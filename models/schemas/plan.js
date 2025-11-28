const mangoose = require('mongoose');
const Schema = mangoose.Schema

const Plan = new Schema({
    name: {
        type: String,
    },
    description: {
        type: String,
    },
    type: {
        type: String,
    },
    types: [
        {
            period: { type: Number },
            isActive: { type: Boolean },
            amount: { type: Number },
            discount: { type: Number, default: 0 },
        }
    ],
    isActive: {
        type: Boolean,
        default: true,
    }
}, {
    versionKey: false,
    timestamps: true
})

module.exports = mangoose.model('Plans', Plan)