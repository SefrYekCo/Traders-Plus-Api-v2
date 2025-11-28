const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Service = new Schema({
    name: {
        type: String
    },
    index: {
        type: Number,
        unique: true
    },
    description: {
        type: String
    },
    link: {
        type: String
    },
    info: {
        type: String
    },
    icon: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    index:{
        type:Number,
        default:0
    }

}, {
    versionKey: false,
    timestamps: true
})

module.exports = mongoose.model('Services', Service)