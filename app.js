const { SHA256 } = require('crypto-js');
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();

app.use(cookieParser());


function encodeCookieData(data, hKey) {
    let base64Data = Buffer.from(JSON.stringify(data), 'binary').toString('base64');
    let base64Hkey = Buffer.from(JSON.stringify(hKey), 'binary').toString('base64');

    //base64data = '65954jgndfkgjd95879354j43'
    //hashedKey = '4jndis74/hrerwfdhfs764324iuhrnfdsnfs'
    const strSequence = "qwertyuio/+=1234567890plkjhgfdsazxcvbnmQWERTYUIOPLKJHGFDSAZXCVBNM";
    let hSet = new Set([...base64Hkey]);
    let hashUniqueSequence = [...hSet].join("");
    console.log("hKey: " + hKey);
    console.log("base64Hkey: "+base64Hkey);
    console.log("hashUniqueSequence: " + hashUniqueSequence);
    console.log("Base64: " + base64Data);
    // Example:
    // if hashUniqueSequence = "3grjey48f/10vu"
    // strSequence    =        "qwertyuio/+=1234567890plkjhgfdsazxcvbnmQWERTYUIOPLKJHGFDSAZXCVBNM";
    // all occurence of '3' in base64Data will be replace by 'q'.
    // Similarly 'g' relaces 'w', 'r' replaces 'e' and so on...
    for (let i = 0; i < hashUniqueSequence.length; i++) {
        let regex = new RegExp(hashUniqueSequence[i], "g");
        base64Data = base64Data.replace(regex, strSequence[i]);
    }
    console.log("Base64: " + base64Data);
    return base64Data;

}

function hashCookieToken(data, key) {
    let cookieString = JSON.stringify({
        cookie_data: data,
        key_cookie: key
    });
    let base64 = Buffer.from(cookieString, 'binary').toString('base64')
    return SHA256(base64).toString();
}


function generateToken({cookieName, cookieData, secretKey, expiresIn, response=null }) {
    //let cookie = req.cookies[cookieName];
    //can be 10s,10m,2h,4d
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
            token: hashed
        };
        if(response){
            response.cookie(cookieName, encodeHashed, { maxAge: maxCookieAge });
        }
        
        return {
            error:false,
            status:"ok",
            cookie:encodeHashed
        }
    }
    return {
        error:true,
        status:"Invalid expiration period for cookie",
        cookie:null
    }

}

function getCookieToken(req, cookieName) {
    let cookie = req.cookies[cookieName];

}



app.get('/setuser', (req, res) => {
    const mycookie = generateToken({
        cookieName: "superCookie",
        cookieData: { name: "deeps", role: "admin" },
        secretKey: "simplePassword",
        expiresIn: "2m",
        response: res
    });
    if(mycookie.error){
        res.send(mycookie.status)
    }else{
        res.send(mycookie.cookie)
    }
});

//Iterate users data from cookie 
app.get('/getuser', (req, res) => {
    //shows all the cookies 
    res.send(req.cookies);
    console.log(req.cookies);
    console.log(req.cookies.userData);
});


//server listens to port 3000 
app.listen(3000, (err) => {
    if (err) throw err;
    console.log('listening on port 3000');
});