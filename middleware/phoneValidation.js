const language = require('../helpers/language/index');

module.exports = async (req, res, next) => {
    let mobileNumber = req.body.mobileNumber;

    try {
        mobileNumber = mobileNumber.toString();
        if (mobileNumber != '14165628234') {
            if (!mobileNumber || mobileNumber.length < 10)
                return res.status(400).json({ status: false, message: language('fa', 'phonenumber.invalid') });
            if (mobileNumber.length == 10 && mobileNumber[0] != '9')
                return res.status(400).json({ status: false, message: language('fa', 'phonenumber.invalid') });
            if (mobileNumber.length == 11 && (mobileNumber[0] != '0' || mobileNumber[1] != '9'))
                return res.status(400).json({ status: false, message: language('fa', 'phonenumber.invalid') });
            if (mobileNumber.length == 10)
                mobileNumber = '0' + mobileNumber;
        }

        req.body.mobileNumber = mobileNumber;
        await next();
    } catch (err) {
        //TODO check
        await next();
    }
};