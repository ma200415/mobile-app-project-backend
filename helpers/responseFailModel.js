class ResponseFail {
    constructor(errorType, message) {
        this.errorType = errorType;
        this.message = message
    }

    json() {
        return JSON.stringify({ errorType: this.errorType, message: this.message })
    }
}

module.exports = ResponseFail;