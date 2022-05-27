import React, { useEffect, useState } from "react";
import ReactLoading from "react-loading";

import "bulma/css/bulma.min.css";
import "animate.css";
import "hover.css";
import "./Home.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChampagneGlasses,
  faCheck,
  faCircleLeft,
  faX,
} from "@fortawesome/free-solid-svg-icons";

function RequestsPage() {
  const [requests, setRequests] = useState(null);

  const [buttonsLoading, setButtonsLoading] = useState({});

  const getRequests = () => {
    fetch(process.env.REACT_APP_SERVER_URL + "/allAttendanceRequests", {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          console.log(data.requests);
          setRequests(data.requests);
        } else {
          alert("requests page: " + data.message);
        }
      });
  };

  useEffect(() => getRequests(), []);

  const sendBulkRequest = async (type, action, button_id) => {
    setButtonsLoading({ ...buttonsLoading, [button_id]: true });
    if (action === "deny") {
      fetch(process.env.REACT_APP_SERVER_URL + "/updateUserBulk", {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          type: type,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setButtonsLoading({ ...buttonsLoading, [button_id]: false });
            getRequests();
          } else {
            setButtonsLoading({ ...buttonsLoading, [button_id]: false });
            alert("requests page: " + data.message);
          }
        });
    } else {
      fetch(process.env.REACT_APP_SERVER_URL + "/updateAttendanceBulk", {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          type: type,
          data:
            type === "Signed In"
              ? requests.signinrequests
              : requests.signoutrequests,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setButtonsLoading({ ...buttonsLoading, [button_id]: false });
            getRequests();
          } else {
            setButtonsLoading({ ...buttonsLoading, [button_id]: false });
            alert("requests page: " + data.message);
          }
        });
    }
  };

  const sendRequest = async (type, action, name, id, timestamp) => {
    let b_id = action === "deny" ? "d" : "g";
    b_id += id;
    setButtonsLoading({ ...buttonsLoading, [b_id]: true });
    if (action === "deny") {
      fetch(process.env.REACT_APP_SERVER_URL + "/updateUser", {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          requested_action: "none",
          id: id,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setButtonsLoading({ ...buttonsLoading, [b_id]: false });
            getRequests();
            return;
          } else {
            setButtonsLoading({ ...buttonsLoading, [b_id]: false });
            alert(data.message);
          }
        });
    } else {
      fetch(process.env.REACT_APP_SERVER_URL + "/updateAttendance", {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          action: type,
          name: name,
          timestamp: timestamp,
          id: id,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setButtonsLoading({ ...buttonsLoading, [b_id]: false });
            getRequests();
            return;
          } else {
            setButtonsLoading({ ...buttonsLoading, [b_id]: false });
            alert(data.message);
          }
        });
    }
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

    return (
      date.getMonth() +
      1 +
      "/" +
      date.getDate() +
      "/" +
      date.getFullYear() +
      " " +
      strTime
    );
  };

  const columnBuilder = (type) => (
    <div className="column requests-col is-half">
      <div className="columns bulk-cols">
        <div className="column bulk-col1">
          <span className="tag is-warning td-bold">{type} Requests</span>
        </div>
        <div className="column bulk-col2">
          <button
            className={
              "button is-success btn-grant" +
              (buttonsLoading["g-all" + (type === "Sign In" ? "s" : "o")]
                ? " is-loading"
                : "")
            }
            onClick={() =>
              sendBulkRequest(
                type === "Sign In" ? "Signed In" : "Signed Out",
                "grant",
                "g-all" + (type === "Sign In" ? "s" : "o")
              )
            }
          >
            <FontAwesomeIcon icon={faCheck} /> Grant All
          </button>
          <button
            className={
              "button is-danger btn-deny" +
              (buttonsLoading["d-all" + (type === "Sign In" ? "s" : "o")]
                ? " is-loading"
                : "")
            }
            onClick={() =>
              sendBulkRequest(
                type === "Sign In" ? "SignIn" : "SignOut",
                "deny",
                "d-all" + (type === "Sign In" ? "s" : "o")
              )
            }
          >
            <FontAwesomeIcon icon={faX} /> Deny All
          </button>
        </div>
      </div>
      <div className="notification is-link is-light">
        {(type === "Sign In"
          ? requests.signinrequests
          : requests.signoutrequests
        ).length === 0 ? (
          <div className="no-requests">
            <button className="button is-link">
              <FontAwesomeIcon icon={faChampagneGlasses} /> No Requests!
            </button>
          </div>
        ) : (
          (type === "Sign In"
            ? requests.signinrequests
            : requests.signoutrequests
          ).map((request) => (
            <article className="message is-link" key={request.id}>
              <div className="message-body">
                <div className="columns mapped-cols">
                  <div className="column student-desc">
                    <h1 className="request-title">{request.name}</h1>
                    <span className="tag is-link">
                      {request.department === "No"
                        ? "No Dept."
                        : request.department}
                    </span>
                    <span className="tag is-link">
                      {parseTimestamp(request.requested_action.split(",")[1])}
                    </span>
                  </div>
                  <div className="column btn-decisions">
                    <button
                      className={
                        "button is-success btn-grant" +
                        (buttonsLoading["g" + request.id] ? " is-loading" : "")
                      }
                      onClick={() =>
                        sendRequest(
                          type === "Sign In" ? "Signed In" : "Signed Out",
                          "grant",
                          request.name,
                          request.id,
                          request.requested_action.split(",")[1]
                        )
                      }
                    >
                      <FontAwesomeIcon icon={faCheck} /> Grant
                    </button>
                    <button
                      className={
                        "button is-danger btn-deny" +
                        (buttonsLoading["d" + request.id] ? " is-loading" : "")
                      }
                      onClick={() =>
                        sendRequest(
                          "Denied",
                          "deny",
                          request.name,
                          request.id,
                          request.requested_action.split(",")[1]
                        )
                      }
                    >
                      <FontAwesomeIcon icon={faX} /> Deny
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );

  const columns = requests ? (
    <div className="columns requests-columns">
      {columnBuilder("Sign In")} {columnBuilder("Sign Out")}
    </div>
  ) : (
    <div className="loading-wrapper">
      <ReactLoading type="bars" color="teal" />
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
          <h1 className="name block">Attendance Requests</h1>
        </div>
        <div className="requests-table">{columns}</div>
      </section>
    </div>
  );
}

export default RequestsPage;
