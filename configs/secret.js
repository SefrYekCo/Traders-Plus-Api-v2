exports.mongoBaseURI = "mongodb://mongodb:27017";
exports.databaseName = 'tradersplus'
exports.mongoURI = `${this.mongoBaseURI}/${this.databaseName}?readPreference=primary&ssl=false`
exports.userSms = "sefryek";
exports.passSms = "J3kyseVYvR48jKas";
exports.senderNumber = "5000151011"
exports.JWT_SECRET = "2[g653aa?3@^oZv^Q-`ec^YO!cN'cal*}1-#YRih+%a~njyW6C}d(p<6=q]jzOK";
exports.JWT_SECRET_FORGET_PASS = "j!4P&mLKNXqxFC@w";
exports.fourDigitExpireAfter = 2 * 60 * 1000; // as millisecond : min * 60s * 1000ms
exports.trialExpireAfter = 7 * 24 * 60 * 60 * 1000; // as millisecond : days * hours * min * 60s * 1000ms
exports.dailyExpire = 1 * 24 * 60 * 60 * 1000; // as millisecond : days * hours * min * 60s * 1000ms
exports.sixDigitExpireAfter = 2 * 60 * 1000; // as millisecond : min * 60s * 1000ms
// Alert
exports.alertLimitation = 15

// correct: 1 * 24 * 60 * 60 * 1000;
exports.port = 5000;

exports.firebaseServerKey ="key=AAAAzF8UFwE:APA91bGbc90l-cF-ZSQIsa3eLSbGfh43R24OdORdW6EOrctgNQU2Jk6_kqkPBnFTJcsXgvahmbi57AeIILbM2xaECio0XJMVM26fonk-DG1GoeLxDObtPMC6kH1njqRMcYycUwt5Scqc"

exports.asanUser = "shrkt3970426"
exports.asanPass = "5Db9W0j"
exports.merchantConfigId = 4989
exports.iban = "IR700150000001976800126602"
exports.merchantID = "2295e565-ee1b-4d8d-b7e4-17ef0fee40a0"

exports.BasketType = {
    cryptoWachlist: 'cryptoWachlist',
    iranWachlist: 'iranWachlist'
}

exports.CategoryType = {
    info: 'info',
    channel: 'channel'
}

exports.PlanType = {
    cryptoSignals: 'cryptoSignals',
    bourseSignals: 'bourseSignals',
    pro: 'pro',
    public: 'public'
}

exports.notifType = {
    planExpirationAlert: 1,
    chatroomMessage: 2,
    custom: 1,
    alertTriggered: 4,
}

exports.alertConditionTypes = {
    greaterThan: "greater-than",
    lowerThan: "lower-than",
    equal: "equal"
}

exports.alertConditions = {
    allStocks: 'all_stocks',
    tradeValue: 'trade_value',
    traderVolume: 'trade_volume',
    traderNumber: 'trade_number',
    realBuyVolume: "real_buy_volume",
    coBuyVolume: "co_buy_volume",
    realSellVolume: "real_sell_volume",
    coSellVolume: "co_sell_volume",
    realBuyValue: "real_buy_value",
    coBuyValue: "co_buy_value",
    realSellValue: "real_sell_value",
    coSellValue: "co_sell_value",
    closePrice: "close_price",
    closePriceChange: "close_price_change",
    closePriceChangePercent: "close_price_change_percent",
    finalPrice: "final_price",
    finalPriceChange: "final_price_change",
    finalPriceChangePercent: "final_price_change_percent",
    yesterday_price: "yesterday_price",
    eps: "eps",
    highestPrice: "highest_price",
    lowestPrice: "lowest_price",
    dailyPriceHigh: "daily_price_high",
    dailyPriceLow: "daily_price_low",
    P_E: "P_E",
    basisVolume: "basis_volume",
    realBuyCount: "real_buy_count",
    coBuyCount: "co_buy_count",
    realSellCount: "real_sell_count",
    coSellCount: "co_sell_count",

    price: "price",
    changePercent24h: "change_percent_24h",
    marketCap: "market_cap",
}

exports.alertActions = {
    notification: "notification",
    sms: "sms",
    email: "email",
    whatsapp: "whatsapp",
    telegram: "telegram"
}

exports.alertState = {
    unknown: 'unknown',
    triggered: 'triggered',
}