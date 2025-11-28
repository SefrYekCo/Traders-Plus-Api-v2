const mangoose = require('mongoose');
const Schema = mangoose.Schema

const Channel = new Schema({
    name:{
        type: String,
    },
    icon:{
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    muted: {
        type: Boolean,
        default: false,
    },
    bio: {
        type: String,
    },
    plan: {
        type: Schema.Types.ObjectId,
        ref: 'Plans',
        require: true
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'ChatroomCategories',
        require: true
    },
    index:{
        type:Number,
        default:0
    }
}, {
    versionKey: false,
    timestamps: true
})

module.exports = mangoose.model('Channels',Channel)