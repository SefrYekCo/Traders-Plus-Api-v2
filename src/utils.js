const conf = require('../config');
const baseUrl = conf.web.sub_url_v1
const tseBaseURL = "http://tsetmc.com/tse"
const asanPardakhtBaseURL = "https://ipgrest.asanpardakht.ir"
const zarinpalBaseURL = "https://api.zarinpal.com/pg/v4/payment"

const keys = {
    currencies: 'currencies',
    metals: 'metals',
    news: 'news',
    indexes: 'indexes',
    cryptos: 'cryptos',
    stocks: 'stocks',
    stocksList: 'stocksList',
    faraBourse: 'faraBourse',
    historyData: 'history_data',
    weatherForecast: 'weather_forecast',
    channels: 'channels',
    messages: 'messages',
    checkVersionList: 'checkVersionList',
    services: 'services',
    banners: 'banners',
    webBanners: 'web_Banners',
    hedgeFundRanks: 'hedge_funds_rank',
    allowedNotifyMethods: 'allowedNotifyMethods',
    USDTStatus: 'usdt_status',
    USDTHistory: 'usdt_history',
    BourseRss: 'bourse_rss',
    carRss: 'car_rss',
    housingRss: 'housing_rss',
    currenciesRss: 'currencies_rss',
    cryptoRss: 'crypto_rss',
    lastNewsRss: 'last_news_rss',
    mostViewRss: 'most_view_rss'

}

const messages = {
    notAvailable: 'not available',
    stockNotFound: 'stock not found',
    submittedFormat: 'The submitted format is incorrect'
}
const urls = {
    tseStocks: tseBaseURL + "/data/Export-txt.aspx?a=InsTrade"

}

const asanPardakhtUrls = {
    token: asanPardakhtBaseURL + '/v1/Token',
    tranResult: asanPardakhtBaseURL + '/v1/TranResult',
    verify: asanPardakhtBaseURL + '/v1/Verify',
    settlement: asanPardakhtBaseURL + '/v1/Settlement',
}

const zarinpalUrls = {
    createUrl: zarinpalBaseURL + "/request.json",
    verify: zarinpalBaseURL + "/verify.json"
}

module.exports = {
    keys,
    messages,
    urls,
    baseUrl,
    asanPardakhtUrls,
    zarinpalUrls
}