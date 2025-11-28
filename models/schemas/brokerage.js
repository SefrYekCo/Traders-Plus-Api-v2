const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Brokerage = new Schema({
    name:{
        type:String
    },

    imageURL:{
        type:String
    },
    
    webAddress:{
        type:String
    },

    mobileAddress:{
        type:String
    },

    isActive:{
        type:Boolean,
        default:false
    },

    click:{
        type:Number,
        default:0
    },
    index:{
        type:Number,
        default:0
    }
},
{
    versionKey:false,
    timestamps:true
}
)

module.exports = mongoose.model("Brokerage" ,Brokerage)