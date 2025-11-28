const language = require('../../helpers/language/index')
const { generateResponse, generateResponseWithKey } = require('../../models/responseModel')
const Category = require('../../models/schemas/chatroomCategory')
const Plan = require('../../models/schemas/plan')

exports.isChannelCategoryIdExist = async (req, res, next) => {
    const _id = req.body.categoryId
    if (!_id || _id === "")
        return res.status(400).json(generateResponseWithKey(false, 'channel.category.id.notfound'))
    else
        return next()
}

exports.isChannelCategoryExist = async (req, res, next) => {
    const _id = req.body.categoryId
    if (!_id || _id === "")
        return next()
    try {
        let category = await Category.findOne({ _id })
        if (!category)
            return res.status(404).json(generateResponseWithKey(false, 'channel.category.id.invalid'))
        return next()
    } catch (err) {
        console.log(err)
        return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
    }
}

exports.isPlanIdExist = async (req, res, next) => {
    const _id = req.body.planId
    if (!_id || _id === "")
        return res.status(400).json(generateResponseWithKey(false, 'plan.id.not.found'))
    else
        return next()
}

exports.idValidation = async (req, res, next) => {
    const _id = req.body.id
    if (!_id || _id === "")
        return res.status(400).json(generateResponseWithKey(false, 'general.check.input'))
    else
        return next()
}

exports.nameValidation = async (req, res, next) => {
    const name = req.body.name
    if (!name) {
        return res.status(400).json(generateResponseWithKey(false, 'general.check.input'))
    } else {
        return next()
    }
}

exports.isPlanExist = async (req, res, next) => {
    const _id = req.body.planId
    if (!_id || _id === "")
        return next()
    try {
        let plan = await Plan.findOne({ _id })
        if (!plan)
            return res.status(404).json(generateResponseWithKey(false, 'plan.not.found'))
        return next()
    } catch (err) {
        console.log(err)
        return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
    }
}