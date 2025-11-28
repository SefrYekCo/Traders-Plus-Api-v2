const Alert = require('../models/schemas/alert')
const Plan = require('../models/schemas/plan')
const keys = require("../src/utils").keys
const redis = require('../src/redisManager');
const firebaseService = require('../services/firebase.service')
const { sendAlert } = require('../middleware/smsSender')
const { notifType, PlanType, alertState } = require('../configs/secret')
const emailSender = require('../middleware/mailSender')
const Config = require("../models/schemas/config");
const { parse, stringify } = JSON;

var stocks = null
var cryptos = null

exports.checkTriggeredCryptoAlerts = async () => {
    try {
        var alerts = await fetchCryptoAlerts()
        var notifyAlerts = []
        for (const alert of alerts) {
            let cryptoFounded = cryptos.find(element => String(element.symbol).toLowerCase() === String(alert.symbol).toLowerCase())
            if (cryptoFounded) {
                if (isCryptoTriggered(alert, cryptoFounded)) {
                    notifyAlerts.push(alert)
                }
            }
        }
        await sendNotify(notifyAlerts)
    } catch (err) {
        console.log('checkTriggeredCryptoAlerts', err)
    }
}

exports.checkTriggeredAlerts = async () => {
    try {
        var alerts = await fetchAlerts()
        var notifyAlerts = []
        for (const alert of alerts) {
            let stockFounded = stocks.find(element => String(element.instance_code) === String(alert.symbol))
            if (stockFounded) {
                if (isTriggered(alert, stockFounded)) {
                    notifyAlerts.push(alert)
                }
            }
        }
        await sendNotify(notifyAlerts)
    } catch (err) {
        console.log('checkTriggeredAlerts', err)
    }
}

const sendNotify = async (alerts) => {
    let proPlan = await Plan.findOne({ type: PlanType.pro })
    for (const alert of alerts) {
        await triggredAlert(alert)
        await notify(alert, proPlan)
    }
}

const isCryptoTriggered = (alert, crypto) => {
    var conditions = alert.conditions
    var isTriggered = false
    for (const item of conditions) {
        const current = parseFloat(crypto[item.condition])
        const operation = getOperation(item.type)
        const checked = check(operation, parseFloat(item.value), current)
        if (checked) {
            isTriggered = checked
        } else {
            return checked
        }
    }
    console.log("all conditions triggred")
    return isTriggered
}

const isTriggered = (alert, stock) => {
    var conditions = alert.conditions
    var isTriggered = false
    for (const item of conditions) {
        const current = parseFloat(stock[item.condition])
        const operation = getOperation(item.type)
        const checked = check(operation, parseFloat(item.value), current)
        if (checked) {
            isTriggered = checked
        } else {
            return checked
        }
    }
    console.log("all conditions triggred")
    return isTriggered
}

const check = (operation, value, current) => {
    if (operation === 0) {
        return (value === current)
    } else if (operation === 1) {
        return (current <= value)
    } else if (operation === 2) {
        return (current >= value)
    } else {
        return false
    }
}

const getOperation = (type) => {
    switch (type) {
        case "equal": return 0
        case "lower-than": return 1
        case "greater-than": return 2
        default: return -1
    }
}

const notify = async (alert, proPlan) => {

    let allowedNotifyMethods = parse(await redis.getAsyncCache(keys.allowedNotifyMethods) || '[]');
    if (!allowedNotifyMethods.length) {
        allowedNotifyMethods = (await Config.findOne({ id: "NotifyMethods" })).allowedNotifyMethods;
        console.log(allowedNotifyMethods)
        await redis.cacheData(keys.allowedNotifyMethods, allowedNotifyMethods);
    }

    if (alert.actions.includes('notification') && allowedNotifyMethods.includes('notification')) {
        await sendNotification(alert)
    }
    if (alert.actions.includes('sms') && allowedNotifyMethods.includes('sms')) {
        const userPlans = alert.user.plans
        let index = userPlans.findIndex(x => String(x.planId) === String(proPlan._id))
        if (index >= 0 && (Date.now() < userPlans[index].expireDate)) {
            let text = 'تریدرپلاس' + '\n' + alert.message
            sendAlert(alert.user.mobileNumber, text)
        }
    }
    if (alert.actions.includes('email') && alert.user.email && allowedNotifyMethods.includes('email')) {
        console.log('Start to send email')
        emailSender(alert.user.email, alert)
    }
    if (alert.actions.includes('whatsapp')) {

    }
}

const triggredAlert = async (item) => {
    try {
        let alert = await Alert.findOne({ _id: item._id })
        alert.disable = true
        alert.state.value = alertState.triggered
        alert.state.latest = Date.now()
        alert.save()
    } catch (err) {
        console.log('triggredAlert', err)
    }
}

const fetchAlerts = async () => {

    try {
        stocks = await redis.getAsyncCache(keys.stocks)
        stocks = JSON.parse(stocks)
        var instanceIDs = stocks.map(o => o.instance_code)
        let alerts = await Alert.find({
            disable: false,
            isCrypto: false,
            symbol: { $in: instanceIDs },
            startDate: { $lte: Date.now() },
            expireDate: { $gte: Date.now() }
        }).populate('user', 'mobileNumber plans fcm email')
        console.log("******* count:", alerts.length)
        console.log("******* names:", alerts.map(o => o.name))
        return alerts
    } catch (err) {
        console.log('fetchAlerts', err)
        return []
    }

}

const fetchCryptoAlerts = async () => {
    try {
        cryptos = await redis.getAsyncCache(keys.cryptos)
        cryptos = JSON.parse(cryptos)
        var symbols = cryptos.map(o => String(o.symbol).toLowerCase())
        let alerts = await Alert.find({
            disable: false,
            isCrypto: true,
            symbol: { $in: symbols },
            startDate: { $lte: Date.now() },
            expireDate: { $gte: Date.now() }
        }).populate('user', 'mobileNumber plans fcm email')
        console.log("******* crypto alerts count:", alerts.length)
        console.log("******* crypto alerts names:", alerts.map(o => o.name))
        return alerts
    } catch (err) {
        console.log('fetchCryptoAlerts', err)
        return []
    }

}

const sendNotification = async (alert) => {
    let fcmObject = { notificationType: `${notifType.alertTriggered}` };
    var data = {
        ...fcmObject,
        title: !alert.name ? 'آلارم' : alert.name,
        message: `${alert.message}`,
        image: '',
        destination: ``,
        action: '',
    }
    var fcmToken = alert.user.fcm.token
    if (fcmToken) {
        var response = await firebaseService.sendMessage(fcmToken, data)
        if (response.successCount > 0) {
            console.log("Successfully sent notification")
        }
    }
}

const sendToWhatsapp = (phone) => {

}
