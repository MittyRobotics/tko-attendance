var express = require("express");

const router = express.Router();
const passport = require("passport");

router.get("/google", passport.authenticate("google"));

router.get(
  "/google/redirect",
  passport.authenticate("google", {
    successRedirect: process.env["CLIENT_URL"],
    failureRedirect: "/auth/login/failed",
  })
);

router.get("/login/success", (req, res) => {
  if (req.user) {
    res.json({
      success: true,
      message: "user has successfully authenticated",
      user: req.user,
      cookies: req.cookies,
    });
  }
});

router.get("/login/failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: "user failed to authenticate",
  });
});

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect(process.env["CLIENT_URL"]);
});

module.exports = router;
