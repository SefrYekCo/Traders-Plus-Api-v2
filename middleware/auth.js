
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../configs/secret");
const language = require('../helpers/language/index');
const os = require('os');
module.exports = async (req, res, next) => {
  const token = req.header("token");
  if (!token)
    return res.status(401).json({ message: language('fa','token.invalid') });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    await next();
  } catch (err) {
    res.status(401).json({ message: language('fa','token.invalid') });
  }
};