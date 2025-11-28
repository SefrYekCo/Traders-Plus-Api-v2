const mongoose = require("mongoose");
const { alertState } = require("../../configs/secret");
const Schema = mongoose.Schema

const Alert = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    name: {
        type: String
    },
    message: {
        type: String
    },
    conditions: [{
        _id: false,
        type: { type: String },
        condition: { type: String },
        value: { type: Number },
    }],
    expireDate: {
        type: Date
    },
    startDate: {
        type: Date
    },
    justOnce: {
        type: Boolean
    },
    disable: {
        type: Boolean,
        default: false
    },
    symbol: {
        type: String
    },
    sound: {
        type: String
    },
    state: {
        latest: { type: Date },
        value: {
            type: String,
            default: alertState.unknown
        }
    },
    actions: [{ type: String }],
    isCrypto: {
        type: Boolean
    },
}, {
    versionKey: false,
    timestamps: true
})

module.exports = mongoose.model('alerts', Alert)