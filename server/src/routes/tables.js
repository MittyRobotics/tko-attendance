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
    .match({ id: req.body.id, requested_action: req.body.requested_action });

  if (error) {
    res.sendStatus(500);
    return;
  }

  console.log(req.body.requested_action);
  console.log(user);

  if (user.length > 0) {
    res.status(200).json({
      success: false,
      message: "Request Already Sent",
    });
    return;
  }

  const { data: resp, err } = await supabase
    .from("users")
    .update({ requested_action: req.body.requested_action })
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
