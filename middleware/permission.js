const User = require('../models/schemas/user')
const Plan = require('../models/schemas/plan')
const Channel = require('../models/schemas/channel')
const Alert = require('../models/schemas/alert')
const { PlanType, alertLimitation } = require('../configs/secret')
const language = require('../helpers/language/index')
const redis = require('../src/redisManager')
const keys = require('../src/utils').keys
const { generateResponseWithKey } = require('../models/responseModel')
const config = require('../config');
const key = config.update.key

//  not used yet
exports.checkChannel = async (req, res, next) => {
  const channelId = req.params.channelId
  try {
    let channel = await Channel.findOne({ _id: channelId }).populate('plan')
    if (!channel)
      return res.status(401).json({
        status: false,
        description: language('fa', 'channel.not.found')
      })
    req.channel = channel
    if (channel.plan.type === PlanType.public)
      next()
  } catch (err) {
    console.log(err)
    return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
  }
}

exports.accessToChannel = async (req, res, next) => {
  const channelId = req.params.channelId || req.query.channelId
  if (req.headers.password === key) {
    return await next();
  }
  if (!channelId)
    return res.status(400).json(generateResponseWithKey(false, 'general.check.input'))

  try {
    var channels = await redis.getAsyncCache(keys.channels)
    channels = JSON.parse(channels)
    console.log('chanells count: ', channels.length)
    let channelIndex = channels.findIndex(x => x._id === channelId)
    console.log('index:', channelIndex);
    if (channelIndex === -1)
      return res.status(404).json(generateResponseWithKey(false, 'channel.not.found'))
    let channel = channels[channelIndex]
    if (channel.plan.type === PlanType.public) {
      await next()
    } else {
      const user = await User.findOne({ _id: req.user._id });
      if (!user)
        return res.status(404).json({
          staus: false,
          description: language('fa', 'user.not.found')
        })
      req.user = user
      var index = -1
      for (var i = 0; i < user.plans.length; i++) {
        if (user.plans[i].planId === String(channel.plan._id)) {
          index = i
          break
        }
      }
      if (index == -1) {
        return res.status(403).json({
          staus: false,
          description: language('fa', 'user.access.denied')
        })
      } else if (Date.now() > user.plans[index].expireDate) {
        user.plans.splice(index, 1)
        user.save()
        return res.status(403).json({
          staus: false,
          description: language('fa', 'user.access.denied')
        })
      } else {
        next()
      }
    }

  } catch (err) {
    console.log(err)
    return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
  }

}

exports.accessToBaskets = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.user._id });
    if (!user)
      return res.status(401).json({
        staus: false,
        description: language('fa', 'user.not.found')
      })

    req.user = user
    let plan = await Plan.findOne({ type: PlanType.pro })
    var index = -1
    for (var i = 0; i < user.plans.length; i++) {
      console.log(user.plans[i].planId);
      if (user.plans[i].planId === String(plan._id)) {
        index = i
        break
      }
    }

    if (index == -1) {
      return res.status(403).json({
        staus: false,
        description: language('fa', 'user.access.denied')
      })
    } else if (Date.now() > user.plans[index].expireDate) {
      user.plans.splice(index, 1)
      user.save()
      return res.status(403).json({
        staus: false,
        description: language('fa', 'user.access.denied')
      })
    } else {
      next()
    }

  } catch (err) {
    console.log(err)
    return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
  }
};

exports.accessToCreateAlert = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.user._id });
    if (!user)
      return res.status(401).json(generateResponseWithKey(false, 'user.not.found'))

    req.user = user
    var alertsCount = await Alert.countDocuments({ user: req.user._id, disable: false })
    if (alertsCount < 1)
      return next()
    let plan = await Plan.findOne({ type: PlanType.pro })
    var index = -1
    for (var i = 0; i < user.plans.length; i++) {
      console.log(user.plans[i].planId);
      if (user.plans[i].planId === String(plan._id)) {
        index = i
        break
      }
    }

    if (index == -1) {
      return res.status(403).json(generateResponseWithKey(false, 'user.access.denied'))
    } else if (Date.now() > user.plans[index].expireDate) {
      user.plans.splice(index, 1)
      user.save()
      return res.status(403).json(generateResponseWithKey(false, 'user.access.denied'))
    } else if (alertsCount >= alertLimitation) {
      return res.status(403).json(generateResponseWithKey(false, 'alert.limitation.reached'))
    } else {
      return next()
    }

  } catch (err) {
    console.log(err)
    return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
  }
};

exports.accessToEditAlert = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.user._id });
    if (!user)
      return res.status(401).json(generateResponseWithKey(false, 'user.not.found'))

    req.user = user
    var alertsCount = await Alert.countDocuments({ user: req.user._id, disable: false });
    const alert = await Alert.findOne({ _id: req.body.id });
    console.log(req.body)
    if (alertsCount < 1 || (alertsCount === 1 && (req.body.disable === true || req.body.disable === alert.disable)))
      return next()
    let plan = await Plan.findOne({ type: PlanType.pro })
    var index = -1
    for (var i = 0; i < user.plans.length; i++) {
      console.log(user.plans[i].planId);
      if (user.plans[i].planId === String(plan._id)) {
        index = i
        break
      }
    }

    if (index == -1) {
      return res.status(403).json(generateResponseWithKey(false, 'user.access.denied'))
    } else if (Date.now() > user.plans[index].expireDate) {
      user.plans.splice(index, 1)
      user.save()
      return res.status(403).json(generateResponseWithKey(false, 'user.access.denied'))
    } else if (alertsCount >= alertLimitation) {
      return res.status(403).json(generateResponseWithKey(false, 'alert.limitation.reached'))
    } else {
      return next()
    }

  } catch (err) {
    console.log(err)
    return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
  }
}