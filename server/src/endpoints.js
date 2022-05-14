import moment from 'moment';

const express = require("express");
const router = express.Router();

router.use(function timeLog(req, res, next) {
    
  console.log(req.method, moment(new Date().toUTCString()).format('MMMM Do, h:mm:ss a'));
  next();
});

router.get("/backend_test", (req, res) => {
  //Line 9
  res.send({ express: "Backend Connected" }); //Line 10
});

module.exports = router;
