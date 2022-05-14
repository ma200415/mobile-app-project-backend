var express = require('express');
var router = express.Router();

const auth = require('../services/auth')

router.post('/', async function (req, res, next) {
    const userPayload = auth.getBearerTokenPayload(req)

    if (userPayload.success) {
        res.status(200).end(JSON.stringify(userPayload.user));
    } else {
        res.status(400).end(JSON.stringify(userPayload));
    }

    return
});

module.exports = router; 