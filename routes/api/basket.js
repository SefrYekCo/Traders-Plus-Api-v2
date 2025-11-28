const express = require("express");
const router = express.Router();
const auth = require('../../middleware/auth')

const {
    addBasket,
    updateBasket,
    getBaskets,
    addSymbol,
    updateSymbolHistory,
    removeBasket,
    removeSymbol,
    removeSymbolHistory,
} = require('../../controllers/basketController')

const {
    accessToBaskets
} = require('../../middleware/permission')

const {
    checkUnit,

} = require('../../middleware/validators/basketValidator')

router.post('/add-basket',
    auth,
    accessToBaskets,
    addBasket
)

router.post(
    '/update-basket',
    auth,
    accessToBaskets,
    updateBasket
)

router.post(
    '/add-symbol',
    auth,
    accessToBaskets,
    checkUnit,
    addSymbol,
)
// router.delete('/delete-basket/:id', auth, removeBasket)
router.get(
    "/get-baskets",
    auth,
    accessToBaskets,
    getBaskets
)

// update history
router.post(
    '/update-symbol-history',
    auth,
    accessToBaskets,
    updateSymbolHistory
)

// delete symbol 
router.delete(
    '/delete-basket/:id',
    auth,
    accessToBaskets,
    removeBasket
)

// delete symbol 
router.delete(
    '/delete-symbol/:id',
    auth,
    accessToBaskets,
    removeSymbol
)

// delete symbol history
router.delete(
    '/delete-symbol-history/:id',
    auth,
    accessToBaskets,
    removeSymbolHistory
)

module.exports = router;