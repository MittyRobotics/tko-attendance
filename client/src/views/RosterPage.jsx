import React, { useEffect, useState } from "react";
import ReactLoading from "react-loading";
import $ from "jquery";

import "bulma/css/bulma.min.css";

import "datatables.net-bm/css/dataTables.bulma.min.css";
import "datatables.net-bm/js/dataTables.bulma.min.js";
// import "datatables.net-buttons-bm/js/buttons.bulma.min.js";
// import "datatables.net-buttons-bm/css/buttons.bulma.min.css";

import "animate.css";
import "hover.css";
import "./Home.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleLeft } from "@fortawesome/free-solid-svg-icons";
import RosterModal from "./components/RosterModal";

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

require("jszip");
require("datatables.net-buttons-bm")();
require("datatables.net-buttons/js/buttons.html5.js")();
require("datatables.net-buttons/js/buttons.print.js")();

function RosterPage() {
  const [userList, setUserList] = useState([]);
  const [presentCount, setPresentCount] = useState([]);

  const [rosterClicked, setRosterClicked] = useState([false, "", "", [""]]);

  const getCurrentDateSimplified = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month}-${day}`;
  };

  const hoursToHoursMinutes = (num) => {
    var decimalTime = num;
    decimalTime = decimalTime * 60 * 60;
    var hours = Math.floor(decimalTime / (60 * 60));
    decimalTime = decimalTime - hours * 60 * 60;
    var minutes = Math.floor(decimalTime / 60);

    return [hours, minutes];
  };

  const getUserList = () => {
    fetch(process.env.REACT_APP_SERVER_URL + "/user", {
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
          var res = { yes: 0, no: 0 };
          data.userList.forEach(function (v) {
            res[v.present === true ? "yes" : "no"] =
              (res[v.present === true ? "yes" : "no"] || 0) + 1;
          });
          setPresentCount([res["yes"], res["no"] + res["yes"]]);
        } else {
          window.location = "/";
        }
      })
      .then(() => {
        if ($.fn.dataTable.isDataTable("#rosterTable")) {
          $("#rosterTable").DataTable().destroy();
        }
        $(() => {
          var table = $("#rosterTable").DataTable({
            // dom: "Bf",
            searching: true,
            info: false,
            paging: false,
            buttons: [
              "csv",
              {
                extend: "print",
                text: "Print",
                message: `Attendance Record: ${getCurrentDateSimplified()}`,
                title: "TKO Attendance",
              },
            ],
          });
          table
            .buttons()
            .container()
            .appendTo($("#rosterTable_filter", table.table().container()));
        });
      });
  };

  useEffect(() => {
    getUserList();
  }, []);

  const tableElement = (
    <div className="table-container">
      <table id="rosterTable" className="table is-fullwidth">
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
                      (user.department === "None" ? "is-danger" : "is-link")
                    }
                    onClick={() => {
                      setRosterClicked([
                        true,
                        "department",
                        user.name,
                        [
                          "FRC",
                          "JV",
                          "Mentor",
                        ],
                        user.id,
                      ]);
                    }}
                  >
                    {user.department === "None" ? "Not Set" : user.department}
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
                <td>
                  <span className="td-bold">
                    {hoursToHoursMinutes(user.total_hours)[0]}
                  </span>{" "}
                  Hrs.{" "}
                  <span className="td-bold">
                    {hoursToHoursMinutes(user.total_hours)[1]}
                  </span>{" "}
                  Min.
                </td>
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
