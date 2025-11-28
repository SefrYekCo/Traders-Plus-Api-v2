const language = require('../helpers/language/index');
const Channel = require('../models/schemas/channel')
const Category = require('../models/schemas/chatroomCategory')// needs for populate in get channels
const Plan = require('../models/schemas/plan')

const User = require('../models/schemas/user')
const { getUrl } = require('../helpers/helper')
const redis = require('../src/redisManager')
const keys = require('../src/utils').keys
const response = require('../models/responseModel');
const { generateResponse, generateResponseWithKey } = response
const config = require('../config');
const key = config.update.key

exports.muteChannel = async (req, res) => {
  const muted = req.body.mute
  const channelId = req.body.channelId

  if (!channelId || typeof muted != 'boolean')
    return res.status(400).json(generateResponseWithKey(false, 'general.check.input'))
  try {
    var user = await User.findOne({ _id: req.user._id })
    if (!user)
      return res.status(404).json(generateResponseWithKey(false, 'user.not.found'))
    var channel = await Channel.findOne({ _id: channelId })
    if (!channel)
      return res.status(404).json(generateResponseWithKey(false, 'channel.not.found'))
    if ((await Plan.findOne({ _id: channel.plan })).type !== "public" && !(user.plans.map(x => String(x.planId)).includes(String(channel.plan))))
      return res.status(403).json(generateResponseWithKey(false, 'user.access.denied'))
    if (muted === true) {
      if (!user.mutedChannels.includes(channel._id)) {
        user.mutedChannels.push(channel._id)
      }
    } else {
      if (user.mutedChannels.includes(channel._id)) {
        let index = user.mutedChannels.findIndex(o => String(o) === String(channel._id))
        user.mutedChannels.splice(index, 1)
      }
    }

    user.save()
    return res.status(200).json(generateResponse(true, { id: channel._id, muted: muted }))
  } catch (err) {
    console.log(err);
    return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
  }
}

exports.addChannel = async (req, res) => {
  var imagePath = ''
  const name = req.body.name
  const password = req.body.password
  if (password !== key)
    return res.status(400).json({
      status: false,
      message: language('fa', 'client.update.key.error')
    });
  if (req.files.icon) {
    console.log('have icons');
    imagePath = req.files.icon[0].path;
  }
  if (!name)
    return res.status(400).json({ status: false, description: language('fa', 'error.name.notfound') })
  try {
    const channel = await new Channel({
      name: name,
      bio: req.body.bio,
      icon: imagePath ? imagePath : null,
      category: req.body.categoryId,
      plan: req.body.planId
      /// TODO add channel type id
    })
    console.log(channel);
    channel.save()
    setTimeout(() => {
      updateChannelList()
    }, 2000);

    return res.status(200).json({ status: true, description: language('fa', 'channel.created') })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ status: false, description: language('fa', 'error.unknown') })
  }
}

exports.editChannel = async (req, res) => {
  const _id = req.body.id
  const password = req.body.password
  if (password !== key)
    return res.status(400).json({
      status: false,
      message: language('fa', 'client.update.key.error')
    });
  //const imagePath = req.files.icon[0].path;
  try {
    let channel = await Channel.findOne({ _id })
    const name = req.body.name.trim()
    const categoryId = req.body.categoryId
    const planId = req.body.planId
    const bio = req.body.bio.trim()
    if (!channel)
      return res.status(404).json({ status: false, description: language('fa', 'channel.not.found') })

    if (name)
      channel.name = name
    if (bio)
      channel.bio = bio
    if (categoryId)
      channel.category = categoryId.trim()
    if (planId)
      channel.plan = planId.trim()
    // if(imagePath) {
    //   /// TODO delete last image
    //   // if (channel.icon) {

    //   // }
    //   channel.icon = imagePath
    // }
    channel.save()
    setTimeout(() => {
      updateChannelList()
    }, 2000);
    return res.status(200).json({ status: true, description: language('fa', 'user.profile.update') })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ status: false, description: language('fa', 'error.unknown') })
  }
}

exports.getChannels = async (req, res) => {
  var responseTemp = null
  var _id = null
  if (req.user && req.user._id)
    _id = req.user._id
  try {
    var user = null
    if (_id)
      user = await User.findOne({ _id }).select('mutedChannels');

    var channels = await redis.getAsyncCache(keys.channels)
    channels = JSON.parse(channels)
    channels.map(channel => {
      if (user && user.mutedChannels.includes(channel._id)) {
        channel.muted = true
      } else {
        channel.muted = false
      }
    })
    responseTemp = response.generateChannels(channels)
    console.log(`{responseTitle:\"channels\",responseCount:"${responseTemp.response.channels.length}"}`)
    return res.status(200).json(responseTemp)
  } catch (err) {
    console.log(err.message)
    responseTemp = response.generateError(err.message)
    console.log(`{responseTitle:\"channels\",response:${responseTemp.description}}`)
    return res.status(500).json(responseTemp)
  }
}

exports.deactiveChannel = async (req, res) => {
  const _id = req.body.id
  const isActive = req.body.isActive
  const password = req.body.password
  if (typeof isActive != "boolean" || !_id) {
    return res.status(400).json({ status: false, description: language('fa', 'general.check.input') })
  }

  if (password !== key)
    return res.status(400).json({
      status: false,
      message: language('fa', 'client.update.key.error')
    });
  try {
    const channel = await Channel.findOne({ _id })
    if (!channel)
      return res.status(404).json({ status: false, description: language('fa', 'channel.not.found') })
    channel.isActive = isActive
    channel.save()
    setTimeout(() => {
      updateChannelList()
    }, 2000);
    return res.status(200).json({
      status: true,
      description: language('fa', isActive ? "channel.isactive.true" : 'channel.isactive.false')
    })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ status: false, description: language('fa', 'error.unknown') })
  }
}

exports.changeIndex = async (req ,res) => {
  try {
      const {id ,index} = req.body;
      const channelCount = await Channel.countDocuments()
      if(index <= 0 || index > channelCount || !Number.isInteger(index)) return res.status(400).json(generateResponseWithKey(false, 'index.invalid')) 

      const channel = await Channel.findById(id)
      if(!channel) return res.status(404).json(generateResponseWithKey(false, 'channel.not.found')) 

      channel.index = index;
      await channel.save()

      await updateChannelList()
      return res.status(200).json(generateResponseWithKey(true, 'index.changed')) 

  } catch (err) {
      console.log(err)
      return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
  }
}

// update cache channels

exports.updateChannels = async () => {
  await updateChannelList()
}

const updateChannelList = async () => {
  try {
    const channels = await Channel.find({ isActive: true })
      .populate('category', '-isActive -createdAt -updatedAt')
      .populate('plan', 'name _id type')
      .select('-createdAt -updatedAt');

    channels.map(o => {
      if (o.icon) {
        o.icon = process.env.PAYMENT_URL + '/' + o.icon
      }
    })
    console.log('channels list cache updated')
    redis.cacheData(keys.channels, channels)
  } catch (err) {
    console.log(err)
  }
}

exports.getChannelsForAdmin = async (req ,res) => {
  try {
    const channels = await Channel.find().populate('plan', 'name _id type').populate('category', '-isActive -createdAt -updatedAt')
    if(channels.length == 0){
      return res.status(404).json({ status: false, description: language('fa', 'channel.not.found') })
    }
    return res.status(200).json({status:true ,response:channels})
  } catch (err) {
    return res.status(500).json({ status: false, description: language('fa', 'error.unknown') })
  }
}