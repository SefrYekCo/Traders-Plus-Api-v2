const express = require('express');
const auth = require("../../middleware/auth")
const router = express.Router()
const multer = require('multer');

const {createBrokerge ,deleteBrokerage ,editBrokerage ,getActiveBrokerages ,getAllBrokerages ,getOne, changeIndex, countClick } = require("../../controllers/brokerageController");
const { checkAdminPassword } = require('../../middleware/commonValidator');

const { storage } = require('../../middleware/multerOptions');
const { fileFileter } = require('../../middleware/validators/brokerValidator');
const upload = multer({ storage: storage ,fileFilter:fileFileter })

router.post(
    "/upload-image",
    checkAdminPassword,
    
    )
    
router.post('/create',
    checkAdminPassword,
    upload.fields([{ name: 'icon', maxCount: 1 }]),
    createBrokerge
)

router.get('/all',
    checkAdminPassword,
    getAllBrokerages
)

router.get('/active',
    getActiveBrokerages,
)

router.delete('/delete/:id',
    checkAdminPassword,
    deleteBrokerage,
)

router.patch('/edit/:id', 
    checkAdminPassword,
    upload.fields([{ name: 'icon', maxCount: 1 }]),
    editBrokerage
)

router.get('/:id' ,
    checkAdminPassword,
    getOne
)

router.post(
    "/index",
    checkAdminPassword,
    changeIndex
)

router.post(
    "/click",
    auth,
    countClick
)

module.exports = router;