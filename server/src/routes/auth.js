var express = require("express");

const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");

router.post(
  "/google/one-tap/callback",
  passport.authenticate("google-one-tap", {
    session: false,
    failureRedirect: process.env["CLIENT_URL"],
  }),
  async (req, res) => {
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
        res.status(200).json({
          token,
        });
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

module.exports = router;
