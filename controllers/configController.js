const config = require('../config');
const Channel = require('../models/schemas/channel')
const key = config.update.key
const { generateResponseWithKey, generateResponse } = require('../models/responseModel')
const { updateChannels } = require('../controllers/channelController')
const { getEnv, setEnv } = require('../helpers/envHelper')

exports.enableNotifications = async (req, res) => {
    const enable = req.body.enable
    const password = req.body.password
    if (password !== key)
        return res.status(400).json(generateResponseWithKey(false, 'client.update.key.error'))
    if (typeof enable != 'boolean')
        return res.status(400).json(generateResponseWithKey(false, 'general.check.input'))

    setEnv('ENABLE_NOTIFICATIONS', `${enable}`)

    return res.status(200).json(generateResponse(true, {
        enable: enable
    }))
}

exports.daysBeforeSendNotificationForExpirePlans = async (req, res) => {
    const days = req.body.days
    const password = req.body.password

    if (password !== key)
        return res.status(400).json(generateResponseWithKey(false, 'client.update.key.error'))
    if (!Number.isInteger(days))
        return res.status(400).json(generateResponseWithKey(false, 'general.check.input'))

    setEnv('DAYS_FOR_SEND_NOTIFICATIONS_BEFORE_EXPIRE', `${days}`)

    return res.status(200).json(generateResponse(true, {
        days: parseInt(days)
    }))
}

exports.muteChannelNotifications = async (req, res) => {
    const _id = req.body.channelId
    const muted = req.body.mute
    const password = req.body.password

    if (password !== key)
        return res.status(400).json(generateResponseWithKey(false, 'client.update.key.error'))
    if (typeof muted != 'boolean')
        return res.status(400).json(generateResponseWithKey(false, 'general.check.input'))
    try {
        var channel = await Channel.findOne({ _id })
        if (!channel)
            return res.status(404).json(generateResponseWithKey(false, 'channel.not.found'))

        channel.muted = muted
        channel.save()
        setTimeout(() => {
            updateChannels()
        }, 2000);
        return res.status(200).json(generateResponse(true, { id: channel._id, muted: muted }))
    } catch (err) {
        console.log(err)
        return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
    }
}



// if (result.error) {
//     throw result.error
// }

// var channels = process.env.DISABLE_CHANNELS_NOTIFICATIONS
// var days = process.env.DAYS_FOR_SEND_NOTIFICATIONS_AFTER_EXPIRE
// days = parseInt(days)
// console.log(days, typeof days);
// console.log(process.env.DISABLE_CHANNELS_NOTIFICATIONS);
