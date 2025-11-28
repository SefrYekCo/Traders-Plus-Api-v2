const mongoose = require("mongoose")
const Schema = mongoose.Schema

const exchanger = new Schema({
    name:{
        type: String,
        require:true
    },

    description:{
        type:String
    },

    webAddress:{
        type:String,
    },

    imageUrl:{
        type:String
    },

    index:{
        type:Number,
        default:0
    },

    isActive:{
        type:Boolean,
        dafault:true
    },

    click:{
        type:Number,
        default:0
    }
},
{
    versionKey: false,
    timestamps: true
}
)


module.exports = mongoose.model("Exchanger" , exchanger)