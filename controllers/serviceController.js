const ObjectId = require('mongoose').Types.ObjectId
const redis = require('../src/redisManager')
const keys = require('../src/utils').keys
var fs = require('fs');
const {
    generateResponse,
    generateResponseWithKey
} = require('../models/responseModel')
const Service = require('../models/schemas/service')
const Report = require('../models/schemas/report')
const User = require('../models/schemas/user')

const { validURL } = require('../helpers/helper')

exports.addService = async (req, res) => {
    const name = req.body.name
    const desc = req.body.description
    const info = req.body.info
    const link = req.body.link
    const index = req.body.index
    var imagePath = ''
    if (!name || !link || !validURL(link))
        return res.status(400).json(generateResponseWithKey(false, 'general.check.input'))
    if (req.files.icon) {
        console.log('have icons');
        imagePath = req.files.icon[0].path;
    }

    try {
        var service = await Service()
        service.name = name
        service.description = desc
        service.info = info
        service.link = link
        service.index = index
        service.icon = imagePath ? imagePath : null
        await service.save()

        var returnObj = {
            isActive: service.isActive,
            _id: service._id,
            name: service.name,
            description: service.description,
            info: service.info,
            link: service.link,
            index: service.index,
            icon: (service.icon) ? (process.env.PAYMENT_URL + "/" + service.icon) : null
        }

        setTimeout(() => {
            updateServices()
        }, 2000);

        return res.status(200).json(generateResponse(true, { service: returnObj }))
    } catch (err) {
        console.log(err)
        return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
    }
}

exports.editService = async (req, res) => {
    const _id = req.body.id
    const name = req.body.name
    const desc = req.body.description
    const info = req.body.info
    const link = req.body.link
    const index = req.body.index
    const isActive = req.body.isActive
    var imagePath = null
    console.log(req.body)
    if (!_id || !isActive)
        return res.status(400).json(generateResponseWithKey(false, 'general.check.input'))

    if (req.files.icon) {
        console.log('have icons');
        imagePath = req.files.icon[0].path;
    }
    try {
        var service = await Service.findOne({ _id })
        if (!service)
            return res.status(404).json(generateResponseWithKey(false, 'service.notfound'))

        if (name)
            service.name = name
        if (desc)
            service.description = desc
        if (info)
            service.info = info
        if (link)
            service.link = link
        if (index)
            service.index = index
        if (imagePath) {
            if (service.icon) {
                let path = "./" + service.icon
                fs.unlink(path, function (err) {
                    if (err) {
                        console.error(err);
                    }
                    console.log('File has been Deleted');
                });
            }
            service.icon = imagePath
        }
        service.isActive = (isActive === 'true')
        await service.save()

        var returnObj = {
            isActive: service.isActive,
            _id: service._id,
            name: service.name,
            description: service.description,
            info: service.info,
            link: service.link,
            icon: (service.icon) ? (process.env.PAYMENT_URL + "/" + service.icon) : null
        }

        setTimeout(() => {
            updateServices()
        }, 2000);

        return res.status(200).json(generateResponse(true, { service: returnObj }))
    } catch (err) {
        console.log(err)
        return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
    }
}

exports.getAllAdmin = async (req, res) => {
    try {
        const services = await Service.find({})
        services.map(o => {
            if (o.icon) {
                o.icon = process.env.PAYMENT_URL + '/' + o.icon
            }
        })
        if (!services)
            services = []
        return res.status(200).json(generateResponse(true, { services }))
    } catch (err) {
        console.log(err)
        return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
    }
}
exports.getOneAdmin = async (req, res) => {
    try {
        const service = (await Service.aggregate([
            {
                $match: {
                    "_id": ObjectId(req.params.id)
                }
            },
            {
                $lookup: {
                    "from": "reports",
                    "localField": "_id",
                    "foreignField": "servicesReport.service",
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
        if (!service)
            return res.status(404).json(generateResponseWithKey(false, 'service.notfound'))
        if (service.icon) {
            service.icon = process.env.PAYMENT_URL + '/' + service.icon
        }
        return res.status(200).json(generateResponse(true, { service }))
    } catch (err) {
        console.log(err)
        return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
    }
}


exports.getServiceReport = async (req, res) => {
    try {
        const services = await Service.find({})
        var reports = []
        for (const i in services) {
            console.log(services[i]._id)
            var temp = await getTotalViewsOfService(services[i]._id)
            if (temp && temp.length > 0) {
                reports.push({
                    serviceId: temp[0]._id,
                    name: services[i].name,
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

exports.getAll = async (req, res) => {
    try {
        var services = await redis.getAsyncCache(keys.services)
        services = JSON.parse(services)
        return res.status(200).json(generateResponse(true, { services }))
    } catch (err) {
        console.log(err)
        return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
    }
}

exports.changeIndex = async (req ,res) => {
    try {
        const {id ,index} = req.body;
        const servicesCount = await Service.countDocuments()
        if(index < 0 || index > servicesCount || !Number.isInteger(index)) return res.status(400).json(generateResponseWithKey(false, 'index.invalid')) 

        const service = await Service.findById(id)
        if(!service) return res.status(404).json(generateResponseWithKey(false, 'service.notfound')) 

        service.index = index;
        await service.save()

        await updateServices()
        
        return res.status(200).json(generateResponseWithKey(true, 'index.changed')) 

    } catch (err) {
        console.log(err)
        return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
    }
}

exports.updateServicesCache = async () => {
    await updateServices()
}

const updateServices = async () => {
    try {
        const services = await Service.find({ isActive: true })
            .select('-createdAt -updatedAt');

        services.map(o => {
            if (o.icon) {
                o.icon = process.env.PAYMENT_URL + '/' + o.icon
            }
        })

        console.log('services cache updated')
        redis.cacheData(keys.services, services)
    } catch (err) {
        console.log(err)
    }
}

const getTotalViewsOfService = async (serviceId) => {
    let reports = await Report.aggregate([
        { $match: { "servicesReport.service": ObjectId(serviceId) } },
        { $unwind: "$servicesReport" },
        { $match: { "servicesReport.service": ObjectId(serviceId) } },
        {
            $group: {
                _id: "$userId",
                serviceId: { $first: "$servicesReport.service" },
                servicesReport: { "$first": "$servicesReport" },
            }
        },
        { $project: { _id: 0, serviceId: 1, servicesReport: "$servicesReport.count" } },
        { $group: { _id: "$serviceId", total: { $sum: "$servicesReport" } } }
    ])

    return reports
}

const mappingServiceModel = (service, status) => {
    return {
        isActive: true,
        _id: service._id,
        name: service.name,
        description: service.description,
        info: service.info,
        link: service.link,
        icon: null,
        status: status
    }
}