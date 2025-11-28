const express = require("express");
const router = express.Router();

const {
    addPlan,
    editPlan,
    editPlanType,
    getPlans,
    getAllPlans,
    getPlan,
    getPlanForWeb,
} = require('../../controllers/planController')
const { checkAdminPassword } = require('../../middleware/commonValidator');
const auth = require("../../middleware/auth")

// add chatroom

/// TODO save icon
router.post(
    "/add",
    addPlan
)

router.get("/getAll", getPlans)
router.get("/getAll-admin", getAllPlans)
router.post("/edit", editPlan)
router.post("/edit-type", editPlanType)
router.get("/:id", checkAdminPassword, getPlan)
router.get("/get/:id", auth, getPlanForWeb)

module.exports = router;