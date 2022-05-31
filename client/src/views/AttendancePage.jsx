import React, { useState } from "react";
import Calendar from "react-calendar";
import ReactLoading from "react-loading";

import "bulma/css/bulma.min.css";
import "animate.css";
import "hover.css";
import "./Home.css";
import "./Calendar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleLeft } from "@fortawesome/free-solid-svg-icons";

function AttendancePage() {
  const [sortBy, setSortBy] = useState("By Date");

  const [dataList, setDataList] = useState(null);

  const handleSortChange = (event) => {
    let { value } = event.target;

    setSortBy(value);
  };

  const onChangeCalendar = (date, event) => {
    var dt = new Date(date).toISOString().split("T")[0];
    console.log(dt);

    setDataList(null);
    fetch(process.env.REACT_APP_SERVER_URL + "/getAttendanceRecords", {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        sortBy: sortBy === "By Date" ? "date" : "user",
        date: dt,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDataList(data.data);
        } else {
          setDataList(null);
          alert("attendance page: " + data.message);
        }
      });
  };

  const byDate = (
    <div className="columns is-fullwidth">
      <div className="column">
        <div className="calendar-chooser">
          <Calendar onChange={onChangeCalendar} />
        </div>
      </div>
      <div className="column">
        {dataList === null ? (
          <div className="loading-wrapper">
            <ReactLoading type="bars" color="teal" />
          </div>
        ) : (
          dataList
        )}
      </div>
    </div>
  );

  const byUser = (
    <div className="columns is-fullwidth">
      <div className="column"></div>
      <div className="column"></div>
    </div>
  );

  return (
    <div>
      <section className="hero-pattern">
        <div className="container sign-out block">
          <button
            className={"button is-warning animate__animated animate__fadeIn"}
            onClick={() => (window.location = "/")}
          >
            <FontAwesomeIcon icon={faCircleLeft} /> Back
          </button>
        </div>
        <div className="qr-title container block">
          <h1 className="name block">Attendance Records</h1>
        </div>
        <div className="attendance-container">
          <div
            className="sort-select select is-link"
            onChange={handleSortChange}
          >
            <select>
              <option>By Date</option>
              <option>By Student</option>
            </select>
          </div>
          {sortBy === "By Date" ? byDate : byUser}
        </div>
      </section>
    </div>
  );
}

export default AttendancePage;
