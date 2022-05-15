import express from "express";

const app = express();

require("dotenv").config({ path: "./.env" });
const PORT = process.env.PORT || 4000;

const cookieSession = require("cookie-session");
const cors = require("cors");
const passport = require("passport");
const authRoutes = require("./routes/auth");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const passportSetup = require("./passport-setup");
const logger = require("morgan");

app.use(logger("dev"));

app.use(
  cookieSession({
    name: "session",
    keys: [process.env["SESSION_SECRET"]],
    maxAge: 24 * 60 * 60 * 100,
  })
);

app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: process.env["CLIENT_URL"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

app.use("/auth", authRoutes);

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
  console.log(`Server listening at http://localhost:${PORT} 🚀`);
});
