const axios = require('axios');
const utf8 = require('utf8');
const language = require('../helpers/language/index');

const {
    userSms, passSms, senderNumber
} = require('../configs/secret')

const createUrl = (to, code) => {
    let base = "http://ws.nh1.ir/Api/SMS/Send?"
    let userQuery = "Username=" + userSms
    let passQuery = "&password=" + passSms
    let textQuery = "&Text=" + language('fa', 'general.otp.message') + "\n" + "Code:" + code
    let phoneQuery = "&to=" + to + "&from=" + senderNumber
    return (base + userQuery + passQuery + textQuery + phoneQuery).toString()
}

const createUrlForAlert = (to, txt) => {
    let base = "http://ws.nh1.ir/Api/SMS/Send?"
    let userQuery = "Username=" + userSms
    let passQuery = "&password=" + passSms
    let textQuery = "&Text=" + txt
    let phoneQuery = "&to=" + to + "&from=" + senderNumber
    return (base + userQuery + passQuery + textQuery + phoneQuery).toString()
}

const createUrlForForgetPassword = (to ,token) => {
    let base = "http://ws.nh1.ir/Api/SMS/Send?"
    let userQuery = "Username=" + userSms
    let passQuery = "&password=" + passSms
    let textQuery = "&Text=" + `لینک تغییر رمز عبور : \n http://tradersplus-qa.sefryek.com/changePassword?token=${token}`
    let phoneQuery = "&to=" + to + "&from=" + senderNumber
    return (base + userQuery + passQuery + textQuery + phoneQuery).toString()
}

var sendSms =  (to, code) => {
    const url = createUrl(to, code)
    console.log('url: ' + url)
    axios({
        method: 'get',
        url: url,
    }).then((response) => {
        console.log(response.data)
        return response.data
    })
}

var sendSmsForAlertTriggered =  (to, text) => {
    const url = createUrlForAlert(to, text)
    axios({
        method: 'get',
        url: encodeURI(url),
    }).then((response) => {
        console.log(response.data)
        return response.data
    })
}

var sendSmsForForgetPass =  (to, token) => {
    const url = createUrlForForgetPassword(to, token)
    console.log('url: ' + url)
    axios({
        method: 'get',
        url: encodeURI(url),
    }).then((response) => {
        console.log(response.data)
        return response.data
    }).catch((err) => {
        console.log(err);
        return language('fa', 'sms.send.failed')
    })
}



const sendValidationCode = async (to, code) => {
    console.log(sendSms(to, code))
};

const sendAlert = async (to, text) => {
    console.log(sendSmsForAlertTriggered(to, text))
};

const  sendForgetPassUrl = async (to ,token) => {
    console.log(sendSmsForForgetPass(to ,token));
}

module.exports = {
    sendValidationCode,
    sendAlert,
    sendForgetPassUrl
}