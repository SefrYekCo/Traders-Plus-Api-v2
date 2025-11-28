const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const path = require("path");
const cluster = require("cluster");
const http = require("http");
const https = require("https");
const config = require("../config");
const baseUrl = require("./utils").baseUrl;
var fs = require("fs");
const PORT = config.web.port;
const PORT_S = config.web.portS;
const {
  isEmptyObject,
  isArray,
  isObject,
  safelyParseJson,
} = require("../helpers/helper");
const { body } = require("express-validator");
const { use } = require("../routes/config");
const { updateAPICaches } = require("../controllers/update.controller");

const setupServer = () => {
  if (cluster.isMaster) {
    let numWorkers = require("os").cpus().length;

    console.log("Master cluster setting up " + numWorkers + " workers...");

    for (let i = 0; i < numWorkers; i++) {
      if (i === 0) {
        // Run tasks
        setTimeout(() => {
          updateAPICaches();
        }, 5000);

        require("../tasks");
      }
      cluster.fork();
    }

    cluster.on("online", function (worker) {
      console.log("Worker " + worker.process.pid + " is online");
    });

    cluster.on("exit", function (worker, code, signal) {
      console.log(
        "Worker " +
          worker.process.pid +
          " died with code: " +
          code +
          ", and signal: " +
          signal
      );
      console.log("Starting a new worker");
      cluster.fork();
    });
  } else {
    const app = express();
    if (process.env.NODE_ENV == "production") {
      var https_options = {
        key: fs.readFileSync("./crk/pay.digihyper.key"),
        cert: fs.readFileSync("./crk/7dd9e521b99adfd6.pem"),
        ca: [
          fs.readFileSync("./crk/7dd9e521b99adfd6.crt"),
          fs.readFileSync("./crk/gd_bundle-g2-g1.crt"),
        ],
      };
    }

    if (process.env.NODE_ENV != "production") {
      app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", `*`);
        res.header(
          "Access-Control-Allow-Methods",
          "GET, POST, PATCH, PUT, DELETE, OPTIONS"
        );
        res.header(
          "Access-Control-Allow-Headers",
          "Content-Type, Accept, Authorization, Password, Token"
        );
        res.header("Access-Control-Allow-Credentials", "true");
        res.header("Cache-Control", "no-cache, no-store, must-revalidate");
        next();
      });
    }

    if (process.env.NODE_ENV == "production") {
      app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header(
          "Access-Control-Allow-Methods",
          "GET, POST, PATCH, PUT, DELETE, OPTIONS"
        );
        res.header(
          "Access-Control-Allow-Headers",
          "Content-Type, Accept, Authorization, Password, Token"
        );
        res.header("Access-Control-Allow-Credentials", "true");
        res.header("Cache-Control", "no-cache, no-store, must-revalidate");
        next();
      });
    }

    app.options("/*", (_, res) => {
      res.sendStatus(200);
    });
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use(
      bodyParser.json({
        limit: "8000kb",
      })
    );
    app.disable("x-powered-by");
    morgan.token("api-content", (req, res) => {
      const bodyLog = {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        responseTime: res.responseTime,
      };
      return JSON.stringify(bodyLog);
    });
    morgan.token("request-content", (req, res) => {
      var userId = null;
      if (req.user) {
        userId = req.user._id;
      }
      var bodyLog = null;
      if (req.body && !isEmptyObject(req.body)) {
        bodyLog = { RequestBody: req.body };
      } else if (req.params && !isEmptyObject(req.params)) {
        bodyLog = { RequestParams: req.params };
      } else if (req.query && !isEmptyObject(req.query)) {
        bodyLog = { RequestQuery: req.query };
      } else {
        bodyLog = { RequestQuery: {} };
      }
      if (!userId) return "\n" + JSON.stringify({ ...bodyLog });
      else return "\n" + JSON.stringify({ ...bodyLog, ...{ userId: userId } });
    });

    morgan.token("response-content", (req, res) => {
      var userId = null;
      var bodyLog = null;
      if (req.user) {
        userId = req.user._id;
      }
      var body = safelyParseJson(res._body ? res._body : "{}");
      if (!body) {
        return JSON.stringify({});
      }
      if (!body.status) {
        bodyLog = { ResponseBody: body };
      } else if (!body.response) {
        bodyLog = { ResponseBody: body };
      } else {
        const keys = Object.keys(body.response);
        for (const i in keys) {
          if (isObject(body.response[keys[i]])) {
            bodyLog = {
              ResponseBody: { status: true, response: body.response },
            };
          } else if (isArray(body.response[keys[i]])) {
            bodyLog = {
              ResponseBody: {
                status: true,
                count: body.response[keys[i]].length,
              },
            };
          } else {
            bodyLog = { ResponseBody: { status: true } };
          }
        }
      }
      if (!userId) return JSON.stringify({ ...bodyLog });
      else return JSON.stringify({ ...bodyLog, ...{ userId: userId } });
    });

    app.use(saveResponseBody);
    app.use(saveResponseTime);
    app.use(
      morgan(
        ":api-content :request-content \n:response-content \n--------------- "
      )
    );
    app.use("/public", express.static(path.join(__dirname, "../public")));

    // Routes to Alert
    app.use(baseUrl.concat("/alert"), require("../routes/api/alert"));
    // Routes to User
    app.use(baseUrl.concat("/user"), require("../routes/api/user"));
    // Routes to Basket
    app.use(baseUrl.concat("/user"), require("../routes/api/basket"));
    // Routes to plan
    app.use(baseUrl.concat("/plan"), require("../routes/api/plan"));
    // Routes to message
    app.use(baseUrl.concat("/message"), require("../routes/api/message"));
    // Routes to category
    app.use(baseUrl.concat("/category"), require("../routes/api/category"));
    // Routes to channel
    app.use(baseUrl.concat("/channel"), require("../routes/api/channel"));
    // Routes to service
    app.use(baseUrl.concat("/service"), require("../routes/api/service"));
    // Routes to Banner
    app.use(baseUrl.concat("/banner"), require("../routes/api/banner"));
    // Routes to client
    app.use(baseUrl.concat("/"), require("../routes/api/client"));
    // Config route
    app.use(baseUrl.concat("/"), require("../routes/config"));
    // Admin route
    app.use(baseUrl.concat("/admin"), require("../routes/api/admin"));
    // Payment
    app.use(baseUrl.concat("/payment"), require("../routes/api/payment"));
    // brokerage
    app.use(baseUrl.concat("/brokerage"), require("../routes/api/brokerage"));
    // exchanger
    app.use(baseUrl.concat("/exchanger"), require("../routes/api/exchanger"));
    // popup
    app.use(baseUrl.concat("/popup"), require("../routes/api/popup"));
    // rss
    app.use(baseUrl.concat("/rss"), require("../routes/api/rss"));

    http.createServer(app).listen(PORT, () => {
      console.log(
        `Started server on => http://0.0.0.0:${PORT} for Process Id ${process.pid}`
      );
    });
    if (process.env.NODE_ENV == "production") {
      https.createServer(https_options, app).listen(PORT_S, () => {
        console.log(
          `Started server on => https://0.0.0.0:${PORT_S} for Process Id ${process.pid}`
        );
      });
    }

    console.log(`Worker ${process.pid} started`);
  }
};

module.exports = {
  setupServer,
};

function saveResponseBody(req, res, next) {
  var oldWrite = res.write;
  var oldEnd = res.end;
  var chunks = [];
  res.write = function (chunk) {
    chunks.push(chunk);
    return oldWrite.apply(res, arguments);
  };
  res.end = function (chunk) {
    if (chunk && Buffer.isBuffer(chunk)) chunks.push(chunk);
    var body = Buffer.concat(chunks).toString("utf8");
    res._body = body;
    oldEnd.apply(res, arguments);
  };
  next();
}

const getDurationInMilliseconds = (start) => {
  const NS_PER_SEC = 1e9;
  const NS_TO_MS = 1e6;
  const diff = process.hrtime(start);

  return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
};

const saveResponseTime = (req, res, next) => {
  const start = process.hrtime();
  res.on("finish", () => {
    const durationInMilliseconds = getDurationInMilliseconds(start);
    res.responseTime = durationInMilliseconds.toLocaleString();
  });
  next();
};
