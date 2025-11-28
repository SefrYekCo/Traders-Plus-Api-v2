const mangoose = require('mongoose');
const Schema = mangoose.Schema

const VersionSchema = new Schema({
    deviceType:{
        type: String,
        unique: true,
    },
    normalVersionCode:{
        type: String
    },
    forceVersionCode:{
        type: String
    },
    message:{
        type:String
    },
    updateLink:{
        type:String
    }
}, {timestamps: true})

module.exports = mangoose.model('client_version',VersionSchema)