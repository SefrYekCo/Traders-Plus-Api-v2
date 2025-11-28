var moment = require('moment-timezone'); // require
const jwt = require("jsonwebtoken");
const { JWT_SECRET_FORGET_PASS } = require('../configs/secret');

exports.getUrl = (req) => {
    return req.protocol + '://' + req.get('host') + "/";
}

exports.normalDateFormatter = (d) => {
    var str = d.toISOString().slice(0, 19);
    str = str.replace("T", " ");
    return str
}

exports.dateFormatter = (d) => {
    var str = new Date().toISOString().slice(0, 19);
    str = str.replace("T", " ");
    str = str.replace("-", "")
    str = str.replace("-", "")
    str = str.replace(":", "")
    str = str.replace(":", "")
    return str
}

exports.isEmptyObject = (obj) => {
    return Object.keys(obj).length === 0;
}

exports.isArray = function (a) {
    return (!!a) && (a.constructor === Array);
};

exports.isObject = function (a) {
    return (!!a) && (a.constructor === Object);
};

exports.createFutureDate = (days) => {
    return Date.now() + (parseInt(days) * 24 * 60 * 60 * 1000);
}

exports.validURL = (str) => {
    try { return Boolean(new URL(str)); }
    catch (e) { return false; }
}

exports.validHexColor = (color) => {
    return /^#[0-9A-F]{6}$/i.test(color)
}

exports.convertDateToTimezone = (date, timeZone) => {
    var format = 'YYYY-MM-DD HH:mm:ss';
    return moment(date, format).tz(timeZone).format(format); 
}

exports.safelyParseJson = (content) => {
    try {
      return JSON.parse(content);
    } catch(ex){
      return null;
    }
}

exports.verifyJwt = (token) => {
    try {
        const secret = JWT_SECRET_FORGET_PASS
        const result = jwt.verify(token ,secret)
        if(!result) return false
        return result
    } catch (err) {
        console.log(err);
        return false
    }
}