var express = require("express");
import supabase from "../supabase-setup";
const passport = require("passport");
import moment from "moment";
import { roundToTwo, calculateTotalHours } from "./helper";

const router = express.Router();

// mounted at /attendance/

// get attendance records by user id
router.get(
  "/user/:user_id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (!req.user.admin) {
      res.status(401).json({
        message: "Error: not admin",
        success: false,
      });
      return;
    }

    const { user_id } = req.params;

    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .match({ user_id: user_id })
      .order("action_logged_at", { ascending: true });

    if (error) {
      res.status(500).json({
        message: "Error: " + error.message,
        success: false,
      });
      return;
    }

    let userData = [];

    for (let i = 0; i < data.length; i++) {
      let day = data[i].action_logged_at.split("T")[0];
      let index = userData.findIndex((x) => x.day === day);

      if (index === -1 && data[i].action === "Signed In") {
        userData.push({
          day: day,
          hours: 0,
          lastAction: "Signed In",
          id: data[i].id,
          lastActionTimeStamp: data[i].action_logged_at,
        });
      } else {
        if (data[i].action === "Signed Out") {
          var startTime = moment(userData[index].lastActionTimeStamp);
          var endTime = moment(data[i].action_logged_at);
          var duration = endTime.diff(startTime, "minutes");
          userData[index].hours += duration / 60;
          userData[index].lastAction = data[i].action;
          userData[index].lastActionTimeStamp = data[i].action_logged_at;
        } else if (data[i].action === "Signed In") {
          userData[index].lastAction = data[i].action;
          userData[index].lastActionTimeStamp = data[i].action_logged_at;
        }
      }
    }

    // round all hour fields to two decimal places
    for (let i = 0; i < userData.length; i++) {
      userData[i].hours = roundToTwo(userData[i].hours);
    }

    res.status(200).json({
      data: userData,
      message: "Success",
      success: true,
    });
  }
);

// get today's attendance by user id
router.get("/user/:id/today", async (req, res) => {

})

// get attendance records by date
router.get(
  "/date/:date",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (!req.user.admin) {
      res.status(401).json({
        message: "Error: not admin",
        success: false,
      });
      return;
    }

    const { date } = req.params;

    const { data, error } = await supabase.rpc(`timestamp_text_table`, {
      datevalue: date,
    });

    if (error) {
      res.status(500).json({
        message: "Error: " + error.message,
        success: false,
      });
      return;
    }

    let userData = [];

    for (let i = 0; i < data.length; i++) {
      let index = userData.findIndex((x) => x.user_id === data[i].user_id);
      if (index === -1 && data[i].action === "Signed In") {
        userData.push({
          user_id: data[i].user_id,
          name: data[i].name,
          hours: 0,
          lastAction: "Signed In",
          lastActionTimeStamp: data[i].action_logged_at,
        });
      } else {
        if (data[i].action === "Signed Out") {
          var startTime = moment(userData[index].lastActionTimeStamp);
          var endTime = moment(data[i].action_logged_at);
          var duration = endTime.diff(startTime, "minutes");
          userData[index].hours += duration / 60;
          userData[index].lastAction = data[i].action;
          userData[index].lastActionTimeStamp = data[i].action_logged_at;
        } else if (data[i].action === "Signed In") {
          userData[index].lastAction = data[i].action;
          userData[index].lastActionTimeStamp = data[i].action_logged_at;
        }
      }
    }

    for (let i = 0; i < userData.length; i++) {
      userData[i].hours = roundToTwo(userData[i].hours);
    }

    res.status(200).json({
      data: userData,
      message: "Success",
      success: true,
    });
  }
);

// get all attendance requests
router.get(
  "/requests",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (!req.user.admin) {
      res.status(401).json({
        message: "Error: not admin",
        success: false,
      });
      return;
    }

    const { data, error } = await supabase
      .from("users")
      .select("id, name, department, requested_action")
      .not("requested_action", "eq", "none")
      .order("id", { ascending: true });

    if (error) {
      res.status(500).json({
        message: "Error: retrieving requests data",
        success: false,
      });
      return;
    }

    let signin = [];
    let signout = [];

    for (let i = 0; i < data.length; i++) {
      if (data[i].requested_action.includes("SignIn")) {
        signin.push(data[i]);
      } else {
        signout.push(data[i]);
      }
    }

    let finalData = {
      signinrequests: signin,
      signoutrequests: signout,
    };

    res.status(200).json({
      requests: finalData,
      message: "Success",
      success: true,
    });
  }
);

// update attendance by user id
router.post(
  "/update/user/:user_id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { user_id } = req.params;

    if (!req.user.admin) {
      res.status(401).json({
        message: "Error: Not Admin",
        success: false,
      });
      return;
    }

    let updateBody = {};
    updateBody.action = req.body.action;
    updateBody.user_id = user_id;
    updateBody.name = req.body.name;

    if (req.body.timestamp) {
      updateBody.action_logged_at = req.body.timestamp;
    }

    const { data, error } = await supabase
      .from("attendance")
      .insert(updateBody);

    if (error) {
      res.status(500).json({
        message: "Error: " + error.message,
        success: false,
      });
      return;
    }

    // if timestamp, then request originated from student attendance signin/out request page
    if (req.body.timestamp) {
      let updateUser = {
        requested_action: "none",
        present: updateBody.action === "Signed In" ? true : false,
      };

      if (updateBody.action === "Signed Out") {
        updateUser.total_hours = await calculateTotalHours(
          user_id,
          req.body.timestamp
        );
      }

      const { users, err } = await supabase
        .from("users")
        .update(updateUser)
        .match({ id: user_id });

      if (err) {
        res.status(500).json({
          message: "Error: " + err.message,
          success: false,
        });
        return;
      }
    }

    res.status(200).json({
      message: "Success",
      success: true,
    });
  }
);

// update all attendance records
router.post(
  "/update_requested",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let actionCheck = req.body.type === "Signed In" ? "SignIn" : "SignOut";
    let presentCheck = req.body.type === "Signed In" ? true : false;

    const { data, error } = await supabase
      .from("users")
      .update({ requested_action: "none", present: presentCheck })
      .select("present, requested_action")
      .textSearch("requested_action", actionCheck, {
        config: "english",
      });

    if (error) {
      res.status(500).json({
        message: "Error: " + error.message,
        success: false,
      });
      return;
    }

    for (let i = 0; i < req.body.data.length; i++) {
      let updateBody = {};
      updateBody.action = req.body.type;
      updateBody.user_id = req.body.data[i].id;
      updateBody.name = req.body.data[i].name;
      updateBody.action_logged_at =
        req.body.data[i].requested_action.split(",")[1];

      let total_hours = await calculateTotalHours(
        updateBody.user_id,
        updateBody.action_logged_at
      );

      const { users, err } = await supabase
        .from("users")
        .update({ total_hours: total_hours }).match({ id: updateBody.user_id });

      if (err) {
        res.status(500).json({
          message: "Error: " + err.message,
          success: false,
        });
        return;
      }

      const { data, error } = await supabase
        .from("attendance")
        .insert(updateBody);

      if (error) {
        res.status(500).json({
          message: "Error: " + error.message,
          success: false,
        });
        return;
      }
    }
    res.status(200).json({
      message: "Success",
      success: true,
    });
  }
);

module.exports = router;
