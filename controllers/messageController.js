const language = require('../helpers/language/index');
const Message = require('../models/schemas/message')
const Channel = require('../models/schemas/channel')
const { getUrl, normalDateFormatter, convertDateToTimezone } = require('../helpers/helper');
const response = require('../models/responseModel');
const {
    generateResponse, generateResponseWithKey
} = require('../models/responseModel');
const User = require('../models/schemas/user');
const redis = require('../src/redisManager')
const keys = require('../src/utils').keys
const config = require('../config');
const message = require('../models/schemas/message');
const key = config.update.key
const { sendNotifications } = require('../tasks/update')

exports.sendMessage = async (req, res) => {
    var imagePath = null
    const password = req.body.password
    const imageUrl = req.body.imageUrl
    if (password !== key)
        return res.status(400).json({
            status: false,
            message: language('fa', 'client.update.key.error')
        });

    if (!req.body.content)
        return res.status(400).json({ status: false, discription: language('fa', 'general.check.input') })
    if (!req.body.channelId)
        return res.status(400).json({ status: false, discription: language('fa', 'general.check.input') })

    if (imageUrl) {
        imagePath = imageUrl
    } else if (req.files.image) {
        console.log('have images');
        imagePath = req.files.image[0].path;
    }
    if (!req.body.content && !imagePath)
        return res.status(400).json({ status: false, description: language('fa', 'error.contect.notfound') })
    try {
        const user = await User.findOne({ _id: req.user._id })
        if (!user)
            return res.status(404).json({ status: false, description: language('fa', 'user.not.found') })

        const channel = await Channel.findOne({ _id: req.body.channelId })
        if (!channel)
            return res.status(404).json({ status: false, description: language('fa', 'channel.not.found') })
        const message = await new Message()
        message.content = req.body.content
        message.publisher = req.user._id
        message.channel = req.body.channelId
        message.file = imagePath
        message.link = req.body.link
        message.title = req.body.title
        message.destination = req.body.destination
        message.action = req.body.action
        message.save()

        console.log(message)



        setTimeout(() => {
            // TODO: rafe vabastegi
            sendNotifications(channel, message)
            updateMessagesList()
        }, 2000);

        return res.status(200).json({ status: true, description: language('fa', 'message.sended') })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ status: false, description: language('fa', 'error.unknown') })
    }
}

exports.getMessages = async (req, res) => {
    const channelId = req.params.channelId
    var userId = null
    if (req.user && req.user._id)
        userId = req.user._id
    var responseTemp = null
    try {
        var messages = await redis.getAsyncCache(keys.messages + '_' + channelId)
        messages = JSON.parse(messages)
        var filteredMessages = []
        var max = (messages.length <= 60) ? messages.length : 60
        for (var i = 0; i < max; i++) {
            filteredMessages.push(messages[i])
        }
        filteredMessages.reverse()
        var returnedMessages = filteredMessages.map(o => {
            return {
                _id: o._id,
                content: o.content,
                file: o.file,
                publisher: o.publisher,
                reply: o.reply,
                deleted: o.deleted,
                edited: o.edited,
                likeCount: o.likes.length,
                liked: (!userId) ? false : o.likes.includes(userId),
                link: o.link,
                title: o.title,
                createdAt: o.createdAt,
                updatedAt: o.updatedAt,
                destination: o.destination,
                action: o.action
            }
        })
        responseTemp = { status: true, response: { messages: returnedMessages } }
        console.log(`{responseTitle:\"messages\",responseCount:"${responseTemp.response.messages.length}"}`)
        return res.status(200).json(responseTemp)

    } catch (err) {
        console.log(err.message)
        responseTemp = response.generateError(err.message)
        console.log(`{responseTitle:\"messages\",response:${responseTemp.description}}`)
        return res.status(500).json(responseTemp)
    }
}

exports.getMessagesV2 = async (req, res) => {
    var perPage = 20
    var page = Math.max(0, parseInt(req.query.page))
    var channelId = req.query.channelId
    var messages = []
    var responseTemp = null
    var userId = null
    if (req.user && req.user._id)
        userId = req.user._id

    try {
        var total = await Message.countDocuments({ channel: channelId })
        const skip = perPage * page
        console.log('total:', total, 'skip:', skip)
        if (skip < 300) {
            var msgs = await redis.getAsyncCache(keys.messages + '_' + channelId)
            msgs = JSON.parse(msgs)
            // const max = (total > skip + perPage) ? skip + perPage : total
            const max = skip + perPage
            for (var i = skip; i < max; i++) {
                if (msgs[i] !== undefined) {
                    messages.push(msgs[i])
                }
            }
        } else {
            var msgs = await Message.find({
                channel: channelId,
                deleted: false
            })
                .populate('channel', '_id name')
                .populate('publisher', '_id name family')
                .populate('reply', '-createdAt -updatedAt')
                .skip(perPage * page)
                .limit(perPage)
                .sort({
                    createdAt: 'desc'
                })
            messages = mapingMessagesToNormalModels(msgs)
        }

        var returnedMessages = messages.map((o ,index) => {
            return {
                _id: o._id ,
                content: o.content,
                file: o.file,
                publisher: o.publisher,
                reply: o.reply,
                deleted: o.deleted,
                edited: o.edited,
                likeCount: o.likes.length,
                liked: (!userId) ? false : o.likes.includes(userId),
                link: o.link,
                title: o.title,
                createdAt: o.createdAt,
                updatedAt: o.updatedAt,
                destination: o.destination,
                action: o.action
            }
        })
        responseTemp = { status: true, response: { total: total, messages: returnedMessages } }
        console.log(`{responseTitle:\"messages\",responseCount:"${responseTemp.response.messages.length}"}`)
        return res.status(200).json(responseTemp)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: false, description: language('fa', 'error.unknown') })
    }
}


