const fs = require('fs');
require('dotenv').config()
const {
    parse,
    stringify
} = require('envfile');
const pathToenvFile = '.env';
const util = require('util');

// Convert fs.readFile into Promise version of same    
const readFile = util.promisify(fs.readFile);

const writeFile = util.promisify(fs.writeFile);




/**
 * 
 * @param {string} key 
 * //Function to get value from env
 */
const getEnv = async (key) => {
    try {
        let data = await readFile(pathToenvFile);
        var result = parse(data);
        return result[key]
    } catch (err) {
        console.log(err)
        return ''
    }
}


/**
 * 
 * @param {string} key 
 * @param {string} value 
 * //Function to set environment variables.
 */
const setEnv = async (key, value) => {
    try {
        let data = await readFile(pathToenvFile);
        var result = parse(data);
        result[key] = value;
        await writeFile(pathToenvFile, stringify(result))
        console.log("File Saved");
    } catch (err) {
        console.log(err)
    }
    /*fs.readFile(pathToenvFile, 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        var result = parse(data);
        result[key] = value;
        console.log(result);
        fs.writeFile(pathToenvFile, stringify(result), function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("File Saved"); // Can be commented or deleted
        })

    });*/
}
//Calling the function setEnv
//setEnv('key1', 'value2');
module.exports = {
    getEnv,
    setEnv,
}
