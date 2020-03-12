const { SHA256 } = require('crypto-js');
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();

app.use(cookieParser());




function hashCookieToken(data, key) {
    let cookieString = JSON.stringify({
        cookie_data: data,
        key_cookie: key
    });
    return SHA256(cookieString).toString();
}


function generateToken({cookieName, cookieData, secretKey, expiresIn, response }) {
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
        let hashed = hashCookieToken(cookieData, secretKey);        
        let encodeHashed = {            
            token: hashed
        };
        response.cookie(cookieName, encodeHashed, { maxAge: maxCookieAge });
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
        secretKey: "Sup3rS3cretP455w0rd",
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