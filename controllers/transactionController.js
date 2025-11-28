const User = require('../models/schemas/user');
const language = require('../helpers/language/index')
const Transaction = require('../models/schemas/transaction')
const urls = require('../src/utils').asanPardakhtUrls
const zarinpalUrls = require('../src/utils').zarinpalUrls
const axios = require('axios')
const { dateFormatter } = require('../helpers/helper')
const { dailyExpire, merchantID } = require('../configs/secret')
const {
    asanUser,
    asanPass,
    merchantConfigId,
    iban
} = require('../configs/secret');
const plan = require('../models/schemas/plan');

exports.createIncoice = async (req, res, next) => {

    try {
        let total = await Transaction.find().sort({ invoiceId: -1 }).limit(1);
        var invoiceId = total.length === 0 ? process.env.T_START_ID : Number(total[0].invoiceId) + 1;
        req.invoiceId = invoiceId
        let transaction = await new Transaction({ invoiceId: invoiceId })
        transaction.user = req.user._id
        transaction.period = req.period
        transaction.amount = req.amount
        transaction.planTypeId = req.body.typeId
        transaction.plan = req.plan._id
        console.log("invoiceId:", invoiceId)
        await transaction.save()
        await next()
    } catch (error) {
        console.log('error:', error);
        return res.status(500).json({ status: false, description: 'خطا در ساخت تراکنش' })
    }

}

exports.createToken = async (req, res) => {
    const amount = parseInt(req.amount) * 1
    const platform = req.body.platform || "android";
    console.log('callback url status:', platform);
    console.log('final amount:', amount);
    console.log('start to create token')
    try {
        let transaction = await Transaction.findOne({ invoiceId: req.invoiceId })
        if (!transaction)
            return res.status(404).json({ status: false, description: 'خطا در ساخت تراکنش' })

        const response = await axios({
            method: 'post',
            url: urls.token,
            headers: {
                'accept': "text/plain",
                'usr': asanUser,
                'pwd': asanPass,
                'Content-Type': "application/json-patch+json"
            },
            data: createTokenParams(req.invoiceId, parseInt(amount) ,platform)
        })
        console.log(response);
        let token = await response.data
        transaction.token = token
        transaction.save();
        let url = process.env.PAYMENT_URL + '/api/v1/payment?id=' + transaction._id
        return res.status(200).json({ status: true, response: { url: url } })
    } catch (error) {
        console.log('error:', error.response.data);
        console.log('status:', error.response.status);
        return res.status(500).json({ status: false, description: 'خطا در ساخت تراکنش' })
    }
}

exports.createZarinPalPaymentUrl = async (req ,res) => {
    try {
        const amount = parseInt(req.amount) * 1
        const platform = req.body.platform || "android";
        console.log('callback url status:', platform);
        console.log('final amount:', amount);

        let transaction = await Transaction.findOne({ invoiceId: req.invoiceId })
        if (!transaction)
            return res.status(404).json({ status: false, description: 'خطا در ساخت تراکنش' })

        const response = await axios({
            method: 'post',
            url: zarinpalUrls.createUrl,
            headers: {
                'accept': "application/json",
                'Content-Type': "application/json"
            },
            data: createZarinPalBody(req.invoiceId, parseInt(amount) ,platform)
        })
        console.log(response);
        let authority = await response.data.data.authority
        transaction.amount = amount
        transaction.token = authority
        transaction.save();

        let url = `https://www.zarinpal.com/pg/StartPay/${authority}?id=${transaction._id}`;
        return res.status(200).json({ status: true, response: { url: url } })

    } catch (error) {
        console.log('error:', error.response.data);
        console.log('status:', error.response.status);
        return res.status(500).json({ status: false, description: 'خطا در ساخت تراکنش' })
    }
}

exports.getToken = async (req, res) => {
    const _id = req.body.id
    try {
        let transaction = await Transaction.findOne({ _id })
        if (!transaction)
            return res.status(404).json({ status: false })
        return res.status(200).json({ status: true, token: transaction.token })

    } catch (err) {
        return res.status(500).json({ status: false })
    }

}

exports.settlementTransaction = async (req, res) => {
    const payGateTranId = req.result.payGateTranID
    try {
        const response = await axios({
            method: 'post',
            url: urls.settlement,
            headers: {
                'accept': "text/plain",
                'usr': asanUser,
                'pwd': asanPass,
                'Content-Type': "application/json-patch+json"
            },
            data: JSON.stringify({
                "merchantConfigurationId": merchantConfigId,
                "payGateTranId": payGateTranId
            })
        })
        console.log('data:', response.data)
        console.log('status:', response.status)
        console.log('transaciton successfully sattelement')
        return res.status(200).json({ status: true })
    } catch (err) {
        console.log('data:', err.response.data);
        console.log('status:', err.response.status);
        return res.status(200).json({ status: true })
    }
}


exports.saveTransactionForUser = async (req, res, next) => {
    const planId = String(req.transaction.plan)
    const _id = String(req.transaction.user)
    const period = req.transaction.period
    try {
        if(!req.transaction.status) return res.status(200).json({ status: false })
        var user = await User.findOne({ _id })
        console.log('plans:', user.plans)
        if (user.plans.filter(e => String(e.planId) === String(planId)).length > 0) {
            /// TODO tamdid account
            let index = user.plans.findIndex(x => String(x.planId) === String(planId));
            let newDate = new Date(user.plans[index].expireDate.getTime() + calculateExpireDateOfPlan(period))
            user.plans[index].expireDate = newDate
        } else {
            let expire = Date.now() + calculateExpireDateOfPlan(period)
            user.plans.push({ planId: planId, expireDate: expire, activateDate: Date.now() })
        }
        user.save()
        console.log('bought plan added to user model successfully')
        return res.status(200).json({ status: true })
    } catch (err) {
        console.log(err)
        return res.status(400).json({ status: false, description: language('fa', 'error.unknown') })
    }
}


