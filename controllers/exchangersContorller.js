const Exchanger = require('../models/schemas/exchangers');
const {validateEditExchanger ,validateExchanger} = require("../middleware/validators/exchangersValidator");
const language = require("../helpers/language");
const { generateResponseWithKey } = require("../models/responseModel");

exports.createExchangers = async (req ,res ,next) => {
    try {
        const {name ,description, isActive ,webAddress ,index} = req.body;
        let imagePath = '';

        const isExist = await Exchanger.findOne({name});
        if(isExist){
            return res.status(400).json({ status: false, description: language('fa', 'exchanger.error.message')})
        }

        if (req.files.icon) {
            console.log('have icons');
            imagePath = req.files.icon[0].path;
        }
        
        const count = await Exchanger.countDocuments()

        const validationStatus = validateExchanger(name ,isActive ,webAddress ,index ,count)
        if(validationStatus !== "ok"){
            return res.status(400).json({ status: false, description: validationStatus})
        }

        const exchanger = new Exchanger()

        exchanger.name = name;
        exchanger.description = description;
        exchanger.index = Number(index)
        exchanger.isActive = Boolean(isActive);
        exchanger.imageURL = imagePath.length > 0 ? imagePath : null ;
        exchanger.webAddress = webAddress;
        
        await exchanger.save()

        return res.status(200).json({status: true ,description: language( "fa" ,"exchanger.create.message")})

    } catch (err) {
        console.log(err);
        return res.status(500).json({status: false ,description: language("fa" ,'error.unknown')})
    }
}

exports.getActiveExchangers = async (req ,res ,next) => {
    try {
        const exchangers = await Exchanger.find({isActive:true})

        return res.status(200).json({status:true ,response:{exchangers}})
        
    } catch (err) {
        console.log(err);
        return res.status(500).json({status: false ,description: language("fa" ,'error.unknown')})
    }
}

exports.getAllExchangers = async (req ,res ,next) => {
    try {
        const exchangers = await Exchanger.find()

        return res.status(200).json({status:true ,response:{exchangers}})
        
    } catch (err) {
        console.log(err);
        return res.status(500).json({status: false ,description: language("fa" ,'error.unknown')})
    }
}

exports.getOne = async (req ,res ,next) => {
    try {
        const id = req.params.id;
        const exchanger = await Exchanger.findOne({_id:id})

        return res.status(200).json({status:true ,response:{exchanger}})
        
    } catch (err) {
        console.log(err);
        return res.status(500).json({status: false ,description: language("fa" ,'error.unknown')})
    }
}

exports.deleteExchanger = async (req ,res ,next) => {
    try {
        const id = req.params.id;

        const deletedExchanger = await Exchanger.findByIdAndDelete(id)
        if(!deletedExchanger) return res.status(404).json({status: false ,description: language("fa" ,"exchanger.id.notFound")})
        return res.status(200).json({status:true ,description:language("fa" ,'exchanger.delete.success')})
        
    } catch (err) {
        console.log(err);
        return res.status(500).json({status: false ,description: language("fa" ,'error.unknown')})
    }
}

exports.editExchanger = async (req ,res) => {
    try {
        const id = req.params.id;
        let imagePath = '';
        
        if (req.files && req.files.icon) {
            console.log('have icons');
            imagePath = req.files.icon[0].path;
        }
    
        const {isActive, name ,description  ,webAddress ,index} = req.body;
        
        if(!id) return res.status(400).json({status:false ,description:language("fa" ,"exchanger.id.error")})
        const exchanger = await Exchanger.findOne({_id:id});
        if(!exchanger) return res.status(400).json({status:false ,description:language("fa" ,"exchanger.id.notFound")})

        const count = await Exchanger.countDocuments()

        const validationStatus = validateEditExchanger(name ,isActive ,webAddress ,index ,count)
        if(validationStatus !== "ok"){
            return res.status(400).json({ status: false, description: validationStatus})
        }

        if(isActive){
            exchanger.isActive = isActive
        }

        if(name){
            exchanger.name = name
        }

        if(description){
            exchanger.description = description
        }

        if(webAddress){
            exchanger.webAddress = webAddress
        }

        if(index){
            exchanger.index = Number(index)
        }

        if(imagePath.length > 0){
            exchanger.imageURL = imagePath 
        }
        

        await exchanger.save()
        return res.status(200).json({status:true ,description:language("fa" ,'exchanger.edit.success')})
        
    } catch (err) {
        console.log(err);
        return res.status(500).json({status: false ,description: language("fa" ,'error.unknown')})
    }
}

exports.changeIndex = async (req ,res) => {
    try {
        const {id ,index} = req.body;
        if(index < 0) return res.status(400).json(generateResponseWithKey(false, 'index.invalid')) 

        const count = await Exchanger.countDocuments()
        console.log(count);
        if(index > count) return res.status(400).json(generateResponseWithKey(false, 'index.invalid')) 

        const exchanger = await Exchanger.findById(id)
        if(!exchanger) return res.status(404).json(generateResponseWithKey(false, 'exchanger.id.notFound')) 

        exchanger.index = index;
        await exchanger.save()

        return res.status(200).json(generateResponseWithKey(true, 'index.changed')) 

    } catch (err) {
        console.log(err)
        return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
    }
}

exports.countClick = async (req ,res) => {
    try {
        const {id} = req.body;
        if(!id) return res.status(400).json(generateResponseWithKey(false, 'exchanger.id.notFound'))
        const exchanger = await Exchanger.findById(id)
        if(!exchanger) return res.status(404).json(generateResponseWithKey(false, 'exchanger.id.notFound'));
        
        exchanger.click ++
        await exchanger.save()

        return res.status(200).json(generateResponseWithKey(true, 'exchanger.click.success')) 
    } catch (err) {
        console.log(err);
        return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
    }
}