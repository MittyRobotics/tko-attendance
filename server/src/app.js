const express = require("express");
const session = require("express-session");
let RedisStore = require("connect-redis")(session);
const { createClient } = require("redis");
require("dotenv").config({ path: "./.env" });
const cors = require("cors");
const helmet = require("helmet");
const logger = require("morgan");

const passport = require("passport");
const authRoutes = require("./routes/auth");
const indexRoutes = require("./routes/tables");
const cookieParser = require("cookie-parser");
const passportSetup = require("./passport-setup");

let setCache = function (req, res, next) {
  if (req.method == "GET") {
    res.set("Cache-control", `no-cache`);
  } else {
    res.set("Cache-control", `no-store`);
  }
  next();
};

let redis_url = process.env.REDIS_URL || "redis://localhost:6379";
let redisClient = createClient({
  legacyMode: true,
  url: redis_url,
});
redisClient.connect().catch(console.error);

redisClient.on("connect", function () {
  console.log("Connected to Redis");
});

redisClient.on("disconnect", function () {
  console.log("Disconnected from Redis");
});

const app = express();
const PORT = process.env.PORT || 4000;
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(logger("dev"));

app.use(helmet());

app.use(
  cors({
    origin: process.env["CLIENT_URL"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    // allowedHeaders: [
    //   "Origin",
    //   "Content-Type",
    //   "Authorization",
    //   "X-Requested-With",
    //   "X-HTTP-Method-Override",
    //   "Accept",
    //   "Access-Control-Allow-Origin",
    //   "Access-Control-Allow-Credentials",
    // ],
    credentials: true,
  })
);
// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Credentials", true);
//   res.header("Access-Control-Allow-Origin", process.env["CLIENT_URL"]);
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-HTTP-Method-Override"
//   );
//   res.header(
//     "Access-Control-Allow-Methods",
//     "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS"
//   );
//   next();
// });

app.use(
  session({
    store: new RedisStore({ client: redisClient, ttl: 86400 }),
    secret: process.env["SESSION_SECRET"],
    resave: false,
    saveUninitialized: false,
    rolling: true,
    unset: "destroy",
    cookie: process.env["CLIENT_URL"].includes("localhost")
      ? {
          maxAge: 24 * 60 * 60 * 100,
          domain: process.env["CLIENT_URL"],
        }
      : {
          maxAge: 24 * 60 * 60 * 100,
          secure: true,
          sameSite: "none",
          domain: process.env["CLIENT_URL"],
        },
  })
);

app.use(setCache);

app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoutes);
app.use("/", indexRoutes);

const authCheck = (req, res, next) => {
  if (!req.user) {
    res.status(401).json({
      authenticated: false,
      message: "user has not been authenticated",
    });
  } else {
    next();
  }
};

app.get("/", authCheck, (req, res) => {
  res.status(200).json({
    authenticated: true,
    message: "user successfully authenticated",
    user: req.user,
    cookies: req.cookies,
  });
});

app.listen(PORT, function () {
  console.log(`Node server listening at http://localhost:${PORT} 🚀`);
});

module.exports = app;
