const express = require("express");
const router = express.Router();
const auth = require('../../middleware/auth')
const multer = require("multer")
const { storage } = require('../../middleware/multerOptions')
const upload = multer({ storage: storage })

const { 
    sendMessage, 
    getMessages,
    getMessagesV2,
    deleteMessage,
    editMessage,
    likeMessage,
    getMessageById
} = require("../../controllers/messageController");

const {
    authGetMessages
} = require('../../middleware/authMessage')

const {
    accessToChannel
} = require('../../middleware/permission')

/// send Message
router.post(
    "/send",
    upload.fields([{ name: 'image', maxCount: 1 }]),
    auth,
    sendMessage
)
/// get messages by channels
router.get(
    "/messages/:channelId",
    authGetMessages, 
    accessToChannel,
    getMessages
)

router.get(
    "/messagesv2",
    authGetMessages,
    accessToChannel,
    getMessagesV2
)

router.get(
    "/message-by-id",
    authGetMessages,
    getMessageById
)

router.post("/delete-message", auth, deleteMessage)
router.post("/edit-message", auth, editMessage)
router.post("/like-message", auth, likeMessage)
module.exports = router;