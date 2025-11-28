const express = require("express");
const router = express.Router();
const multer = require("multer")
const { storage } = require('../../middleware/multerOptions')
const upload = multer({ storage: storage })
const auth = require('../../middleware/auth')
const {
    authGetChannels
} = require('../../middleware/authMessage')
const { serviceReport } = require('../../controllers/update.controller')
const {
    addService,
    editService,
    getAll,
    getAllAdmin,
    getServiceReport,
    getOneAdmin,
    changeIndex
} = require('../../controllers/serviceController')

const { checkAdminPassword } = require('../../middleware/commonValidator');

router.post(
    '/add',
    upload.fields([{ name: 'icon', maxCount: 1 }]),
    checkAdminPassword,
    addService
)

router.post(
    '/edit',
    upload.fields([{ name: 'icon', maxCount: 1 }]),
    checkAdminPassword,
    editService
)

router.get('/report', getServiceReport)

router.post(
    '/report',
    auth,
    serviceReport
)

router.get(
    '/getAll',
    authGetChannels,
    getAll
)

router.get(
    '/getAll-admin',
    getAllAdmin
)

router.get(
    '/:id',
    checkAdminPassword,
    getOneAdmin
)

router.post(
    "/index",
    checkAdminPassword,
    changeIndex
)

module.exports = router;