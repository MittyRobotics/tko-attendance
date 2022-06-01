import supabase from "../supabase-setup";

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

function roundToTwo(num) {
    return +(Math.round(num + "e+2") + "e-2");
  }

function toISOStringLocal(d) {
    var tzoffset = new Date().getTimezoneOffset() * 60000;
    var localISOTime = new Date(Date.now() - tzoffset).toISOString().slice(0, -1);
    return localISOTime;
  }

module.exports = { insertNewAttendanceLog, updateUserPresent, toISOStringLocal, roundToTwo };
