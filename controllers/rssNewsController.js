const keys = require("../src/utils").keys
const language = require("../helpers/language");
const redis = require('../src/redisManager');
const Message = require('../models/schemas/message');
const User = require('../models/schemas/user');
const { updateMessages } = require("./messageController");
const { normalDateFormatter } = require("../helpers/helper");

exports.getBourseRss = async (req ,res) => {
    try {
        let bourseRss = JSON.parse(await redis.getAsyncCache(keys.BourseRss)) 
        console.log(bourseRss.length);
        return res.status(200).json({status:200 ,response:{bourseRss}})
    } catch (err) {
        console.log(err);
        return res.status(500).json({ status: false, message: language('fa', 'error.unknown') })
    }
}

exports.getCarRss = async (req ,res) => {
    try {
        let carRss = JSON.parse(await redis.getAsyncCache(keys.carRss)) 
        console.log(carRss.length);
        return res.status(200).json({status:200 ,response:{carRss}})
    } catch (err) {
        console.log(err);
        return res.status(500).json({ status: false, message: language('fa', 'error.unknown') })
    }
}

exports.getHousingRss = async (req ,res) => {
    try {
        let housingRss = JSON.parse(await redis.getAsyncCache(keys.housingRss)) 
        console.log(housingRss.length);
        return res.status(200).json({status:200 ,response:{housingRss}})
    } catch (err) {
        console.log(err);
        return res.status(500).json({ status: false, message: language('fa', 'error.unknown') })
    }
}

exports.getLastNewsRss = async (req ,res) => {
    try {
        let lastNews = JSON.parse(await redis.getAsyncCache(keys.lastNewsRss)) 
        console.log(lastNews.length);
        return res.status(200).json({status:200 ,response:{lastNews}})
    } catch (err) {
        console.log(err);
        return res.status(500).json({ status: false, message: language('fa', 'error.unknown') })
    }
}

exports.getMostViewRss = async (req ,res) => {
    try {
        let mostViews = JSON.parse(await redis.getAsyncCache(keys.mostViewRss)) 
        console.log(mostViews.length);
        return res.status(200).json({status:200 ,response:{mostViews}})
    } catch (err) {
        console.log(err);
        return res.status(500).json({ status: false, message: language('fa', 'error.unknown') })
    }
}


exports.getCurrenciesRss = async (req ,res) => {
    try {
        let currenciesRss = JSON.parse(await redis.getAsyncCache(keys.currenciesRss)) 
        console.log(currenciesRss.length);
        return res.status(200).json({status:200 ,response:{currenciesRss}})
    } catch (err) {
        console.log(err);
        return res.status(500).json({ status: false, message: language('fa', 'error.unknown') })
    }
}

exports.getCryptosRss = async (req ,res) => {
    try {
        let cryptosRss = JSON.parse(await redis.getAsyncCache(keys.cryptoRss)) 
        console.log(cryptosRss.length);
        return res.status(200).json({status:200 ,response:{cryptosRss}})
    } catch (err) {
        console.log(err);
        return res.status(500).json({ status: false, message: language('fa', 'error.unknown') })
    }
}


exports.getBourseRssFromCache = async () => {
    try {
        const date = new Date()
        var userID =  process.env.NEWS_ADMIN_USER_ID
        var channelId = process.env.BOURSE_RSS_CHANNEL_ID
        const bourseMessages = JSON.parse( await redis.getAsyncCache(keys.BourseRss))
        console.log("bourse Messages lenght:" ,bourseMessages.length);

        var returnedMessages = bourseMessages.map((o ,index) => {
            return {
                _id: String(index + 1) ,//rss doesn't have _id .use index instead _id
                content: o.content ? o.content : "",
                file: o.file ? o.file : "",
                publisher: {
                    _id : userID,
                    name: "امیر حسین",
                    family: "امین پویا"
                },
                reply: o.reply,
                deleted: o.deleted ? o.deleted : "",
                edited: false,
                likes: "",
                liked: false,
                link: o.link ? o.link : "",
                title: o.title ? o.title : "",
                createdAt: normalDateFormatter(date) ,
                updatedAt: normalDateFormatter(date),
                destination: "",
                action: ""
            }
        })

        await redis.cacheData(keys.messages + '_' + channelId ,returnedMessages)
    } catch (err) {
        console.log(err);
    }
}

