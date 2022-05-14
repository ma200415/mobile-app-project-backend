var express = require('express');

var router = express.Router();

const dbMongo = require('../helpers/mongodb');

const ResponseFail = require('../helpers/responseFailModel')

const auth = require('../services/auth');
const Booking = require('../helpers/bookingModel');

const doc = "booking"

router.get('/', async function (req, res) {
    let responseFail

    try {
        const userPayload = auth.getBearerTokenPayload(req)

        if (!userPayload.success) {
            res.status(400).end(JSON.stringify(userPayload));
            return
        }

        const result = await dbMongo.find(doc,
            userPayload.user.payload.role === "employee" ? {} : { userId: userPayload.user.payload._id }
        );

        res.status(200).end(JSON.stringify(result));

        return
    } catch (err) {
        console.log("/booking/", err)

        responseFail = new ResponseFail("error", String(err))
    }

    res.status(400).end(responseFail.json());

    return
});

router.post('/booked', async function (req, res) {
    let responseFail

    try {
        const result = await dbMongo.find(doc, { dogId: req.body.dogId });

        res.status(200).end(JSON.stringify(result));

        return
    } catch (err) {
        console.log("/booking/booked", err)

        responseFail = new ResponseFail("error", String(err))
    }

    res.status(400).end(responseFail.json());

    return
});

router.post('/new', async function (req, res) {
    let responseFail

    try {
        const userPayload = auth.getBearerTokenPayload(req)

        if (!userPayload.success) {
            res.status(400).end(JSON.stringify(userPayload));
            return
        }

        const booking = new Booking(req.body)

        for (const [key, value] of Object.entries(booking)) {
            if (key != "remark" && (!value || String(value).trim() == '')) {
                responseFail = new ResponseFail(key, `${key.toUpperCase()} is empty`)

                res.status(400).end(responseFail.json());

                return;
            }
        }

        const result = await dbMongo.insertOne(doc, booking);

        res.status(200).end(JSON.stringify({ success: result.success, message: result.message }));
        return
    } catch (err) {
        console.log("/booking/new", err)

        responseFail = new ResponseFail("error", String(err))

        res.status(400).end(responseFail.json());
        return
    }
});

module.exports = router;
