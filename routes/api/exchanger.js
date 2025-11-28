const express = require('express');
const auth = require("../../middleware/auth")
const router = express.Router()
const multer = require('multer');

const { changeIndex ,countClick ,createExchangers ,deleteExchanger ,editExchanger ,getActiveExchangers ,getAllExchangers ,getOne} = require("../../controllers/exchangersContorller");
const { checkAdminPassword } = require('../../middleware/commonValidator');

const { storage } = require('../../middleware/multerOptions');
const { fileFileter } = require('../../middleware/validators/exchangersValidator');
const upload = multer({ storage: storage ,fileFilter:fileFileter })

router.post(
    "/upload-image",
    checkAdminPassword,
    
    )
    
router.post('/create',
    checkAdminPassword,
    upload.fields([{ name: 'icon', maxCount: 1 }]),
    createExchangers
)

router.get('/all',
    checkAdminPassword,
    getAllExchangers
)

router.get('/active',
    auth,
    getActiveExchangers,
)

router.delete('/delete/:id',
    checkAdminPassword,
    deleteExchanger,
)

router.patch('/edit/:id', 
    checkAdminPassword,
    upload.fields([{ name: 'icon', maxCount: 1 }]),
    editExchanger
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