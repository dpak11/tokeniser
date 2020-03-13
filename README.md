# tokeniser

`Tokeniser` lets you securely transmit cookie data from server(NodeJS) to client browser in a compact, self-contained manner. To ensure integrity, unique `cookie signature`(digest) is attached along with `obfuscated` cookie data using a combination of `secretkey` and `SHA256` hashing.



## Usage (app.js)


```js
const express = require('express');
const cookieParser = require('cookie-parser');
const {tokeniser} = require('./tokeniser');
const app = express();
app.use(cookieParser());

app.get('/setcookie', (req, res) => {
    const mycookie = tokeniser.setToken({
        cookieName: "mycookie",
        cookieData: { name: "abcd", role: "admin" },
        secretKey: "a_long_Password",
        expiresIn: "5m", // example 5m => 5 minutes; 12s => 12 seconds; 3h => 3 hours; 2d => 2 days
        response: res
    });
    if(mycookie.error){
    	console.log(cookie.status);
        // do something
    }else{
        // res.send(mycookie.cookie)
        // or do something else
    }
});


app.get('/getcookie', (req, res) => {
    const mycookie = tokeniser.getToken({
        cookieName: "mycookie",
        secretKey: "a_long_Password",
        request: req
    });
    if(!mycookie.error){
    	console.log(mycookie.data);
    	// do something with cookie data
    }
});

```

