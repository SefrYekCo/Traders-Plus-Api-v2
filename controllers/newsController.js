const Message = require('../models/schemas/message')
const { updateMessages } = require('../controllers/messageController')
const User = require('../models/schemas/user');
const redis = require('../src/redisManager')
const keys = require('../src/utils').keys

async function getAndSaveNews() {
    var messages = await redis.getAsyncCache(keys.messages + "_" + process.env.NEWS_CHANNEL_ID)
    messages = JSON.parse(messages)
    //TODO change with news id
    
    var news = await redis.getAsyncCache(keys.news)
    news = JSON.parse(news)
    var standardNews = []
    for (const i in news) {
        let index = standardNews.findIndex(x => String(x.title) === String(news[i].title));
        if (index === -1) {
            standardNews.push(news[i])
        }
    }
    console.log('news count:', standardNews.length)
    var unsaveNews = []
    for (const i in standardNews) {
        let existInfoldId = messages.filter(e => String(e.infoldId) === String(standardNews[i].id)).length > 0
        let existTitle = messages.filter(e => String(e.title) === String(standardNews[i].title)).length > 0
        let existContent = messages.filter(e => String(e.content) === String(standardNews[i].text)).length > 0
        if (!existInfoldId && !existTitle && !existContent) {
            unsaveNews.push(standardNews[i])
        }
    }
    console.log('unsaved news count:', unsaveNews.length)
    for (const i in unsaveNews) {
        var newsJson = unsaveNews[i]
        //console.log('news:', newsJson)
        var newsId = newsJson.id
        var title = newsJson.title
        var pic = newsJson.pic
        var link = newsJson.link
        var msg = newsJson.text
        await saveNews(newsId, msg, pic, link, title)
    }

    if (unsaveNews.length > 0) {
        setTimeout(() => {
            updateMessages()
        }, 2000);
    }

}
async function saveNews(id, content, imageUrl, link, title) {
    var imagePath = null
    //TODO change with news id
    var userID =  process.env.NEWS_ADMIN_USER_ID
    var channelId = process.env.NEWS_CHANNEL_ID

    if (imageUrl) {
        imagePath = imageUrl
    }
    try {
        const user = await User.findOne({ _id: userID })
        if (!user) {
            console.log('user not found for save news')
        } else {
            const message = await new Message()
            message.infoldId = id
            message.content = content
            message.publisher = userID
            message.channel = channelId
            message.file = imagePath
            message.link = link
            message.title = title
            await message.save()
            console.log('messages ', id, " did saved")
        }

    } catch (err) {
        console.log(err);
    }
}

module.exports = getAndSaveNews
