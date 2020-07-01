# Tokie

`Tokie` lets you securely share data in form of a `token` between server(NodeJS) and client, and between different parties in a compact manner. To ensure integrity, a unique `signature`(digest) is generated using `SHA256`



### Tokie format

Here is a sample Tokie output containing your encrypted `data`, token `expiration` period and the `signature`.
Further this will be base64 encoded and used as a token.

```
{
  "data": "RV9FXzdfNV85X1hfdF9rX1JfZl90X1ZfTl9WXzJfc19aX2lfdF8rXzlfS185X1Zfcl9PX2VfZ185XzNfQ19WX1BfeV9lX2dfNF9NXzFfV18=",
  "sign": "db9e7dd82d03f389670376ad9da7e561237a0ea53962d6b79c2c211adb4d5469",
  "expire": 1584249622972
}

```







### Storing data into a `token`: 

`tokie.create()` will create a unique `token` using your `data` and `secretKey`. 

You may include a `response` parameter for embedding the `token` to the `response header`. 

> `Authorization Bearer {token}` 


```js
    tokie.create({
        data: { name: "joe", admin: "yes" },
        secretKey: "token-complex-p@ssw0rd", // During 'production' phase, the secretKey should only be stored on the server side
        expiresIn: "5m", 
        response: res // OPTIONAL
    });

```

If `response` is not included, then `tokie.create()` will simply return back the encoded token.

`expiresIn` parameter is the expiry period of the token. This parameter is `required`

Here are some valid `expiresIn` examples:

```
20s denotes 20 seconds,
3m denotes 3 minutes,
6h denotes 6 hours,
5d denotes 5 days,

etc...
```




### Reading data from a `token`:

There are 2 ways to read a `token`. 

1. `tokie.read({tokenKey})` will read data from the `token` that was passed as a query string parameter.

`tokenKey` parameter is `REQUIRED`.

In this case the `request` parameter is `NOT REQUIRED`.


```js
    const token = tokie.read({
        secretKey: "some-Complex-Password",
        tokenKey: TOKEN_KEY // REQUIRED
    });

```


2. `tokie.read({request})` will read data from the `token` that is embedded in `Authorization Header`.

In this case, `request` parameter is `REQUIRED`.

`tokenKey` parameter is `NOT REQUIRED`.


```js
    const token = tokie.read({
        secretKey: "some-Complex-Password", // During 'production' phase, the secretKey should only be stored on the server side
        request: req // REQUIRED
    });

```

---

## Token Usage (app.js)

1. **Create a Signed Token and return the token, but do not attach it to Header**

```js

const express = require('express');
const bodyParser = require('body-parser');
const { tokie } = require('./tokie');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



// Create a Signed Token and return the token, but do not attach it to Header

app.post('/createtoken', (req, res) => {
    const { name, admin } = req.body;
    const token = tokie.create({
        data: { name, admin },
        secretKey: "some-long-password", // During 'production' phase, the secretKey should only be stored on the server side
        expiresIn: "15m" // token expires in 15 mins
    });
    if (token.error) {
        return res.send(token.status);
    }
    res.send(token.value)

});

```


2. **Create a Signed Token, attach it to Authorization Header and return back the token**

Here the signed token gets attached in the response header because of the addition of `response` parameter.


```js
app.post('/createtoken_header', (req, res) => {
    const { name, admin } = req.body;
    const token = tokie.create({
        data: { name, admin },
        secretKey: "some-long-password", // During 'production' phase, the secretKey should only be stored on the server side
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

`tokie.read()` is used to read a token value.

If you already have a signed token, you can transmit the token via query parameter. Below example, `my_token` contains your signed token.

`http://localhost:3000/read_token_query?my_token=eyJkYXRhIjoiYkY5c1gxZGZSVjkyjdkfrye8rfs`

`tokenKey` parameter is `REQUIRED`.

`request` parameter is `NOT required`. 
 

```js
app.get('/read_token_query', (req, res) => {
    const TOKEN_KEY = req.query.my_token;
    const token = tokie.read({
        secretKey: "some-Complex-Password", // During 'production' phase, the secretKey should only be stored on the server side
        tokenKey: TOKEN_KEY // REQUIRED
    });
    if (token.error) {
        return res.send(token.status);
    }
    res.send(token.value)

});

````


4. **Read a Signed Token from Authorization Header:**

If you want to read signed token from Header, you MUST include the `request` parameter.
(`tokenKey` parameter is NOT required in this case)


```js
app.get('/read_token_header', (req, res) => {    
    const token = tokie.read({
        type: "token", 
        secretKey: "some-Complex-Password", // During 'production' phase, the secretKey should only be stored on the server side
        request: req // This is REQUIRED for reading the token from Header
    });
    if (token.error) {
        return res.send(token.status);
    }
    res.send(token.value)

});



```

---


## Example Pages:

- To view demonstration examples, download or clone this repository to your local drive.

- "Shift + Right click" inside the folder where you have package.json, and open Windows PowerShell or command window.

- Execute `npm install`.

- After the installation is complete, execute `npm start`.

- Open your browser in `http://localhost:3000`
