const language = require('../../helpers/language/index')
const User = require('../../models/schemas/user')
const Plan = require('../../models/schemas/plan')

exports.planExist = async (req, res, next) => {
    let userId = req.user._id
    let _id = req.body.planId
    let typeId = req.body.typeId
    try {
        const user = await User.findOne({ _id: userId })
        if (!user) return res.status(404).json({ status: false, description: language('fa', 'user.not.found') })
        req.user = user
        const plan = await Plan.findOne({ _id })
        if (!plan) return res.status(404).json({ status: false, description: language('fa', 'plan.not.found') })
        if (plan.types.filter(e => String(e._id) === String(typeId)).length === 0) {
            return res.status(404).json({ status: false, description: language('fa', 'plan.not.found') })
        }
        let index = plan.types.findIndex(x => String(x._id) === String(typeId));
        req.period = plan.types[index].period
        req.plan = plan
        console.log('amount: ', calculateAmount(typeId, plan))
        const amount = calculateAmount(typeId, plan)
        if (amount === 0)
            return res.status(400).json({ status: false, description: language('fa', 'error.period.invalid') })
        req.amount = amount
        await next()
    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: false, message: language('fa', 'error.unknown') })
    }


}

var calculateAmount = (typeId, plan) => {

    if (plan.types.filter(e => String(e._id) === String(typeId)).length > 0) {
        let index = plan.types.findIndex(x => String(x._id) === String(typeId));
        return (plan.types[index].amount) * (1 - ((plan.types[index].discount || 0) / 100))
    } else {
        return 0
    }
}