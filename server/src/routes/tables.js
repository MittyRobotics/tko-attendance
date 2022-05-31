var express = require("express");
import supabase from "../supabase-setup";
const passport = require("passport");
import moment from "moment";

import schedule from "node-schedule";

const router = express.Router();

async function updateUserPresent(google_id, presentValue) {
  const { data, error } = await supabase
    .from("users")
    .update({ present: presentValue })
    .match({ google_id: google_id });

  if (error) {
    return false;
  }
  return true;
}

async function insertNewAttendanceLog(user, action) {
  let { data, error } = await supabase.from("attendance").insert({
    action: action,
    user_id: user.id,
    name: user.name,
  });

  if (error) {
    return false;
  }
  return true;
}

router.post(
  "/updateUserBulk",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { data, error } = await supabase
      .from("users")
      .update({ requested_action: "none" })
      .select("id, requested_action")
      .textSearch("requested_action", req.body.type, {
        config: "english",
      });

    if (error) {
      res.json({
        message: error.message,
        success: false,
      });
      return;
    }

    res.json({
      message: "success",
      success: true,
    });
  }
);

router.post(
  "/updateAttendanceBulk",
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
      res.json({
        message: error.message,
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

      const { data, error } = await supabase
        .from("attendance")
        .insert(updateBody);

      if (error) {
        res.json({
          message: error.message,
          success: false,
        });
        return;
      }
    }
    res.json({
      message: "Success",
      success: true,
    });
  }
);

router.post(
  "/updateUser",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let updateBody = {};

    if (req.body.department) {
      updateBody.department = req.body.department;
    }
    if (req.body.admin) {
      if (req.user.admin) {
        updateBody.admin = req.body.admin;
      }
    }
    if (req.body.current_grade) {
      updateBody.current_grade = req.body.current_grade;
    }
    if (req.body.present) {
      updateBody.present = req.body.present;
    }
    if (req.body.total_hours) {
      if (req.user.admin) {
        updateBody.total_hours = req.body.total_hours;
      }
    }
    if (req.body.requested_action) {
      if (req.user.admin) {
        updateBody.requested_action = req.body.requested_action;
      }
    }

    const { data, error } = await supabase
      .from("users")
      .update(updateBody)
      .match({ id: req.body.id });

    if (error) {
      res.json({
        message: error.message,
        success: false,
      });
      return;
    }

    if ("present" in updateBody) {
      if (
        !(await insertNewAttendanceLog(
          data[0],
          data[0].present ? "Signed In" : "Signed Out"
        ))
      ) {
        res.json({
          message: "Error: inserting attendance",
          success: false,
        });
        return;
      }
    }

    res.json({
      message: "Success",
      success: true,
    });
  }
);

router.post(
  "/updateAttendance",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (!req.user.admin) {
      res.json({
        message: "Error: not admin",
        success: false,
      });
      return;
    }

    let updateBody = {};
    updateBody.action = req.body.action;
    updateBody.user_id = req.body.id;
    updateBody.name = req.body.name;

    if (req.body.timestamp) {
      updateBody.action_logged_at = req.body.timestamp;
    }

    const { data, error } = await supabase
      .from("attendance")
      .insert(updateBody);

    if (error) {
      res.json({
        message: error.message,
        success: false,
      });
      return;
    }

    // if timestamp, then request originated from student attendance signin/out request page
    if (req.body.timestamp) {
      const { users, err } = await supabase
        .from("users")
        .update({
          requested_action: "none",
          present: updateBody.action === "Signed In" ? true : false,
        })
        .match({ id: req.body.id });

      if (err) {
        res.json({
          message: err.message,
          success: false,
        });
        return;
      }
    }

    res.json({
      message: "Success",
      success: true,
    });
  }
);

router.get(
  "/userList",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (!req.user.admin) {
      res.json({
        message: "Error: not admin",
        success: false,
      });
      return;
    }

    const { data, error } = await supabase
      .from("users")
      .select(
        "id, name, department, admin, current_grade, present, total_hours"
      )
      .order("id", { ascending: true });

    if (error) {
      res.json({
        message: "Error: " + error,
        success: false,
      });
      return;
    }

    res.json({
      userList: data,
      message: "Success",
      success: true,
    });
  }
);

