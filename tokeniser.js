const { SHA256 } = require('crypto-js');
const strSequence = "poiuytrewq+/=asdfghjklmnbv0123456789cxzQWERTYUIOPLKJHGFDSAZXCVBNM";


function encodeCookieData(data, hKey) {   
    
    //qwertyuiop
    //poiuytrewq
    // Example:
    // if uniqueSequence =     "3grj7ey48f/10vu"
    // reverseUnique    =      "uv01/f84ye7jrg3";
    // base64data     =        "7gywesadasew423uhd"
    // loop through base64data, replace all occurences of '7 in base64Data by '/_'(from unique sequence corresponds 7 in reverse unique).
    // Similarly 'g' relaced by 'v_', 'y' replaces '8_' and so on...
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

function decodeCookieData(data, hKey) {
    
    let uniqueSequence = getUniqueKey(hKey);
    let _data = Buffer.from(data, "base64").toString('ascii');
    let d = _data.split("_");
    let altered = [];
    d.forEach((val) => {        
        let index = uniqueSequence.unique.indexOf(val);
        altered.push(uniqueSequence.reversed[index])
    }); 
    
    let base64 = altered.reverse().join("");
    base64 = Buffer.from(altered.join(""), 'base64').toString('binary');
    return JSON.parse(base64);

}

function hashCookieToken(data, key) {
    let cookieString = JSON.stringify({
        cookie_data: data,
        secure: key
    });
    let base64 = Buffer.from(cookieString, 'binary').toString('base64')
    return SHA256(base64).toString();
}

function getUniqueKey(hKey){
    let base64Hkey = Buffer.from(JSON.stringify(hKey), 'binary').toString('base64');
    let hSet = new Set([...base64Hkey,...strSequence]);
    let uniqueSequence = [...hSet];
    let reverseUnique = [...hSet].reverse();
    return {unique:uniqueSequence, reversed:reverseUnique}

}


function setToken({ cookieName, cookieData, secretKey, expiresIn, response = null }) {
    
    //expiresIn examples: 10s,10m,2h,4d
    if (typeof cookieName != "string") {
        return {
            error: true,
            status: "Invalid CookieName",
            cookie: null
        }
    }
    if ((/^[0-9]{1,3}[smhd]{1}$/).test(expiresIn)) {
        let lastStr = expiresIn.slice(expiresIn.length - 1);
        let expireNum = Number(expiresIn.slice(0, expiresIn.length - 1));
        let maxCookieAge = 0;
        if (lastStr == "s") { maxCookieAge = 1000 * expireNum }
        if (lastStr == "m") { maxCookieAge = 1000 * expireNum * 60 }
        if (lastStr == "h") { maxCookieAge = 1000 * expireNum * 3600 }
        if (lastStr == "d") { maxCookieAge = 1000 * expireNum * 3600 * 24 }
        let hashed = hashCookieToken(cookieData, SHA256(secretKey).toString());
        let encodedData = encodeCookieData(cookieData, SHA256(secretKey).toString());
        let encodeHashed = {
            data: encodedData,
            sign: hashed
        };
        if (response) {
            response.cookie(cookieName, encodeHashed, { maxAge: maxCookieAge });
        }

        return {
            error: false,
            status: "ok",
            cookie: encodeHashed
        }
    }
    return {
        error: true,
        status: "You have set an invalid expiration period.",
        cookie: null
    }

}

function getToken({ cookieName, secretKey, request }) {
    let cookie = request.cookies[cookieName];
    if (typeof cookie == "undefined") {
        return {
            error: true,
            status: "Cookie not found",
            data: null
        }
    }
    let decodedData = decodeCookieData(cookie.data, SHA256(secretKey).toString());
    let hashed = hashCookieToken(decodedData, SHA256(secretKey).toString());
    if (hashed == cookie.sign) {
        return {
            error: false,
            status: "ok",
            data: decodedData
        }
    }
    return {
        error: true,
        status: "Cookie has been tampered"
    }
}


module.exports = {
    tokeniser: {
        setToken,
        getToken
    }
}