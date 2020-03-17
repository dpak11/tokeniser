# Tokie

`Tokie` lets you securely share data in form of a `token` between server(NodeJS) and client, and between different parties in a compact, secure manner. To ensure integrity, a unique `signature`(digest) is created using a `secretKey` and attached along with `obfuscated` data inside the token. Tokie uses `SHA256`



### Tokie format

Below is Tokie output containing your actual `data` in encoded form, and the signature stored in `sign`.
This will be further encoded when used as `API key`(token).

```
{
  "data": "RV9FXzdfNV85X1hfdF9rX1JfZl90X1ZfTl9WXzJfc19aX2lfdF8rXzlfS185X1Zfcl9PX2VfZ185XzNfQ19WX1BfeV9lX2dfNF9NXzFfV18=",
  "sign": "db9e7dd82d03f389670376ad9da7e561237a0ea53962d6b79c2c211adb4d5469",
  "expire": 1584249622972
}

```







### Storing data into a `token`: 

`tokie.setToken()` will create a unique `token` using your `data` and `secretKey`. 

If `response` parameter is included, then the `token` gets automatically attached to the `response header`. 

> `Authorisation Bearer {token}` 

If `response` is not included, then `tokie.set()` will simply return back the encoded (and signed) data.

`expiresIn` is the expiry period of the token. 

Here is an example of some valid values for `expiresIn`:

```
20s (20 seconds),
3m (3 minutes),
6h (6 hours),
5d (5 days)
```


```js
    tokie.setToken({
        data: { name: "joe", admin: "yes" },
        secretKey: "token-complex-p@ssw0rd",
        expiresIn: "5m", 
        response: res // optional
    });

```


### Reading data from a `token`:

There are 2 ways to read a `token`. 

1. `tokie.getToken({tokenKey})` will read data from the `token` that is part of a query string parameter (API key/token key).

`tokenKey` parameter is `REQUIRED`.

`request` parameter is `NOT REQUIRED`.


```js
    const token = tokie.getToken({
        secretKey: "some-Complex-Password",
        tokenKey: TOKEN_KEY // REQUIRED
    });

```


2. `tokie.getToken({response})` will read data from the `token` that is embedded in `Authorisation Header`.

`request` parameter is `REQUIRED` in this case.

`tokenKey` parameter is `NOT REQUIRED`.


```js
    const token = tokie.getToken({
        secretKey: "some-Complex-Password",
        request: req // REQUIRED
    });

```



## Token Usage (app.js)

1. **Create a Signed Token and return the token, but do not attach it to Authorisation Header**

```js

const express = require('express');
const bodyParser = require('body-parser');
const { tokie } = require('./tokie');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



// Create a Signed Token and return the token, but do not attach it to Authorisation Header

app.post('/createtoken', (req, res) => {
    const { name, admin } = req.body;
    const token = tokie.setToken({
        data: { name, admin },
        secretKey: "some-long-password",
        expiresIn: "15m" // token expire in 15 mins
    });
    if (token.error) {
        return res.send(token.status);
    }
    res.send(token.value)

});

```


2. **Create a Signed Token, attach it to Authorisation Header and return back the token**

Here the signed token is attached in the response header. Please note the addition of `response` parameter.


```js
app.post('/createtoken_header', (req, res) => {
    const { name, admin } = req.body;
    const token = tokie.setToken({
        data: { name, admin },
        secretKey: "some-long-password",
        expiresIn: "5m",
        response: res // This is required for inserting token into Header
    });
    if (token.error) {
        return res.send(token.status);
    }
    res.send(token.value)

});

```

3. **Read a Signed Token from Query Parameter:**

`tokie.getToken()` is used to read a token value.

If you already have a signed token, you can transmit the token via query parameter. Below example, `my_token` contains your signed token.

`http://localhost:3000/read_token_query?my_token=eyJkYXRhIjoiYkY5c1gxZGZSVjkyjdkfrye8rfs`

`tokenKey` parameter is `REQUIRED`.

`request` parameter is `NOT required`. 
 

```js
app.get('/read_token_query', (req, res) => {
    const TOKEN_KEY = req.query.my_token;
    const token = tokie.getToken({
        secretKey: "some-Complex-Password",
        tokenKey: TOKEN_KEY // REQUIRED
    });
    if (token.error) {
        return res.send(token.status);
    }
    res.send(token.value)

});

````


4. **Read a Signed Token from Authorisation Header:**

If you want to read signed token from Header, you MUST include the `request` parameter.
(`tokenKey` parameter is NOT required in this case)


```js
app.get('/read_token_header', (req, res) => {    
    const token = tokie.getToken({
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

