const express = require('express')
const router = express.Router()
const multer = require("multer")
const { storage } = require('../../middleware/multerOptions')
const upload = multer({ storage: storage })
const auth = require('../../middleware/auth')
const { bannerReport } = require('../../controllers/update.controller')
const {
    addBanner,
    editBanner,
    getAll,
    getAllAdmin,
    getBannerReport,
    getOneAdmin,
    changeIndex,
    getAllForWeb
} = require('../../controllers/bannerController')

const { checkAdminPassword } = require('../../middleware/commonValidator')

router.post(
    '/add',
    upload.fields([{ name: 'icon', maxCount: 1 }]),
    checkAdminPassword,
    addBanner
)

router.post(
    '/edit',
    upload.fields([{ name: 'icon', maxCount: 1 }]),
    checkAdminPassword,
    editBanner
)

router.post(
    '/report',
    auth,
    bannerReport
)
// router.post(
//     '/delete',
//     checkAdminPassword,
//     editService
// )

router.get(
    '/report', 
    getBannerReport
)

router.get(
    '/getAll',
    getAll
)

router.get(
    '/getAll-admin',
    checkAdminPassword,
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

router.get(
    "/getAll/web",
    getAllForWeb
)

module.exports = router