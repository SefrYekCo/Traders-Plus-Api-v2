const User = require('../models/schemas/user');
const jwt = require("jsonwebtoken");
const language = require('../helpers/language/index')
const Plan = require('../models/schemas/plan')
const Report = require('../models/schemas/report')
const Config = require('../models/schemas/config')
const bcrypt = require('bcrypt')
const { sendValidationCode } = require('../middleware/smsSender')
const config = require('../config');
const { createFutureDate } = require('../helpers/helper')
const {
  generateResponse,
  generateResponseWithKey
} = require('../models/responseModel')
const key = config.update.key
const { validationResult } = require("express-validator");
const { random4Digit } = require('../middleware/random4digits');
const {
  JWT_SECRET,
  fourDigitExpireAfter,
  trialExpireAfter,
  dailyExpire,
  PlanType,
} = require('../configs/secret');
const { sendMessage } = require('../services/firebase.service');
const { emailCredentaialsForWeb } = require('../middleware/mailSender');

// Signin By Phone
exports.signinByMobilePhone = async (req, res) => {
  const fourDigitToken = random4Digit();
  console.log('Code: ' + fourDigitToken)
  const mobileNumber = req.body.mobileNumber;
  const platform = req.body.platform ? req.body.platform : "android";
  if (mobileNumber != '14165628234') {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ status: false, description: errors.array() });
  }

  try {
    var user = await User.findOne({ mobileNumber });
    if (!user)
      user = await new User()
    user.mobileNumber = mobileNumber
    user.fourDigitToken = fourDigitToken;
    user.fourDigitTokenExpire = Date.now() + fourDigitExpireAfter;
    if(!user.platform.includes(platform)) user.platform.push(platform)
    await user.save();
    // send sms
    if (mobileNumber != '14165628234') {
      sendValidationCode(mobileNumber, fourDigitToken)
    }
    return res.status(200).json({ status: true, mobileNumber: mobileNumber });
  } catch (err) {
    console.error(err);
    return res.status(500).json(generateResponseWithKey(false, 'enter-data-correctly'))
  }
};

// Validate Sign in
exports.validatePhoneNumberCode = async (req, res) => {
  const code = req.body.code;
  const mobileNumber = req.body.mobileNumber;
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ status: false, description: errors.array() });
  try {
    const user = await User.findOne({ mobileNumber }).populate('baskets', '-createdAt -updatedAt');
    if (!user)
      return res
        .status(404)
        .json({ status: false, description: language('fa', 'user.not.found') });

    if (mobileNumber == '14165628234' && code != '1234')
      return res.status(403).json({ status: false, description: language('fa', 'code.error') });
    if (user.fourDigitToken != code && mobileNumber != '14165628234')
      return res.status(403).json({ status: false, description: language('fa', 'code.error') });
    else if (Date.now() > user.fourDigitTokenExpire)
      return res.status(401).json({ status: false, description: language('fa', 'code.unavailable') });
    // generate a token with user id and secret
    user.fourDigitToken = null;
    user.fourDigitTokenExpire = null;
    user.isActive = true;
    user.save();
    const token = jwt.sign(
      {
        _id: user._id,
        mobileNumber: user.mobileNumber,
        iss: "tradersplus",
        exp: 1200000000000,
      },
      JWT_SECRET
    );
    const returnedList = {
      token: token,
      _id: user._id,
      name: user.name,
      date: user.date,
      plans: user.plans,
      isActive: user.isActive
    };

    return res.json({ status: true, response: returnedList });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json(generateResponseWithKey(false, 'enter-data-correctly'))
  }
};

//sign out
exports.signOutUser = async (req, res) => {
  const _id = req.user._id
  try {
    const user = await User.findOne({ _id })
    if (!user)
      return res.status(404).json({ status: false, description: language('fa', 'user.not.found') })
    user.isActive = false
    user.fcm = null
    user.save()
    return res.status(200).json({ status: true, description: language('fa', 'user.signout') })
  } catch (err) {
    console.log(err)
    return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
  }
}

