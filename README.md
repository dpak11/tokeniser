# Tokie

`Tokie` lets you securely transmit/share data as cookies and tokens from server(NodeJS) to client, and between different parties in a compact, self-contained manner. To ensure integrity, unique `signature`(digest) is created using your `secretKey` and attached along with `obfuscated` cookie/token in the `http header`.



## Usage (app.js)


```js

const express = require('express');
const { tokie } = require('./tokie');
const app = express();



//---------------- COOKIE handling -----------------


// 1. Save a Cookie

app.get('/savecookie', (req, res) => {
    const cookie = tokie.set({
        type: "cookie",
        name: "supercookie", 
        data: {name:"joe", admin:"yes"},
        secretKey: "Cookiecomplex-p@ssw0rd",
        expiresIn: "5m",
        response: res
    });
    if (cookie.error) {
        return res.send("Error Status:" + cookie.status);
    }
    console.log(cookie.value);
    res.send("cookie set successfuly")

});


// 2. Read a Cookie

app.get('/readcookie', (req, res) => {
    //shows all the cookies
    const cookie = tokie.get({
        type: "cookie",
        name: "supercookie",
        secretKey: "Cookiecomplex-p@ssw0rd",
        request: req
    });
    if (cookie.error) {
        return res.send("Error Status:" + cookie.status);
    }
    console.log(cookie.value);
    res.send(cookie.value);
});








//---------------- TOKEN Handling -----------------------


// 3. Save a Signed Token to the Header

app.get('/savetoken', (req, res) => {
    const token = tokie.set({
        type: "token",
        data: {name:"bob", admin:"no"},
        secretKey: "Tokencomplex-p@ssw0rd",
        response: res
    });
    if (token.error) {
        return res.send("Error Status:" + token.status);
    }
    console.log(token.value);
    res.send(token.value)

});


// 4. Read a Signed Token from Header

app.get('/readtoken', (req, res) => {
    const token = tokie.get({
        type: "token",
        secretKey: "Tokencomplex-p@ssw0rd",
        req: req
    });
    if (token.error) {
        return res.send("Error Status:" + token.status);
    }
    console.log(token.value);
    res.send(token.value)

});



app.listen(3000, (err) => {
    if (err) throw err;
    console.log('listening on port 3000');
});

```


### Tokie format (output)

Below is the Tokie output where your actual `data` is encoded, and the signature of the output data is stored in `sign`.


```
{
  "data": "RV9FXzdfNV85X1hfdF9rX1JfZl90X1ZfTl9WXzJfc19aX2lfdF8rXzlfS185X1Zfcl9PX2VfZ185XzNfQ19WX1BfeV9lX2dfNF9NXzFfV18=",
  "sign": "db9e7dd82d03f389670376ad9da7e561237a0ea53962d6b79c2c211adb4d5469"
}

```

### Storing the `cookie` data (input):

For a `cookie`, the `name` and `expiresIn` parameters are `REQUIRED`.

`response` parameter is `OPTIONAL`. 

If `response` is included, then the cookie gets automatically attached to the http response header. If not included, then tokie.set({...}) will return back the encoded data along with signature. 

```
tokie.set({
    type: "cookie",
    name: "supercookie",
    data: {name:"aaa", role:"none"},
    secretKey: "Cookiecomplex-p@ssw0rd",
    expiresIn: "5m",
    response: res // optional
});
```


### Storing the `token` data: (input)

For a `token`, the `name` and `expiresIn` parameters and `NOT REQUIRED`.

`response` parameter is `OPTIONAL`. 

If `response` is included, then the token gets automatically attached to the http response header. If not included, then tokie.set({...}) will return back the encoded data along with signature. 

```
const token = tokie.set({
    type: "token",
    data: {name:"bob", admin:"no"},
    secretKey: "Tokencomplex-p@ssw0rd",
    response: res // optional
});
```