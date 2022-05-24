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

async function calculateHours(user) {}

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
    if (!user.present === false) {
      calculateHours(user);
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

router.post("/updateUserDeptGrade", async (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    res.sendStatus(404);
    return;
  }

  const { data, error } = await supabase
    .from("users")
    .update({ department: req.body.department, current_grade: req.body.grade })
    .match({ id: req.body.id });

  if (error) {
    res.sendStatus(500);
    return;
  }

  res.sendStatus(200);
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

  if (updatedValue === false) {
    calculateHours(user);
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

  console.log(updateText);

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

module.exports = router;
