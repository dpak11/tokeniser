const { SHA256 } = require('crypto-js');

function encodeData(data, hKey) {

    // Example:
    // if uniqueSequence =     "3grj7ey48f/10vu"
    // reverseUnique    =      "uv01/f84ye7jrg3";
    // base64data     =        "7gywesadasew423uhd"
    // loop through base64data, replace all occurences of '7 in base64Data by '/_'(refer unique sequence).
    // Similarly 'g' relaced by 'v_', 'y' replaced by '8_' and so on...
    let uniqueSequence = getUniqueKey(hKey);
    let b64Data = Buffer.from(JSON.stringify(data), 'binary').toString('base64');
    let base64Data = b64Data.split("").reverse();
    let alteredBase64 = [];
    base64Data.forEach((base) => {
        let index = uniqueSequence.reversed.indexOf(base);
        alteredBase64.push(`${uniqueSequence.unique[index]}_`)
    });
    return Buffer.from(alteredBase64.join(""), 'binary').toString('base64')
}

function tokieDecoder(encdata, hKey) {
    let obj = null;
    try {
        obj = JSON.parse(Buffer.from(encdata, "base64").toString('ascii'));
    } catch(e) {
        return false;
    }

    try {
        if(!obj.sign || !obj.expire){
            return false;
        }
        if(typeof obj.sign == "undefined" || typeof obj.expire == "undefined"){
            return false;
        }
        let uniqueSequence = getUniqueKey(hKey);
        let _data = Buffer.from(obj.data, "base64").toString('ascii');
        let d = _data.split("_");
        let altered = [];
        d.forEach((val) => {
            let index = uniqueSequence.unique.indexOf(val);
            altered.push(uniqueSequence.reversed[index])
        });

        let base64 = altered.reverse().join("");
        base64 = Buffer.from(altered.join(""), 'base64').toString('binary');        
        return {
            data: JSON.parse(base64),
            sign: obj.sign,
            expire: obj.expire
        }
    } catch(e) {
        console.log("Invalid Password")
        return false;
    }

}


function hashTokie(data, expire, key) {
    let tokieString = JSON.stringify({
        tokie_data: data,
        secure: key,
        expire: expire
    });
    let base64 = Buffer.from(tokieString, 'binary').toString('base64')
    return SHA256(base64).toString();
}

function getUniqueKey(hKey) {
    const strSequence = "poiuytrewq+/=asdfghjklmnbv0123456789cxzQWERTYUIOPLKJHGFDSAZXCVBNM";
    let base64Hkey = Buffer.from(JSON.stringify(hKey), 'binary').toString('base64');
    let hSet = new Set([...base64Hkey, ...strSequence]);
    let uniqueSequence = [...hSet];
    let reverseUnique = [...hSet].reverse();
    return { unique: uniqueSequence, reversed: reverseUnique }

}

function errorLog(err) {
    return {
        error: true,
        status: err,
        value: null
    }
}

function testPass(secret){
    if(typeof secret!="string"){
        return "missing"
    }
    if(secret.length<10){
        return "weak";
    }
    let password = new Set([...secret.split("")]);
    if([...password].length < 5) {
        return "weak"
    }
    return "strong";
}


function set({ type = "cookie", name = null, data, secretKey, expiresIn = "30m", response = null }) {

    if (type !== "token" && type !== "cookie") {
        return errorLog("Tokie: 'type' parameter must be 'cookie' or 'token'");
    }

    if(testPass(secretKey) !== "strong"){
        return errorLog("Tokie: Weak 'secretKey'");
    }

    if (type == "cookie") {
        if (name == null) {
            return errorLog("Tokie: 'name' parameter expected");
        }

        if (typeof name != "string") {
            return errorLog("Tokie: Cookie name must be a valid string");
        }
        if ((/^[a-z0-9_]{1,20}$/i).test(name) === false) {
            return errorLog("Tokie: 'name' must be Aphanumberic (max length 20)");
        }

    }
    if ((/^[0-9]{1,3}[smhd]{1}$/).test(expiresIn)) {
        let lastStr = expiresIn.slice(expiresIn.length - 1);
        let expireNum = Number(expiresIn.slice(0, expiresIn.length - 1));
        var maxCookieAge = 0;
        if (lastStr == "s") { maxCookieAge = 1000 * expireNum }
        if (lastStr == "m") { maxCookieAge = 1000 * expireNum * 60 }
        if (lastStr == "h") { maxCookieAge = 1000 * expireNum * 3600 }
        if (lastStr == "d") { maxCookieAge = 1000 * expireNum * 3600 * 24 }
    } else {
        return errorLog("Tokie: Invalid 'expiresIn' parameter");
    }
    let setExpiry = Date.now() + maxCookieAge;
    let hashed = hashTokie(data, setExpiry, SHA256(secretKey).toString());
    let encodedData = encodeData(data, SHA256(secretKey).toString());
    let encodeHashed = {
        data: encodedData,
        sign: hashed,
        expire: setExpiry
    };
    let enc_data = Buffer.from(JSON.stringify(encodeHashed)).toString('base64');
    if (response != null) {        
        if (type == "token") {
            response.set('Access-Control-Allow-Headers', 'Authorization');
            response.set('Access-Control-Request-Headers', 'Authorization');
            response.set('Access-Control-Expose-Headers', 'Authorization');
            response.header("Authorization", `Bearer ${enc_data}`);
        } else {
            response.cookie(name, enc_data, { maxAge: maxCookieAge, httpOnly: true });
        }
    } 
    return {
        error: false,
        status: "ok",
        value: enc_data
    }

}



function get({ type = "cookie", name = null, secretKey, tokenKey=null, request = null }) {

    if (type !== "token" && type !== "cookie") {
        return errorLog("Tokie: 'type' parameter must be 'cookie' or 'token'");
    }
    
    let encoded_data = null;
    if (type == "cookie") {
        if (name == null) {
            return errorLog("Tokie: Cookie 'name' parameter expected");
        }

        if (typeof name != "string") {
            return errorLog("Tokie: Cookie 'name' must be a valid string");
        }

        if ((/^[a-z0-9_]{1,20}$/i).test(name) === false) {
            return errorLog("Tokie: 'name' must be Aphanumberic (max length 20)");
        }

        encoded_data = request.cookies[name];
        if (typeof encoded_data == "undefined") {
            return errorLog("Tokie: Cookie not found");
        }

    } else {
        
        if(typeof tokenKey == "string"){
            encoded_data = tokenKey;
        }else{
            try {            
                let authHeader = request.headers["authorization"];
                encoded_data = authHeader.split("Bearer ")[1];
            } catch(e) {
                return errorLog("Tokie: Unable to find Token")
            }
        }

    }

    let decoded = tokieDecoder(encoded_data, SHA256(secretKey).toString());
    if (!decoded) { return errorLog("Tokie: Corrupt data or Invalid Password") }
    let hashed = hashTokie(decoded.data, decoded.expire, SHA256(secretKey).toString());
    if (hashed == decoded.sign) {
        if (Date.now() > Number(decoded.expire)) {
            return errorLog("Tokie: This Token has expired!");
        }
        return {
            error: false,
            status: "ok",
            value: decoded.data
        }
    }
    return errorLog("Tokie: Data tampered");
}


module.exports = {
    tokie: { set, get }
}