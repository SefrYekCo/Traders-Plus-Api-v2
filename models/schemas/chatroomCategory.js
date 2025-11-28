const mangoose = require('mongoose');
const Schema = mangoose.Schema

const ChatroomCategory = new Schema({
    name:{
        type: String,
        unique: true,
    },
    type: {
        type: String
    },
    icon:{
        type: String,
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

module.exports = mangoose.model('ChatroomCategories',ChatroomCategory) 