import React, { useEffect, useState } from "react";
import ReactLoading from "react-loading";

import "bulma/css/bulma.min.css";
import "animate.css";
import "hover.css";
import "./Home.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleLeft } from "@fortawesome/free-solid-svg-icons";
import RosterModal from "./components/RosterModal";

function RosterPage() {
  const [userList, setUserList] = useState([]);
  const [presentCount, setPresentCount] = useState([]);

  const [rosterClicked, setRosterClicked] = useState([false, "", "", [""]]);

  const getUserList = () => {
    fetch(process.env.REACT_APP_SERVER_URL + "/user", {
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
          setUserList(data.userList);
          var res = { yes: 0, no: 0 };
          data.userList.forEach(function (v) {
            res[v.present === true ? "yes" : "no"] =
              (res[v.present === true ? "yes" : "no"] || 0) + 1;
          });
          console.log(res);
          setPresentCount([res["yes"], res["no"] + res["yes"]]);
        } else {
          window.location = "/";
        }
      });
  };

  useEffect(() => {
    getUserList();
  }, []);

  const tableElement = (
    <div className="table-container">
      <table className="table is-fullwidth">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Department</th>
            <th>Grade</th>
            <th>Total Hours</th>
            <th>Present</th>
            <th>Admin</th>
          </tr>
        </thead>
        <tbody>
          {userList.map((user) => {
            return (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td className="td-bold">{user.name}</td>
                <td>
                  <span
                    className={
                      "tag is-light " +
                      (user.department === "No" ? "is-danger" : "is-link")
                    }
                    onClick={() => {
                      setRosterClicked([
                        true,
                        "department",
                        user.name,
                        [
                          "FRC Programming",
                          "FRC Electrical",
                          "FRC Mechanical",
                          "JV Programming",
                          "JV Electrical",
                          "JV Mechanical",
                          "Operations",
                          "No",
                        ],
                        user.id,
                      ]);
                    }}
                  >
                    {user.department === "No" ? "Not Set" : user.department}
                  </span>
                </td>
                <td>
                  <span
                    className={
                      "tag is-light " +
                      (user.current_grade === -1 ? "is-danger" : "is-link")
                    }
                    onClick={() => {
                      setRosterClicked([
                        true,
                        "current_grade",
                        user.name,
                        [9, 10, 11, 12, -1],
                        user.id,
                      ]);
                    }}
                  >
                    {user.current_grade === -1 ? "Not Set" : user.current_grade}
                  </span>
                </td>
                <td className="td-italics">{user.total_hours}</td>
                <td>
                  <span
                    className={
                      "tag is-light " + (user.present ? "is-link" : "is-danger")
                    }
                    onClick={() => {
                      setRosterClicked([
                        true,
                        "present",
                        user.name,
                        ["true", "false"],
                        user.id,
                      ]);
                    }}
                  >
                    {user.present ? "true" : "false"}
                  </span>
                </td>
                <td>
                  <span
                    className={
                      "tag is-light " + (user.admin ? "is-danger" : "is-info")
                    }
                    onClick={() => {
                      setRosterClicked([
                        true,
                        "admin",
                        user.name,
                        ["true", "false"],
                        user.id,
                      ]);
                    }}
                  >
                    {user.admin ? "true" : "false"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
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
          <h1 className="name block">Student Roster</h1>
          {presentCount.length === 2 ? (
            <h1 className="email">
              Students Present:{" "}
              <span className="td-bold">{presentCount[0]}</span> | Students
              Total: <span className="td-bold">{presentCount[1]}</span>
            </h1>
          ) : null}
        </div>
        <div className="roster-table">
          {userList.length > 0 ? (
            tableElement
          ) : (
            <div className="loading-wrapper">
              <ReactLoading type="bars" color="teal" />
            </div>
          )}
        </div>
      </section>
      <RosterModal
        getUserList={getUserList}
        rosterClicked={rosterClicked}
        setRosterClicked={setRosterClicked}
      />
    </div>
  );
}

export default RosterPage;
