const express = require('express');
//const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const { tokie } = require('./tokie');
const app = express();

app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(cookieParser());
/*app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,HEAD,PUT,POST,DELETE');
    res.set('Access-Control-Allow-Headers', 'Authorization');
    res.set('Access-Control-Request-Headers', 'Authorization');
    res.set('Access-Control-Expose-Headers', 'Authorization');
    next();
});*/





//---------------- TOKEN Handling -----------------------


// Save a Signed Token to the Header

app.post('/savetoken', (req, res) => {
    const { name, admin, password } = req.body;
    const token = tokie.set({
        type: "token",
        data: { name, admin },
        secretKey: password,
        expiresIn: "5m"
    });
    if (token.error) {
        return res.send(token.status);
    }
    res.send(token.value)

});

// Read a Signed Token from Header

app.get('/readtoken', (req, res) => {
    const { pass, apikey } = req.query;
    const token = tokie.get({
        type: "token",
        secretKey: pass,
        tokenKey: apikey
        //request: req 
    });
    if (token.error) {
        return res.send(token.status);
    }
    res.send(token.value)

});




//---------------- COOKIE handling -----



// Save a Cookie

app.post('/savecookie', (req, res) => {
    const cookie = tokie.set({
        type: "cookie",
        name: "supercookie",
        data: { name: "joe", admin: "yes" },
        secretKey: "Cookiecomplex-p@ssw0rd",
        expiresIn: "5m",
        response: res
    });
    if (cookie.error) {
        return res.send(cookie.status);
    }
    res.send(cookie.value)

});


// Read a Cookie

app.get('/readcookie', (req, res) => {
    const cookie = tokie.get({
        type: "cookie",
        name: "supercookie",
        secretKey: "Cookiecomplex-p@ssw0rd",
        request: req
    });
    if (cookie.error) {
        return res.send(cookie.status);
    }
    return res.send(cookie.value);
});



app.get('/home', (req, res) => {
    res.sendFile(__dirname + "/index.html")
});



//server listens to port 3000 
app.listen(3000, (err) => {
    if (err) throw err;
    console.log('listening on port 3000');
});