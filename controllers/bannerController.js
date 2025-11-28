const ObjectId = require('mongoose').Types.ObjectId
const redis = require('../src/redisManager')
const keys = require('../src/utils').keys
var fs = require('fs');
const {
    generateResponse,
    generateResponseWithKey
} = require('../models/responseModel')
const Banner = require('../models/schemas/banner')
const Report = require('../models/schemas/report')
const { validURL, validHexColor } = require('../helpers/helper')

function isFloat(n) {
    return Number(n) === n && n % 1 !== 0;
}

exports.addBanner = async (req, res) => {
    const name = req.body.name
    const desc = req.body.description
    const action = req.body.action
    const link = req.body.link
    const destination = req.body.destination
    const platform = req.body.platform || "ANDROID"
    var widthScale = req.body.widthScale

    const titleColor = req.body.titleColor
    const descriptionColor = req.body.descriptionColor
    const buttonTextColor = req.body.buttonTextColor
    const buttonBackgroundColor = req.body.buttonBackgroundColor
    const backgroundColor = req.body.backgroundColor
    const buttonTitle = req.body.buttonTitle

    var imagePath = ''
    if (!name || !link || !action || !destination || !validURL(link) || !buttonTitle)
        return res.status(400).json(generateResponseWithKey(false, 'general.check.input'))

    if (typeof widthScale !== 'undefined') {
        if (isNaN(parseFloat(widthScale))) {
            return res.status(400).json(generateResponseWithKey(false, 'general.check.input'))
        }
    } else {
        widthScale = 1
    }

    if (req.files.icon) {
        console.log('have icons');
        imagePath = req.files.icon[0].path;
    }

    try {
        var banner = await Banner()
        banner.name = name
        banner.platform = platform
        banner.description = desc
        banner.action = action
        banner.link = link
        banner.destination = destination
        banner.buttonTitle = buttonTitle
        banner.resources.icon = imagePath ? imagePath : null
        banner.appearance = {
            titleColor: validHexColor(titleColor) ? titleColor : null,
            descriptionColor: validHexColor(descriptionColor) ? descriptionColor : null,
            buttonTextColor: validHexColor(buttonTextColor) ? buttonTextColor : null,
            buttonBackgroundColor: validHexColor(buttonBackgroundColor) ? buttonBackgroundColor : null,
            backgroundColor: validHexColor(backgroundColor) ? backgroundColor : null,
        }
        banner.widthScale = widthScale
        banner.save()

        var returnObj = {
            isActive: banner.isActive,
            _id: banner._id,
            name: banner.name,
            description: banner.description,
            action: banner.action,
            destination: banner.destination,
            link: banner.link,
            platform:banner.platform,
            buttonTitle: banner.buttonTitle,
            resources: {
                icon: banner.resources.icon ? process.env.PAYMENT_URL + "/" + banner.resources.icon : null,
            },
            widthScale: banner.widthScale,
            appearance: banner.appearance
        }

        setTimeout(() => {
            updateBanners()
            updateBannersOfWeb()
        }, 2000);
        return res.status(200).json(generateResponse(true, { banner: returnObj }))
    } catch (err) {
        console.log(err)
        return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
    }
}

exports.editBanner = async (req, res) => {
    const _id = req.body.id
    const name = req.body.name
    const platform = req.body.platform
    const desc = req.body.description
    const action = req.body.action
    const link = req.body.link
    const destination = req.body.destination
    const isActive = req.body.isActive
    var widthScale = req.body.widthScale

    const titleColor = req.body.titleColor
    const descriptionColor = req.body.descriptionColor
    const buttonTextColor = req.body.buttonTextColor
    const buttonBackgroundColor = req.body.buttonBackgroundColor
    const backgroundColor = req.body.backgroundColor
    const buttonTitle = req.body.buttonTitle

    var imagePath = null

    if (!_id || !isActive)
        return res.status(400).json(generateResponseWithKey(false, 'general.check.input'))



    if (req.files.icon) {
        console.log('have icons');
        imagePath = req.files.icon[0].path;
    }
    try {
        var banner = await Banner.findOne({ _id })
        if (!banner)
            return res.status(404).json(generateResponseWithKey(false, 'service.notfound'))

        if (name)
            banner.name = name
        if (platform)
            banner.platform = platform
        if (desc)
            banner.description = desc
        if (action)
            banner.action = action
        if (destination)
            banner.destination = destination
        if (link)
            banner.link = link
        if (buttonTitle)
            banner.buttonTitle = buttonTitle
        if (imagePath) {
            if (banner.resources.icon) {
                let path = "./" + banner.resources.icon
                fs.unlink(path, function (err) {
                    if (err) {
                        console.error(err);
                    }
                    console.log('File has been Deleted');
                });
            }
            banner.resources.icon = imagePath
        }
        if (typeof widthScale !== 'undefined') {
            if (!isNaN(parseFloat(widthScale))) {
                banner.widthScale = widthScale
            }
        }

        if (validHexColor(titleColor))
            banner.appearance.titleColor = titleColor
        if (validHexColor(descriptionColor))
            banner.appearance.descriptionColor = descriptionColor
        if (validHexColor(buttonTextColor))
            banner.appearance.buttonTextColor = buttonTextColor
        if (validHexColor(buttonBackgroundColor))
            banner.appearance.buttonBackgroundColor = buttonBackgroundColor
        if (validHexColor(backgroundColor))
            banner.appearance.backgroundColor = backgroundColor


        banner.isActive = (isActive === 'true')
        banner.save()

        var returnObj = {
            isActive: banner.isActive,
            _id: banner._id,
            name: banner.name,
            description: banner.description,
            action: banner.action,
            destination: banner.destination,
            link: banner.link,
            platform:banner.platform,
            buttonTitle: banner.buttonTitle,
            resources: {
                icon: banner.resources.icon ? process.env.PAYMENT_URL + "/" + banner.resources.icon : null,
            },
            widthScale: banner.widthScale,
            appearance: banner.appearance
        }

        setTimeout(() => {
            updateBanners()
            updateBannersOfWeb()
        }, 2000);

        return res.status(200).json(generateResponse(true, { banner: returnObj }))
    } catch (err) {
        console.log(err)
        return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
    }
}

