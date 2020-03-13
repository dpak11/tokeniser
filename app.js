const express = require('express');
const cookieParser = require('cookie-parser');
const {tokeniser} = require('./tokeniser');
const app = express();
app.use(cookieParser());

app.get('/setuser', (req, res) => {
    const mycookie = tokeniser.setToken({
        cookieName: "supercookie",
        cookieData: { name: "aaa", role: "none" },
        secretKey: "simplePassword",
        expiresIn: "5m",
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
    const mycookie = tokeniser.getToken({
        cookieName: "supercookie",
        secretKey: "simplePassword",
        request: req
    });
    res.send(mycookie);
});


//server listens to port 3000 
app.listen(3000, (err) => {
    if (err) throw err;
    console.log('listening on port 3000');
});