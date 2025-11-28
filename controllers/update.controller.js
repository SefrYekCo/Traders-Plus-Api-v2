const Banner = require('../models/schemas/banner')
const Service = require('../models/schemas/service')
const Report = require('../models/schemas/report')
const User = require('../models/schemas/user')
const {
    generateResponse,
    generateResponseWithKey
} = require('../models/responseModel')

const { updateMessages } = require('../controllers/messageController')
const { updateChannels } = require('../controllers/channelController')
const { updateServicesCache } = require('../controllers/serviceController')
const { updateBannersCache } = require('../controllers/bannerController')
const { updateCheckVersion } = require('../controllers/clientController')

exports.bannerReport = async (req, res) => {
    const userId = req.user._id
    const bannerId = req.body.id

    if (!bannerId)
        return res.status(400).json(generateResponseWithKey(false, 'general.check.input'))

    try {
        let user = await User.findOne({ _id: userId })
        if (!user)
            return res.status(404).json(generateResponseWithKey(false, 'user.not.found'))
        let banner = await Banner.findOne({ _id: bannerId })
        if (!banner)
            return res.status(404).json(generateResponseWithKey(false, 'banner.notfound'))

        let report = await Report.findOne({ userId: userId })
        if (!report) {
            report = await new Report()
            report.userId = userId
            report.bannersReport.push({ banner: bannerId, recordedDates: [Date.now()], count: 1 })
        } else {
            if (report.bannersReport.filter(e => String(e.banner) === String(bannerId)).length > 0) {
                let index = report.bannersReport.findIndex(x => String(x.banner) === String(bannerId))
                report.bannersReport[index].count += 1
                report.bannersReport[index].recordedDates.push(Date.now())
            } else {
                report.bannersReport.push({ banner: bannerId, recordedDates: [Date.now()], count: 1 })
            }
        }
        report.save()
        return res.status(200).json(generateResponseWithKey(true, 'report added successfully'))
    } catch (err) {
        console.log(err)
        return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
    }
}

exports.serviceReport = async (req, res) => {
    const userId = req.user._id
    const serviceId = req.body.id

    if (!serviceId)
        return res.status(400).json(generateResponseWithKey(false, 'general.check.input'))

    try {
        let user = await User.findOne({ _id: userId })
        if (!user)
            return res.status(404).json(generateResponseWithKey(false, 'user.not.found'))
        let service = await Service.findOne({ _id: serviceId })
        if (!service)
            return res.status(404).json(generateResponseWithKey(false, 'service.notfound'))

        let report = await Report.findOne({ userId: userId })
        if (!report) {
            report = await new Report()
            report.userId = userId
            report.servicesReport.push({ service: serviceId, recordedDates: [Date.now()], count: 1 })
        } else {
            if (report.servicesReport.filter(e => String(e.service) === String(serviceId)).length > 0) {
                let index = report.servicesReport.findIndex(x => String(x.service) === String(serviceId))
                report.servicesReport[index].count += 1
                report.bannersReport[index].recordedDates.push(Date.now())
            } else {
                report.servicesReport.push({ service: serviceId, recordedDates: [Date.now()], count: 1 })
            }
        }
        report.save()
        return res.status(200).json(generateResponseWithKey(true, 'report added successfully'))
    } catch (err) {
        console.log(err)
        return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
    }
}

exports.updateAPICaches = async () => {

    await updateCheckVersion()
    await updateBannersCache()
    await updateServicesCache()
    await updateMessages()
    await updateChannels()

}