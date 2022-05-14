var express = require('express');
var router = express.Router();

const { ObjectId } = require('mongodb');

const ResponseFail = require('../helpers/responseFailModel')
const dbMongo = require('../helpers/mongodb')

const auth = require('../services/auth');

const doc = "user"

router.post('/id', async (req, res, next) => {
  try {
    const result = await dbMongo.findOne(doc, { _id: ObjectId(req.body.id) });

    res.status(200).end(JSON.stringify(result));

    return
  } catch (error) {
    console.log("/user/id", error)

    const responseFail = new ResponseFail("error", error)

    res.status(400).end(responseFail);

    return
  }
})

router.post('/bookmark', async (req, res, next) => {
  let responseFail

  try {
    const userPayload = auth.getBearerTokenPayload(req)

    if (!userPayload.success) {
      res.status(400).end(JSON.stringify(userPayload));
      return
    }

    const result = await dbMongo.addToSet(doc, userPayload.user.payload._id, { bookmarks: req.body.dogId });

    res.status(200).end(JSON.stringify({ success: result.success, message: result.message }));

    return
  } catch (err) {
    console.log("/user/bookmark", err)

    responseFail = new ResponseFail("error", String(err))

    res.status(400).end(responseFail.json());

    return
  }
});

router.post('/unbookmark', async (req, res, next) => {
  let responseFail

  try {
    const userPayload = auth.getBearerTokenPayload(req)

    if (!userPayload.success) {
      res.status(400).end(JSON.stringify(userPayload));
      return
    }

    const result = await dbMongo.pullFromSet(doc, userPayload.user.payload._id, { bookmarks: req.body.dogId });

    res.status(200).end(JSON.stringify({ success: result.success, message: result.message }));

    return
  } catch (err) {
    console.log("/user/unbookmark", err)

    responseFail = new ResponseFail("error", String(err))

    res.status(400).end(responseFail.json());

    return
  }
});

module.exports = router;
