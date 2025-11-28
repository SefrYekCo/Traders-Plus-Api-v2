const utils = require('../src/utils')
const keys = require("../src/utils").keys
const response = require('../models/responseModel');
const { generateResponse, generateResponseWithKey } = require('../models/responseModel');
const conf = require('../config');
const redis = require('../src/redisManager');
const BrokerModel = require('../models/brokerageModel');
const brokeragesData = require('../public/resources/Brokerages.json')
const irStock = require('../src/index.js')
const clientVersion = require('../models/schemas/clientVersion');
const language = require('../helpers/language/index');
const { validURL } = require('../helpers/helper')
const config = require('../config');
const key = config.update.key
const { parse, stringify } = JSON;

exports.getCryptoDetails = async (req, res) => {
    var symbols = req.body.symbols
    console.log(symbols)

    if (!symbols)
        return res.status(400).json({ status: false, description: language('fa', 'client.crypto.symbol.notfound') })

    console.log(`{requestTitle:\"cryptoDetails\"}`)
    var responseTemp = null
    try {
        var cryptos = await redis.getAsyncCache(keys.cryptos)
        cryptos = JSON.parse(cryptos)
        var selectedCryptos = []
        for (var i in cryptos) {
            var crypto = cryptos.find(o => (String(symbols[i]).toLowerCase() === o.symbol.toLowerCase()))
            if (crypto) {
                selectedCryptos.push(crypto)
            }
        }
        if (selectedCryptos.length > 0) {
            responseTemp = { status: true, response: selectedCryptos }
            console.log(`{responseTitle:\"cryptoDetails\",responseCount:${JSON.stringify(responseTemp.response.length)}}`)
            return res.status(200).json(responseTemp)
        } else {
            responseTemp = response.generateError(utils.messages.submittedFormat)
            console.log(`{responseTitle:\"cryptoDetails\",response:${JSON.stringify(responseTemp.description)}}`)
            return res.status(400).json(responseTemp)
        }
    } catch (err) {
        console.log(err.message)
        responseTemp = response.generateError(err.message)
        console.log(`{responseTitle:\"cryptoDetails\",response:${responseTemp.description}}`)
        return res.status(500).json(responseTemp)
    }
}

exports.getCrypto = async (req, res) => {
    console.log(`{requestTitle:\"cryptos\"}`)
    var responseTemp = null
    try {
        let cryptos = await redis.getAsyncCache(keys.cryptos)
        responseTemp = response.generateCryptos(JSON.parse(cryptos))
        console.log(`{responseTitle:\"cryptos\",responseCount:"${responseTemp.response.cryptos.length}"}`)
        return res.status(200).json(responseTemp)
    } catch (err) {
        console.log(err.message)
        responseTemp = response.generateError(err.message)
        console.log(`{responseTitle:\"cryptos\",response:${responseTemp.description}}`)
        return res.status(500).json(responseTemp)
    }
}

exports.getUSDT = async (req, res) => {
    try {
        const USDTStatus = parse(await redis.getAsyncCache(keys.USDTStatus));
        const USDTHistory = parse(await redis.getAsyncCache(keys.USDTHistory));

        USDTStatus.price *= 10;
        USDTStatus.last24h *= 10;
        USDTStatus.last24hMin *= 10;
        USDTStatus.last24hMax *= 10;
        USDTStatus.last7d *= 10;
        USDTStatus.last7dMin *= 10;
        USDTStatus.last7dMax *= 10;
        USDTStatus.last30d *= 10;
        USDTStatus.last30dMin *= 10;
        USDTStatus.last30dMax *= 10;
        return res.json({
            status: true, response: {
                status: USDTStatus, history: USDTHistory.map(item => {
                    item.price *= 10;
                    return item;
                })
            }
        });

    } catch (error) {
        console.log('Exception in getUSDT() (clientController.js)', error);
        return res.status(500).json(response.generateError(err.message));
    }
}
exports.checkVersion = async (req, res) => {
    const deviceType = req.body.deviceType.trim().toLowerCase()
    if (!deviceType)
        return res.status(400).json(generateResponseWithKey(false, 'general.check.input'))
    try {
        var clients = await redis.getAsyncCache(keys.checkVersionList)
        clients = JSON.parse(clients)
        let index = clients.findIndex(x => x.deviceType === deviceType);
        if (index > -1) {
            const client = clients[index]
            const responseTemp = {
                deviceType: client.deviceType,
                normalVersionCode: client.normalVersionCode,
                forceVersionCode: client.forceVersionCode,
                message: client.message,
                updateLink: client.updateLink
            };
            return res.json(response.generateCheckVersion(responseTemp));
        } else {
            return res.status(404).json({ status: false, message: language('fa', 'client.not.found') })
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: false, message: language('fa', 'enter-data-correctly') });
    }
}
exports.changeVersion = async (req, res) => {
    const deviceType = req.body.deviceType.trim().toLowerCase()
    const normalVersionCode = req.body.normalVersionCode
    const forceVersionCode = req.body.forceVersionCode
    const message = req.body.message
    const updateLink = req.body.updateLink
    const password = req.body.password

    if (!deviceType || !normalVersionCode || !forceVersionCode || !updateLink || !validURL(updateLink))
        return res.status(400).json(generateResponseWithKey(false, 'general.check.input'))

    try {
        if (password !== key)
            return res.status(400).json({
                status: false,
                message: language('fa', 'client.update.key.error')
            });
        let client = await clientVersion.findOne({ deviceType })
        if (!client) {
            client = await new clientVersion({
                deviceType: deviceType,
                normalVersionCode: normalVersionCode,
                forceVersionCode: forceVersionCode,
                message: message,
                updateLink: updateLink,
            });
            client.save()

            setTimeout(() => {
                updateCheckversionCache()
            }, 2000);

            return res.json({
                status: true,
                message: language('fa', 'client.success')
            });
        }
        client.normalVersionCode = normalVersionCode
        client.forceVersionCode = forceVersionCode
        client.message = message
        client.updateLink = updateLink
        client.save()

        setTimeout(() => {
            updateCheckversionCache()
        }, 2000);


        return res.status(200).json({
            status: true,
            message: language('fa', 'client.success')
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: language('fa', 'enter-data-correctly') });
    }
}

