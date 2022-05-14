var express = require('express');
var router = express.Router();

const dbMongo = require('../helpers/mongodb');

const SignupUser = require('../helpers/signupUserModel')
const ResponseFail = require('../helpers/responseFailModel')

const auth = require('../services/auth')

router.post('/', async function (req, res, next) {
    const signupUser = new SignupUser()
    let responseFail

    try {
        //general info
        signupUser.lastName = req.body.lastName;
        signupUser.firstName = req.body.firstName;
        signupUser.email = req.body.email;
        signupUser.password = await dbMongo.hash(req.body.password);
        signupUser.createTimestamp = new Date()

        switch (req.body.code) {
            case auth.adminCode():
                signupUser.admin = true;
                signupUser.role = "employee"
                break;
            case auth.employeeCode():
                signupUser.role = "employee"
                break;
            default: //public
                signupUser.role = "public"
                break;
        }

        for (const [key, value] of Object.entries(signupUser)) {
            if (key != "admin" && (!value || String(value).trim() == '')) {
                responseFail = new ResponseFail(key, `${key.toUpperCase()} is missing`)

                res.status(400).end(responseFail.json());

                return;
            }
        }

        const findExistsUser = await dbMongo.findOne('user', { email: signupUser.email });

        if (findExistsUser) {
            responseFail = new ResponseFail("email", 'Email already exists')

            res.status(200).end(responseFail.json());
            return
        } else {
            const result = await dbMongo.insertOne('user', signupUser);

            res.status(200).end(JSON.stringify({ success: result.success, message: (result.success ? `Welcome ${signupUser.firstName} ${signupUser.lastName}!` : result.message) }));
            return
        }
    } catch (err) {
        responseFail = new ResponseFail("error", String(err))

        res.status(400).end(responseFail.json());
        return
    }
});

module.exports = router;
