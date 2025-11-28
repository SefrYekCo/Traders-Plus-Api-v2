const rateLimit = require('express-rate-limit');
const language = require('../helpers/language/index');

// global limit: 60 requests per minute
exports.globalLimitter = rateLimit({
    windowMs: 60 * 1000, // 1 min in milliseconds
    max: 20,
    message: {message: language('fa','rate.limit.global')},
    headers: true,
});

// limit for login and register using sms: 1 request in 2 minutes
exports.smsLimiter = rateLimit({
    windowMs: 2* 60 * 1000, // 2 minutes in milliseconds
    max: 1,
    message: {message: language('fa','rate.limit.sms')},
    headers: true,
});