# Tokie

`Tokie` lets you securely transmit cookie data and token from server(NodeJS) to client browser in a compact, self-contained manner. To ensure integrity, unique `signature`(digest) is attached along with `obfuscated` cookie or token using your `secretkey`




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


### Tokeniser format

Below is the tokeniser output format where your actual `data` is encoded, and the signature of the output data is stored in `sign`.
This gets stored as a `cookie`

```
{
  "data": "RV9FXzdfNV85X1hfdF9rX1JfZl90X1ZfTl9WXzJfc19aX2lfdF8rXzlfS185X1Zfcl9PX2VfZ185XzNfQ19WX1BfeV9lX2dfNF9NXzFfV18=",
  "sign": "db9e7dd82d03f389670376ad9da7e561237a0ea53962d6b79c2c211adb4d5469"
}

```

The data:

```
tokeniser.setToken({
    cookieName: "supercookie",
    cookieData: { name: "aaa", role: "none" },
    secretKey: "simplePassword",
    expiresIn: "5m",
    response: res
});
```
