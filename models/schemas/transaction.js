const mangoose = require('mongoose');
const Schema = mangoose.Schema

const TransactionSchema = new Schema({
    invoiceId: {
        type: Number,
        unique: true,
        default: 10000
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
    },
    planTypeId: {
        type: String
    },
    period: {
        type: Number
    },
    plan: {
        type: Schema.Types.ObjectId,
        ref: 'Plans',
    },
    status: {
        type: Boolean,
        default: false
    },
    token: {
        type: String
    },
    cardNumber: {
        type: String
    },
    rrn: {
        type: String
    },
    amount: {
        type: String
    },
    payGateTranID: {
        type: String
    },
    salesOrderID: {
        type: String
    },
    serviceTypeId: {
        type: Number
    },
    payGateTranDate: {
        type: String
    },
    payGateTranDateEpoch: {
        type: Number
    },
    cardHash :{
        type: String
    },
    ref_id: {
        type:Number
    },
    code: {
        type: Number
    },
    fee: {
        type: Number
    }
}, { timestamps: true })

module.exports = mangoose.model('Transactions', TransactionSchema)