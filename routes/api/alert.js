const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')

const {
    addAlertValidator,
    editAlertValidator,
} = require('../../helpers/validator')

const {
    accessToCreateAlert,
    accessToEditAlert
} = require('../../middleware/permission')

const {
    addAlert,
    editAlert,
    getAlerts,
    getList
} = require('../../controllers/alertController')


router.post(
    '/add',
    auth,
    addAlertValidator,
    accessToCreateAlert,
    addAlert
)

router.post(
    '/edit',
    auth,
    editAlertValidator,
    accessToEditAlert,
    editAlert
)

router.get(
    "/get",
    auth,
    getAlerts
)

router.get(
    '/list',
    getList
)
module.exports = router