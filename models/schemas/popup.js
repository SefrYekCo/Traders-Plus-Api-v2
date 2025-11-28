const mangoose = require('mongoose');
const Schema = mangoose.Schema

const Popup = new Schema({
    title:{
        type:String,
        require:true
    },

    type:{
        type:String,
        require:true,
        enum:["alert" ,"prompt" ,"confirm"]
    },

    description:{
        type:String
    },

    buttons:[
        {
            text:{type:String}
        }
    ],

    imageUrl:{
        type:String
    },

    link:{
        type:String
    },

    isActive:{
        type:Boolean,
        default:false
    },

    indicatedPage:{
        type:String,
        require:true,
        enum: ['main' ,'subscriptionBaseFragment' ,'channelFragment' ,'servicesFragment' ,'myPortfolioBaseFragment' ,'userOptionsFragment' ,'weatherForecastFragment']
    },

},
{
    versionKey: false,
    timestamps: true
}
)

module.exports = mangoose.model('Popup', Popup)