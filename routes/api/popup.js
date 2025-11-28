const express = require("express");
const { getOne } = require("../../controllers/brokerageController");
const router = express.Router();
const multer = require('multer');
const {storage} = require('../../middleware/multerOptions');
const {
    activationPopup,
    createPopup,
    deletePopup,
    editPopup,
    getActivePopup,
    getPopup,
    getPopupAnswers,
    getPopups,
    registerPopupAnswer,
} = require('../../controllers/popupController');
const auth = require("../../middleware/auth")
const { checkAdminPassword } = require('../../middleware/commonValidator');

const upload = multer({storage:storage})

router.get("/get-all" ,checkAdminPassword ,getPopups)
router.get("/get-active" ,auth ,getActivePopup)
router.get("/get-one/:id" ,checkAdminPassword ,getPopup)
router.get("/get-answer/:id" ,checkAdminPassword ,getPopupAnswers)

router.post("/create" ,upload.fields([{name:'icon'  ,maxCount:1}]) ,checkAdminPassword ,createPopup)
router.post("/activation/:id" ,checkAdminPassword ,activationPopup)
router.post("/register-answer/:id" ,auth ,registerPopupAnswer)

router.patch(
    "/edit/:id" ,
    upload.fields([{name:'icon'  ,maxCount:1}]),
    checkAdminPassword,
    editPopup
)

router.delete("/delete/:id" ,checkAdminPassword ,deletePopup)

module.exports = router;