exports.getAllAdmin = async (req, res) => {
    try {
        const banners = await Banner.find({})
        banners.map(o => {
            if (o.resources.icon) {
                o.resources.icon = process.env.PAYMENT_URL + '/' + o.resources.icon
            }
        })
        if (!banners)
            banners = []
        return res.status(200).json(generateResponse(true, { banners }))
    } catch (err) {
        console.log(err)
        return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
    }
}

exports.getOneAdmin = async (req, res) => {
    try {
        const banner = (await Banner.aggregate([
            {
                $match: {
                    "_id": ObjectId(req.params.id)
                }
            },
            {
                $lookup: {
                    "from": "reports",
                    "localField": "_id",
                    "foreignField": "bannersReport.banner",
                    "as": "users"
                }
            },
            {
                $lookup: {
                    "from": "users",
                    "localField": "users.userId",
                    "foreignField": "_id",
                    "as": "users"
                }
            }
        ]))[0]
        if (!banner)
            return res.status(404).json(generateResponseWithKey(false, 'service.notfound'))
        if (banner.resources.icon) {
            banner.resources.icon = process.env.PAYMENT_URL + '/' + banner.resources.icon
        }
        return res.status(200).json(generateResponse(true, { banner }))
    } catch (err) {
        console.log(err)
        return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
    }
}

exports.getAll = async (req, res) => {
    try {
        var banners = await redis.getAsyncCache(keys.banners)
        banners = JSON.parse(banners)
        if (!banners)
            banners = []
        banners.reverse();
        return res.status(200).json(generateResponse(true, { banners }))
    } catch (err) {
        console.log(err)
        return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
    }

}

exports.getAllForWeb = async (req, res) => {
    try {
        var banners = await redis.getAsyncCache(keys.webBanners)
        banners = JSON.parse(banners)
        if (!banners)
            banners = []
        banners.reverse();
        return res.status(200).json(generateResponse(true, { banners }))
    } catch (err) {
        console.log(err)
        return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
    }

}

exports.getBannerReport = async (req, res) => {
    try {
        const banners = await Banner.find({})
        var reports = []
        for (const i in banners) {
            var temp = await getTotalViewsOfBanner(banners[i]._id)
            if (temp && temp.length > 0) {
                reports.push({
                    bannerId: temp[0]._id,
                    name: banners[i].name,
                    total: temp[0].total
                })
            }
        }

        return res.status(200).json(generateResponse(true, { reports }))
    } catch (err) {
        console.log(err)
        return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
    }
}

exports.changeIndex = async (req ,res) => {
    try {
        const {id ,index} = req.body;

        const bannersCount = await Banner.countDocuments()
        if(index <= 0 || index > bannersCount || !Number.isInteger(index)) return res.status(400).json(generateResponseWithKey(false, 'index.invalid')) 

        const banner = await Banner.findById(id)
        if(!banner) return res.status(404).json(generateResponseWithKey(false, 'banner.notfound')) 

        banner.index = index;
        await banner.save()

        await updateBanners()
        await updateBannersOfWeb()

        return res.status(200).json(generateResponseWithKey(true, 'index.changed')) 

    } catch (err) {
        console.log(err)
        return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
    }
}

exports.updateBannersCache = async () => {
    await updateBanners()
    await updateBannersOfWeb()
}

const updateBanners = async () => {
    try {
        const banners = await Banner.find({ isActive: true ,platform:"ANDROID"})
            .select('-createdAt -updatedAt');

        banners.map(o => {
            if (o.resources.icon) {
                o.resources.icon = process.env.PAYMENT_URL + '/' + o.resources.icon
            }
        })

        console.log('banners cache updated')
        redis.cacheData(keys.banners, banners)
    } catch (err) {
        console.log(err)
    }

}

const updateBannersOfWeb = async () => {
    try {
        const banners = await Banner.find({ isActive: true ,platform:"WEB" })
            .select('-createdAt -updatedAt');

        banners.map(o => {
            if (o.resources.icon) {
                o.resources.icon = process.env.PAYMENT_URL + '/' + o.resources.icon
            }
        })

        console.log('banners cache updated')
        redis.cacheData(keys.webBanners, banners)
    } catch (err) {
        console.log(err)
    }

}

const getTotalViewsOfBanner = async (bannerId) => {
    let reports = await Report.aggregate([
        { $match: { "bannersReport.banner": ObjectId(bannerId) } },
        { $unwind: "$bannersReport" },
        { $match: { "bannersReport.banner": ObjectId(bannerId) } },
        {
            $group: {
                _id: "$userId",
                bannerId: { $first: "$bannersReport.banner" },
                bannersReport: { "$first": "$bannersReport" },
            }
        },
        { $project: { _id: 0, bannerId: 1, bannersReport: "$bannersReport.count" } },
        { $group: { _id: "$bannerId", total: { $sum: "$bannersReport" } } }
    ])

    return reports
}