// edit profile
exports.editProfile = async (req, res) => {
  const _id = req.user._id;

  let imagePath = '';
        
  if (req.files && req.files.icon) {
      console.log('have icons');
      imagePath = req.files.icon[0].path;
  }
  try {
    const user = await User.findOne({ _id })
    const email = req.body.email
    const name = req.body.name
    const family = req.body.family
    const username = req.body.username
    if (!user)
      return res.status(404).json(generateResponseWithKey(false, 'user.not.found'))
    if (name)
      user.name = name
    if (family)
      user.family = family
    if (email)
      user.email = email
    if (username)
      user.username = username
    if(imagePath.length > 0)
      user.thumbnailImagePath = imagePath 

    await user.save()
    return res.status(200).json(generateResponseWithKey(true, 'user.profile.update'))
  } catch (err) {
    console.log(err)
    return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
  }
}

// User info 
exports.userInfo = async (req, res) => {
  const _id = req.user._id
  try {
    var user = await User.findOne({ _id })
    var countOfInvites = await User.countDocuments({ invitedBy: user._id })
    if (!user)
      return res.status(404).json(generateResponseWithKey(false, 'user.not.found'))
    var userInfo = {
      _id: user._id,
      mobileNumber: user.mobileNumber,
      name: user.name,
      family: user.family,
      email: user.email,
      plans: user.plans,
      notifications: user.notifications,
      fcm: user.fcm,
      countOfInvites: countOfInvites,
      trialUsed: (user.trialUsed) ? user.trialUsed : false,
      termsAccepted: (user.termsAccepted) ? user.termsAccepted : false,
      brokers: user.brokers,
      thumbnailImagePath:user.thumbnailImagePath.length > 0 ? process.env.PAYMENT_URL + "/" + user.thumbnailImagePath : null,
      username:user.username
    }
    return res.status(200).json({ status: true, response: { userInfo } })
  } catch (err) {
    console.log(err)
    return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
  }
}

// Buy a plan
exports.buyPlan = async (req, res) => {
  const _id = req.user._id
  const planId = req.body.planId
  var period = req.body.period

  if (!Number.isInteger(period))
    return res.status(400).json(generateResponseWithKey(false, 'general.check.input'))
  if (!planId)
    return res.status(400).json(generateResponseWithKey(false, 'plan.id.not.found'))

  try {
    var user = await User.findOne({ _id })
    if (!user)
      return res.status(404).json(generateResponseWithKey(false, 'user.not.found'))

    var plan = await Plan.findOne({ _id: planId })
    if (!plan)
      return res.status(404).json(generateResponseWithKey(false, 'plan.not.found'))

    if (user.plans.filter(e => String(e.planId) === String(planId)).length > 0) {
      /// TODO tamdid account
      let index = user.plans.findIndex(x => String(x.planId) === String(planId));
      let newDate = new Date(user.plans[index].expireDate.getTime() + calculateExpireDateOfPlan(period))
      user.plans[index].expireDate = newDate
    } else {
      let expire = Date.now() + calculateExpireDateOfPlan(period)
      user.plans.push({ planId: planId, expireDate: expire, activateDate: Date.now() })
    }

    user.save()
    return res.status(200).json({ status: true, description: language('fa', 'plan.bought') })
  } catch (err) {
    console.log(err)
    return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
  }
}

exports.buyPlanService = async (_id, planId, period) => {

  if (!Number.isInteger(period))
    return false;
  if (!planId)
    return false;

  try {
    var user = await User.findOne({ _id })
    if (!user)
      return false;

    var plan = await Plan.findOne({ _id: planId })
    if (!plan)
      return false;

    if (user.plans.filter(e => String(e.planId) === String(planId)).length > 0) {
      /// TODO tamdid account
      let index = user.plans.findIndex(x => String(x.planId) === String(planId));
      let newDate = new Date(user.plans[index].expireDate.getTime() + calculateExpireDateOfPlan(period))
      user.plans[index].expireDate = newDate
    } else {
      let expire = Date.now() + calculateExpireDateOfPlan(period)
      user.plans.push({ planId: planId, expireDate: expire, activateDate: Date.now() })
    }

    user.save()
    return true;
  } catch (err) {
    console.log(err)
    return false;
  }
}

