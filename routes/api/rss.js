const express = require("express");
const router = express.Router();

const {getBourseRss ,getCryptosRss ,getCurrenciesRss ,getHousingRss ,getLastNewsRss ,getMostViewRss ,getCarRss} = require("../../controllers/rssNewsController");

router.get("/bourse", getBourseRss)
router.get("/most-view" , getMostViewRss )
router.get("/currencies" , getCurrenciesRss )
router.get("/cryptos" , getCryptosRss )
router.get("/housing" , getHousingRss )
router.get("/car" , getCarRss )
router.get("/last-news" , getLastNewsRss )

module.exports = router;