# Tokie

`Tokie` lets you securely share data in form of a `token` or a `cookie` from server(NodeJS) to client, and between different parties in a compact, secure manner. To ensure integrity, a unique `signature`(digest) is created using a `secretKey` and attached along with `obfuscated` token(and cookie).



### Tokie format

Below is the Tokie output where your actual `data` is encoded, and the signature is stored in `sign`.
This output gets further encoded to be used as `API key`.

```
{
  "data": "RV9FXzdfNV85X1hfdF9rX1JfZl90X1ZfTl9WXzJfc19aX2lfdF8rXzlfS185X1Zfcl9PX2VfZ185XzNfQ19WX1BfeV9lX2dfNF9NXzFfV18=",
  "sign": "db9e7dd82d03f389670376ad9da7e561237a0ea53962d6b79c2c211adb4d5469",
  "expire": 1584249622972
}

```





### Storing data into `token`: (input)

`tokie.set()` will create a unique token using your `data`, `secretKey`. This token gets attached to `Authorisation Header` if you specify it in the parameter section.

`response` parameter is `OPTIONAL`. 

If `response` is included, then the `token` gets automatically attached to the `http` response header. If not included, then `tokie.set({...})` will return back the encoded data. 

`expiresIn` is the expiry period of the token. 

Example:

20s => 20 seconds,
3m => 3 minutes,
6h => 6 hours,
5d => 5 days



```js
const cookie = tokie.set({
        type: "token",
        data: { name: "joe", admin: "yes" },
        secretKey: "Cookiecomplex-p@ssw0rd",
        expiresIn: "5m", // 5 minutes
        response: res // optional
    });

```




### Storing the `cookie` data (input):

Now in case of a `cookie`, the `name` parameter is `REQUIRED`, unlike in `token`.

`response` parameter is `OPTIONAL`. 

If `response` is included, then the `cookie` gets automatically attached to the `http response header`. If not included, then `tokie.set({...})` will return back the encoded data. 

```js
tokie.set({
    type: "cookie",
    name: "supercookie",
    data: {name:"aaa", role:"none"},
    secretKey: "Cookiecomplex-p@ssw0rd",
    expiresIn: "5m",
    response: res // optional
});
```




## Token Usage (app.js)


```js

const express = require('express');
const bodyParser = require('body-parser');
const { tokie } = require('./tokie');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));





//---------------- TOKEN Handling -----------------------


// Create a Signed Token and return the token, but do not attach it to Authorisation Header

app.post('/createtoken', (req, res) => {
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



// Create a Signed Token and return the token, and also attach it to Authorisation Header

app.post('/createtoken_header', (req, res) => {
    const { name, admin, password } = req.body;
    const token = tokie.set({
        type: "token",
        data: { name, admin },
        secretKey: password,
        expiresIn: "5m",
        response: res // This is required for inserting token into Header
    });
    if (token.error) {
        return res.send(token.status);
    }
    res.send(token.value)

});



/* Read a Signed Token from Query Parameter

EXAMPLE: http://localhost:3000/read_token_query?tokenKey=eyJkYXRhIjoiYkY5c1gxZGZSVjkyjdkfrye8rfs

*/
app.get('/read_token_query', (req, res) => {
    const TOKEN_KEY = req.query.tokenKey;
    // read_token_query?tokenKey=eyJkYXRhIjoiYkY5c1gxZGZSVjkyjdkfrye8rfs
    const token = tokie.get({
        type: "token",
        secretKey: "some-Complex-Password",
        tokenKey: TOKEN_KEY
    });
    if (token.error) {
        return res.send(token.status);
    }
    res.send(token.value)

});



// Read a Signed Token from Authorisation Header

app.get('/read_token_header', (req, res) => {
    
    const token = tokie.get({
        type: "token", //This is REQUIRED
        secretKey: "some-Complex-Password", //This is REQUIRED
        request: req // This is REQUIRED for reading token from Header
    });
    if (token.error) {
        return res.send(token.status);
    }
    res.send(token.value)

});




app.listen(3000, (err) => {
    if (err) throw err;
    console.log('listening on port 3000');
});

```




## Cookie Usage (app.js)


```js
const express = require('express');
const bodyParser = require('body-parser');
const { tokie } = require('./tokie');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



//---------------- COOKIE handling -----



// Save a Cookie

app.post('/savecookie', (req, res) => {
    const cookie = tokie.set({
        type: "cookie", 
        name: "supercookie", 
        data: { name: "joe", admin: "yes" }, 
        secretKey: "Cookiecomplex-p@ssw0rd", 
        expiresIn: "5m", //This is REQUIRED
        response: res //This is OPTIONAL. 
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



```