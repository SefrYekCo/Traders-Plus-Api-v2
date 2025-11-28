const language = require('../../helpers/language/index')

exports.validatePopup = (title ,description ,indicatedPage ,link ,type ,buttons) => {
    try {
    const pages = ["main" ,"subscriptionBaseFragment", "channelFragment" ,"servicesFragment" ,"myPortfolioBaseFragment" ,"userOptionsFragment" ,"weatherForecastFragment"]
    const types = ['alert' ,'prompt' ,'confirm'];

    if(typeof title !== 'string' || title.length === 0) return language("fa",'popup.title.invalid');
    if(description !== undefined && (typeof description !== "string") ) return language('fa','popup.description.invalid');
    if(typeof indicatedPage !== 'string' || !pages.includes(indicatedPage)) return language('fa','popup.indicateInPage.invalid');
    if(link !== undefined && (typeof link !== 'string' || link.length === 0)) return language("fa",'popup.link.invalid');
    if(typeof type !== 'string' || type.length === 0 || !types.includes(type)) return language('fa','popup.type.invalid');
    if(typeof buttons !== "object" || buttons.length > 5 || buttons.length <= 0) return language('fa','popup.numbers.buttons.invalid');

    for (let i = 0; i < buttons.length; i++) {
        const text = buttons[i].text
        if(!text || text.length > 30 || text.length <= 0) return language('fa','popup.buttons.invalid');
        continue
    }

    return "ok";

    } catch (err) {
        console.log(err);
        return language('fa','popup.validation.error');
    }
}

exports.validateEditPopup = (title ,description ,indicatedPage ,link ,type ,buttons) => {
    try {
        console.log("title :" ,title);
        console.log("indicatedPage :" ,typeof indicatedPage);
        console.log("description :" ,description);
        console.log("link :" ,link);
        console.log("type :" ,type);
        console.log("buttons :" ,buttons);
        const pages = ["main" ,"subscriptionBaseFragment", "channelFragment" ,"servicesFragment" ,"myPortfolioBaseFragment" ,"userOptionsFragment" ,"weatherForecastFragment"]
        const types = ['alert' ,'prompt' ,'confirm'];
    
        if(title !== undefined && title.length !== 0 && (typeof title !== 'string' || title.length === 0)) return language("fa",'popup.title.invalid');
        if(description !== undefined && description.length !== 0 && (typeof description !== "string") ) return language('fa','popup.description.invalid');
        if(indicatedPage !== undefined && indicatedPage.length !== 0 && (typeof indicatedPage !== 'string' || !pages.includes(indicatedPage))) return language('fa','popup.indicateInPage.invalid');
        if(link !== undefined && link.length !== 0 && (typeof link !== 'string' || link.length === 0)) return language("fa",'popup.link.invalid');
        if(type !== undefined && type.length !== 0 && (typeof type !== 'string' || type.length === 0 || !types.includes(type))) return language('fa','popup.type.invalid');
        if(buttons !== undefined && buttons.length !== 0 && (typeof buttons !== "object" || buttons.length > 5 || buttons.length <= 0)) return language('fa','popup.numbers.buttons.invalid');

        for (let i = 0; i < buttons.length; i++) {
            const text = buttons[i].text
            if(!text || text.length > 30 || text.length <= 0) return language('fa','popup.buttons.invalid');
            continue
        }

        return "ok";
    
    } catch (err) {
        console.log(err);
        return language('fa','popup.validation.error');
    }
}

exports.validatePopupAnswer = (answer) => {
    try {

    if(typeof answer !== 'string' || answer.length === 0) return language("fa",'popup.answer.invalid');
    return "ok";

    } catch (err) {
        console.log(err);
        return language('fa','popup.validation.error');
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
