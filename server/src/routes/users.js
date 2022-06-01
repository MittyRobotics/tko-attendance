var express = require("express");
import supabase from "../supabase-setup";
const passport = require("passport");
import {
  insertNewAttendanceLog,
  toISOStringLocal,
  updateUserPresent,
} from "./helper";

const router = express.Router();

// mounted at /user/

// get all users
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (!req.user.admin) {
      res.status(401).json({
        message: "Error: Not Admin",
        success: false,
      });
      return;
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      res.status(500).json({
        message: "Error: " + error.message,
        success: false,
      });
      return;
    }

    res.status(200).json({
      userList: data,
      message: "Success",
      success: true,
    });
  }
);

// get user by id
router.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (!req.user.admin) {
      res.status(401).json({
        message: "Error: Not Admin",
        success: false,
      });
      return;
    }

    const { id } = req.params;

    const { data, error } = await supabase.from("users");

    if (error) {
      res.status(500).json({
        message: "Error: " + error.message,
        success: false,
      });
      return;
    }

    const user = data.find((user) => user.id === id);

    if (!user) {
      res.status(500).json({
        message: "Error: User not found",
        success: false,
      });
      return;
    }

    res.status(200).json({
      user: user,
      message: "Success",
      success: true,
    });
  }
);

// update a user (updating specific fields requires admin)
router.post(
  "/update/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { id } = req.params;

    let updateBody = {};

    if (req.body.department) {
      updateBody.department = req.body.department;
    }
    if (req.body.current_grade) {
      updateBody.current_grade = req.body.current_grade;
    }
    if (req.user.admin) {
      if (req.body.togglePresent) {
        const { data, error } = await supabase.from("users");
        if (error) {
          res.status(500).json({
            message: "Error: " + error.message,
            success: false,
          });
          return;
        }
        let returnedUser = data.find(
          (user) => user.google_id === req.body.google_id
        );
        updateBody.present = !returnedUser.present;
      } else if (req.body.present) {
        updateBody.present = req.body.present;
      }
      if (req.body.admin) {
        updateBody.admin = req.body.admin;
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
    }

    const { data, error } = await supabase
      .from("users")
      .update(updateBody)
      .match({ id: id });

    if (error) {
      res.status(500).json({
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
        res.status(500).json({
          message: "Error: inserting attendance",
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

// update all users
router.post(
  "/update_requested",
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
      res.status(500).json({
        message: error.message,
        success: false,
      });
      return;
    }

    res.status(200).json({
      message: "success",
      success: true,
    });
  }
);

// user request to sign in or out
router.post(
  "/:id/request",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { id } = req.params;
    if (req.body.requested_action === "Cancel Current Request") {
      const { data: rp, er } = await supabase
        .from("users")
        .update({ requested_action: "none" })
        .match({ id: id });

      if (er) {
        res.status(500).json({
          message: "Error: " + er.message,
          success: false,
        });
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
      .match({ id: id })
      .textSearch(
        "requested_action",
        req.body.requested_action.split(" ").join(""),
        {
          config: "english",
        }
      );

    if (error) {
      res.status(500).json({
        message: "Error: " + error.message,
        success: false,
      });
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
      .match({ id: id });

    if (err) {
      res.status(500).json({
        message: "Error: " + err.message,
        success: false,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Request Successfully Sent",
    });
  }
);

// user QR code scanned
router.post(
  "/scan/:google_id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { google_id } = req.params;
    const { data, error } = await supabase.from("users");

    var user = data.find((user) => user.google_id === google_id);

    if (!user) {
      res.status(500).json({
        message: "Error: retrieving user",
        success: false,
      });
      return;
    }

    let updatedValue = !user.present;

    let message = updatedValue
      ? user.name + " Signed In"
      : user.name + " Signed Out";

    if (!(await updateUserPresent(google_id, updatedValue))) {
      res.status(500).json({
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
      res.status(500).json({
        message: "Error: inserting attendance",
        success: false,
      });
      return;
    }

    res.status(200).json({
      message: message,
      success: true,
    });
  }
);

// sign out all users
router.post(
  "/signout",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (!req.user.admin) {
      res.status(401).json({
        message: "Error: Not Authorized",
        success: false,
      });
      return;
    }

    const { data, error } = await supabase.from("users").select();

    if (error) {
      res.status(500).json({
        message: "Error: retrieving users",
        success: false,
      });
      return;
    }

    for (var i = 0; i < data.length; i++) {
      if (data[i].present) {
        if (!(await updateUserPresent(data[i].google_id, false))) {
          res.status(500).json({
            message: "Error: updating user " + i,
            success: false,
          });
          return;
        }

        if (!(await insertNewAttendanceLog(data[i], "Signed Out"))) {
          res.status(500).json({
            message: "Error: inserting attendance for user " + i,
            success: false,
          });
          return;
        }
      }
    }

    res.status(200).json({
      message: "Success",
      success: true,
    });
  }
);

module.exports = router;
