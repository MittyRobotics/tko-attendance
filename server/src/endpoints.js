const express = require("express");
const router = express.Router();

router.use(function timeLog(req, res, next) {
  console.log("Request Received - Time: ", new Date(new Date().toUTCString()));
  next();
});

router.get("/backend_test", (req, res) => {
  //Line 9
  res.send({ express: "Backend Connected" }); //Line 10
});

module.exports = router;