router.get(
  "/allAttendanceRequests",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (!req.user.admin) {
      res.json({
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
      res.json({
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

    res.json({
      requests: finalData,
      message: "Success",
      success: true,
    });
  }
);

router.post(
  "/adminPresentToggle",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { data, error } = await supabase.from("users");

    var user = data.find((user) => user.google_id === req.body.id);

    if (user && user.admin) {
      if (!(await updateUserPresent(req.body.id, !user.present))) {
        res.json({
          message: "Error: updating user",
          success: false,
        });
        return;
      }

      if (
        !(await insertNewAttendanceLog(
          user,
          !user.present ? "Signed In" : "Signed Out"
        ))
      ) {
        res.json({
          message: "Error: inserting attendance",
          success: false,
        });
        return;
      }
      res.json({
        message: "Success",
        success: true,
      });
    } else {
      res.json({
        message: "Not admin",
        success: false,
      });
    }

    return;
  }
);

router.post(
  "/qrscanned",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { data, error } = await supabase.from("users");

    var user = data.find((user) => user.google_id === req.body.id);

    if (!user) {
      res.json({
        message: "Error: retrieving user",
        success: false,
      });
      return;
    }

    let updatedValue = !user.present;

    let message = updatedValue
      ? user.name + " Signed In"
      : user.name + " Signed Out";

    if (!(await updateUserPresent(req.body.id, updatedValue))) {
      res.json({
        message: "Error: updating user",
        success: false,
      });
      return;
    }

    if (
      !(await insertNewAttendanceLog(
        user,
        updatedValue ? "Signed In" : "Signed Out"
      ))
    ) {
      res.json({
        message: "Error: inserting attendance",
        success: false,
      });
      return;
    }

    res.json({
      message: message,
      success: true,
    });
  }
);

function roundToTwo(num) {
  return +(Math.round(num + "e+2") + "e-2");
}

router.post(
  "/getAttendanceRecords",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const sortBy = req.body.sortBy;

    if (sortBy === "date") {
      const parsedDate = req.body.date;
      const { data, error } = await supabase.rpc(`timestamp_text_table`, {
        datevalue: parsedDate,
      });

      if (error) {
        res.json({
          message: "Error: " + error.message,
          success: false,
        });
        return;
      }
      console.log(data);

      let userData = {};

      for (let i = 0; i < data.length; i++) {
        if (!(data[i].user_id in userData) && data[i].action === "Signed In") {
          userData[data[i].user_id] = {
            name: data[i].name,
            hours: 0,
            lastAction: "Signed In",
            lastActionTimeStamp: data[i].action_logged_at,
          };
        } else {
          if (data[i].action === "Signed Out") {
            var startTime = moment(
              userData[data[i].user_id].lastActionTimeStamp
            );
            var endTime = moment(data[i].action_logged_at);
            var duration = endTime.diff(startTime, "minutes");
            userData[data[i].user_id].hours += roundToTwo(duration / 60);
            userData[data[i].user_id].lastAction = data[i].action;
            userData[data[i].user_id].lastActionTimeStamp =
              data[i].action_logged_at;
          } else if (data[i].action === "Signed In") {
            userData[data[i].user_id].lastAction = data[i].action;
            userData[data[i].user_id].lastActionTimeStamp =
              data[i].action_logged_at;
          }
        }
      }

      console.log(userData);

      res.json({
        data: data,
        message: "Success",
        success: true,
      });
    }
  }
);

function toISOStringLocal(d) {
  var tzoffset = new Date().getTimezoneOffset() * 60000;
  var localISOTime = new Date(Date.now() - tzoffset).toISOString().slice(0, -1);
  return localISOTime;
}

router.post(
  "/request",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (req.body.requested_action === "Cancel Current Request") {
      const { data: rp, er } = await supabase
        .from("users")
        .update({ requested_action: "none" })
        .match({ id: req.body.id });

      if (er) {
        res.sendStatus(500);
        return;
      }

      res.status(200).json({
        success: true,
        message: "Request Successfully Canceled",
      });
      return;
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id, requested_action")
      .match({ id: req.body.id })
      .textSearch(
        "requested_action",
        req.body.requested_action.split(" ").join(""),
        {
          config: "english",
        }
      );

    if (error) {
      console.log(error);
      res.sendStatus(500);
      return;
    }

    if (user.length > 0) {
      res.status(200).json({
        success: false,
        message: "Request Already Sent",
      });
      return;
    }

    var now = new Date();
    var local_timestamp = toISOStringLocal(now);

    let updateText =
      req.body.requested_action.split(" ").join("") + "," + local_timestamp;

    const { data: resp, err } = await supabase
      .from("users")
      .update({ requested_action: updateText })
      .match({ id: req.body.id });

    if (err) {
      res.sendStatus(500);
      return;
    }

    res.status(200).json({
      success: true,
      message: "Request Successfully Sent",
    });
  }
);

let signoutAll = async (req, res) => {
  console.log("signout all!");
  if (!req.user.admin) {
    res.sendStatus(404);
    return;
  }

  const { data, error } = await supabase.from("users").select();

  if (error) {
    console.log(error);
    res.json({
      message: "Error: retrieving users",
      success: false,
    });
    return;
  }

  for (var i = 0; i < data.length; i++) {
    if (data[i].present) {
      if (!(await updateUserPresent(data[i].google_id, false))) {
        res.json({
          message: "Error: updating user " + i,
          success: false,
        });
        return;
      }

      if (!(await insertNewAttendanceLog(data[i], "Signed Out"))) {
        res.json({
          message: "Error: inserting attendance for user " + i,
          success: false,
        });
        return;
      }
    }
  }

  res.json({
    message: "Success",
    success: true,
  });
};

router.post(
  "/signoutAll",
  passport.authenticate("jwt", { session: false }),
  signoutAll
);

// schedule.scheduleJob("0 0 * * *", () => {
//   signoutAll();
// });

module.exports = router;