exports.brokers = async (req, res) => {
    var data = brokeragesData.filter(o => o.webURL)
    var brokers = data.map(o => {
        var imageUrl = (o.imageName === undefined) ? "" : req.protocol + '://' + req.get("host") + "/public/images/brokers/" + o.imageName + '.jpg'
        return BrokerModel(
            o.id,
            o.name,
            o.webURL,
            imageUrl
        )
    })
    responseTemp = response.generateBrokers(brokers)
    return res.send(responseTemp)
}

exports.stockList = async (req, res) => {
    console.log(`{requestTitle:\"stocks\"}`)
    var responseTemp = null
    try {
        let stocks = await redis.getAsyncCache(keys.stocksList)
        responseTemp = response.generateStocks(JSON.parse(stocks).filter(o => o.name !== "undefined").map(o => {
            if (o.state == "-") {
                o.state = "ممنوع-متوقف"
            }
            return o;
        }))
        console.log(`{responseTitle:\"stocks\",responseCount:"${responseTemp.response.stocks.length}"}`)
        return res.status(200).json(responseTemp)
    } catch (err) {
        console.log(err.message)
        responseTemp = response.generateError(err.message)
        console.log(`{responseTitle:\"stocks\",response:${responseTemp.description}}`)
        return res.status(500).json(responseTemp)
    }
}

exports.getHedgeFundList = async (req, res) => {
    console.log(`{requestTitle:\"hedgeFunds\"}`)
    let responseTemp = null
    try {
        let hedgeFundRanks = await redis.getAsyncCache(keys.hedgeFundRanks)
        responseTemp = response.generateHedgeFunds(JSON.parse(hedgeFundRanks))
        console.log(`{responseTitle:\"hedge funds\",responseCount:"${responseTemp.response.hedgeFunds.length}"}`)
        return res.status(200).json(responseTemp)
    } catch (err) {
        console.log(err.message)
        responseTemp = response.generateError(err.message)
        console.log(`{responseTitle:\"hedgeFunds\",response:${responseTemp.description}}`)
        return res.status(500).json(responseTemp)
    }
}

exports.weatherForecast = async (req, res) => {
    console.log(`{requestTitle:\"weatherForecast\"}`)
    var responseTemp = null
    try {
        let weatherForecast = await redis.getAsyncCache(keys.weatherForecast)
        responseTemp = response.generateWeatherForecast(JSON.parse(weatherForecast))
        console.log(`{responseTitle:\"weatherForecast\",responseCount:"${responseTemp.response.weatherForecast.length}"}`)
        return res.status(200).json(responseTemp)
    } catch (err) {
        console.log(err.message)
        responseTemp = response.generateError(err.message)
        console.log(`{responseTitle:\"weatherForecast\",response:${responseTemp.description}}`)
        return res.status(500).json(responseTemp)
    }
}

exports.symbolHistory = (req, res) => {
    let start_date = req.body.startDate
    let end_date = req.body.endDate
    let instance_code = req.body.instanceCode

    if (!start_date || !end_date || !instance_code || start_date.length != 8 || end_date.length != 8)
        return res.status(400).json(generateResponseWithKey(false, 'general.check.input'))

    try {
        let tempResponse
        irStock.getHistory(instance_code, start_date, end_date)
            .then(historyResponse => {
                if (historyResponse == null || !start_date || !end_date || !instance_code) {
                    tempResponse = response.generateError("fetch data error");
                    console.log(`{responseTitle:\"symbol-history\",response:${tempResponse.description}}`)
                    return res.send(tempResponse)
                } else {
                    tempResponse = response.generateSymbolHistory(historyResponse)
                    console.log(`{requestTitle:\"stocks-details\",responseCount:${JSON.stringify(tempResponse.response.records.length)}}`)
                    return res.send(tempResponse)
                }
            })
            .catch(err => {
                let responseTemp = response.generateError("fetch data error");
                console.log(`{responseTitle:\"symbol-history\",response:${responseTemp.description}}`)
                return res.send(responseTemp)
            })
    } catch (e) {
        let responseTemp = response.generateError("fetch data error");
        console.log(`{responseTitle:\"symbol-history\",response:${responseTemp.description}}`)
        return res.send(responseTemp)
    }
}

