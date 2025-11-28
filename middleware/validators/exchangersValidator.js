const language = require('../../helpers/language/index')

exports.validateExchanger = (name ,isActive ,webAddress ,index ,numberOfExchangers) => {
    try {
        
    
    if(typeof name !== 'string' || name.length === 0) return language("fa",'exchanger.name.invalid');
    if(isActive !== "true" && isActive !== "false" ) return language('fa','exchanger.isActive.invalid');
    if(typeof webAddress !== 'string' || webAddress.length === 0) return language('fa','exchanger.webAddress.invalid');
    if(!index) return "ok";
    if( Number.isNaN(index) || Number(index) < 0 || Number(index) > numberOfExchangers) return language('fa','exchanger.index.invalid');

    return "ok";

    } catch (err) {
        console.log(err);
        return language('fa','exchanger.validation.error');
    }
}

exports.validateEditExchanger = (name ,isActive ,webAddress ,index ,numberOfExchangers) => {
    try {
       
    if(name !== undefined && name.length !== 0 && (typeof name !== 'string' || name.length === 0)) return language("fa",'exchanger.name.invalid');

    if(isActive !== undefined && isActive.length !== 0 && (isActive !== "true" && isActive !== "false") ) return language('fa','exchanger.isActive.invalid');
    
    if(webAddress !== undefined && webAddress.length !== 0 && (typeof webAddress !== 'string' || webAddress.length === 0)) return language('fa','exchanger.webAddress.invalid');

    if(index !== undefined && (Number.isNaN(index) || Number(index) < 0 || Number(index) > numberOfExchangers)) return language('fa','exchanger.index.invalid');

    return "ok";

    } catch (err) {
        console.log(err);
        return language('fa','exchanger.validation.error');
    }
}


exports.fileFileter = (req, file ,cb) => {
    const imageFormats = ['jpg', 'jpeg', 'jpe' , 'jif', 'jfif', 'jfi', 'png', 'gif', 'webp', 'tiff', 'tif', 'raw', 'bmp',
    'jp2', 'j2k', 'jpf', 'jpx', 'jpm', 'mj2', 'svg', 'svgz', 'ico'];

    const originalNameSplited = file.originalname.split('.');
    const format = (originalNameSplited[originalNameSplited.length - 1]).toLowerCase();
    if (!imageFormats.includes(format)){
        return cb(language("fa" ,"exchanger.icon.invalid"))
    }
    cb(null ,true)
}
