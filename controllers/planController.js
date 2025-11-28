const Plan = require('../models/schemas/plan');
const Transaction = require('../models/schemas/transaction');
const jwt = require("jsonwebtoken");
const language = require('../helpers/language/index');
const { validationResult } = require("express-validator");
const { PlanType } = require('../configs/secret')
const { updateChannels } = require('../controllers/channelController')
const config = require('../config');
const { generateResponseWithKey } = require('../models/responseModel');
const key = config.update.key
const ObjectId = require('mongoose').Types.ObjectId

// Signin By Phone
exports.addPlan = async (req, res) => {
    const types = req.body.types
    const name = req.body.name
    const type = req.body.type
    console.log(req.body)
    if (!types || types.length <= 0)
        return res.status(400).json({ status: false, description: language('fa', 'plan.types.notfound') })
    else if (types.length === 0) {
        return res.status(400).json({ status: false, description: language('fa', 'plan.types.notfound') })
    } else {
        for (const i in types) {
            if (!isNumeric(types[i].amount) || !isNumeric(types[i].period)) {
                return res.status(400).json({ status: false, description: language('fa', 'plan.types.invalid') })
            }
        }
    }

    try {
        if (!type || !name || !req.body.password || req.body.password !== key)
            return res.status(400).json({ status: false, description: language('fa', 'general.check.input') })
        if (type !== PlanType.bourseSignals && type !== PlanType.cryptoSignals && type !== PlanType.pro && type !== PlanType.public)
            return res.status(400).json({ status: false, description: language('fa', 'general.check.input') })

        let plan = await Plan.findOne({ name: name })
        if (plan) {
            return res.status(404).json({ status: false, discription: language('fa', 'plan.exist') })
        } else {
            plan = await new Plan({ name: name })
            plan.description = req.body.description
            plan.type = type
            for (const i in types) {
                plan.types.push({
                    period: types[i].period,
                    isActive: true,
                    amount: types[i].amount,
                    discount: types[i].discount || 0
                })
            }
            plan.save((err, doc) => {
                if (err)
                    console.log(err)
                else {
                    console.log(doc)
                }
            })
            return res.status(200).json({ status: true, discription: language('fa', 'plan.created') })
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: false, discription: language('fa', 'error.unknown') })
    }
};

exports.editPlan = async (req, res) => {

    const name = req.body.name
    const description = req.body.description
    const isActive = req.body.isActive
    const _id = req.body.id
    const password = req.body.password

    if (typeof isActive != "boolean")
        return res.status(400).json({ status: false, description: language('fa', 'general.check.input') })
    if (password !== key)
        return res.status(400).json({
            status: false,
            message: language('fa', 'client.update.key.error')
        });

    try {
        if (!_id)
            return res.status(400).json({ status: false, description: language('fa', 'general.check.input') })
        let plan = await Plan.findOne({ _id: req.body.id })
        if (!plan) {
            return res.status(404).json({ status: false, discription: language('fa', 'plan.not.found') })
        } else {
            if (name)
                plan.name = name
            if (description)
                plan.description = description
            plan.isActive = isActive
            plan.save()

            setTimeout(() => {
                updateChannels()
            }, 2000);

            return res.status(200).json({ status: true, discription: language('fa', 'plan.updated') })
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: false, discription: language('fa', 'error.unknown') })
    }
};

exports.editPlanType = async (req, res) => {

    const amount = req.body.amount
    const typeId = req.body.typeId // can empty and then a type added to types of this plan
    const period = req.body.period
    const isActive = req.body.isActive
    const discount = req.body.discount
    const _id = req.body.id
    try {
        if (!_id || !isNumeric(amount) || !isNumeric(period))
            return res.status(400).json({ status: false, description: language('fa', 'general.check.input') })
        let plan = await Plan.findOne({ _id: _id })
        if (!plan) {
            return res.status(404).json({ status: false, discription: language('fa', 'plan.not.found') })
        } else {
            if (typeId) {
                if (plan.types.filter(e => String(e._id) === String(typeId)).length > 0) {
                    let index = plan.types.findIndex(x => String(x._id) === String(typeId));
                    plan.types[index].period = period
                    plan.types[index].amount = amount
                    if (typeof isActive == 'boolean')
                        plan.types[index].isActive = isActive
                    if (typeof discount == 'number')
                        plan.types[index].discount = discount
                } else {
                    return res.status(404).json(generateResponseWithKey(false, 'plan.type.notfound'))
                }
            } else {
                plan.types.push({ amount: amount, period: period, discount: discount })
            }
            plan.save()
            return res.status(200).json({ status: true, discription: language('fa', 'plan.updated') })
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: false, discription: language('fa', 'error.unknown') })
    }
};

exports.getPlans = async (req, res) => {
    try {
        var plans = await Plan.find().select('-createdAt -updatedAt');
        plans = plans.filter(item => item.isActive === true)
        for (const i in plans) {
            plans[i].types = plans[i].types.filter(e => e.isActive === true)
        }
        return res.status(200).json({ status: true, response: { plans } })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: false, message: language('fa', 'error.unknown') })
    }
}

exports.getAllPlans = async (req, res) => {
    try {
        var plans = await Plan.find().select('-createdAt -updatedAt');
        return res.status(200).json({ status: true, response: { plans } })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: false, message: language('fa', 'error.unknown') })
    }
}

exports.getPlan = async (req, res) => {
    try {
        var plan = await Plan.findOne({ _id: ObjectId(req.params.id) });
        var users = (await Transaction.aggregate([
            {
                $match: {
                    plan: ObjectId(req.params.id)
                }
            },
            {
                $group: {
                    _id: "$user",
                    items: { $push: { amount: "$amount", date: "$createdAt", period: "$period" } },
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            }
        ]));
        if (!plan)
            return res.status(404).json({ status: false, message: language('fa', 'plan.not.found') })
        return res.status(200).json({ status: true, response: { plan, users } })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: false, message: language('fa', 'error.unknown') })
    }
}

exports.getPlanForWeb = async (req, res) => {
    try {
        const id = req.params.id;
        const plan = await Plan.findOne({_id:id}) ;
        if(!plan) return res.status(404).json({ status: false, message: language('fa', 'plan.not.found') })

        return res.status(200).json({ status: true, response: { plan } })
        
    } catch (err) {
        console.log(err);
        return res.status(500).json({ status: false, message: language('fa', 'error.unknown') })
    }
}

function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

