const express = require('express')
const router = express.Router()
const multer = require("multer")
const { storage } = require('../../middleware/multerOptions')
const upload = multer({ storage: storage })

const { checkAdminPassword } = require('../../middleware/commonValidator')

const {
    sendNotification,
    getNotificationsReport,
    updateNotifyMethods,
    getChannels,
    getFCMs,
    activePlan,
    sendNotificationByCount,
    getUsersReport,
    sendWebNotification,
    sendWebNotificationToLimitedUser
} = require('../../controllers/admin.controller')
const { getUsersNotificationToken } = require('../../controllers/userController')


router.post(
    '/send-notification',
    checkAdminPassword,
    sendNotification
)
router.post(
    '/send-notification-by-count',
    checkAdminPassword,
    sendNotificationByCount
)
router.put('/notify-methods',
    checkAdminPassword,
    updateNotifyMethods
);
router.post('/channel',
    checkAdminPassword,
    getChannels
)
router.post(
    '/fcm',
    checkAdminPassword,
    getFCMs
)
router.get(
    '/notification-report',
    getNotificationsReport
)
router.post(
    '/activePlan',
    checkAdminPassword,
    activePlan
)

router.get(
    '/users-report',
    checkAdminPassword,
    getUsersReport
)

router.get('/get-notification-token', checkAdminPassword, getUsersNotificationToken)

router.post("/send-web-notification" ,checkAdminPassword ,sendWebNotification)

router.post("/send-limited-web-notification" ,checkAdminPassword ,sendWebNotificationToLimitedUser)

module.exports = router