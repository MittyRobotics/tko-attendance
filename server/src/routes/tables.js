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

module.exports = router;
