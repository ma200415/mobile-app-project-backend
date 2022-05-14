var express = require('express');
const { ObjectId } = require('mongodb');

var router = express.Router();

const dbMongo = require('../helpers/mongodb');

const ResponseFail = require('../helpers/responseFailModel')

const auth = require('../services/auth')

const doc = "message"

router.get('/', async function (req, res) {
    let responseFail

    try {
        const userPayload = auth.getBearerTokenPayload(req)

        if (!userPayload.success) {
            res.status(400).end(JSON.stringify(userPayload));
            return
        }

        let result

        switch (userPayload.user.payload.role) {
            case "employee":
                result = await dbMongo.find(doc, {});
                res.status(200).end(JSON.stringify(result));
                break;
            case "public":
                result = await dbMongo.find(doc, { userId: userPayload.user.payload._id });
                res.status(200).end(JSON.stringify(result));
                break;
            default:
                res.status(400).end(JSON.stringify({ message: "undefined role" }));
                break;
        }

        return
    } catch (err) {
        console.log(`${doc}/`, err)

        responseFail = new ResponseFail("error", String(err))
    }

    res.status(400).end(responseFail.json());

    return
});

router.post('/id', async (req, res, next) => {
    try {
        const userPayload = auth.getBearerTokenPayload(req)

        if (!userPayload.success) {
            res.status(400).end(JSON.stringify(userPayload));
            return
        }

        const result = await dbMongo.findOne(doc, { _id: ObjectId(req.body.id) });

        res.status(200).end(JSON.stringify(result));

        return
    } catch (error) {
        console.log(`${doc}/`, err)

        const responseFail = new ResponseFail("error", error)

        res.status(400).end(responseFail);

        return
    }
})

router.post('/add', async function (req, res, next) {
    let responseFail

    try {
        const userPayload = auth.getBearerTokenPayload(req)

        if (!userPayload.success) {
            res.status(400).end(JSON.stringify(userPayload));
            return
        }

        const message = req.body
        message.createTimestamp = new Date()

        const result = await dbMongo.insertOne(doc, message);

        res.status(200).end(JSON.stringify(result));

        return
    } catch (err) {
        console.log(`${doc}/add`, err)

        responseFail = new ResponseFail("error", String(err))
    }

    res.status(400).end(responseFail.json());

    return
});

router.post('/append', async function (req, res, next) {
    let responseFail

    try {
        const userPayload = auth.getBearerTokenPayload(req)

        if (!userPayload.success) {
            res.status(400).end(JSON.stringify(userPayload));
            return
        }

        const message = {
            message: req.body.message,
            userId: userPayload.user.payload._id,
            createTimestamp: new Date()
        }

        const result = await dbMongo.addToSet(doc, req.body.messageId, { replys: message });

        res.status(200).end(JSON.stringify(result));

        return
    } catch (err) {
        console.log(`${doc}/append`, err)

        responseFail = new ResponseFail("error", String(err))
    }

    res.status(400).end(responseFail.json());

    return
});

router.post('/id', async (req, res, next) => {
    try {
        const result = await dbMongo.findOne(doc, { _id: ObjectId(req.body.id) });

        res.status(200).end(JSON.stringify(result));

        return
    } catch (error) {
        console.log(`/${doc}/id`, error)

        const responseFail = new ResponseFail("error", error)

        res.status(400).end(responseFail);

        return
    }
})

router.post('/delete', async function (req, res, next) {
    try {
        const userPayload = auth.getBearerTokenPayload(req)

        if (!userPayload.success) {
            res.status(400).end(JSON.stringify(userPayload));
            return
        }

        if (userPayload.user.payload.role !== "employee") {
            res.status(400).end(JSON.stringify({ message: "You do not have permission to action" }));
            return
        }

        let result

        if (req.body.index === 0) {
            result = await dbMongo.deleteOne(doc, req.body.messageId)
        } else {
            const payload = {
                message: req.body.message,
                userId: req.body.userId,
                createTimestamp: new Date(req.body.createTimestamp)
            }

            result = await dbMongo.pullFromSet(doc, req.body.messageId, { replys: payload });
        }

        res.status(200).end(JSON.stringify({/* success: result.success, message: result.message */ }));
        return
    } catch (error) {
        console.log(`/${doc}/delete`, error)

        const responseFail = new ResponseFail("error", error)

        res.status(400).end(responseFail);

        return
    }
});

module.exports = router;