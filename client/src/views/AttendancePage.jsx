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

  const [userList, setUserList] = useState(null);
  const [dataList, setDataList] = useState(null);

  const monthList = {
    1: "January",
    2: "February",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
    7: "July",
    8: "August",
    9: "September",
    10: "October",
    11: "November",
    12: "December",
  };

  const hoursToHoursMinutes = (num) => {
    var decimalTime = num;
    decimalTime = decimalTime * 60 * 60;
    var hours = Math.floor(decimalTime / (60 * 60));
    decimalTime = decimalTime - hours * 60 * 60;
    var minutes = Math.floor(decimalTime / 60);

    return hours + " Hrs. " + minutes + " Min.";
  };

  const resetUserList = () => {
    setUserList(null);
    fetch(process.env.REACT_APP_SERVER_URL + "/user/", {
      method: "GET",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUserList(data.userList);
        } else {
          setUserList(null);
        }
      });
  };

  const handleSortChange = (event) => {
    let { value } = event.target;

    setDataList(null);
    setUserList(null);

    if (value === "By Student") {
      resetUserList();
    }

    setSortBy(value);
  };

  const handleUserChange = (event) => {
    let { value } = event.target;

    let id = value.split(" ")[1].substring(1);

    setDataList(false);
    fetch(process.env.REACT_APP_SERVER_URL + `/attendance/user/${id}`, {
      method: "GET",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (data.data.length === 0) {
            setDataList(null);
          } else {
            setDataList(data.data);
          }
        } else {
          setDataList(null);
          alert("attendance page: " + data.message);
        }
      });
  };

  const parseTimestamp = (timestamp) => {
    const date = new Date(timestamp);

    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var strTime = hours + ":" + minutes + " " + ampm;

    return strTime;
  };

  const onChangeCalendar = (date, event) => {
    var dt = new Date(date).toISOString().split("T")[0];

    setDataList(false);

    if (sortBy === "By Date") {
      fetch(process.env.REACT_APP_SERVER_URL + `/attendance/date/${dt}`, {
        method: "GET",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Access-Control-Allow-Credentials": true,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            if (data.data.length === 0) {
              setDataList(null);
            } else {
              setDataList(data.data);
            }
          } else {
            setDataList(null);
            alert("attendance page: " + data.message);
          }
        });
    }
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
            <h1 className="date-select-text">No Records On Selected Date</h1>
          </div>
        ) : dataList === false ? (
          <div className="loading-wrapper">
            <ReactLoading type="bars" color="teal" />
          </div>
        ) : (
          <div>
            <h1 className="ats-h1">
              Total Students:{" "}
              <span className="td-underline td-bold">{dataList.length}</span>
            </h1>
            {dataList.map((user) => {
              return (
                <article
                  className="message is-link"
                  key={"bydate-" + user.user_id}
                >
                  <div className="message-body">
                    <h1 className="request-title">{user.name}</h1>
                    <h1>
                      <span className="td-underline">
                        {hoursToHoursMinutes(user.hours)}
                      </span>
                    </h1>
                    <h1>
                      Last <span className="td-italics">{user.lastAction}</span>{" "}
                      at {parseTimestamp(user.lastActionTimeStamp)}
                    </h1>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const byUser = (
    <div>
      {userList === null ? (
        <div className="loading-wrapper">
          <ReactLoading type="bars" color="teal" />
        </div>
      ) : (
        <div>
          <h1 className="ats-h1">Select Student</h1>
          <div
            className="sort-select select is-link"
            onChange={handleUserChange}
          >
            <select>
              <option>---</option>
              {userList.map((user) => {
                return (
                  <option key={"selectstudent-" + user.id}>
                    ID #{user.id} | {user.name}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="columns is-fullwidth">
            <div className="column">
              {dataList === null ? (
                <div className="loading-wrapper">
                  <h1 className="date-select-text">No Records Found</h1>
                </div>
              ) : dataList === false ? (
                <div className="loading-wrapper">
                  <ReactLoading type="bars" color="teal" />
                </div>
              ) : (
                dataList.map((date) => {
                  let day = date.day.split("-").reverse();
                  return (
                    <article
                      className="message is-link"
                      key={"byuser-" + date.id}
                    >
                      <div className="message-body">
                        <h1 className="request-title">
                          {day[0] +
                            " " +
                            monthList[parseInt(day[1])] +
                            ", " +
                            day[2]}
                        </h1>
                        <h1>
                          <span className="td-underline">
                            {hoursToHoursMinutes(date.hours)}
                          </span>
                        </h1>
                        <h1>
                          Last
                          <span className="td-italics">
                            {" "}
                            {date.lastAction}
                          </span>{" "}
                          at {parseTimestamp(date.lastActionTimeStamp)}
                        </h1>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
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
