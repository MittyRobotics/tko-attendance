var express = require("express");
import supabase from "../supabase-setup";

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

router.post("/updateUser", async (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    res.sendStatus(404);
    return;
  }

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

  res.json({
    message: "Success",
    success: true,
  });
});

router.get("/userList", async (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    res.sendStatus(404);
    return;
  }

  if (!req.user.admin) {
    res.json({
      error: "Error: not admin",
      success: false,
    });
    return;
  }

  const { data, error } = await supabase
    .from("users")
    .select("id, name, department, admin, current_grade, present, total_hours")
    .order("id", { ascending: true });

  if (error) {
    res.json({
      error: "Error: " + error,
      success: false,
    });
    return;
  }

  res.json({
    userList: data,
    message: "Success",
    success: true,
  });
});

router.get("/allAttendanceRequests", async (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    res.sendStatus(404);
    return;
  }

  if (!req.user.admin) {
    res.json({
      error: "Error: not admin",
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
      error: "Error: retrieving requests data",
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
});

router.post("/adminPresentToggle", async (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    res.sendStatus(404);
    return;
  }

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
});

router.post("/qrscanned", async (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    res.sendStatus(404);
    return;
  }

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
});

router.post("/request", async (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    res.sendStatus(404);
    return;
  }

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
  var utc_timestamp = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes(),
      now.getUTCSeconds(),
      now.getUTCMilliseconds()
    )
  );

  let updateText =
    req.body.requested_action.split(" ").join("") +
    "," +
    utc_timestamp.toISOString();

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
});

router.post("/signoutAll", async (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    res.sendStatus(404);
    return;
  }

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
});

module.exports = router;
