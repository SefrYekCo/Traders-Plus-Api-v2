const express = require("express");
const router = express.Router();


const {
    getCrypto,
    getCryptoDetails,
    brokers,
    stockList,
    symbolHistory,
    stocksDetails,
    stocksDetailsWithInstanceIds,
    getCurrencies,
    getCryptoHistory,
    changeVersion,
    checkVersion,
    weatherForecast,
    getHedgeFundList,
    getUSDT

  } = require("../../controllers/clientController");

// get crypto currencies
router.get("/cryptos", getCrypto)
router.get("/cryptos/USDT", getUSDT)

// get crypto by symbol
router.post("/cryptos", getCryptoDetails)

// get brokers list
router.get("/brokers", brokers)

// get all stocks 
router.get("/stocks", stockList)

router.get("/hedgeFundList", getHedgeFundList)

// get all weatherForecast
router.get("/weatherForecast", weatherForecast)

// get symbol history
router.post("/symbol-history", symbolHistory)

// get stocks with symbol ids
router.post("/stocks-details", stocksDetails)
router.post("/stocks-details-with-instance", stocksDetailsWithInstanceIds)

// get currencies : cryptos, currencies , metals
router.get("/currencies", getCurrencies)

// get Crypto History
router.post("/crypto-history", getCryptoHistory)


router.post("/check-version", checkVersion)
router.post("/change-version", changeVersion)

module.exports = router;