var express = require('express');
var formidable = require('formidable');
var fs = require('fs');
const { ObjectId } = require('mongodb');

var router = express.Router();

const dbMongo = require('../helpers/mongodb');

const Dog = require('../helpers/dogModel')
const ResponseFail = require('../helpers/responseFailModel')

const auth = require('../services/auth')

const doc = "craft"

router.post('/', async function (req, res, next) {
    let responseFail

    try {
        const payload = {}

        for (const property in req.body[0]) {
            const value = req.body[0][property]

            if (value != null && String(value).trim() !== "") {
                payload[property] = property === "_id" ? (value.length === 24 && ObjectId(value)) : value
            }
        }

        const result = await dbMongo.find(doc, payload);

        res.status(200).end(JSON.stringify(result));

        return
    } catch (err) {
        console.log("/dog/", err)

        responseFail = new ResponseFail("error", String(err))
    }

    res.status(400).end(responseFail.json());

    return
});

router.post('/add', async function (req, res, next) {
    let responseFail

    try {
        const userPayload = auth.getBearerTokenPayload(req)

        if (!userPayload.success) {
            res.status(200).end(JSON.stringify(userPayload));
            return
        } else if (userPayload.user.payload.role !== "employee") {
            res.status(200).end(JSON.stringify({ message: "You do not have permission to action" }));
            return
        }

        const dog = new Dog()

        dog.name = req.body.name

        if (dog.name == null || String(dog.name).trim() == "") {
            responseFail = new ResponseFail("name", "Required*")

            res.status(200).end(responseFail.json());
        } else {
            dog.store = req.body.store
            dog.date = req.body.date
            dog.description = req.body.description
            dog.photo = req.body.photo
            dog.addBy = userPayload.user.payload._id
            dog.addTimestamp = new Date()

            const result = await dbMongo.insertOne(doc, dog);

            res.status(200).end(JSON.stringify({ success: result.success, message: result.message }));
        }
    } catch (err) {
        console.log("/dog/add", err)

        responseFail = new ResponseFail("error", String(err))

        res.status(400).end(responseFail.json());
    }

    return
});

router.post('/edit', async function (req, res, next) {
    let responseFail

    try {
        const userPayload = auth.getBearerTokenPayload(req)

        if (!userPayload.success) {
            res.status(200).end(JSON.stringify(userPayload));
            return
        } else if (userPayload.user.payload.role !== "employee") {
            res.status(200).end(JSON.stringify({ message: "You do not have permission to action" }));
            return
        }

        const dog = new Dog()
        dog.name = req.body.name
        dog.store = req.body.store
        dog.date = req.body.date
        dog.description = req.body.description
        dog.photo = req.body.photo
        dog.editBy = userPayload.user.payload._id
        dog.editTimestamp = new Date()

        const result = await dbMongo.updateOne(doc, req.body.craftId, dog);

        res.status(200).end(JSON.stringify(result));
        return
    } catch (err) {
        console.log("/dog/edit", err)

        responseFail = new ResponseFail("error", String(err))

        res.status(400).end(responseFail.json());
    }

    return
});

router.post('/delete', async function (req, res, next) {
    let responseFail

    try {
        const userPayload = auth.getBearerTokenPayload(req)

        if (!userPayload.success) {
            res.status(200).end(JSON.stringify(userPayload));
            return
        } else if (userPayload.user.payload.role !== "employee") {
            res.status(200).end(JSON.stringify({ message: "You do not have permission to action" }));
            return
        }

        const result = await dbMongo.deleteOne(doc, req.body.craftId);

        res.status(200).end(JSON.stringify({ success: result.success, message: result.message }));

        return
    } catch (err) {
        console.log("/dog/delete", err)

        responseFail = new ResponseFail("error", String(err))

        res.status(400).end(responseFail.json());

        return
    }
});

router.post('/id', async function (req, res, next) {
    try {
        let result = await dbMongo.findOne(doc, { _id: ObjectId(req.body.id) });

        if (result == null) {
            result = {}
        }

        res.status(200).end(JSON.stringify(result));

        return
    } catch (error) {
        console.log("/dog/id", error)

        const responseFail = new ResponseFail("error", error)

        res.status(200).end(responseFail);

        return
    }
})

module.exports = router;