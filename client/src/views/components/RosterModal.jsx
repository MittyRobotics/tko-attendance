import { faWrench } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";

function RosterModal({ getUserList, rosterClicked, setRosterClicked }) {
  const [selectedValue, setSelectedValue] = useState(rosterClicked[3][0]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    setSelectedValue(rosterClicked[3][0]);
  }, [rosterClicked]);

  const uppercaseIt = (str) => {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  };

  const submitRosterChange = () => {
    setUpdating(true);
    fetch(
      process.env.REACT_APP_SERVER_URL + `/user/update/${rosterClicked[4]}`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          [rosterClicked[1]]: selectedValue,
        }),
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUpdating(false);
          getUserList();
          setRosterClicked([false, "", "", [""]]);
        } else {
          alert("roster modal: " + data.message);
          setRosterClicked([false, "", "", [""]]);
          setUpdating(false);
        }
      });
  };

  const handleSelectChange = (event) => {
    let { value } = event.target;

    setSelectedValue(value);
  };

  return (
    <div className={"modal " + (rosterClicked[0] ? "is-active" : "")}>
      <div
        className="modal-background"
        onClick={() => setRosterClicked([false, "", "", [""]])}
      ></div>
      <div className="modal-content">
        <div className="box">
          <h1 className="modal-title">
            Setting{" "}
            <span className="identify">
              {uppercaseIt(rosterClicked[1].split("_").join(" "))}
            </span>{" "}
            for <span className="identify">{rosterClicked[2]}</span>
          </h1>
          <br></br>
          <div className="select is-link">
            <select onChange={handleSelectChange}>
              {rosterClicked[3].map((option) => {
                return <option key={option}>{option}</option>;
              })}
            </select>
          </div>
          <br></br>
          <br></br>
          <br></br>
          <button
            className={"button is-danger" + (updating ? " is-loading" : "")}
            onClick={() => submitRosterChange()}
          >
            <FontAwesomeIcon icon={faWrench} /> Update
          </button>
        </div>
      </div>
      <button
        className="modal-close is-large"
        aria-label="close"
        onClick={() => setRosterClicked([false, "", "", [""]])}
      ></button>
    </div>
  );
}

export default RosterModal;
