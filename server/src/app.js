require("dotenv").config({ path: "./.env" });

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const logger = require("morgan");

const passport = require("passport");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const attendanceRoutes = require("./routes/attendance");
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

const app = express();
const PORT = process.env.PORT || 4000;
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(logger("dev"));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

app.use(setCache);

app.use(passport.initialize());

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/attendance", attendanceRoutes);

// app.use("/", indexRoutes);

app.get("*", (req, res) => {
  res.status(200).json({
    top_secret: `
    __
    _(\    |@@|
   (__/\__ \--/ __
      \___|----|  |   __
          \ }{ /\ )_ / _\
          /\__/\ \__O (__
         (--/\--)    \__/
         _)(  )(_
        '---''---'
    `,
  });
});

app.listen(PORT, function () {
  console.log(`Node server listening at http://localhost:${PORT} 🚀`);
});

module.exports = app;
