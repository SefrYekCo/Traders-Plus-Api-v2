const multer = require("multer")
const Broker = require("../../models/brokerageModel")
const { generateResponseWithKey } = require('../../models/responseModel')
const language = require('../../helpers/language/index')

exports.validateBroker = (name ,isActive ,webAddress ,index ,numberOfBrokers) => {
    try {
    const numIndex = Number(index)
    if(typeof name !== 'string' || name.length === 0) return language("fa",'brokerage.name.invalid');
    if(isActive !== "true" && isActive !== "false" ) return language('fa','brokerage.isActive.invalid');
    if(typeof webAddress !== 'string' || webAddress.length === 0) return language('fa','brokerage.webAddress.invalid');
    if(!index) return "ok";
    if(numIndex < 0 || numIndex > numberOfBrokers || !Number.isInteger(numIndex)) return language('fa','brokerage.index.invalid');

    return "ok";

    } catch (err) {
        console.log(err);
        return language('fa','brokerage.validation.error');
    }
}

exports.validateEditBroker = (name ,isActive ,webAddress ,index ,numberOfBrokers) => {
    try {
       
    const numIndex = Number(index)
    if(name !== undefined && (typeof name !== 'string' || name.length === 0)) return language("fa",'brokerage.name.invalid');

    if(isActive !== undefined && (isActive !== "true" && isActive !== "false") ) return language('fa','brokerage.isActive.invalid');
    
    if(webAddress !== undefined && (typeof webAddress !== 'string' || webAddress.length === 0)) return language('fa','brokerage.webAddress.invalid');

    if(index !== undefined && (numIndex < 0 || numIndex > numberOfBrokers || !Number.isInteger(numIndex))) return language('fa','brokerage.index.invalid');

    return "ok";

    } catch (err) {
        console.log(err);
        return language('fa','brokerage.validation.error');
    }
}


exports.fileFileter = (req, file ,cb) => {
    const imageFormats = ['jpg', 'jpeg', 'jpe' , 'jif', 'jfif', 'jfi', 'png', 'gif', 'webp', 'tiff', 'tif', 'raw', 'bmp',
    'jp2', 'j2k', 'jpf', 'jpx', 'jpm', 'mj2', 'svg', 'svgz', 'ico'];

    const originalNameSplited = file.originalname.split('.');
    const format = (originalNameSplited[originalNameSplited.length - 1]).toLowerCase();
    if (!imageFormats.includes(format)){
        return cb(language("fa" ,"brokerage.icon.invalid"))
    }
    cb(null ,true)
}
