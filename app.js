const express = require('express');
const bodyParser = require('body-parser');
const { tokie } = require('./tokie');
const app = express();


app.use(express.static(__dirname + "/examples"));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));



//---------------- TOKEN Handling -----------------------


// Save a Signed Token to the Header

app.post('/create_tokenapi', (req, res) => {
    const { name, pass, descr, expiry } = req.body;
    const token = tokie.create({
        data: { name, descr },
        secretKey: pass,
        expiresIn: expiry
    });
    if (token.error) {
        return res.json({error:token.status, token:null})
    }
    res.json({token:token.value})

});

// Read a Signed Token from Header

app.post('/read_tokenapi', (req, res) => {
    
    const apikey = req.query.token;
    const passwd = req.body.pass;
    const token = tokie.read({
        secretKey: passwd,
        tokenKey: apikey
    });
    if (token.error) {
        return res.json({error:token.status, token:null})
    }
    res.send({token:token.value})

});

app.post('/create_headertoken', (req, res) => {
    const { name, pass, descr, expiry } = req.body;
    const token = tokie.create({
        data: { name, descr },
        secretKey: pass,
        expiresIn: expiry,
        //response: res
    });
    if (token.error) {
        return res.json({error:token.status, token:null})
    }
    res.json({token:token.value})

});

app.post('/read_headertoken', (req, res) => {
    const passwd = req.body.pass;
    const token = tokie.read({
        secretKey: passwd,
        request: req
    });
    if (token.error) {
        return res.json({error:token.status, token:null})
    }
    res.send({token:token.value})

});





app.get('/example1_create', (req, res) => {
    res.sendFile(__dirname + "/examples/example1.html")
});


app.get('/example1_read', (req, res) => {
    res.sendFile(__dirname + "/examples/example1-read.html")
});


app.get('/example2_create', (req, res) => {
    res.sendFile(__dirname + "/examples/example2.html")
});

app.get('/example2_read', (req, res) => {
    res.sendFile(__dirname + "/examples/example2-read.html")
});

app.get('/', (req,res) => {
    res.redirect("/example1_create");
});

//server listens to port 3000 
app.listen(3000, (err) => {
    if (err) throw err;
    console.log('listening on port 3000');
});