const language = require('../../helpers/language/index')


exports.checkUnit = async (req, res, next) => {
    var unit = req.body.unit
    console.log('unit:', unit)
    if (!unit) {
        req.body.unit = 'USD'
        await next()
    } else {
        unit = unit.toUpperCase()
        if (unit === "USD" || unit === "RIAL")
            await next()
        else
            return res.status(404).json({ status: false, message: language('fa', 'symbol.unit.invalid') })
    }
}