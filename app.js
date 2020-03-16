const express = require('express');
const bodyParser = require('body-parser');
const { tokie } = require('./tokie');
const app = express();

app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));



//---------------- TOKEN Handling -----------------------


// Save a Signed Token to the Header

app.post('/savetoken', (req, res) => {
    const { name, admin } = req.body;
    const token = tokie.setToken({
        data: { name, admin },
        secretKey: "TokenComplexP@ssw0rd",
        expiresIn: "5m",
        response: res
    });
    if (token.error) {
        return res.send(token.status);
    }
    res.send(token.value)

});

// Read a Signed Token from Header

app.get('/readtoken', (req, res) => {
    const { apikey } = req.query;
    const token = tokie.getToken({
        secretKey: "TokenComplexP@ssw0rd",
        //tokenKey: apikey
        request: req 
    });
    if (token.error) {
        return res.send(token.status);
    }
    res.send(token.value)

});





app.get('/home', (req, res) => {
    res.sendFile(__dirname + "/index.html")
});



//server listens to port 3000 
app.listen(3000, (err) => {
    if (err) throw err;
    console.log('listening on port 3000');
});