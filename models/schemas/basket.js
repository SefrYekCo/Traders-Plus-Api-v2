const mangoose = require('mongoose');
const Schema = mangoose.Schema

const Basket = new Schema({
    name: {
        type: String,
    },
    symbols: [{
        type: Schema.Types.ObjectId,
        ref: 'Symbols',
    }],
    type: {
        type: String,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
    },
}, {
    versionKey: false,
    timestamps: true
})

module.exports = mangoose.model('Baskets', Basket)