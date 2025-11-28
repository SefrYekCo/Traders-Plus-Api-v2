const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../configs/secret");
const language = require('../helpers/language/index');
const redis = require('../src/redisManager')
const keys = require('../src/utils').keys
const { PlanType } = require('../configs/secret')
const config = require('../config');
const key = config.update.key

exports.authGetMessages = async (req, res, next) => {
    const token = req.header("token");
    if (req.headers.password === key) {
        return await next();
    }
    const channelId = req.params.channelId || req.query.channelId
    if (!token) {
        var channels = await redis.getAsyncCache(keys.channels)
        channels = JSON.parse(channels)
        let channelIndex = channels.findIndex(x => x._id === channelId)
        if (channelIndex === -1)
            return res.status(401).json({
                status: false,
                description: language('fa', 'channel.not.found')
            })
        let channel = channels[channelIndex]
        if (channel.plan.type === PlanType.public) {
            await next()
        } else {
            return res.status(401).json({ message: language('fa', 'token.invalid') });
        }

    } else {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
            await next();
        } catch (err) {
            return res.status(401).json({ message: language('fa', 'token.invalid') });
        }
    }


};

exports.authGetChannels = async (req, res, next) => {
    const token = req.header("token");
    if (!token) {
        await next();
    } else {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
            await next();
        } catch (err) {
            return res.status(401).json({ message: language('fa', 'token.invalid') });
        }
    }
}