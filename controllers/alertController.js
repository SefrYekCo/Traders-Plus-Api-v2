const redis = require('../src/redisManager')
const keys = require('../src/utils').keys
var fs = require('fs');
const { alertLimitation } = require('../configs/secret')
const { validationResult } = require("express-validator");
const {
    generateResponse,
    generateResponseWithKey
} = require('../models/responseModel')

const { parse, stringify } = JSON;
const Alert = require('../models/schemas/alert')
const Config = require('../models/schemas/config')

exports.addAlert = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array())
        return res.status(400).json(generateResponseWithKey(false, errors.array()[0].msg));
    }
    try {
        var alert = await new Alert({
            name: req.body.name,
            message: req.body.message,
            symbol: String(req.body.symbol).toLowerCase(),
            sound: req.body.sound,
            user: req.user._id,
            justOnce: req.body.justOnce,
            startDate: new Date(req.body.startDate),
            expireDate: new Date(req.body.expireDate),
            actions: req.body.actions,
            conditions: req.body.conditions,
            isCrypto: !req.body.isCrypto ? false : req.body.isCrypto
        })
        alert.save()

        const tempStocksList = JSON.parse(await redis.getAsyncCache(keys.stocks));
        const tempCryptoList = JSON.parse(await redis.getAsyncCache(keys.cryptos));

        let details;
        if (alert.symbol.length < 10) {
            details = tempCryptoList.find(crypto => crypto.symbol.toLowerCase() === String(req.body.symbol).toLowerCase())
        } else {
            details = tempStocksList.find(stock => stock.instance_code == String(req.body.symbol).toLowerCase())
        }
        var returnedObject = {
            id: alert._id,
            name: alert.name,
            message: alert.message,
            symbol: alert.symbol,
            sound: alert.sound,
            justOnce: alert.justOnce,
            disable: alert.disable,
            startDate: alert.startDate.getTime(),
            expireDate: alert.expireDate.getTime(),
            actions: alert.actions,
            conditions: alert.conditions,
            state: {
                latest: !alert.state.latest ? 0 : alert.state.latest.getTime(),
                value: alert.state.value
            },
            isCrypto: alert.isCrypto,
            details: details || null
        }

        return res.status(200).json(generateResponse(true, { alert: returnedObject }))
    } catch (err) {
        console.log(err)
        return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
    }
}

exports.editAlert = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array())
        return res.status(400).json(generateResponseWithKey(false, errors.array()[0].msg));
    }
    try {
        var alert = await Alert.findOne({
            _id: req.body.id
        }).select('-active -user -createdAt -updatedAt')
        if (!alert)
            return res.status(404).json(generateResponseWithKey(false, 'alert.notfound'))

        if (!req.body.disable) {
            if (alert.disable) {
                var alertsCount = await Alert.countDocuments({ user: req.user._id, disable: false })
                if (alertsCount >= alertLimitation) {
                    return res.status(403).json(generateResponseWithKey(false, 'alert.limitation.reached'))
                }
            }
        }

        alert.name = req.body.name
        alert.message = req.body.message
        alert.symbol = String(req.body.symbol).toLowerCase()
        alert.sound = req.body.sound
        alert.user = req.user._id
        alert.justOnce = req.body.justOnce
        alert.disable = req.body.disable
        alert.startDate = new Date(req.body.startDate)
        alert.expireDate = new Date(req.body.expireDate)
        alert.actions = req.body.actions
        alert.conditions = req.body.conditions
        alert.isCrypto = !req.body.isCrypto ? false : req.body.isCrypto
        alert.save()

        const tempStocksList = JSON.parse(await redis.getAsyncCache(keys.stocks));
        const tempCryptoList = JSON.parse(await redis.getAsyncCache(keys.cryptos));

        let details;
        if (alert.symbol.length < 10) {
            details = tempCryptoList.find(crypto => crypto.symbol.toLowerCase() === String(req.body.symbol).toLowerCase())
        } else {
            details = tempStocksList.find(stock => stock.instance_code == String(req.body.symbol).toLowerCase())
        }
        var returnedObject = {
            id: alert._id,
            name: alert.name,
            message: alert.message,
            symbol: alert.symbol,
            sound: alert.sound,
            justOnce: alert.justOnce,
            disable: alert.disable,
            startDate: alert.startDate.getTime(),
            expireDate: alert.expireDate.getTime(),
            actions: alert.actions,
            conditions: alert.conditions,
            state: {
                latest: !alert.state.latest ? 0 : alert.state.latest.getTime(),
                value: alert.state.value
            },
            isCrypto: alert.isCrypto,
            details: details || null
        }

        return res.status(200).json(generateResponse(true, { alert: returnedObject }))
    } catch (err) {
        console.log(err)
        return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
    }
}

exports.getAlerts = async (req, res) => {
    var disable = req.query.disable
    try {
        var alerts = await Alert.find({
            user: req.user._id,
            disable: disable
        }).select('-user -createdAt -updatedAt')
        const tempStocksList = JSON.parse(await redis.getAsyncCache(keys.stocks));
        const tempCryptoList = JSON.parse(await redis.getAsyncCache(keys.cryptos));

        alerts = alerts.map(alert => {
            let details;
            if (alert.symbol.length < 10) {
                details = tempCryptoList.find(crypto => crypto.symbol.toLowerCase() === alert.symbol.toLowerCase())
            } else {
                details = tempStocksList.find(stock => stock.instance_code == alert.symbol)
            }

            return {
                id: alert._id,
                name: alert.name,
                message: alert.message,
                symbol: alert.symbol,
                sound: alert.sound,
                justOnce: alert.justOnce,
                disable: alert.disable,
                startDate: alert.startDate.getTime(),
                expireDate: alert.expireDate.getTime(),
                actions: alert.actions,
                conditions: alert.conditions,
                state: {
                    latest: !alert.state.latest ? 0 : alert.state.latest.getTime(),
                    value: alert.state.value
                },
                isCrypto: alert.isCrypto,
                deatils: details || null
            }
        })

        alerts = alerts.map(alert => {
            if (alert.expireDate < Date.now()) {
                alert.disable = true;
            }
            return alert
        });

        alerts = alerts.filter(alert => alert.disable === (disable === "true"));

        return res.status(200).json(generateResponse(true, { alerts: alerts }))
    } catch (err) {
        console.log(err)
        return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
    }
}

exports.getList = async (req, res) => {
    const methods = ["notification", "sms", "email"];
    try {

        let allowedNotifyMethods = parse(await redis.getAsyncCache(keys.allowedNotifyMethods) || '[]');
        if (!allowedNotifyMethods.length) {
            allowedNotifyMethods = (await Config.findOne({ id: "NotifyMethods" })).allowedNotifyMethods;
            console.log(allowedNotifyMethods)
            await redis.cacheData(keys.allowedNotifyMethods, allowedNotifyMethods);
        }
        return res.status(200).json(generateResponse(true, {
            list: methods.map((method) => {
                return {
                    name: method,
                    id: method,
                    active: allowedNotifyMethods.includes(method)
                }
            })
        }));

    } catch (error) {
        console.log(error)
        return res.status(500).json(generateResponseWithKey(false, 'error.unknown'));
    }
}