const express = require('express');
//const cors = require('cors');
const cookieParser = require('cookie-parser');
const { tokeniser } = require('./tokeniser');
const app = express();
app.use(cookieParser());

//app.use(cors());
/*app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,HEAD,PUT,POST,DELETE');
    res.set('Access-Control-Allow-Headers', 'Authorization');
    res.set('Access-Control-Request-Headers', 'Authorization');
    res.set('Access-Control-Expose-Headers', 'Authorization');
    next();
});*/


//---------------- COOKIE handling -----



// Save a Cookie

app.get('/savecookie', (req, res) => {
    const cookie = tokeniser.set({
        type: "cookie",
        name: "supercookie", 
        data: {name:"joe", admin:"yes"},
        secretKey: "Cookiecomplex-p@ssw0rd",
        expiresIn: "5m",
        response: res
    });
    if (cookie.error) {
        console.log(cookie.status);
        return res.send(cookie.status);
    }
    console.log(cookie.value);
    res.send("cookie set successfuly")

});


// Read a Cookie

app.get('/readcookie', (req, res) => {
    //shows all the cookies
    const cookie = tokeniser.get({
        type: "cookie",
        name: "supercookie",
        secretKey: "Cookiecomplex-p@ssw0rd",
        request: req
    });
    if (cookie.error) {
        return res.send(cookie.status);
    }
    console.log(cookie.value);
    return res.send("cookie loaded");
});






//---------------- TOKEN Handling -----------------------


// Save a Signed Token to the Header

app.get('/savetoken', (req, res) => {
    const token = tokeniser.set({
        type: "token",
        data: {name:"bob", admin:"no"},
        secretKey: "Tokencomplex-p@ssw0rd",
        response: res
    });
    if (token.error) {
        console.log(token.status);
        return res.send(token.status);
    }
    console.log(token.value);
    res.send("token set successfuly")

});

// Read a Signed Token from Header

app.get('/readtoken', (req, res) => {
    const token = tokeniser.get({
        type: "token",
        secretKey: "Tokencomplex-p@ssw0rd",
        req: req
    });
    if (token.error) {
        console.log(token.status);
        return res.send(token.status);
    }
    console.log(token.value);
    res.send("token set successfuly")

});





//server listens to port 3000 
app.listen(3000, (err) => {
    if (err) throw err;
    console.log('listening on port 3000');
});