const mangoose = require('mongoose');
const Schema = mangoose.Schema

const UserSchema = new Schema({
    mobileNumber: {
        type: String,
        unique: true,
    },
    username: {
        type: String,
        unique:true,
        default:null
    },
    password: {
        type: String,
    },
    family: {
        type: String,
    },
    name: {
        type: String,
    },
    fourDigitToken: {
        type: String
    },
    fourDigitTokenExpire: {
        type: Date
    },
    thumbnailImagePath: {
        type: String,
        default: ''
    },
    mainImagePath: {
        type: String,
        default: ''
    },
    email: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    mutedChannels: [{
        type: Schema.Types.ObjectId,
        ref: 'Channels',
    }],
    baskets: [{
        type: Schema.Types.ObjectId,
        ref: 'Baskets',
    }],
    plans: [
        {
            planId: { type: String },
            expireDate: { type: Date },
            activateDate: { type: Date },
        }
    ],
    fcm: {
        token: { type: String },
        expireDate: { type: Date }
    },
    trialUsed: {
        type: Boolean
    },
    notifications: {
        type: Boolean,
        default: true
    },
    termsAccepted: {
        type: Boolean
    },
    invitedBy: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
    },
    brokers:[{
        type: Schema.Types.ObjectId,
        ref:"Brokerage"
    }],
    web_notification_token :{
        type: String,
        default:null,
    },
    web_notification_token_date :{
        type: Date,
        default:null,
    },
    platform:[]
    
}, { timestamps: true })

module.exports = mangoose.model('Users', UserSchema)