const mangoose = require('mongoose');
const Schema = mangoose.Schema

const SymbolHistory = new Schema({
    unitPrice: {
        type: String,
        default: 0,
    },
    tradeDate: {
        type: String,
        default: ""
    },
    type: {
        type: String,
        default: ""
    },
    amount: {
        type: Number,
        default: 0
    }
}, {
    versionKey: false,
    timestamps: true
})

module.exports = mangoose.model('SymbolHistory', SymbolHistory)