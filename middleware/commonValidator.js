const {
    generateResponseWithKey
} = require('../models/responseModel')
const config = require('../config');
const key = config.update.key

exports.checkAdminPassword = async (req, res, next) => {
    const password = req.body.password || req.headers.password;
    if (password !== key) {
        return res.status(400).json(generateResponseWithKey(false, 'client.update.key.error'));
    } else {
        return next()
    }
}