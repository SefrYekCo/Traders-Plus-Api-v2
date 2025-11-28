const language = require("../helpers/language");
const { generateResponseWithKey } = require("../models/responseModel");
const Brokerage = require("../models/schemas/brokerage")
const {validateBroker, validateEditBroker} = require("../middleware/validators/brokerValidator")


exports.createBrokerge = async (req ,res) => {
    try {
        const {name ,isActive ,webAddress ,index ,buttons ,mobileAddress} = req.body;
        let imagePath = '';

        const isExist = await Brokerage.findOne({name});
        if(isExist){
            return res.status(400).json({ status: false, description: language('fa', 'brokerage.error.message')})
        }

        if (req.files.icon) {
            console.log('have icons');
            imagePath = req.files.icon[0].path;
        }
        
        const countOfBrokers = await Brokerage.countDocuments()

        const validationStatus = validateBroker(name ,isActive ,webAddress ,index ,countOfBrokers)
        if(validationStatus !== "ok"){
            return res.status(400).json({ status: false, description: validationStatus})
        }

        const brokerage = new Brokerage()

        brokerage.name = name;
        brokerage.index = Number(index)
        brokerage.isActive = Boolean(isActive);
        brokerage.imageURL = imagePath.length > 0 ? imagePath : null ;
        brokerage.webAddress = webAddress;
        brokerage.buttons = buttons;
        brokerage.mobileAddress = mobileAddress
        
        await brokerage.save()

        return res.status(200).json({status: true ,description: language( "fa" ,"brokerage.create.message")})

    } catch (err) {
        console.log(err);
        return res.status(500).json({status: false ,description: language("fa" ,'error.unknown')})
    }
}

exports.getActiveBrokerages = async (req ,res ,next) => {
    try {
        const brokerages = await Brokerage.find({isActive:true})
        const brokers = returnObj(brokerages)
        return res.status(200).json({status:true ,response:{brokers}})
        
    } catch (err) {
        console.log(err);
        return res.status(500).json({status: false ,description: language("fa" ,'error.unknown')})
    }
}

exports.getAllBrokerages = async (req ,res ,next) => {
    try {
        const brokerages = await Brokerage.find()
        const response = returnObj(brokerages)
        return res.status(200).json({status:true ,response:{response}})
        
    } catch (err) {
        console.log(err);
        return res.status(500).json({status: false ,description: language("fa" ,'error.unknown')})
    }
}

exports.getOne = async (req ,res ,next) => {
    try {
        const id = req.params.id;
        const brokerage = await Brokerage.findOne({_id:id})
        const obj = {
            isActive:brokerage.isActive,
            id:brokerage._id,
            name:brokerage.name,
            imageURL:brokerage.imageURL ? process.env.PAYMENT_URL  + "/" + brokerage.imageURL : null,
            webAddress:brokerage.webAddress,
            mobileAddress:brokerage.mobileAddress,
            click:brokerage.click,
            index:brokerage.index,
            createdAt:brokerage.createdAt,
            updatedAt:brokerage.updatedAt
        }
        return res.status(200).json({status:true ,response:{obj}})
        
    } catch (err) {
        console.log(err);
        return res.status(500).json({status: false ,description: language("fa" ,'error.unknown')})
    }
}

exports.deleteBrokerage = async (req ,res ,next) => {
    try {
        const id = req.params.id;

        const deletedBrokerage = await Brokerage.findByIdAndDelete(id)
        if(!deletedBrokerage) return res.status(404).json({status: false ,description: language("fa" ,"brokerage.id.notFound")})
        return res.status(200).json({status:true ,description:language("fa" ,'brokerage.delete.success')})
        
    } catch (err) {
        console.log(err);
        return res.status(500).json({status: false ,description: language("fa" ,'error.unknown')})
    }
}

exports.editBrokerage = async (req ,res) => {
    try {
        const id = req.params.id;
        let imagePath = '';
        
        if (req.files && req.files.icon) {
            console.log('have icons');
            imagePath = req.files.icon[0].path;
        }
    
        const {isActive, name ,webAddress ,index ,mobileAddress} = req.body;
        
        if(!id) return res.status(400).json({status:false ,description:language("fa" ,"brokerage.id.error")})
        const brokerage = await Brokerage.findOne({_id:id});
        if(!brokerage) return res.status(400).json({status:false ,description:language("fa" ,"brokerage.id.notFound")})

        const count = await Brokerage.countDocuments()

        const validationStatus = validateEditBroker(name ,isActive ,webAddress ,index ,count)
        if(validationStatus !== "ok"){
            return res.status(400).json({ status: false, description: validationStatus})
        }

        if(isActive){
            brokerage.isActive = isActive
        }

        if(mobileAddress){
            brokerage.mobileAddress = mobileAddress
        }

        if(name){
            brokerage.name = name
        }

        if(webAddress){
            brokerage.webAddress = webAddress
        }

        if(imagePath.length > 0){
            brokerage.imageURL = imagePath 
        }
        

        await brokerage.save()
        return res.status(200).json({status:true ,description:language("fa" ,'brokerage.edit.success')})
        
    } catch (err) {
        console.log(err);
        return res.status(500).json({status: false ,description: language("fa" ,'error.unknown')})
    }
}

exports.changeIndex = async (req ,res) => {
    try {
        const {id ,index} = req.body;
        if(index <= 0 || !Number.isInteger(index)) return res.status(400).json(generateResponseWithKey(false, 'index.invalid')) 

        const count = await Brokerage.countDocuments()
        if(index > count) return res.status(400).json(generateResponseWithKey(false, 'index.invalid')) 

        const brokerage = await Brokerage.findById(id)
        if(!brokerage) return res.status(404).json(generateResponseWithKey(false, 'brokerage.id.notFound')) 

        brokerage.index = index;
        await brokerage.save()

        
        return res.status(200).json(generateResponseWithKey(true, 'index.changed')) 

    } catch (err) {
        console.log(err)
        return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
    }
}

exports.countClick = async (req ,res) => {
    try {
        const {id} = req.body;
        if(!id) return res.status(400).json(generateResponseWithKey(false, 'brokerage.id.notFound'))
        const brokerage = await Brokerage.findById(id)
        if(!brokerage) return res.status(404).json(generateResponseWithKey(false, 'brokerage.id.notFound'));
        
        brokerage.click++
        await brokerage.save()

        return res.status(200).json(generateResponseWithKey(true, 'brokerage.click.success')) 
    } catch (err) {
        console.log(err);
        return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
    }
}

const returnObj = (array) => {
    return array.map((item) => {
        return {
            isActive:item.isActive,
            id:item._id,
            name:item.name,
            imageURL:item.imageURL ? process.env.PAYMENT_URL  + "/" + item.imageURL : null,
            webAddress:item.webAddress,
            mobileAddress:item.mobileAddress,
            click:item.click,
            index:item.index,
            createdAt:item.createdAt,
            updatedAt:item.updatedAt
        }
    })
}