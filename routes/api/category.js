const express = require("express");
const router = express.Router();
const multer = require("multer")
const {storage} = require('../../middleware/multerOptions')
const upload = multer({storage: storage})

const {
    addCategory,
     editCategory,
     getCategories,
     deactiveCategory,
     changeIndex
} = require('../../controllers/categoryController');
const auth = require("../../middleware/auth");
const { checkAdminPassword } = require("../../middleware/commonValidator");

// add chatroom

/// TODO save icon
router.post(
    "/add", 
    upload.fields([{name: 'icon', maxCount: 1}]), 
    addCategory
)

router.get("/getAll", getCategories)
router.post("/edit", editCategory)
router.post("/activation",auth, deactiveCategory)
router.post("/index" , checkAdminPassword , changeIndex)


module.exports = router;