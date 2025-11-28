const express = require("express");
const router = express.Router();
const multer = require("multer")
const { storage } = require('../../middleware/multerOptions')
const upload = multer({ storage: storage })

const {
    isChannelCategoryIdExist,
    isChannelCategoryExist,
    isPlanIdExist,
    isPlanExist,
    idValidation,
    nameValidation
} = require('../../middleware/validators/chatroomValidator')

const {
    addChannel,
    editChannel,
    getChannels,
    deactiveChannel,
    muteChannel,
    getChannelsForAdmin,
    changeIndex
} = require('../../controllers/channelController');
const auth = require('../../middleware/auth')

const {
    authGetChannels
} = require('../../middleware/authMessage');
const { checkAdminPassword } = require("../../middleware/commonValidator");

/// get all available channels
router.get(
    "/getAll",
    authGetChannels,
    getChannels
)

router.post(
    "/mute",
    auth,
    muteChannel
)

// all below services for Admin usage

/// add chatroom
router.post(
    "/add",
    upload.fields([{ name: 'icon', maxCount: 1 }]),
    isChannelCategoryIdExist,
    isChannelCategoryExist,
    isPlanIdExist,
    isPlanExist,
    addChannel
)
/// edit channel info
router.post(
    "/edit",
    upload.fields([{ name: 'icon', maxCount: 1 }]),
    idValidation,
    nameValidation,
    isChannelCategoryExist,
    isPlanExist,
    editChannel
)
/// channel activation of channel by id
router.post(
    "/activation",
    isChannelCategoryExist,
    deactiveChannel
)

router.get(
    "/getForAdmin",
    authGetChannels,
    getChannelsForAdmin
)

router.post(
    "/index",
    checkAdminPassword,
    changeIndex
)


module.exports = router;