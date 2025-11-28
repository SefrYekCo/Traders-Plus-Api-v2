const language = require('../helpers/language/index')

const generateError = (error) => {
    return {
        status: false,
        discription: error,
    }
}

const generateChannels = (data) => {
    return {
        status: true,
        response: {
            channels: data
        },
    }
}

const generateCurrencies = (currencies, metals, indexes, cryptos) => {
    return {
        status: true,
        response: {
            currencies: currencies,
            metals: metals,
            indexes: indexes,
            cryptos: cryptos
        }
    }
}

const generateStocks = (stocks) => {
    return {
        status: true,
        response: {
            stocks
        }
    }
}

const generateHedgeFunds = (hedgeFunds) => {
    return {
        status: true,
        response: {
            hedgeFunds
        }
    }
}

const generateWeatherForecast = (weatherForecast) => {
    return {
        status: true,
        response: {
            weatherForecast
        }
    }
}
const generateCryptoHistory = (history) => {
    return {
        status: true,
        response: {
            history
        }
    }
}
const generateSymbolHistory = (history) => {
    let records = history.split('\r\n')
    // remove header
    records.shift()
    // filter not empty lines
    records = records.filter(record => record)
        .map(record => {
            let fields = record.split(',')
            if (fields.length < 11) return

            return {
                date: fields[1],
                first: fields[2],
                highest: fields[3],
                lowest: fields[4],
                closing: fields[5],
                value: fields[6],
                volume: fields[7],
                opening: fields[10],
            }
        })

    records = records.filter(record => record)
    return {
        status: true,
        response: {
            records
        }
    }
}

const generateCryptos = (cryptos) => {
    return {
        status: true,
        response: {
            cryptos: cryptos
        }
    }
}

const generateDetailsStock = (stock) => {
    return {
        status: true,
        response: {
            stock
        }
    }
}
const generateCheckVersion = (versionResponse) => {
    return {
        status: true,
        response: {
            versionResponse
        }
    }
}

const generateBrokers = (brokers) => {
    return {
        status: true,
        response: {
            brokers: brokers
        }
    }
}

const generateResponse = (status, res) => {
    return {
        status: status,
        response: {...res}
    }
}

const generateResponseWithKey = (status, key) => {
    return {
        status: status,
        description: language('fa', key)
    }
}

module.exports = {
    generateError,
    generateChannels,
    generateCurrencies,
    generateStocks,
    generateDetailsStock,
    generateBrokers,
    generateSymbolHistory,
    generateCryptos,
    generateCryptoHistory,
    generateCheckVersion,
    generateWeatherForecast,
    generateResponse,
    generateResponseWithKey,
    generateHedgeFunds
}