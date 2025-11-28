const config = {};
config.web = {};
config.update = {};
config.web.port =  process.env.PORT || 5000;
config.web.portS =  process.env.PORT || 5001;
config.web.sub_url_v1 = "/api/v1";
config.update.key = "sefryek3914!@#$";

module.exports = config;
