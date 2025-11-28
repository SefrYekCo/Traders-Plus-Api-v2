const language = require('../helpers/language/index');
const Category = require('../models/schemas/chatroomCategory')
const { CategoryType } = require('../configs/secret')
const { updateChannels } = require('../controllers/channelController')
const config = require('../config');
const { generateResponseWithKey } = require('../models/responseModel');
const key = config.update.key

exports.addCategory = async (req, res) => {
    //const imagePath = req.files.icon[0].path;
    const name = req.body.name
    const type = req.body.type
    const password = req.body.password
    if (password !== key)
        return res.status(400).json({
            status: false,
            message: language('fa', 'client.update.key.error')
        });

    if (!type)
        return res.status(400).json({ status: false, description: language('fa', 'channel.category.type.notfound') })
    else if (type !== CategoryType.channel && type !== CategoryType.info)
        return res.status(400).json({ status: false, description: language('fa', 'channel.category.type.invalid') })
    if (!name)
        return res.status(400).json({ status: false, description: language('fa', 'error.name.notfound') })
    try {
        let category = await Category.findOne({ name: req.body.name })
        if (category) {
            return res.status(400).json({ status: false, discription: language('fa', 'channel.category.exist') })
        } else {
            category = await new Category({ name: name, type: type })
            category.save()
            return res.status(200).json({ status: true, discription: language('fa', 'channel.category.created') })
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: false, discription: language('fa', 'error.unknown') })
    }
}

exports.editCategory = async (req, res) => {
    const name = req.body.name
    const _id = req.body.id
    const password = req.body.password
    if (password !== key)
        return res.status(400).json({
            status: false,
            message: language('fa', 'client.update.key.error')
        });
    if (!name)
        return res.status(400).json({ status: false, description: language('fa', 'error.name.notfound') })
    if (!_id)
        return res.status(400).json({ status: false, discription: language('fa', 'general.check.input') })
    try {
        let category = await Category.findOne({ _id })
        if (!category) {
            return res.status(404).json({ status: false, discription: language('fa', 'channel.category.notfound') })
        } else {
            category.name = name
            category.save()
            setTimeout(() => {
                updateChannels()
            }, 2000);
            return res.status(200).json({ status: true, discription: language('fa', 'channel.category.updated') })
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: false, discription: language('fa', 'error.unknown') })
    }
}

exports.getCategories = async (req, res) => {
    try {
        Category.find({ isActive: true }, (err, categories) => {
            return res.status(200).json({ status: true, response: { categories } })
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: false, discription: language('fa', 'error.unknown') })
    }
}

exports.deactiveCategory = async (req, res) => {
    const _id = req.body.id
    const isActive = req.body.isActive
    const password = req.body.password

    if (typeof isActive != "boolean")
        return res.status(400).json({ status: false, description: language('fa', 'general.check.input') })
    if (password !== key)
        return res.status(400).json({
            status: false,
            message: language('fa', 'client.update.key.error')
        });
    try {
        if (!_id) {
            return res.status(400).json({ status: false, discription: language('fa', 'general.check.input') })
        }
        let category = await Category.findOne({ _id: _id })
        if (!category) {
            return res.status(404).json({ status: false, discription: language('fa', 'channel.category.notfound') })
        } else {
            category.isActive = isActive
            category.save()
            return res.status(200).json({
                status: true,
                discription: language('fa', isActive ? 'channel.category.isactive.true' : 'channel.category.isactive.false')
            })
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: false, discription: language('fa', 'error.unknown') })
    }
}

exports.changeIndex = async (req ,res) => {
    try {
        const {id ,index} = req.body;

        const categoriesCount = await Category.countDocuments()
        if(index <= 0 || index > categoriesCount || !Number.isInteger(index)) return res.status(400).json(generateResponseWithKey(false, 'index.invalid')) 

        const category = await Category.findById(id)
        if(!category) return res.status(404).json(generateResponseWithKey(false, 'channel.category.notfound')) 

        category.index = index;
        await category.save()

        
        return res.status(200).json(generateResponseWithKey(true, 'index.changed')) 

    } catch (err) {
        console.log(err)
        return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
    }
}