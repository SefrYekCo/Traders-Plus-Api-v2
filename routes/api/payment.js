const express = require("express")
const router = express.Router()
const auth = require('../../middleware/auth')
var path = require('path');

const {
    getToken,
    createIncoice,
    createToken,
    saveTransactionResult,
    getResultOfTransaction,
    verifyTransaction,
    saveTransactionForUser,
    settlementTransaction,
    createZarinPalPaymentUrl,
    getResultOfZarinPalTransaction,
    saveZarinpalTransactionResult
} = require('../../controllers/transactionController')

const {
    planExist
} = require('../../middleware/validators/transactionValidator')

const fs = require('fs');
const util = require('util');

// Convert fs.readFile into Promise version of same    
const readFile = util.promisify(fs.readFile);

var getHtml = async (req, res) => {
    res.status(200).sendFile(path.resolve(__dirname + '/../../src/payment.html'))
}

var getResultHtml = async (req, res) => {
    res.status(200).sendFile(path.resolve(__dirname + '/../../src/paymentResult.html'))
}

var getResultInWebHtml = async (req, res) => {
    res.status(200).sendFile(path.resolve(__dirname + '/../../src/paymentResultWeb.html'))
}

router.get("/", getHtml);
router.post('/get-token', getToken)
router.get('/result', getResultHtml)
router.get('/result-web', getResultInWebHtml)

// router.post(
//     "/buy-plan",
//     auth,
//     planExist,
//     createIncoice,
//     createToken
// )

router.post(
    "/buy-plan",
    auth,
    planExist,
    createIncoice,
    createZarinPalPaymentUrl
)

// router.post(
//     '/get-result',
//     getResultOfTransaction,
//     saveTransactionResult,
//     verifyTransaction,
//     saveTransactionForUser,
//     settlementTransaction
// )

router.post(
    '/get-result',
    getResultOfZarinPalTransaction,
    saveZarinpalTransactionResult,
    saveTransactionForUser,
)


router.get(
    '/get-result',
    getResultOfTransaction,
    saveTransactionResult,
    verifyTransaction,
    saveTransactionForUser,
    settlementTransaction
)

module.exports = router;