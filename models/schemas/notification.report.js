const mongoose = require("mongoose");
const Schema = mongoose.Schema

const NotificationReport = new Schema({
    title: {
        type: String
    },
    message: {
        type: String
    },
    destination: {
        type: String
    },
    action: {
        type: String
    },
    corrects: [{
        type: Schema.Types.ObjectId,
        ref: 'Users'
    }],
    wrongs: [{
        type: Schema.Types.ObjectId,
        ref: 'Users'
    }],
}, {
    versionKey: false,
    timestamps: true
})

module.exports = mongoose.model('notificationsReport', NotificationReport)