exports.verifyTransaction = async (req, res, next) => {
    const payGateTranId = req.result.payGateTranID
    try {
        const response = await axios({
            method: 'post',
            url: urls.verify,
            headers: {
                'accept': "text/plain",
                'usr': asanUser,
                'pwd': asanPass,
                'Content-Type': "application/json-patch+json"
            },
            data: JSON.stringify({
                "merchantConfigurationId": merchantConfigId,
                "payGateTranId": (payGateTranId)
            })
        })
        console.log('data:', response.data)
        console.log('status:', response.status)
        console.log('transaciton successfully verified')
        await next()
    } catch (error) {
        console.log('data:', error.response.data);
        console.log('status:', error.response.status);
        return res.status(500).json({ status: false })
    }
}

exports.saveTransactionResult = async (req, res, next) => {
    const invoiceId = req.body.invoice
    console.log('invoice:', invoiceId)
    try {
        let transaction = await Transaction.findOne({ invoiceId: invoiceId })
        console.log('transaction:', transaction)
        if (!transaction)
            return res.status(404).json({ status: false, description: language('fa', 'transaction.notfound') })
        const result = req.result
        transaction.status = true
        transaction.cardNumber = result.cardNumber
        transaction.rrn = result.rrn
        transaction.amount = result.amount
        transaction.payGateTranID = result.payGateTranID
        transaction.salesOrderID = result.salesOrderID
        transaction.serviceTypeId = result.serviceTypeId
        transaction.payGateTranDate = result.payGateTranDate
        transaction.payGateTranDateEpoch = result.payGateTranDateEpoch
        transaction.save()
        req.transaction = transaction
        console.log('transaciton successfully saved')
        await next()
    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: false })
    }
}

exports.saveZarinpalTransactionResult = async (req, res, next) => {
    const invoiceId = req.body.invoice
    console.log('invoice:', invoiceId)
    try {
        let transaction = await Transaction.findOne({ invoiceId: invoiceId })
        console.log('transaction:', transaction)
        if (!transaction)
            return res.status(404).json({ status: false, description: language('fa', 'transaction.notfound') })
        const result = req.result
        if(result.length === 0) return res.status(400).json({ status: false })
        transaction.status = result.code === 100 || result.code === 101 ? true : false
        transaction.cardNumber = result.card_pan
        transaction.cardHash = result.card_hash
        transaction.fee = result.fee
        transaction.ref_id = result.ref_id
        transaction.amount = result.amount
        transaction.code = result.code
        transaction.save()
        req.transaction = transaction
        console.log('transaciton successfully saved')
        await next()
    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: false })
    }
}

exports.getResultOfTransaction = async (req, res, next) => {
    const invoiceId = req.body.invoice
    try {
        const response = await axios({
            method: 'get',
            url: urls.tranResult + `?MerchantConfigurationId=${merchantConfigId}&LocalInvoiceId=${invoiceId}`,
            headers: {
                'accept': "text/plain",
                'usr': asanUser,
                'pwd': asanPass,
                'Content-Type': "application/json-patch+json"
            }
        })
        console.log('data:', response.data)
        console.log('status:', response.status)
        req.result = response.data
        await next()
    } catch (error) {
        console.log('data:', error.response.data);
        console.log('status:', error.response.status);
        //console.log('headers:', error.response.headers);
        return res.status(404).json({ status: false, description: 'result not found' })
    }
}

exports.getResultOfZarinPalTransaction = async (req, res, next) => {
    const invoiceId = req.body.invoice

    let transaction = await Transaction.findOne({ invoiceId: invoiceId })
    try {
        const response = await axios({
            method: 'post',
            url: zarinpalUrls.verify,
            headers: {
                'accept': "application/json",
                'Content-Type': "application/json"
            },
            data: {
                merchant_id: merchantID,
                amount: +transaction.amount,
                authority:transaction.token
            }
        })
        console.log('data of result tttt:', response.data)
        console.log('status:', response.status)
        req.result = response.data.data
        await next()
    } catch (error) {
        console.log('data:', error.response.data);
        console.log('status:', error.response.status);
        //console.log('headers:', error.response.headers);
        return res.status(500).json({ status: false }) 
    }
}

var createTokenParams = (invoiceId, amount ,platform) => {
    var data = {
        "merchantConfigurationId": merchantConfigId,
        "serviceTypeId": 1,
        "localInvoiceId": invoiceId,
        "amountInRials": amount,
        "localDate": dateFormatter(new Date),
        "additionalData": "",
        "callbackURL": platform === "web" ? process.env.PAYMENT_URL + '/api/v1/payment/result-web?invoiceId=' + invoiceId : process.env.PAYMENT_URL + '/api/v1/payment/result?invoiceId=' + invoiceId ,
        "paymentId": "0",
        "settlementPortions": [{
            "iban": iban,
            "amountInRials": amount,
            "paymentId": "0"
        }]
    }
    return JSON.stringify(data)
}

var createZarinPalBody = (invoiceId, amount ,platform) => {
    var data = {
        "merchant_id": merchantID,
        "amount": amount,
        "callback_url": platform === "web" ? process.env.PAYMENT_URL + '/api/v1/payment/result-web?invoiceId=' + invoiceId : process.env.PAYMENT_URL + '/api/v1/payment/result?invoiceId=' + invoiceId ,
        "description":"tradersplus payment"
    }
    return data
}

var calculateExpireDateOfPlan = (period) => {
    return dailyExpire * period
}