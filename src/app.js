const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const path = require("path");
const http = require("http");
const https = require("https");
const fs = require("fs");
const config = require("../config");
const baseUrl = require("./utils").baseUrl;
const {
  isEmptyObject,
  isArray,
  isObject,
  safelyParseJson,
} = require("../helpers/helper");
const { updateAPICaches } = require("../controllers/update.controller");

const PORT = config.web.port;
const PORT_S = config.web.portS;

const app = express();

// ------------------- CORS -------------------
if (process.env.NODE_ENV !== "production") {
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

if (process.env.NODE_ENV === "production") {
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

app.options("/*", (_, res) => res.sendStatus(200));

// ------------------- Body parser -------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "8000kb" }));

// ------------------- Security -------------------
app.disable("x-powered-by");

// ------------------- Logging -------------------
morgan.token("api-content", (req, res) => {
  return JSON.stringify({
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    responseTime: res.responseTime,
  });
});

morgan.token("request-content", (req, res) => {
  let userId = req.user ? req.user._id : null;
  let bodyLog = isEmptyObject(req.body) ? {} : { RequestBody: req.body };
  return JSON.stringify(userId ? { ...bodyLog, userId } : bodyLog);
});

morgan.token("response-content", (req, res) => {
  let userId = req.user ? req.user._id : null;
  let body = safelyParseJson(res._body || "{}");
  let bodyLog = body?.status
    ? { ResponseBody: { status: true } }
    : { ResponseBody: body };
  return JSON.stringify(userId ? { ...bodyLog, userId } : bodyLog);
});

app.use(saveResponseBody);
app.use(saveResponseTime);
app.use(
  morgan(":api-content :request-content \n:response-content \n--------------- ")
);

// ------------------- Static -------------------
app.use("/public", express.static(path.join(__dirname, "../public")));

// ------------------- Routes -------------------
app.use(baseUrl.concat("/alert"), require("../routes/api/alert"));
app.use(baseUrl.concat("/user"), require("../routes/api/user"));
app.use(baseUrl.concat("/user"), require("../routes/api/basket"));
app.use(baseUrl.concat("/plan"), require("../routes/api/plan"));
app.use(baseUrl.concat("/message"), require("../routes/api/message"));
app.use(baseUrl.concat("/category"), require("../routes/api/category"));
app.use(baseUrl.concat("/channel"), require("../routes/api/channel"));
app.use(baseUrl.concat("/service"), require("../routes/api/service"));
app.use(baseUrl.concat("/banner"), require("../routes/api/banner"));
app.use(baseUrl.concat("/"), require("../routes/api/client"));
app.use(baseUrl.concat("/"), require("../routes/config"));
app.use(baseUrl.concat("/admin"), require("../routes/api/admin"));
app.use(baseUrl.concat("/payment"), require("../routes/api/payment"));
app.use(baseUrl.concat("/brokerage"), require("../routes/api/brokerage"));
app.use(baseUrl.concat("/exchanger"), require("../routes/api/exchanger"));
app.use(baseUrl.concat("/popup"), require("../routes/api/popup"));
app.use(baseUrl.concat("/rss"), require("../routes/api/rss"));

// ------------------- Start server -------------------
http.createServer(app).listen(PORT, () => {
  console.log(
    `Started server on => http://0.0.0.0:${PORT} for Process Id ${process.pid}`
  );
});

if (process.env.NODE_ENV === "production") {
  const https_options = {
    key: fs.readFileSync("./crk/pay.digihyper.key"),
    cert: fs.readFileSync("./crk/7dd9e521b99adfd6.pem"),
    ca: [
      fs.readFileSync("./crk/7dd9e521b99adfd6.crt"),
      fs.readFileSync("./crk/gd_bundle-g2-g1.crt"),
    ],
  };

  https.createServer(https_options, app).listen(PORT_S, () => {
    console.log(
      `Started server on => https://0.0.0.0:${PORT_S} for Process Id ${process.pid}`
    );
  });
}

// ------------------- Optional tasks -------------------
setTimeout(() => {
  updateAPICaches();
}, 5000);

require("../tasks");

console.log(`Worker ${process.pid} started`);

// ------------------- Helpers -------------------
function saveResponseBody(req, res, next) {
  let oldWrite = res.write;
  let oldEnd = res.end;
  let chunks = [];
  res.write = function (chunk) {
    chunks.push(chunk);
    return oldWrite.apply(res, arguments);
  };
  res.end = function (chunk) {
    if (chunk && Buffer.isBuffer(chunk)) chunks.push(chunk);
    res._body = Buffer.concat(chunks).toString("utf8");
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

function saveResponseTime(req, res, next) {
  const start = process.hrtime();
  res.on("finish", () => {
    res.responseTime = getDurationInMilliseconds(start).toLocaleString();
  });
  next();
}

module.exports = { app };
