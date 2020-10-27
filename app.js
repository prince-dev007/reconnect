global.appurl = "http://localhost:3000";
global.PROJECT_DIR = __dirname;

require("rootpath")();
const cors = require("cors");
const jwt = require("_helpers/jwt");
var createError = require("http-errors");
var express = require("express");
var session = require('express-session');
var xFrameOptions = require('x-frame-options');
const csp = require('express-csp-header');
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var pg = require("pg");
var bodyParser = require('body-parser');
require("./utility/picklistUtility");
require("dotenv").config();
require("./controllers/constant");


/** CRYPTO CONFIG*/
global.cryptoJSON = require('crypto-json');
global.algorithm = 'camellia-128-cbc'
global.encoding = 'hex'
global.encrypt_password = process.env.ENCRYPT_PASSWORD;
/** CRYPTO */


console.log('branch',process.env.DATABASE_URL)
try {
  global.client = new pg.Client(`${process.env.DATABASE_URL}?ssl=true`);
  client.connect();
} catch (e) {
  console.log(`ERROR::: app.js >>> 14 >>> err `, e);
}

var app = express();
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(bodyParser.json({ limit: '20mb' }))

app.use(xFrameOptions());
app.use(csp({
  policies: {
      'default-src': [csp.SELF],
      'script-src': [csp.SELF, csp.INLINE, 'zoxima-cns.herokuapp.com'],
      'style-src': [csp.SELF, 'zoxima-cns.herokuapp.com'],
      'img-src': ['data:', 'zoxima-cns.herokuapp.com'],
      'worker-src': [csp.NONE],
      'block-all-mixed-content': true
  }
}));

app.use(bodyParser.json())

app.use(logger("dev"));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false
  })
);

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'GHFHSGAVNBA6735e673HJGDSHDJH',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(jwt());
require("./router")(app);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render("error");
});
module.exports = app;
