const mongoose = require("mongoose");
const Schema = mongoose.Schema

const Config = new Schema({
    id: {
        type: String
    },
    allowedNotifyMethods: {
        type: [String],
        default: []
    },
    privacy: {
        title: {
            type: String,
            default: "Privacy Policy"
        },
        description: {
            type: String,
            default: "Privacy Policy"
        },
    }
}, {
    versionKey: false,
    timestamps: true
})

module.exports = mongoose.model('Config', Config)