exports.getCurrenciesRssFromCache = async () => {
    try {
        const date = new Date()
        var userID =  process.env.NEWS_ADMIN_USER_ID
        var channelId = process.env.CURRENCIES_RSS_CHANNEL_ID
        const currenciesMessages = JSON.parse( await redis.getAsyncCache(keys.currenciesRss))
        console.log("bourse Messages lenght:" ,currenciesMessages.length);

        var returnedMessages = currenciesMessages.map((o ,index) => {
            return {
                _id: String(index + 1) ,//rss doesn't have _id .use index instead _id
                content: o.content ? o.content : "",
                file: o.file ? o.file : "",
                publisher: {
                    _id : userID,
                    name: "امیر حسین",
                    family: "امین پویا"
                },
                reply: o.reply,
                deleted: o.deleted ? o.deleted : "",
                edited: false,
                likes: "",
                liked: false,
                link: o.link ? o.link : "",
                title: o.title ? o.title : "",
                createdAt: normalDateFormatter(date) ,
                updatedAt: normalDateFormatter(date),
                destination: "",
                action: ""
            }
        })

        await redis.cacheData(keys.messages + '_' + channelId ,returnedMessages)
    } catch (err) {
        console.log(err);
    }
}

exports.getCryptoRssFromCache = async () => {
    try {
        const date = new Date()
        var userID =  process.env.NEWS_ADMIN_USER_ID
        var channelId = process.env.CURRENCIES_RSS_CHANNEL_ID
        const cryptoMessages = JSON.parse( await redis.getAsyncCache(keys.cryptoRss))
        console.log("bourse Messages lenght:" ,cryptoMessages.length);

        var returnedMessages = cryptoMessages.map((o ,index) => {
            return {
                _id: String(index + 1) ,//rss doesn't have _id .use index instead _id
                content: o.content ? o.content : "",
                file: o.file ? o.file : "",
                publisher: {
                    _id : userID,
                    name: "امیر حسین",
                    family: "امین پویا"
                },
                reply: o.reply,
                deleted: o.deleted ? o.deleted : "",
                edited: false,
                likes: "",
                liked: false,
                link: o.link ? o.link : "",
                title: o.title ? o.title : "",
                createdAt: normalDateFormatter(date) ,
                updatedAt: normalDateFormatter(date),
                destination: "",
                action: ""
            }
        })

        await redis.cacheData(keys.messages + '_' + channelId ,returnedMessages)
    } catch (err) {
        console.log(err);
    }
}

exports.getCarRssFromCache = async () => {
    try {
        const date = new Date()
        var userID =  process.env.NEWS_ADMIN_USER_ID
        var channelId = process.env.CAR_AND_HOUSING_RSS_CHANNEL_ID
        const carMessages = JSON.parse( await redis.getAsyncCache(keys.carRss))
        console.log("bourse Messages lenght:" ,carMessages.length);

        var returnedMessages = carMessages.map((o ,index) => {
            return {
                _id: String(index + 1) ,//rss doesn't have _id .use index instead _id
                content: o.content ? o.content : "",
                file: o.file ? o.file : "",
                publisher: {
                    _id : userID,
                    name: "امیر حسین",
                    family: "امین پویا"
                },
                reply: o.reply,
                deleted: o.deleted ? o.deleted : "",
                edited: false,
                likes: "",
                liked: false,
                link: o.link ? o.link : "",
                title: o.title ? o.title : "",
                createdAt: normalDateFormatter(date) ,
                updatedAt: normalDateFormatter(date),
                destination: "",
                action: ""
            }
        })

        await redis.cacheData(keys.messages + '_' + channelId ,returnedMessages)
    } catch (err) {
        console.log(err);
    }
}

