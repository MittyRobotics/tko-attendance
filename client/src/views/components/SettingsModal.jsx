import React, { useState } from "react";

function SettingsModal({ user, settingsClicked, setSettingsClicked }) {
  const [dept, setDept] = useState("---");
  const [grade, setGrade] = useState("---");

  const modifySettings = () => {
    let finalDept = "";
    let finalGrade = "";

    if (dept === "---") {
      finalDept = "No";
    } else {
      finalDept = dept;
    }

    if (grade === "---") {
      finalGrade = "-1";
    } else {
      finalGrade = parseInt(grade.split(" ")[0]);
    }

    fetch(process.env.REACT_APP_SERVER_URL + "/updateUserDeptGrade", {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        department: finalDept,
        grade: finalGrade,
        id: user.id,
      }),
    }).then((response) => {
      if (response.status === 200) {
        window.location.reload();
      }
      throw new Error("failed to update user data");
    });
  };

  const handleDeptChange = (event) => {
    let { name, value } = event.target;

    setDept(value);
  };

  const handleGradeChange = (event) => {
    let { name, value } = event.target;

    setGrade(value);
  };

  return (
    <div class={"modal " + (settingsClicked ? "is-active" : "")}>
      <div
        class="modal-background"
        onClick={() => setSettingsClicked(false)}
      ></div>
      <div class="modal-content">
        <div class="box">
          <h1 class="modal-title">Change Department</h1>
          <div class="select is-primary">
            <select onChange={handleDeptChange}>
              <option>---</option>
              <option>FRC Programming</option>
              <option>JV Programming</option>
              <option>FRC Mechanical</option>
              <option>JV Mechanical</option>
              <option>FRC Electrical</option>
              <option>JV Electrical</option>
              <option>Operations</option>
            </select>
          </div>
          <h1 class="modal-title">Change Grade</h1>
          <div class="select is-primary">
            <select onChange={handleGradeChange}>
              <option>---</option>
              <option>9 (Freshman)</option>
              <option>10 (Sophomore)</option>
              <option>11 (Junior)</option>
              <option>12 (Senior)</option>
            </select>
          </div>
          <br></br>
          <button
            className="button is-primary is-light save-btn"
            onClick={() => modifySettings()}
          >
            Save
          </button>
        </div>
      </div>
      <button
        class="modal-close is-large"
        aria-label="close"
        onClick={() => setSettingsClicked(false)}
      ></button>
    </div>
  );
}

export default SettingsModal;
