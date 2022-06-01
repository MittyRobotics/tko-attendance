var express = require("express");

const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");

router.get("/google", passport.authenticate("google"));

router.get(
  "/google/redirect",
  passport.authenticate("google", {
    session: false,
    failureRedirect: process.env["CLIENT_URL"],
  }),
  (req, res) => {
    jwt.sign(
      { id: req.user.google_id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
      (err, token) => {
        if (err) {
          return res.json({
            token: null,
          });
        }
        res.cookie(
          "token",
          token,
          process.env["CLIENT_URL"].includes("localhost")
            ? {
                maxAge: 24 * 60 * 60 * 100,
                httpOnly: true,
              }
            : {
                maxAge: 24 * 60 * 60 * 100,
                httpOnly: true,
                sameSite: "none",
                secure: true,
              }
        );
        res.redirect(303, process.env["CLIENT_URL"]);
      }
    );
  }
);

router.get(
  "/login/success",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.status(200).json({
      user: req.user,
    });
  }
);

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect(process.env["CLIENT_URL"]);
});

module.exports = router;
