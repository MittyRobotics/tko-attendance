import supabase from "../supabase-setup";
import moment from "moment";

async function insertNewAttendanceLog(user, action) {
  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .match({ user_id: user.id })
    .order("action_logged_at", { ascending: true });

  if (error) {
    console.log(false);
  }

  // print last element of data1
  // console.log(data[data.length - 1]);

  // if this is true, the server is either skipping requests or something bugged out. lets hotfix it :D
  // if the requested action has already been logged, dont log it again
  if (data[data.length - 1] && data[data.length - 1].action === action) {
    return true;
  } else {
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
}

async function calculateTotalHours(user_id, finalTimestamp = null) {
  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .match({ user_id: user_id })
    .order("action_logged_at", { ascending: true });

  if (error) {
    return false;
  }

  let totalHours = 0;
  let lastTimestamp = null;
  let lastAction = null;
  let timestamps = [];

  for (let i = 0; i < data.length; i++) {
    let day = data[i].action_logged_at.split("T")[0];
    if (!timestamps.includes(day) && data[i].action === "Signed In") {
      timestamps.push(day);
    } else if (!timestamps.includes(day) && data[i].action === "Signed Out") {
      continue;
    }
    if (data[i].action === "Signed In") {
      lastTimestamp = data[i].action_logged_at;
      lastAction = "Signed In";
    } else if (data[i].action === "Signed Out") {
      let lastTime = moment(lastTimestamp);
      let currentTime = moment(data[i].action_logged_at);
      let duration = currentTime.diff(lastTime, "minutes");
      totalHours += duration / 60;
      lastTimestamp = null;
      lastAction = "Signed Out";
    }
  }

  if (lastAction === "Signed In" && finalTimestamp !== null) {
    let lastTime = moment(lastTimestamp);
    let currentTime = moment(finalTimestamp);
    let duration = currentTime.diff(lastTime, "minutes");
    totalHours += duration / 60;
  }

  return roundToTwo(totalHours);
}

async function updateUserPresent(
  google_id,
  presentValue,
  alternateUserId = null
) {
  let updateValue = { present: presentValue };

  if (presentValue === false) {
    if (alternateUserId !== null) {
      updateValue.total_hours = await calculateTotalHours(
        alternateUserId,
        toISOStringLocal()
      );
    } else {
      const { users, error } = await supabase.from("users");

      if (error) {
        return false;
      }

      let user = users.find((user) => user.google_id === google_id);
      updateValue.total_hours = await calculateTotalHours(
        user.id,
        toISOStringLocal()
      );
    }
  }

  const { data, error } = await supabase
    .from("users")
    .update(updateValue)
    .match({ google_id: google_id });

  if (error) {
    return false;
  }
  return true;
}

function roundToTwo(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

function toISOStringLocal() {
  var tzoffset = new Date().getTimezoneOffset() * 60000;
  var localISOTime = new Date(Date.now() - tzoffset).toISOString().slice(0, -1);
  return localISOTime;
}

module.exports = {
  insertNewAttendanceLog,
  updateUserPresent,
  toISOStringLocal,
  roundToTwo,
  calculateTotalHours,
};
