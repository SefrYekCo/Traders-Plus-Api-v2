const mangoose = require('mongoose');
const Schema = mangoose.Schema

const Message = new Schema({
    content: {
        type: String,
    },
    file: {
        type: String
    },
    link: {
        type: String
    },
    infoldId: {
        type: String
    },
    title: {
        type: String
    },
    reply: {
        type: Schema.Types.ObjectId,
        ref: 'Messages'
    },
    publisher: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: 'Channels'
    },
    edited: {
        type: Boolean,
        default: false
    },
    reportCount: {
        type: Number,
        default: 0,
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'Users'
    }],
    deleted: {
        type: Boolean,
        default: false,
    },
    destination: {
        type: String
    },
    action: {
        type: String
    },
}, {
    versionKey: false,
    timestamps: true
})

module.exports = mangoose.model('Messages', Message)