exports.stocksDetails = async (req, res) => {
    var stocksIDs = req.body.stocks
    var responseTemp = null
    try {
        let stocks = await redis.getAsyncCache(keys.stocks)
        var selectedStocks = []
        var allstocks = JSON.parse(stocks).filter(o => o.name !== "undefined").map(o => {
            if (o.state == "-") {
                o.state = "ممنوع-متوقف"
            }
            return o;
        })
        for (var i in stocksIDs) {
            var stock = allstocks.find(o => (stocksIDs[i] === o.symbol_code))
            if (stock) {
                selectedStocks.push(stock)
            }
        }
        var responseTempS = null
        if (selectedStocks.length > 0) {
            responseTempS = response.generateStocks(selectedStocks)
            return res.status(200).json({ status: true, response: { stocks: selectedStocks } })
        } else {
            responseTempS = response.generateError(utils.messages.submittedFormat)
            return res.status(400).json(responseTempS)
        }
    } catch (err) {
        console.log(err.message)
        responseTemp = response.generateError(utils.messages.submittedFormat)
        return res.status(500).json(responseTemp)
    }
}

exports.getCurrencies = async (req, res) => {
    try {
        let currencies = await redis.getAsyncCache(keys.currencies)
        let indexes = await redis.getAsyncCache(keys.indexes)
        let cryptos = await redis.getAsyncCache(keys.cryptos)
        let metals = await redis.getAsyncCache(keys.metals)

        var responseTemp = response.generateCurrencies(
            JSON.parse(currencies),
            JSON.parse(metals),
            JSON.parse(indexes),
            JSON.parse(cryptos),
        )
        return res.status(200).json(responseTemp)
    } catch (err) {
        console.log(err.message)
        responseTemp = response.generateError(err.message)
        return res.status(500).json(responseTemp)
    }
}

exports.stocksDetailsWithInstanceIds = async (req, res) => {
    var stocksIDs = req.body.stocks

    try {
        let stocks = await redis.getAsyncCache(keys.stocks)
        var selectedStocks = []
        var allstocks = JSON.parse(stocks).filter(o => o.name !== "undefined").map(o => {
            if (o.state == "-") {
                o.state = "ممنوع-متوقف"
            }
            return o;
        })
        for (var i in stocksIDs) {
            var stock = allstocks.find(o => (stocksIDs[i] === o.instance_code))
            if (stock) {
                selectedStocks.push(stock)
            }
        }
        var responseTempS = null
        if (selectedStocks.length > 0) {
            responseTempS = response.generateStocks(selectedStocks)
            return res.status(200).json(responseTempS)
        } else {
            responseTempS = response.generateError(utils.messages.submittedFormat)
            return res.status(400).json(responseTempS)
        }
    } catch (err) {
        console.log(err.message)
        var responseTemp = response.generateError(stocks)
        return res.status(500).json(responseTemp)
    }
}

exports.getCryptoHistory = async (req, res) => {
    let name = req.body.code;
    let startDate = new Date(req.body.startDate)
    let endDate = new Date(req.body.endDate)
    let period = req.body.period
    console.log(`{requestTitle:\"crypto-history\",request:${JSON.stringify(req.body)}}`)
    if (req.body.endDate < 8 || req.body.startDate < 8 || name.length < 2 || period.length < 2) {
        let responseTemp = response.generateError("fetch data error");
        return res.status(400).json(responseTemp)
    }

    try {
        let result = await redis.getAsyncCache(keys.historyData + "_" + name + "_" + period)
        let history = JSON.parse(result)
        let filter_history = history.filter(function (a) {
            let hitDates = a.time || {};
            let date = new Date(hitDates);
            return date >= startDate && date <= endDate
        });
        let responseTempS = response.generateCryptoHistory(filter_history)
        console.log(`{responseTitle:\"crypto-history\",response:${JSON.stringify(responseTempS.response.history.length)}}`)
        return res.status(200).json(responseTempS)
    } catch (err) {
        console.log(err.message)
        let responseTemp = response.generateError("fetch data error");
        console.log(`{responseTitle:\"crypto-history\",response:${responseTemp.description}}`)
        return res.status(500).json(responseTemp)
    }
}

exports.updateCheckVersion = async () => {
    await updateCheckversionCache()
}

const updateCheckversionCache = async () => {

    try {
        var clients = await clientVersion.find().select('-createdAt -updatedAt -__v')
        redis.cacheData(keys.checkVersionList, clients)
    } catch (err) {
        console.log(err)
    }

}
