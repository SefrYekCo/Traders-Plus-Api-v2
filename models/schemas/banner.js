const mongoose = require("mongoose");
const Schema = mongoose.Schema

const Banner = new Schema({
    name: {
        type: String
    },
    description: {
        type: String
    },
    link: {
        type: String
    },
    action: {
        type: String
    },
    destination: {
        type: String
    },
    buttonTitle: {
        type: String
    },
    widthScale: {
        type: Number
    },
    isActive: {
        type: Boolean,
        default: true
    },
    appearance: {
        titleColor: { type: String },
        descriptionColor: { type: String },
        buttonTextColor: { type: String },
        buttonBackgroundColor: { type: String },
        backgroundColor: { type: String },
    },
    resources: {
        icon: { type: String },
        backgroundImage: { type: String }
    },
    index: {
        type:Number,
        default:0
    },
    platform:{
        type:String,
        enum:["ANDROID" ,"WEB"],
        default:"ANDROID"
    }
}, {
    versionKey: false,
    timestamps: true,
})

module.exports = mongoose.model('Banners', Banner)