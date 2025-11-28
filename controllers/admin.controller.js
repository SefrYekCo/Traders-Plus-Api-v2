const {
    generateResponse,
    generateResponseWithKey
} = require('../models/responseModel')
const { notifType, firebaseServerKey } = require('../configs/secret')
const firebaseService = require('../services/firebase.service')
const User = require('../models/schemas/user')
const Channel = require('../models/schemas/channel')
const Category = require('../models/schemas/chatroomCategory')
const Plan = require('../models/schemas/plan')
const NotificationReport = require('../models/schemas/notification.report')
const Config = require("../models/schemas/config");
const redis = require('../src/redisManager');
const { keys } = require('../src/utils')
const { exec } = require("child_process");
const util = require('util');
const { readFileSync } = require('fs');
const language = require('../helpers/language/index');
const { dailyExpire } = require('../configs/secret')
const { default: axios } = require('axios')

const { parse, stringify } = JSON;

exports.getNotificationsReport = async (req, res) => {

    try {
        var reports = await NotificationReport.find({})
            .populate('corrects', 'mobileNumber')
            .populate('wrongs', 'mobileNumber')

        reports = reports.map(o => {
            return {
                _id: o._id,
                title: o.title,
                message: o.message,
                action: o.action,
                destination: o.destination,
                createdAt: o.createdAt,
                updatedAt: o.updatedAt,
                corrects: o.corrects.map(obj => obj.mobileNumber),
                wrongs: o.wrongs.map(obj => obj.mobileNumber),
            }
        })
        return res.status(200).json({
            status: true,
            response: { reports }
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
    }

}

exports.sendNotificationByCount = async (req, res) => {
    var title = req.body.title
    var message = req.body.message
    var destination = req.body.destination
    var action = req.body.action

    try {
        var tokens = await User.find({ fcm: { $ne: null, $exists: true } }).skip(req.body.from).limit(req.body.count);
        var data = notifData(title, message, destination, action)
        var wrongCounter = 0
        var rightCounter = 0
        var correctUsers = []
        var wrongUsers = []
        for (const i in tokens) {
            var fcm = tokens[i].fcm.token
            var response = await firebaseService.sendMessage(fcm, data)
            if (response.successCount > 0) {
                console.log("Successfully sent notification => ");
                rightCounter += 1
                correctUsers.push({ mobileNumber: tokens[i].mobileNumber, _id: i._id })
            } else {
                wrongCounter += 1
                wrongUsers.push({ mobileNumber: tokens[i].mobileNumber, _id: i._id })
            }
        }
        var report = await new NotificationReport()
        report.title = title
        report.message = message
        report.action = action
        report.destination = destination
        report.corrects = correctUsers.map(o => o._id)
        report.wrongs = wrongUsers.map(o => o._id)
        report.save()

        return res.status(200).json({
            status: true,
            response: {
                corrects: rightCounter,
                wrongs: wrongCounter,
                correctOnes: correctUsers.map(o => o.mobileNumber),
                wrongOnes: wrongUsers.map(o => o.mobileNumber),
            }
        })

    } catch (err) {
        console.log(err)
        return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
    }

}

exports.sendNotification = async (req, res) => {
    var title = req.body.title
    var message = req.body.message
    var destination = req.body.destination
    var action = req.body.action
    var tokens = req.body.tokens

    try {
        var data = notifData(title, message, destination, action)
        var wrongCounter = 0
        var rightCounter = 0
        var wrongFcms = []
        var correctFcms = []
        for (const i in tokens) {
            var fcm = tokens[i]
            var response = await firebaseService.sendMessage(fcm, data)
            if (response.successCount > 0) {
                console.log("Successfully sent notification => ");
                rightCounter += 1
                correctFcms.push(fcm)
            } else {
                wrongCounter += 1
                wrongFcms.push(fcm)
            }
        }
        var correctUsers = []
        var wrongUsers = []
        if (correctFcms.length > 0) {
            correctUsers = await User.find({ "fcm.token": { $in: correctFcms } }).select("mobileNumber")
        }
        if (wrongFcms.length > 0) {
            wrongUsers = await User.find({ "fcm.token": { $in: wrongFcms } }).select("mobileNumber")
        }

        var report = await new NotificationReport()
        report.title = title
        report.message = message
        report.action = action
        report.destination = destination
        report.corrects = (correctUsers.length == 0) ? [] : correctUsers.map(o => o._id)
        report.wrongs = (wrongUsers.length == 0) ? [] : wrongUsers.map(o => o._id)
        report.save()

        return res.status(200).json({
            status: true,
            response: {
                corrects: rightCounter,
                wrongs: wrongCounter,
                correctOnes: correctUsers.map(o => o.mobileNumber),
                wrongOnes: wrongUsers.map(o => o.mobileNumber),
            }
        })

    } catch (err) {
        console.log(err)
        return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
    }

}
exports.getChannels = async (req, res) => {
    try {
        const temp = await Channel.find().populate('plan').populate('category');
        return res.status(200).json({
            status: true,
            response: { channles: temp }
        })
    } catch (x) {
        return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
    }
}
exports.getFCMs = async (req, res) => {
    try {
        const execP = util.promisify(exec);
        await execP("mongoexport --db=tradersplus --collection=users --type=csv --fields=fcm  --out=./private/users.csv");
        return res.status(200).set('content-type', 'text/csv').send(readFileSync('./private/users.csv'));
    } catch (x) {
        return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
    }
}
exports.updateNotifyMethods = async (req, res) => {
    try {

        if (typeof req.body.notifyMethods !== "object") {
            return res.status(400).json(generateResponseWithKey(false, "general.check.input"));
        }
        const { allowedNotifyMethods } = await Config.findOneAndUpdate({ id: "NotifyMethods" }, { allowedNotifyMethods: req.body.notifyMethods }, { new: true, upsert: true });
        await redis.cacheData(keys.allowedNotifyMethods, allowedNotifyMethods);
        return res.status(200).json({
            status: true,
            response: { allowedNotifyMethods }
        });

    } catch (error) {
        return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
    }
}
exports.activePlan = async (req, res) => {
    const { mobileNumber, planId, period } = req.body;
    if (!Number.isInteger(period))
        return res.status(400).json(generateResponseWithKey(false, 'general.check.input'))
    if (!planId)
        return res.status(400).json(generateResponseWithKey(false, 'plan.id.not.found'))
    try {
        const user = await User.findOne({ mobileNumber })
        if (!user)
            return res.status(404).json(generateResponseWithKey(false, 'user.not.found'))

        const plan = await Plan.findOne({ _id: planId })
        if (!plan)
            return res.status(404).json(generateResponseWithKey(false, 'plan.not.found'))
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
        return res.status(200).json({ status: true, description: language('fa', 'plan.bought') })
    } catch (err) {
        return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
    }
}

exports.getUsersReport = async (req, res) => {
    try {
        const users = await User.aggregate([{
            $lookup: {
                from: 'transactions',
                localField: '_id',
                foreignField: 'user',
                as: 'transactions'
            }
        }]).skip(Number(req.query.skip)).limit(Number(req.query.limit));

        return res.status(200).json({
            status: true,
            response: { users }
        })

    } catch (err) {
        return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
    }
}

exports.sendWebNotification = async (req ,res) => {
    try {
        const {title , body} = req.body;
        
        const tokens = await User.find({platform: "web" ,web_notification_token:{ $ne: null }}).select("web_notification_token")
        console.log(tokens);

        if(tokens.length >= 1000) {
            let success = 0 
            let failure = 0
            const chunkSize = 999;
            for (let i = 0; i < tokens.length; i += chunkSize) {
                const chunk = tokens.slice(i, i + chunkSize);
                const data = {
                    registration_ids:[
                        ...chunk
                    ],
                    notification :{
                        title,
                        body
                    }
                }

                const res = await axios.post("https://fcm.googleapis.com/fcm/send" , data , {
                    headers:{
                        "Authorization":firebaseServerKey,
                        "Content-Type":"application/json"
                    }
                })

                success += res.data.success; 
                failure += res.data.failure;
            }

            return res.status(200).json({status:true ,response:{success ,failure}})
        }

        const data = {
            registration_ids:[
                ...tokens
            ],
            notification :{
                title,
                body
            }
        }
        
        const firebaseRes = await axios.post("https://fcm.googleapis.com/fcm/send" , data , {
            headers:{
                "Authorization":firebaseServerKey,
                "Content-Type":"application/json"
            }
        } )


        let success = firebaseRes.data.success;
        let failure = firebaseRes.data.failure;

        return res.status(200).json({status:true ,response:{success ,failure}})

    } catch (err) {
        return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
    }
}

exports.sendWebNotificationToLimitedUser = async (req ,res) => {
    try {
        const {title , body ,tokens } = req.body;

        const data = {
            registration_ids:[
                ...tokens
            ],
            notification :{
                title,
                body
            }
        }
        
        const firebaseRes = await axios.post("https://fcm.googleapis.com/fcm/send" , data , {
            headers:{
                "Authorization":firebaseServerKey,
                "Content-Type":"application/json"
            }
        } )

        
        let success = firebaseRes.data.success;
        let failure = firebaseRes.data.failure;

        return res.status(200).json({status:true ,response:{success ,failure}})

    } catch (err) {
        return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
    }
}


const notifData = (title, message, destination, action) => {
    let fcmObject = { notificationType: `${notifType.custom}` };
    return {
        ...fcmObject,
        title: title,
        message: message,
        image: '',
        destination: destination,
        action: action,
    }

}

var calculateExpireDateOfPlan = (period) => {
    return dailyExpire * period
}