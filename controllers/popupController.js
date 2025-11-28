const Popup = require('../models/schemas/popup');
const PopupAnswer = require('../models/schemas/popupAnswer');
const User = require('../models/schemas/user');
const { generateResponseWithKey } = require('../models/responseModel');
const { validatePopup, validatePopupAnswer, validateEditPopup } = require('../middleware/validators/popUpValidator');

exports.createPopup = async (req, res) => {
    try {
        const {title ,description ,indicatedPage ,link ,type ,buttons} = req.body;
        var json = buttons.replaceAll("", ).split(",")
        const btnsArr = JSON.parse(buttons)
        let imagePath = '';
        
        if (req.files.icon) {
            console.log('have icons');
            imagePath = req.files.icon[0].path;
        }

        const isValidate = validatePopup(title ,description ,indicatedPage ,link, type ,btnsArr)
        if(isValidate !== "ok"){
            return res.status(400).json({status:false ,description:isValidate})
        }

        const popup = new Popup()
        popup.title = title;
        popup.description = description;
        popup.indicatedPage = indicatedPage;
        popup.link = link;
        popup.type = type
        popup.imageUrl = imagePath;
        popup.buttons = btnsArr

        await popup.save();

        res.status(200).json(generateResponseWithKey(true ,"popup.create.successfully"))
        
    } catch (err) {
        console.log(err);
        res.status(500).json(generateResponseWithKey(false ,'error.unknown'))
    }
}

exports.getPopups = async (req ,res) => {
    try {
        const popups = await Popup.find()
        // if(popups.length === 0) return res.status(404).json(generateResponseWithKey(true ,"popup.not.found"))
        return res.status(200).json({stauts:true ,response:{popups}})
    } catch (err) {
        console.log(err);
        res.status(500).json(generateResponseWithKey(false ,'error.unknown'))
    }
}

exports.getPopup = async (req ,res) => {
    try {
        const id = req.params.id
        const popup = await Popup.findOne({_id:id})
        if(popup.length === 0) return res.status(404).json(generateResponseWithKey(true ,"popup.not.found"))
        return res.status(200).json({stauts:true ,response:{popup}})
    } catch (err) {
        console.log(err);
        res.status(500).json(generateResponseWithKey(false ,'error.unknown'))
    }
}

exports.getActivePopup = async (req ,res) => {
    try {
        const popups = await Popup.find({isActive:true})
        // if(popups.length === 0) return res.status(404).json(generateResponseWithKey(true ,"popup.not.found"))
        return res.status(200).json({stauts:true ,response:{popups}})
    } catch (err) {
        console.log(err);
        res.status(500).json(generateResponseWithKey(false ,'error.unknown'))
    }
}

exports.activationPopup = async (req ,res) => {
    try {
        const id = req.params.id;
        const status = req.body.status;

        if(typeof status !== 'boolean') return res.status(400).json(generateResponseWithKey(false ,"popup.status.invalid"));

        const activePopup = await Popup.findOne({isActive:true});
        if(activePopup && status) return res.status(400).json(generateResponseWithKey(false ,"popup.can.not.active"));

        const popup = await Popup.findOne({_id:id})
        if(!popup) return res.status(404).json(generateResponseWithKey(false ,"popup.not.found"))
        popup.isActive = status;
        
        await popup.save()
        if(status){
            return res.status(200).json(generateResponseWithKey(true ,"popup.active.successfully"))
        }
        return res.status(200).json(generateResponseWithKey(true ,"popup.deactive.successfully"))
    } catch (err) {
        console.log(err);
        res.status(500).json(generateResponseWithKey(false ,'error.unknown'))
    }
}

exports.editPopup = async (req ,res) => {
    try {
        const id = req.params.id
        const {title ,description ,link ,indicatedPage ,type ,buttons} = req.body;
        const btnsArr = JSON.parse(buttons)

        const isValidate = validateEditPopup(title ,description ,indicatedPage ,link , type ,btnsArr)
        if(isValidate !== "ok"){
            return res.status(400).json({status:false ,description:isValidate})
        }

        let imagePath = '';
        
        if (req.files.icon) {
            console.log('have icons');
            imagePath = req.files.icon[0].path;
        }

        const popup = await Popup.findOne({_id:id})
        if(!popup) return res.status(404).json(generateResponseWithKey(false ,"popup.not.found"))

        if(title){
            popup.title = title;
        }
        if(description){
            popup.description = description;
        }
        if(indicatedPage){
            popup.indicatedPage = indicatedPage;
        }
        if(link){
            popup.link = link;
        }
        if(type){
            popup.type = type;
        }
        if(imagePath.length > 0){
            popup.imageUrl = imagePath;
        }
        if(btnsArr.length > 0){
            popup.buttons = btnsArr
        }

        await popup.save()

        return res.status(200).json(generateResponseWithKey(true ,"popup.edit.successfully"))
        
    } catch (err) {
        console.log(err);
        res.status(500).json(generateResponseWithKey(false ,'error.unknown'))
    }
}

exports.deletePopup = async (req ,res) => {
    try {
        const id = req.params.id;

        const deletedPopup = await Popup.findByIdAndDelete(id)
        if(!deletedPopup) return res.status(404).json(generateResponseWithKey(false ,"popup.not.found"))
        return res.status(200).json(generateResponseWithKey(true ,'popup.delete.successfully'))
        
    } catch (err) {
        console.log(err);
        res.status(500).json(generateResponseWithKey(false ,'error.unknown'))
    }
}

exports.registerPopupAnswer = async (req ,res) => {
    try {
        const popupId = req.params.id
        const {answer ,userId} = req.body;

        const isValidate = validatePopupAnswer(title ,description ,indicatedPage ,link)
        if(isValidate !== "ok"){
            return res.status(400).json({status:false ,description:isValidate})
        }

        const user = await User.findOne({_id:userId})
        if(!user) return res.status(404).json(generateResponseWithKey(false, "users.not.found"))

        const popupAnswer = await PopupAnswer.findOne({userId})
        
        if(popupAnswer) return res.status(400).json(generateResponseWithKey(false, "popup.answer.user.invalid"))

        const newPopupAnswer = new PopupAnswer()
        newPopupAnswer.answer = answer;
        newPopupAnswer.answerDate = new Date.now();
        newPopupAnswer.user = userId;
        newPopupAnswer.popup = popupId

        await newPopupAnswer.save()
        return res.status(200).json(generateResponseWithKey(true ,"popup.answer.register.successfully"))

    } catch (err) {
        console.log(err);
        res.status(500).json(generateResponseWithKey(false ,'error.unknown'))
    }
}

exports.getPopupAnswers = async (req ,res) => {
    try {
        const popupId = req.params.popupId 
        const popupAnswer = await PopupAnswer.find({popup:popupId}).populate("user" ,"name family mobileNumber").populate("popup" ,"title description type")
        if(popupAnswer.length === 0) return res.status(404).json(generateResponseWithKey(true ,"popup.answer.not.found"))
        return res.status(200).json({stauts:true ,response:popupAnswer})
    } catch (err) {
        console.log(err);
        res.status(500).json(generateResponseWithKey(false ,'error.unknown'))
    }
}

