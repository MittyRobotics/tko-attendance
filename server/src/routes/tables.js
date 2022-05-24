var express = require("express");
import supabase from "../supabase-setup";

const router = express.Router();

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

  const { data, error } = await supabase
    .from("users")
    .select("google_id, present, name, id")
    .match({ google_id: req.body.id });

  if (error) {
    res.json({
      message: "Error: retrieving user",
      success: false,
    });
    return;
  }

  if (data.length > 1) {
    res.json({
      message: "Error: too many users with same google_id",
      success: false,
    });
    return;
  }

  let updatedValue = data[0].present;

  if (data[0].present) {
    updatedValue = false;
  } else {
    updatedValue = true;
  }

  let message = updatedValue
    ? data[0].name + " Signed In"
    : data[0].name + " Signed Out";

  const { data2, error2 } = await supabase
    .from("users")
    .update({ present: updatedValue })
    .match({ google_id: req.body.id });

  if (error2) {
    res.json({
      message: "Error: updating user",
      success: false,
    });
    return;
  }

  let { data3, error3 } = await supabase.from("attendance").insert({
    action: updatedValue ? "Signed In" : "Signed Out",
    user_id: data[0].id,
    name: data[0].name,
  });

  if (error3) {
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
