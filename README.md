# Tokie

`Tokie` lets you securely share data in form of a `token` or a `cookie` between server(NodeJS) and client, and between different parties in a compact, secure manner. To ensure integrity, a unique `signature`(digest) is created using a `secretKey` and attached along with `obfuscated` token(and cookie). Tokie uses `SHA256`



### Tokie format

Below is a sample Tokie output containing your actual `data` in encoded form, and the signature stored in `sign`.
This is further encoded to be used as `API key`(token).

```
{
  "data": "RV9FXzdfNV85X1hfdF9rX1JfZl90X1ZfTl9WXzJfc19aX2lfdF8rXzlfS185X1Zfcl9PX2VfZ185XzNfQ19WX1BfeV9lX2dfNF9NXzFfV18=",
  "sign": "db9e7dd82d03f389670376ad9da7e561237a0ea53962d6b79c2c211adb4d5469",
  "expire": 1584249622972
}

```







### Storing data into a `token`: 

`tokie.set()` will create a unique token using your `data` and `secretKey`. This token gets attached to `Authorisation Header` (if only specified). 

`response` parameter is `OPTIONAL`. 

If `response` is included, then the `token` gets automatically attached to the `response header`. 

`Authorisation Bearer {token}`  

If not included, then `tokie.set({...})` will only return back the encoded (and signed) data. You can then trasmit/share this encoded data to client side in whichever way you prefer. 

`expiresIn` is the expiry period of the token. 

Example:

20s => 20 seconds,
3m => 3 minutes,
6h => 6 hours,
5d => 5 days



```js
    tokie.set({
        type: "token",
        data: { name: "joe", admin: "yes" },
        secretKey: "token-complex-p@ssw0rd",
        expiresIn: "5m", // 5 minutes
        response: res // optional
    });

```




### Storing data into a `cookie`:

Now in case of a `cookie`, the `name` parameter is `REQUIRED`, unlike in `token`.

`response` parameter is `OPTIONAL`. 

If `response` is included, then the `cookie` gets automatically attached to the `response header`. If not included, then `tokie.set({...})` will only return back the encoded data. 

```js
tokie.set({
    type: "cookie",
    name: "supercookie",
    data: {name:"tom", role:"admin"},
    secretKey: "Cookiecomplex-p@ssw0rd",
    expiresIn: "5m",
    response: res // optional
});
```




## Token Usage (app.js)

1) **Create a Signed Token and return the token, but do not attach it to Authorisation Header**

```js

const express = require('express');
const bodyParser = require('body-parser');
const { tokie } = require('./tokie');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



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

```


2) **Create a Signed Token and return the token, and also attach it to Authorisation Header**

```js
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

```

3) **Read a Signed Token from Query Parameter:**

If you already have a signed token, you can transmit this token as query parameter. Below, `my_token` contains your signed token.

`tokenKey` parameter is `REQUIRED`.

`request` parameter is `NOT required`. 


`http://localhost:3000/read_token_query?my_token=eyJkYXRhIjoiYkY5c1gxZGZSVjkyjdkfrye8rfs`
 

```js
app.get('/read_token_query', (req, res) => {
    const TOKEN_KEY = req.query.my_token;
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

````


4) **Read a Signed Token from Authorisation Header:**

If you choose to transmit signed token via Header, you MUST include the `request` parameter.
(`tokenKey` parameter is not required in this case)


```js
app.get('/read_token_header', (req, res) => {    
    const token = tokie.get({
        type: "token", 
        secretKey: "some-Complex-Password", 
        request: req // This is REQUIRED for reading token from Header
    });
    if (token.error) {
        return res.send(token.status);
    }
    res.send(token.value)

});



```






## Cookie Usage (app.js)

1) **Save a cookie to Header:**

When saving a `cookie`, you need to specify the `name` of the cookie. Though `response` parameter is optional, in most use cases you MUST include it in case of a cookie.

```js
const express = require('express');
const bodyParser = require('body-parser');
const { tokie } = require('./tokie');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


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
```



2) **Read a Cookie:**

Always include `request` parameter for reading a cookie.

```js
// Read a Cookie

app.get('/readcookie', (req, res) => {
    const cookie = tokie.get({
        type: "cookie", 
        name: "supercookie", 
        secretKey: "Cookiecomplex-p@ssw0rd", 
        request: req // REQUIRED
    });
    if (cookie.error) {
        return res.send(cookie.status);
    }
    return res.send(cookie.value);
});



```