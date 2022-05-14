var express = require('express');
var router = express.Router();

const dbMongo = require('../helpers/mongodb')

const SignInUser = require('../helpers/signInUserModel')
const ResponseFail = require('../helpers/responseFailModel')

const auth = require('../services/auth')

router.post('/', async function (req, res, next) {
  const signInUser = new SignInUser()
  let responseFail

  try {
    signInUser.email = req.body.email
    signInUser.password = req.body.password

    for (const [key, value] of Object.entries(signInUser)) {
      if (!value || value.trim() == '') {
        responseFail = new ResponseFail(key, `${key.toUpperCase()} is empty`)

        res.status(400).end(responseFail.json());

        return;
      }
    }

    const result = await dbMongo.find('user', { email: signInUser.email });

    if (result.length > 0) {
      const firstMatch = result[0]

      const isMatch = await dbMongo.comparePassword(signInUser.password, firstMatch.password);

      if (isMatch) {
        const userPayload = firstMatch
        delete userPayload['password'];

        const authToken = auth.genAuthToken(userPayload)

        if (authToken) {
          const user = auth.verifyAuthToken(authToken)

          res.status(200).end(JSON.stringify({ success: true, authToken: authToken, user: user }));

          return;
        } else {
          responseFail = new ResponseFail("error", 'Get auth token failed')
        }
      } else {
        responseFail = new ResponseFail("password", 'Password is not correct')
      }
    } else {
      responseFail = new ResponseFail("email", 'User not found')
    }
  } catch (err) {
    responseFail = new ResponseFail("error", String(err))
  }

  res.status(400).end(responseFail.json());

  return
});

module.exports = router;