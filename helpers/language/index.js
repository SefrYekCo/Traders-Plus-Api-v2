const serverLang = require('./server-logs.json');
const fa = require('./fa.json')

const language = (lang, parameter) => {
    if (lang == 'server') {
        return !serverLang[parameter] ? parameter : serverLang[parameter];
    } else if (lang == 'fa' || lang == 'farsi' || lang == 'persian') {
        return !fa[parameter] ? parameter : fa[parameter];
    }
}

module.exports = language;