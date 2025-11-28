const mangoose = require('mongoose');
const Schema = mangoose.Schema

const PopupAnswer = new Schema({
    answer:{
        type:String
    },

    answerDate:{
        type:Date,
        require:true
    },

    user:{
        type:Schema.Types.ObjectId,
        ref:"Users"
    },

    popup:{
        type:Schema.Types.ObjectId,
        ref:"Popup"
    }
},
{
    versionKey: false,
    timestamps: true
}
)

module.exports = mangoose.model('PopupAnswer', PopupAnswer)