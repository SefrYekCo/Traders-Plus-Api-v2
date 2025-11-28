const language = require('../helpers/language/index');
const Basket = require('../models/schemas/basket')
const Symbol = require('../models/schemas/symbol')
const SymbolHistory = require('../models/schemas/symbolHistory')
const User = require('../models/schemas/user')
const { BasketType } = require('../configs/secret');

const orderType = {
    buy: 'BUY',
    sell: 'SELL',
    award_share: 'AWARD_SHARE',
    convert_priority_to_share: 'CONVERT_PRIORITY_TO_SHARE'
}

exports.addBasket = async (req, res) => {
    const _id = req.user._id
    const name = req.body.name
    const type = req.body.type

    if (!name)
        return res.status(400).json({ status: false, description: language('fa', 'error.name.notfound') })
    if (!type)
        return res.status(400).json({ status: false, description: language('fa', 'basket.type.notfound') })
    else if (type !== BasketType.cryptoWachlist && type !== BasketType.iranWachlist)
        return res.status(400).json({ status: false, description: language('fa', 'basket.type.invalid') })
    try {
        const user = await User.findOne({ _id })
        if (!user) return res.status(404).json({ staus: false, description: language('fa', 'user.not.found') })
        var basket = await new Basket()
        basket.name = name
        basket.type = type
        basket.userId = _id
        user.baskets.push(basket)
        user.save()
        basket.save()

        const returnItem = {
            _id: basket._id,
            name: basket.name,
            type: basket.type
        }

        return res.status(200).json({ status: true, response: { basket: returnItem } })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: false, description: language('fa', 'error.unknown') })
    }
}

exports.updateBasket = async (req, res) => {
    const _id = req.user._id
    const basketId = req.body.id
    const name = req.body.name
    if (!basketId)
        return res.status(400).json({ status: false, description: language('fa', 'basket.id.notfound') })
    if (!name)
        return res.status(400).json({ status: false, description: language('fa', 'error.name.notfound') })
    try {
        var basket = await Basket.findOne({ _id: basketId, userId: _id })
        if (!basket)
            return res.status(404).json({ status: false, description: language('fa', 'basket.notfound') })
        basket.name = req.body.name
        basket.save()
        const returnItem = {
            _id: basket._id,
            name: basket.name,
            type: basket.type
        }
        return res.status(200).json({ status: true, response: { basket: returnItem } })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: false, description: language('fa', 'error.unknown') })
    }
}

exports.addSymbol = async (req, res) => {
    const _id = req.user._id
    const basketId = req.body.basketId
    const symbolName = req.body.symbol
    const price = req.body.price
    const amount = req.body.amount
    const date = req.body.date
    const type = req.body.type

    var newSymbol = false

    if (!symbolName)
        return res.status(400).json({ status: false, description: language('fa', 'symbol.notfound') })

    try {
        if (!basketId || !symbolName || !price || !amount || !date || !type || !(Object.values(orderType).includes(type)))
            return res.status(400).json({ status: false, description: language('fa', 'general.check.input') })
        var basket = await Basket.findOne({ userId: _id, _id: basketId })
        if (!basket)
            return res.status(404).json({ status: false, description: language('fa', 'basket.notfound') })
        var symbol = await Symbol.findOne({ symbol: symbolName, basketId: basketId })
        if (!symbol) {
            symbol = await new Symbol({ symbol: symbolName, basketId: basketId })
            newSymbol = true
        }
        var symbolHistory = await new SymbolHistory()
        symbolHistory.unitPrice = parseFloat(price)
        symbolHistory.amount = parseFloat(amount)
        symbolHistory.tradeDate = date
        symbolHistory.type = type
        symbol.unit = req.body.unit
        symbol.history.push(symbolHistory)
        if (newSymbol)
            basket.symbols.push(symbol)

        await symbolHistory.save()
        await symbol.save()
        await basket.save()

        let temp = await Symbol.findOne({ _id: symbol._id }).populate('history', '-createdAt -updatedAt')
        return res.status(200).json({ status: true, response: { symbol: temp } })

    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: false, description: language('fa', 'error.unknown') })
    }
}

exports.updateSymbolHistory = async (req, res) => {
    const _id = req.body.id
    const price = req.body.price
    const amount = req.body.amount
    const date = req.body.date
    const type = req.body.type
    try {
        if (!price || !amount || !date || !type || !_id || !(Object.values(orderType).includes(type)))
            return res.status(400).json({ status: false, description: language('fa', 'general.check.input') })
        var history = await SymbolHistory.findOne({ _id })
        if (!history)
            return res.status(404).json({ status: false, description: language('fa', 'symbolhistory.notfound') })
        history.amount = parseFloat(amount)
        history.unitPrice = parseFloat(price)
        history.tradeDate = date
        history.type = type
        history.save()
        return res.status(200).json({ status: true, description: language('fa', 'symbolhistory.updated') })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: false, description: language('fa', 'error.unknown') })
    }
}

exports.removeBasket = async (req, res) => {
    const _id = req.params.id
    console.log(_id)
    try {
        let basket = await Basket.findOneAndRemove({ _id })
        for (let symbol of basket.symbols) {
            let s = await Symbol.findOneAndRemove({ _id: symbol })
            await SymbolHistory.deleteMany({ _id: { $in: s.history } })
        }
        return res.status(200).json({ status: true, description: language('fa', 'basket.deleted') })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: false, description: language('fa', 'error.unknown') })
    }
}

exports.removeSymbol = async (req, res) => {
    const _id = req.user._id
    const symbolId = req.params.id
    try {
        let symbol = await Symbol.findOneAndRemove({ _id: symbolId })
        if (symbol)
            await SymbolHistory.deleteMany({ _id: { $in: symbol.history } })
        return res.status(200).json({ status: true, description: language('fa', 'symbolhistory.deleted') })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: false, description: language('fa', 'error.unknown') })
    }
}

exports.removeSymbolHistory = async (req, res) => {
    const _id = req.user._id
    const symbolId = req.params.id
    try {
        let symbol = await Symbol.findOne({ history: symbolId })
        let historyItem = await SymbolHistory.deleteOne({ _id: symbolId }, (err) => {
            if (err) console.log('delete symbolhistory', err)
        })
        let index = symbol.history.findIndex(x => String(x) === symbolId);
        symbol.history.splice(index, 1)
        await symbol.save()
        if (symbol.history.length < 1) {
            // delete symbol
            let symbolItem = await Symbol.deleteOne({ _id: symbol._id }, (err) => {
                if (err) console.log('delete symbol', err)
            })
            console.log(symbolItem)
        }
        console.log(historyItem)
        return res.status(200).json({ status: true, description: language('fa', 'symbolhistory.deleted') })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: false, description: language('fa', 'error.unknown') })
    }
}

exports.getBaskets = async (req, res) => {
    const _id = req.user._id
    try {
        const baskets = await Basket.find({ userId: _id })
            .select('_id name type symbols')
            .populate({
                path: "symbols",
                select: { '_id': 1, 'unit': 1, 'symbol': 1 },
                populate: {
                    path: "history",
                    select: { '_id': 1, 'unitPrice': 1, 'amount': 1, 'tradeDate': 1, 'type': 1 },
                }
            })
        return res.status(200).json({ status: true, response: { baskets } })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: false, description: language('fa', 'error.unknown') })
    }
}