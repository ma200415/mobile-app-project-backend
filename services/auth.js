const jwt = require('jsonwebtoken');

const privateKey = "4#%gce6$hUf^vleEL[e%(73"

exports.adminCode = () => "thisisthecodeforadmin"
exports.employeeCode = () => "thisisthecodeforemployee"

exports.genAuthToken = (payload = {}) => {
    return jwt.sign(payload, privateKey, { expiresIn: '7d' })
}

exports.verifyAuthToken = (token) => {
    try {
        const result = jwt.verify(token, privateKey)

        return { success: true, payload: result }
    } catch (error) {
        let errorType = ""

        switch (error.name) {
            case "TokenExpiredError":
                errorType = "expired"
                break;
            case "JsonWebTokenError":
                errorType = "misc"
                break;
            case "NotBeforeError":
                errorType = "nbf"
                break;
            default:
                break;
        }

        return { errorType: errorType, message: error.message }
    }
}

exports.getBearerTokenPayload = (req) => {
    const headerAuth = req.headers['authorization']

    if (headerAuth) {
        const bearerToken = headerAuth.split(' ')[1]

        const result = this.verifyAuthToken(bearerToken)

        if (result.success) {
            return { success: true, user: result }
        } else {
            return result
        }

    } else {
        const missingBearer = "Bearer is missing"

        return missingBearer
    }
}