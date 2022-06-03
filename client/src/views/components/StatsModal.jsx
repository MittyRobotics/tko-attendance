import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

function StatsModal({ user, statsClicked, setStatsClicked }) {
  const hoursToHoursMinutes = (num) => {
    var decimalTime = num;
    decimalTime = decimalTime * 60 * 60;
    var hours = Math.floor(decimalTime / (60 * 60));
    decimalTime = decimalTime - hours * 60 * 60;
    var minutes = Math.floor(decimalTime / 60);

    return [hours, minutes];
  };

  return (
    <div id="qr-modal" className={"modal " + (statsClicked ? "is-active" : "")}>
      <div
        className="modal-background"
        onClick={() => setStatsClicked(false)}
      ></div>
      <div className="modal-content">
        <div className="box">
          <h1 className="stats-title">{user.name}</h1>
          <h1 className="modal-desc">
            <span className="td-underline">Total Time:</span>{" "}
            <span className="td-bold">
              {hoursToHoursMinutes(user.total_hours)[0]}
            </span>{" "}
            Hours,{" "}
            <span className="td-bold">
              {hoursToHoursMinutes(user.total_hours)[1]}
            </span>{" "}
            Minutes
          </h1>
          <br></br>
          <button
            className="button is-link is-light"
            onClick={() => setStatsClicked(false)}
          >
            <FontAwesomeIcon icon={faCircleXmark} /> Close
          </button>
        </div>
      </div>
      <button
        className="modal-close is-large"
        aria-label="close"
        onClick={() => setStatsClicked(false)}
      ></button>
    </div>
  );
}

export default StatsModal;