exports.getHousingRssFromCache = async () => {
    try {
        const date = new Date()
        var userID =  process.env.NEWS_ADMIN_USER_ID
        var channelId = process.env.CAR_AND_HOUSING_RSS_CHANNEL_ID
        const housingMessages = JSON.parse( await redis.getAsyncCache(keys.housingRss))
        console.log("bourse Messages lenght:" ,housingMessages.length);

        var returnedMessages = housingMessages.map((o ,index) => {
            return {
                _id: String(index + 1) ,//rss doesn't have _id .use index instead _id
                content: o.content ? o.content : "",
                file: o.file ? o.file : "",
                publisher: {
                    _id : userID,
                    name: "امیر حسین",
                    family: "امین پویا"
                },
                reply: o.reply,
                deleted: o.deleted ? o.deleted : "",
                edited: false,
                likes: "",
                liked: false,
                link: o.link ? o.link : "",
                title: o.title ? o.title : "",
                createdAt: normalDateFormatter(date) ,
                updatedAt: normalDateFormatter(date),
                destination: "",
                action: ""
            }
        })

        await redis.cacheData(keys.messages + '_' + channelId ,returnedMessages)
    } catch (err) {
        console.log(err);
    }
}

exports.getLastNewsRssFromCache = async () => {
    try {
        const date = new Date()
        var userID =  process.env.NEWS_ADMIN_USER_ID
        var channelId = process.env.LASTNEWS_RSS_CHANNEL_ID
        const lastNewsMessages = JSON.parse( await redis.getAsyncCache(keys.lastNewsRss))
        console.log("bourse Messages lenght:" ,lastNewsMessages.length);

        var returnedMessages = lastNewsMessages.map((o ,index) => {
            return {
                _id: String(index + 1) ,//rss doesn't have _id .use index instead _id
                content: o.content ? o.content : "",
                file: o.file ? o.file : "",
                publisher: {
                    _id : userID,
                    name: "امیر حسین",
                    family: "امین پویا"
                },
                reply: o.reply,
                deleted: o.deleted ? o.deleted : "",
                edited: false,
                likes: "",
                liked: false,
                link: o.link ? o.link : "",
                title: o.title ? o.title : "",
                createdAt: normalDateFormatter(date) ,
                updatedAt: normalDateFormatter(date),
                destination: "",
                action: ""
            }
        })

        await redis.cacheData(keys.messages + '_' + channelId ,returnedMessages)
    } catch (err) {
        console.log(err);
    }
}

exports.getMostViewRssFromCache = async () => {
    try {
        const date = new Date()
        var userID =  process.env.NEWS_ADMIN_USER_ID
        var channelId = process.env.MOSTVIEWS_RSS_CHANNEL_ID
        const mostViewMessages = JSON.parse( await redis.getAsyncCache(keys.mostViewRss))
        console.log("bourse Messages lenght:" ,mostViewMessages.length);

        var returnedMessages = mostViewMessages.map((o ,index) => {
            return {
                _id: String(index + 1) ,//rss doesn't have _id .use index instead _id
                content: o.content ? o.content : "",
                file: o.file ? o.file : "",
                publisher: {
                    _id : userID,
                    name: "امیر حسین",
                    family: "امین پویا"
                },
                reply: o.reply,
                deleted: o.deleted ? o.deleted : "",
                edited: false,
                likes: "",
                liked: false,
                link: o.link ? o.link : "",
                title: o.title ? o.title : "",
                createdAt: normalDateFormatter(date) ,
                updatedAt: normalDateFormatter(date),
                destination: "",
                action: ""
            }
        })

        await redis.cacheData(keys.messages + '_' + channelId ,returnedMessages)
    } catch (err) {
        console.log(err);
    }
}