const cron = require('node-cron');
const getAndSaveNews = require("../controllers/newsController");
const {
    removeExpirePlans,
    plansExpireSoon,
} = require('../services/update.user.plans')
const { getEnv } = require('../helpers/envHelper')
const { checkTriggeredAlerts, checkTriggeredCryptoAlerts } = require('../services/alert.service');
const { getBourseRssFromCache, getHousingRssFromCache ,getCarRssFromCache ,getCryptoRssFromCache ,getLastNewsRssFromCache ,getCurrenciesRssFromCache ,getMostViewRssFromCache } = require('../controllers/rssNewsController');

cron.schedule('*/30 * * * *', function () {
    getAndSaveNews()
})

cron.schedule('*/15 * * * *', async function () {
    await getBourseRssFromCache()
    await getHousingRssFromCache()
    await getMostViewRssFromCache()
    await getCurrenciesRssFromCache()
    await getCryptoRssFromCache()
    await getLastNewsRssFromCache()
    await getCarRssFromCache()
    console.log(' bourse RSS is running');
})


cron.schedule('*/5 * * * *', function () {
    var currenct = new Date()
    console.log('***************************');
    console.log('Running Cron Job for check triggered alerts -- ' + currenct.getHours() + ':' + currenct.getMinutes() + ':' + currenct.getSeconds());
    checkTriggeredCryptoAlerts()
    checkTriggeredAlerts()
})

cron.schedule('0 1 * * *', function () {
    var currenct = new Date()
    console.log('***************************');
    console.log('Running Cron Job for remove expire plans -- ' + currenct.getHours() + ':' + currenct.getMinutes() + ':' + currenct.getSeconds());
    removeExpirePlans()
})

cron.schedule('0 6 * * *', async function ()  {
    var currenct = new Date()
    console.log('***************************');
    console.log('Running Cron Job for notifications expire plans -- ' + currenct.getHours() + ':' + currenct.getMinutes() + ':' + currenct.getSeconds());
    const enabled = await getEnv('ENABLE_NOTIFICATIONS')
    if((enabled === 'true')) {
        plansExpireSoon()
    }
})


// Methods

 //  ┌────────────── second (optional)
 //  │ ┌──────────── minute
 //  │ │ ┌────────── hour
 //  │ │ │ ┌──────── day of month
 //  │ │ │ │ ┌────── month
 //  │ │ │ │ │ ┌──── day of week
 //  │ │ │ │ │ │
 //  │ │ │ │ │ │
 //  * * * * * *