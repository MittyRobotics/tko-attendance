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
  faSquareCheck,
  faX,
} from "@fortawesome/free-solid-svg-icons";

function RequestsPage({ user }) {
  const [requests, setRequests] = useState(null);

  const getRequests = () => {
    fetch("/allAttendanceRequests", {
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

  const columns = requests ? (
    <div className="columns requests-columns">
      <div className="column requests-col is-half">
        <div class="columns bulk-cols">
          <div class="column bulk-col1">
            <span className="tag is-warning td-bold">Sign In Requests</span>
          </div>
          <div class="column bulk-col2">
            <button className="button is-success btn-grant">
              <FontAwesomeIcon icon={faCheck} /> Grant All
            </button>
            <button className="button is-danger btn-deny">
              <FontAwesomeIcon icon={faX} /> Deny All
            </button>
          </div>
        </div>
        <div class="notification is-link is-light">
          {requests.signinrequests.length === 0 ? (
            <div class="no-requests">
              <button className="button is-link">
                <FontAwesomeIcon icon={faChampagneGlasses} /> No Requests!
              </button>
            </div>
          ) : (
            requests.signinrequests.map((request) => (
              <article class="message is-link" key={request.id}>
                <div class="message-body">
                  <div className="columns mapped-cols">
                    <div className="column student-desc">
                      <h1 className="request-title">{request.name}</h1>
                      <span class="tag is-link">
                        {request.department === "No"
                          ? "No Dept."
                          : request.department}
                      </span>
                      <span class="tag is-link">
                        {parseTimestamp(request.requested_action.split(",")[1])}
                      </span>
                    </div>
                    <div className="column btn-decisions">
                      <button className="button is-success btn-grant">
                        <FontAwesomeIcon icon={faCheck} /> Grant
                      </button>
                      <button className="button is-danger btn-deny">
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
      <div className="column requests-col is-half">
        <div class="columns bulk-cols">
          <div class="column bulk-col1">
            <span className="tag is-warning td-bold">Sign Out Requests</span>
          </div>
          <div class="column bulk-col2">
            <button className="button is-success btn-grant">
              <FontAwesomeIcon icon={faCheck} /> Grant All
            </button>
            <button className="button is-danger btn-deny">
              <FontAwesomeIcon icon={faX} /> Deny All
            </button>
          </div>
        </div>

        <div class="notification is-link is-light">
          {requests.signoutrequests.length === 0 ? (
            <div class="no-requests">
              <button className="button is-link">
                <FontAwesomeIcon icon={faChampagneGlasses} /> No Requests!
              </button>
            </div>
          ) : (
            requests.signoutrequests.map((request) => (
              <article class="message is-link" key={request.id}>
                <div class="message-body">
                  <div className="columns mapped-cols">
                    <div className="column student-desc">
                      <h1 className="request-title">{request.name}</h1>
                      <span class="tag is-link">
                        {request.department === "No"
                          ? "No Dept."
                          : request.department}
                      </span>
                      <span class="tag is-link">
                        {parseTimestamp(request.requested_action.split(",")[1])}
                      </span>
                    </div>
                    <div className="column btn-decisions">
                      <button className="button is-success btn-grant">
                        <FontAwesomeIcon icon={faCheck} /> Grant
                      </button>
                      <button className="button is-danger btn-deny">
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
    </div>
  ) : (
    <div class="loading-wrapper">
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
