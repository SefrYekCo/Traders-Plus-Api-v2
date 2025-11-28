const express = require("express")
const language = require('../helpers/language/index')
const router = express.Router()
const {
    enableNotifications,
    daysBeforeSendNotificationForExpirePlans,
    muteChannelNotifications,
} = require('../controllers/configController')

const details = async (req, res, next) => {
    try {
        res.json({
            author: "SefrYek Idea Hamrah << http://tradersplus.com >>",
            headers: req.headers,
            ip: req.ip,
            your_ip: req.headers['cf-connecting-ip']
        })
    } catch (err) {
        res.status(500).json({ message: language('server', 'server-500') });
    }
};


router.all("/", details);

router.post('/enable-notif', enableNotifications)

router.post('/days-before-expire-send-notif', daysBeforeSendNotificationForExpirePlans)

router.post('/mute-channel-notif', muteChannelNotifications)

module.exports = router;