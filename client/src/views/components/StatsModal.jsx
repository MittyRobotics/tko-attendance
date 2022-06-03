import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import ReactLoading from "react-loading";

function StatsModal({ user, statsClicked, setStatsClicked }) {
  const hoursToHoursMinutes = (num) => {
    var decimalTime = num;
    decimalTime = decimalTime * 60 * 60;
    var hours = Math.floor(decimalTime / (60 * 60));
    decimalTime = decimalTime - hours * 60 * 60;
    var minutes = Math.floor(decimalTime / 60);

    return [hours, minutes];
  };

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState("");

  useEffect(() => {
    if (statsClicked) {
      setLoading(true);
      fetch(
        process.env.REACT_APP_SERVER_URL + `/attendance/user/${user.id}/today`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            Accept: "application/json",
            "Content-Type": "application/json",
            "Access-Control-Allow-Credentials": true,
          },
        }
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            if (data.data.length > 0) {
              setUserData(data.data[0]);
            } else {
              setUserData(false);
            }
            setLoading(false);
          }
        });
    }
  }, [statsClicked]);

  return (
    <div id="qr-modal" className={"modal " + (statsClicked ? "is-active" : "")}>
      <div
        className="modal-background"
        onClick={() => setStatsClicked(false)}
      ></div>
      <div className="modal-content">
        <div className="box">
          {loading ? (
            <div className="loading-wrapper-modal">
              <ReactLoading type="bars" color="teal" />
            </div>
          ) : (
            <div>
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
              {userData ? (
                <h1 className="modal-desc">
                  <span className="td-underline">Total Time Today:</span>{" "}
                  <span className="td-bold">
                    {hoursToHoursMinutes(userData.hours)[0]}
                  </span>{" "}
                  Hours,{" "}
                  <span className="td-bold">
                    {hoursToHoursMinutes(userData.hours)[1]}
                  </span>{" "}
                  Minutes
                </h1>
              ) : (
                <h1 className="modal-desc">
                  <span className="td-underline">Time Today:</span> No hours
                  logged yet.
                </h1>
              )}

              <br></br>
              <button
                className="button is-link is-light"
                onClick={() => setStatsClicked(false)}
              >
                <FontAwesomeIcon icon={faCircleXmark} /> Close
              </button>
            </div>
          )}
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
