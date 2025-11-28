const { check, body, param } = require("express-validator");
const language = require("./language/index");
const conditions = require('../configs/secret').alertConditions
const conditionTypes = require('../configs/secret').alertConditionTypes
const alertActions = require('../configs/secret').alertActions
exports.isEmail = [
  check('email').normalizeEmail().isEmail(),
]

exports.signupByPhoneNumberValidator = [
  check("mobileNumber", language('fa', 'mobile-number-required'))
    .isLength({ min: 9, max: 11 })
    .not()
    .isEmpty(),
];

exports.validateCodeValidator = [
  check("code", language('fa', 'code.error'))
    .isLength({ min: 4, max: 5 })
    .not()
    .isEmpty()
    .bail(),

  check("mobileNumber", language('fa', 'phonenumber.required'))
    .isLength({ min: 9, max: 11 })
    .not()
    .isEmpty(),
];

exports.addAlertValidator = [
  check("symbol", language('fa', 'general.check.input'))
    .isString()
    .not()
    .isEmpty(),

  check("startDate", language('fa', 'general.check.input'))
    .isInt({ min: 1610000000000 })
    .not()
    .isEmpty(),

  check("expireDate", language('fa', 'general.check.input'))
    .isInt({ min: (new Date()).getTime() })
    .not()
    .isEmpty(),

  check(["sound", "name", "message"], language('fa', 'general.check.input'))
    .isString(),

  check("conditions.*.type", language('fa', 'general.check.input'))
    .isString()
    .isIn(Object.values(conditionTypes))
    .not()
    .isEmpty(),

  check("conditions.*.value", language('fa', 'general.check.input'))
    .isInt()
    .not()
    .isEmpty(),

  check("conditions", language('fa', 'general.check.input'))
    .isArray({ min: 1, max: 4 }),

  check("conditions.*.condition", language('fa', 'general.check.input'))
    .isString()
    .isIn(Object.values(conditions))
    .not()
    .isEmpty(),

  check("actions", language('fa', 'general.check.input'))
    .isArray()
    .not()
    .isEmpty(),

  check("actions.*", language('fa', 'general.check.input'))
    .isString()
    .isIn(Object.values(alertActions))
    .not()
    .isEmpty(),

  check(["justOnce", "isCrypto"], language('fa', 'general.check.input'))
    .isBoolean()
    .not()
    .isEmpty(),
];

exports.editAlertValidator = [
  check(["id", "symbol"], language('fa', 'general.check.input'))
    .isString()
    .not()
    .isEmpty(),

    check("startDate", language('fa', 'general.check.input'))
    .isInt()
    .isInt({ min: 1610000000000 })
    .not()
    .isEmpty(),

  check("expireDate", language('fa', 'general.check.input'))
    .isInt()
    .isInt({ min: (new Date()).getTime() })
    .not()
    .isEmpty(),

  check(["sound", "name", "message"], language('fa', 'general.check.input'))
    .isString(),

  check("actions", language('fa', 'general.check.input'))
    .isArray()
    .not()
    .isEmpty(),

  check("conditions", language('fa', 'general.check.input'))
    .isArray({ min: 1, max: 4 }),

  check("conditions.*.type", language('fa', 'general.check.input'))
    .isString()
    .isIn(Object.values(conditionTypes))
    .not()
    .isEmpty(),

  check("conditions.*.value", language('fa', 'general.check.input'))
    .isInt()
    .not()
    .isEmpty(),

  check("conditions.*.condition", language('fa', 'general.check.input'))
    .isString()
    .isIn(Object.values(conditions))
    .not()
    .isEmpty(),

  check("actions.*", language('fa', 'general.check.input'))
    .isString()
    .isIn(Object.values(alertActions))
    .not()
    .isEmpty(),

  check(["justOnce", "disable", "isCrypto"], language('fa', 'general.check.input'))
    .isBoolean()
    .not()
    .isEmpty(),
];