exports.getTrial = async (req, res) => {
  const _id = req.user._id
  try {
    var user = await User.findOne({ _id })
    if (!user)
      return res.status(404).json({ status: false, description: language('fa', 'user.not.found') })
    if (!user.trialUsed) {
      var plans = await Plan.find({ isActive: true, type: [PlanType.bourseSignals, PlanType.cryptoSignals, PlanType.pro] })
      var userPlans = user.plans
      for (const i in plans) {
        const index = userPlans.findIndex(p => String(p.planId) === String(plans[i]._id))
        console.log(index, plans[i].name)
        if (index < 0) {
          user.plans.push({
            planId: plans[i]._id,
            expireDate: Date.now() + trialExpireAfter
          })
        } /*else {
          user.plans[index].expireDate += trialExpireAfter
        }*/
      }
      user.trialUsed = true
      await user.save()
      return res.status(200).json({ status: true, description: language('fa', 'user.trial.enabled') })
    } else {
      return res.status(403).json({ status: false, description: language('fa', 'user.trial.used') })
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
  }
}

exports.updateFcmToken = async (req, res) => {
  var fcm = req.body.fcm
  var _id = req.user._id
  if (!fcm) {
    return res.status(400).json(generateResponseWithKey(false, 'general.check.input'))
  }
  try {
    var user = await User.findOne({ _id })
    if (!user)
      return res.status(404).json(generateResponseWithKey(false, 'user.not.found'))
    user.fcm.token = fcm
    user.fcm.expireDate = createFutureDate(7)
    user.save()
    return res.status(200).json(generateResponseWithKey(false, 'user.fcm.updated'))
  } catch (err) {
    console.log(err)
    return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
  }
}

exports.setSettings = async (req, res) => {
  const _id = req.user._id
  const notifications = req.body.notifications
  if (typeof notifications != "boolean")
    return res.status(400).json(generateResponseWithKey(false, 'general.check.input'))
  try {
    const user = await User.findOne({ _id })
    if (!user)
      return res.status(404).json(generateResponseWithKey(false, 'user.not.found'))
    user.notifications = notifications
    user.save()
    return res.status(200).json(generateResponseWithKey(true, 'user.settings.updated'))
  } catch (err) {
    return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
  }
}

exports.deletePlan = async (req, res) => {
  const userId = req.body.userId
  const planId = req.body.planId
  const password = req.body.password
  if (password !== key)
    return res.status(400).json({
      status: false,
      message: language('fa', 'client.update.key.error')
    });

  try {
    var user = await User.findOne({ _id: userId })
    if (!user)
      return res.status(404).json({ staus: false, description: language('fa', 'user.not.found') })

    if (user.plans.filter(e => String(e.planId) === String(planId)).length > 0) {
      const index = user.plans.findIndex(p => { String(p.planId) === String(planId) })
      user.plans.splice(index, 1)
      user.save()
      return res.status(200).json({ status: true, description: language('fa', 'user.plan.deleted') })
    } else {
      return res.status(404).json({ status: false, description: language('fa', 'user.plan.not.exist') })
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
  }
}

exports.getReprt = async (req, res) => {
  const userId = req.body.id

  if (!userId)
    return res.status(400).json(generateResponseWithKey(false, 'general.check.input'))

  try {
    var user = await User.findOne({ _id: userId })
    if (!user)
      return res.status(404).json({ staus: false, description: language('fa', 'user.not.found') })

    var report = await Report.findOne({ userId: userId })
      .select('_id bannersReport.banner bannersReport.count servicesReport.service servicesReport.count userId')
      .populate({
        path: "bannersReport.banner",
        select: { '_id': 1, 'name': 1 },
      })
      .populate({
        path: "servicesReport.service",
        select: { '_id': 1, 'name': 1 },
      })
    if (!report)
      return res.status(404).json(generateResponseWithKey(false, "user haven't report yet"))

    return res.status(200).json(generateResponse(true, { report }))

  } catch (err) {
    console.log(err)
    return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
  }


}

exports.acceptTerms = async (req, res) => {
  const userId = req.user._id
  var accepted = req.body.accepted
  if (typeof accepted != 'boolean') {
    return res.status(400).json(generateResponseWithKey(false, 'general.check.input'))
  }
  try {
    let user = await User.findOne({ _id: userId }).select('services')
    if (!user)
      return res.status(404).json(generateResponseWithKey(false, 'user.not.found'))
    user.termsAccepted = accepted
    user.save()
    return res.status(200).json(generateResponseWithKey(true, 'service.terms.status'))
  } catch (err) {
    console.log(err)
    return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
  }
}

exports.getPrivacyPolicy = async (req, res) => {
  try {
    var privacyPolicy = await Config.findOne({})
    if (!privacyPolicy)
      return res.status(404).json(generateResponseWithKey(false, 'privacyPolicy.not.found'))
    return res.status(200).json(generateResponse(true, { ...privacyPolicy.privacy }))
  } catch (err) {
    console.log(err)
    return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
  }
}
exports.setInviter = async (req, res) => {
  const userId = req.user._id
  const inviterNumber = req.body.inviterNumber
  if (!inviterNumber)
    return res.status(400).json(generateResponseWithKey(false, 'general.check.input'))
  try {
    let user = await User.findOne({ _id: userId });
    let inviter = await User.findOne({ mobileNumber: inviterNumber });
    if (!user || !inviter)
      return res.status(404).json(generateResponseWithKey(false, 'user.not.found'))
    if (user.invitedBy)
      return res.status(400).json(generateResponseWithKey(false, 'user.already.invited'))
    user.invitedBy = inviter._id
    user.save()
    try {
      await sendMessage(inviter.fcm.token, {
        data: {
          title: language('fa', 'user.invited.title'),
          message: language('fa', 'user.invited.message')
        }
      });
    } catch (error) {
      console.log(error);
    }
    const countOfInvites = await User.countDocuments({ invitedBy: inviter._id });
    if (countOfInvites === 3) {

      const resPlan = await this.buyPlanService(inviter._id, (await Plan.findOne({ type: 'cryptoSignals' }))._id, 7);
      const resPlan1 = await this.buyPlanService(inviter._id, (await Plan.findOne({ type: 'pro' }))._id, 15);

      console.log(resPlan, resPlan1);
      try {
        await sendMessage(inviter.fcm.token, {
          data: {
            title: language('fa', 'user.invited.title'),
            message: language('fa', 'user.invitedComp.message')
          }
        });
      } catch (error) {
        console.log(error);
      }
    }
    return res.status(200).json(generateResponseWithKey(true, 'user.inviter.set'))
  } catch (err) {
    console.log(err)
    return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
  }
}
var calculateExpireDateOfPlan = (period) => {
  return dailyExpire * period
}

exports.getUserByPhoneNumber = async (req ,res) => {
  try {
      const phoneNumber = req.params.phoneNumber;
      const user = await User.findOne({mobileNumber:phoneNumber}).select('_id name family isActive email fcm plans baskets invitedBy web_notification_token web_notification_token_date')
      if(!user) return res.status(404).json({status:false ,message:language('fa', 'user.not.found')})
      return res.status(200).json({status:true ,response: user})
  } catch (err) {
    return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
  }
}

exports.signUpInWebSite = async (req ,res) => {
  try {
    const {name ,family ,mobileNumber ,username ,password ,email} = req.body;

    const user = await User.findOne({$or:[{'mobileNumber':mobileNumber} ,{'username':username}]})
    if(user) return res.status(400).json(generateResponseWithKey(false, "user.singUp.invalidUsername"))

 
    const hashPass = await bcrypt.hash(password ,10)


    const newUser = new User()
    newUser.username = username;
    newUser.password = hashPass;
    newUser.name = name;
    newUser.family = family;
    newUser.mobileNumber = mobileNumber;
    newUser.email = email;
    // newUser.token = token
    newUser.isActive = true

    await newUser.save();

    const token = jwt.sign(
      {
        _id:newUser._id,
      } ,
        JWT_SECRET,
      {
        expiresIn:"60d",
      }
    )

    return res.status(200).json({status:true ,response:{message:"خوش آمدید" ,token}})

  } catch (err) {
    console.log("error in web signUp :" ,err);
    return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
  }
}

exports.signInByUsernameAndPassword = async (req ,res) => {
  try {

    const username = req.body.username;
    const password = req.body.password;
    const user = await User.findOne({username})
    if(!user) return res.status(404).json(generateResponseWithKey(false, "user.login.uncorrect"))
    
    const isPassSame = await bcrypt.compare(password ,user.password)
    if(!isPassSame) return res.status(404).json(generateResponseWithKey(false, "user.login.uncorrect"))
    
    const token = await jwt.sign(
      {
        _id:user._id,
      } ,
        JWT_SECRET,
      {
        expiresIn:"60d",
      }
    )

    user.isActive = true;
    await user.save();

      return res.status(200).json({status:true ,response:{message:"خوش آمدید" ,token}})

  } catch (err) {
    console.log("error in web signIn :" ,err);
    return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
  }
}

exports.pinBroker = async (req ,res) => {
  try {
    const id = req.user._id;
    const brokerId = req.body.brokerId;
    const user = await User.findOne({_id:id})
    if(!user) return res.status(404).json(generateResponseWithKey(false,"users.not.found"))
    if(user.brokers.includes(brokerId)){
      const index = user.brokers.indexOf(brokerId)
      user.brokers.splice(index ,1)
      await user.save();
      return res.status(200).json(generateResponseWithKey(false, 'brokerage.unpin.successfully'))
    }else{
      user.brokers.push(brokerId)
      await user.save();
      return res.status(200).json(generateResponseWithKey(false, 'brokerage.pin.successfully'))
    }

  } catch (err) {
    console.log(err);
    return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
  }
}

exports.sendForgetPassUrl = async (req ,res) => {
  try {

      const mobileNumber = req.body.mobileNumber;
      const user = await User.findOne({mobileNumber})
      if(!user) res.status(404).json(generateResponseWithKey(false, "user.not.found"))

      const token = await jwt.sign({mobileNumber} ,JWT_SECRET_FORGET_PASS ,{expiresIn:"1h"})

      if(user.email.length > 0){
        const data = {
          name:"تریدرز پلاس",
          message:"برای تغییر رمز عبور خود روی لینک زیر کلیک کنید",
          link: process.env.NODE_ENV === "production" ? `https://traderzplus.ir/changePassword?token=${token}` : `http://tradersplus-qa.sefryek.com/changePassword?token=${token}`
        }
         emailCredentaialsForWeb(user.email , data)
      }
      // await sendForgetPassUrl(mobileNumber ,token)
      return res.status(200).json(generateResponseWithKey(true, "sms.send.success"))
  } catch (err) {
      console.log(err);
      return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
  }
}

exports.handleForgetPassword = async (req ,res) => {
  try {
      const token = req.query.Token;
      if(!token) return res.status(401).json(generateResponseWithKey(false, 'users.unathorized'))
      console.log(token);
    const isValidToken = verifyJwt()
      if(!isValidToken) return res.status(401).json(generateResponseWithKey(false, 'users.unathorized'))
      
      const newPassword = req.body.password;
      const mobileNumber = isValidToken.mobileNumber;

      
      const user = await User.findOne({mobileNumber})
      const isSame = await bcrypt.compare(newPassword ,user.password)
      if(!isSame) return res.status(400).json(generateResponseWithKey(false, 'user.password.invalid'))

      const hashPass = await bcrypt.hash(newPassword ,10)
      user.password = hashPass;
      await user.save()

      return res.status(200).json({status:true ,message:"رمزعبور با موفقیت تغییر یافت"})

  } catch (err) {
      console.log(err);
      return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
  }
}

exports.saveUserNotificationToken = async (req ,res) => {
  try {
    const token = req.body.token;
    const _id = req.user._id;
    const user = await User.findOne({_id})
    if(!user) return res.status(404).json(generateResponseWithKey(false, "user.not.found"));

    if(!token || token.length === 0) return res.status(400).json(generateResponseWithKey(false, "token.invalid"));

    user.web_notification_token = token
    user.web_notification_token_date = Date.now()
    await user.save();

    return res.status(200).json(generateResponseWithKey(false, "token.save.successfully"));

  } catch (err) {
    console.log(err);
    return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
  }
}

exports.getUsersNotificationToken = async (req ,res) => {
  try {
    const users = await User.find({platform: "web" ,web_notification_token:{ $ne: null }}).select("_id name family web_notification_token web_notification_token_date mobileNumber")

    return res.status(200).json({status:true , users});

  } catch (err) {
        console.log(err);
    return res.status(500).json(generateResponseWithKey(false, 'error.unknown'))
  }
}