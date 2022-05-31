import { faFloppyDisk } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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

    fetch(process.env.REACT_APP_SERVER_URL + "/updateUser", {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        department: finalDept,
        current_grade: finalGrade,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          window.location.reload();
        } else {
          alert("settings modal: " + data.message);
        }
      });
  };

  const handleDeptChange = (event) => {
    let { value } = event.target;

    setDept(value);
  };

  const handleGradeChange = (event) => {
    let { value } = event.target;

    setGrade(value);
  };

  return (
    <div className={"modal " + (settingsClicked ? "is-active" : "")}>
      <div
        className="modal-background"
        onClick={() => setSettingsClicked(false)}
      ></div>
      <div className="modal-content">
        <div className="box">
          <h1 className="modal-title">Change Department</h1>
          <div className="select is-primary">
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
          <h1 className="modal-title">Change Grade</h1>
          <div className="select is-primary">
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
            <FontAwesomeIcon icon={faFloppyDisk} /> Save
          </button>
        </div>
      </div>
      <button
        className="modal-close is-large"
        aria-label="close"
        onClick={() => setSettingsClicked(false)}
      ></button>
    </div>
  );
}

export default SettingsModal;
