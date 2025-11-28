const redis = require("redis");
const utils = require("./utils.js");
const REDIS_HOST = process.env.REDIS_HOST || "redis";
const REDIS_PORT = process.env.PORT || 6379;
const client = redis.createClient({
  socket: {
    host: REDIS_HOST,
    port: REDIS_PORT,
  },
});
const util = require("util");

client.get = util.promisify(client.get);

client.on("connect", () => {
  console.log("✓-- " + "Redis client pid=>" + process.pid + " Connected");
});

client.on("error", function () {
  console.log("x-- " + "Redis client pid=>" + process.pid + " error");
});

var cacheData = (key, jsonData) => {
  client.set(key, JSON.stringify(jsonData), (err, reply) => {
    console.log(key, "redis reply: " + reply + "\t" + "redis err: " + err);
  });
};

var getAsyncCache = async (key) => {
  return await client.get(key);
};

var getCachedData = (key, callback) => {
  client.get(key, (err, reply) => {
    if (err != null) {
      console.log("redis err: " + err.message);
      callback(false, err.message);
    } else if (reply == null) {
      callback(false, utils.messages.notAvailable);
    } else {
      callback(true, reply);
    }
  });
};

module.exports = {
  cacheData,
  getCachedData,
  getAsyncCache,
};
