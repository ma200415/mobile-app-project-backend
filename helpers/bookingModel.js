class Booking {
    constructor(data) {
        this.dogId = data.dogId;
        this.userId = data.userId
        this.contact = data.contact
        this.date = data.date
        this.remark = data.remark
        this.submitBy = data.submitBy
        this.submitTimestamp = data.submitTimestamp
    }
}

module.exports = Booking;