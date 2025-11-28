const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const standardPhoneNumber = require("../../middleware/phoneValidation");
const limiter = require('../../configs/rateLimitter');
const auth = require('../../middleware/auth')
const {
  validatePhoneNumberCode,
  signinByMobilePhone,
  signOutUser,
  editProfile,
  userInfo,
  buyPlan,
  getTrial,
  updateFcmToken,
  deletePlan,
  setSettings,
  getReprt,
  acceptTerms,
  setInviter,
  getPrivacyPolicy,
  pinBroker,
  getUserByPhoneNumber,
  saveUserNotificationToken,
} = require("../../controllers/userController");

const multer = require("multer")
const { storage } = require('../../middleware/multerOptions')
const upload = multer({ storage: storage })


const {
  signupByPhoneNumberValidator,
  validateCodeValidator,
  isEmail,
} = require("../../helpers/validator");


// login or register
router.post(
  "/login",
  limiter.smsLimiter,
  signupByPhoneNumberValidator,
  standardPhoneNumber,
  signinByMobilePhone
);

// validate code
router.post(
  "/validation",
  validateCodeValidator,
  standardPhoneNumber,
  validatePhoneNumberCode
);

//sign out
router.post(
  "/signout",
  auth,
  signOutUser
)

// edit profile
router.post(
  "/edit-profile",
  auth,
  //isEmail,
  upload.fields([{maxCount:1 ,name:"icon"}]),
  editProfile
  )
  
  
  router.get("/user-info", auth, userInfo)
  router.post("/set-inviter", auth, setInviter)
  
  router.post("/get-trial", auth, getTrial)
  
  router.post("/update-fcm", auth, updateFcmToken)
  
  router.post('/set-settings', auth, setSettings)

  router.post('/save-notification-token', auth, saveUserNotificationToken)

  /// ADMIN
  router.post("/delete-plan", deletePlan)
  
  router.post('/qa-buy-plan', auth, buyPlan)

router.post('/get-report', getReprt)
router.get('/privacy', getPrivacyPolicy)
router.post(
  '/accept-terms',
  auth,
  acceptTerms
  )
  
  router.post("/pin-broker", auth, pinBroker)
  
  router.get('/getUserByPhoneNumber/:phoneNumber', auth , getUserByPhoneNumber )
  
  module.exports = router;