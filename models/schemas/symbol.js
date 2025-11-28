const mangoose = require('mongoose');
const Schema = mangoose.Schema

const Symbol = new Schema({
    symbol: {
        type: String,
    },
    history: [{
        type: Schema.Types.ObjectId,
        ref: 'SymbolHistory'
    }],
    unit: {
        type: String,
        default: 'USD'
    },
    basketId: {
        type: Schema.Types.ObjectId,
        ref: 'Baskets'
    },
}, {
    versionKey: false,
    timestamps: true
})

module.exports = mangoose.model('Symbols', Symbol)