exports.likeMessage = async (req, res) => {
    const userId = req.user._id
    const _id = req.body.id
    var isLike;
    if (!req.body.id)
        return res.status(400).json({ status: false, discription: language('fa', 'general.check.input') })
    try {
        var message = await Message.findOne({ _id: _id })
        if (!message)
            return res.status(404).json({ status: false, description: language('fa', 'message.notfound') })
        if (message.likes.length === 0) {
            message.likes.push(userId)
            message.save()
            isLike = true
        } else {
            const index = message.likes.indexOf(userId);
            if (index > -1) {
                message.likes.splice(index, 1);
                message.save()
                isLike = false
            } else {
                message.likes.push(userId)
                message.save()
                isLike = true
            }
        }

        setTimeout(() => {
            updateMessagesList()
        }, 2000);

        const returedMessage = {
            _id: message._id,
            content: message.content,
            liked: isLike,
            file: message.file,
            deleted: message.deleted,
            likeCount: message.likes.length,
            link: message.link,
            title: message.title
        }
        return res.json({ status: true, response: { message: returedMessage } })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: false, description: language('fa', 'error.unknown') })
    }
}

exports.editMessage = async (req, res) => {
    const userId = req.user._id
    const _id = req.body.id
    const content = req.body.content
    const imageUrl = req.body.imageUrl
    const password = req.body.password
    if (password !== key)
        return res.status(400).json({
            status: false,
            message: language('fa', 'client.update.key.error')
        });
    if (!req.body.id)
        return res.status(400).json({ status: false, discription: language('fa', 'general.check.input') })
    if (!content)
        return res.status(400).json({ status: false, description: language('fa', 'error.contect.notfound') })
    try {
        var message = await Message.findOne({ _id: _id,  ...( (!req.headers.password) && { publisher: userId }) })
        if (!message)
            return res.status(404).json({ status: false, description: language('fa', 'message.notfound') })
        message.content = content
        message.link = req.body.link
        message.title = req.body.title
        message.destination = req.body.destination
        message.action = req.body.action
        message.edited = true
        if (imageUrl) message.file = imageUrl
        message.save()
        setTimeout(() => {
            updateMessagesList()
        }, 2000);
        return res.status(200).json({ status: true, description: language('fa', 'message.edited') })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: false, description: language('fa', 'error.unknown') })
    }
}

exports.deleteMessage = async (req, res) => {
    const userId = req.user._id
    const _id = req.body.id
    const password = req.body.password
    if (password !== key)
        return res.status(400).json(generateResponseWithKey(false, 'client.update.key.error'))
    if (!req.body.id)
        return res.status(400).json(generateResponseWithKey(false, 'general.check.input'))
    try {
        var message = await Message.findOne({ _id: _id , ...( (!req.headers.password) && { publisher: userId })})
        if (!message)
            return res.status(404).json(generateResponseWithKey(false, 'message.notfound'))
        message.deleted = true
        message.save()
        setTimeout(() => {
            updateMessagesList()
        }, 2000);
        return res.status(200).json(generateResponseWithKey(true, 'message.deleted'))
    } catch (err) {
        console.log(err)
        return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
    }
}

exports.updateMessages = async () => {
    await updateMessagesList()
}

const updateMessagesList = async () => {
    // TODO: change prePage to 300 records
    var perPage = 300
    var page = 0
    try {
        var ids = await Channel.find({ isActive: true }).select("_id")
        ids = ids.map(o => { return o._id })
        for (const i in ids) {
            var msgs = await Message.find({
                channel: ids[i],
                deleted: false
            })
                .populate('channel', '_id name')
                .populate('publisher', '_id name family')
                .populate('reply', '-createdAt -updatedAt')
                .skip(perPage * page)
                .limit(perPage)
                .sort({
                    createdAt: 'desc'
                })
            msgs = mapingMessagesToNormalModels(msgs)
            redis.cacheData(keys.messages + '_' + ids[i], msgs)
        }

        console.log('messages list cache updated')
    } catch (err) {
        console.log(err)
    }
}

const mapingMessagesToNormalModels = (messages) => {

    return messages.map(o => {
        if (o.file && !o.file.includes('http'))
            o.file = process.env.PAYMENT_URL + '/' + o.file

        return {
            edited: o.edited,
            reportCount: o.reportCount,
            likes: o.likes,
            deleted: o.deleted,
            _id: o._id,
            content: o.content,
            publisher: o.publisher,
            channel: o.channel,
            file: o.file,
            link: o.link,
            title: o.title,
            infoldId: o.infoldId,
            createdAt: convertDateToTimezone(o.createdAt, "GMT"),
            updatedAt: convertDateToTimezone(o.updatedAt, "GMT"),
            destination: o.destination,
            action: o.action,
        }

    })

}

exports.getMessageById = async (req ,res) => {
    try {

        const id = req.params.messageId
        const message = await Message.findOne({_id:id})
        if(!message) return res.status(404).json({status:false ,message:"message not found"})
        return res.status(200).json({status:true ,response:message})
        
    } catch (err) {
        console.log(err);
        return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
    }
}