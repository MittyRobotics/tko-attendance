import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SettingsModal from "./components/SettingsModal";
import QRModal from "./components/QRModal";
import RequestModal from "./components/RequestModal";

import "bulma/css/bulma.min.css";
import "animate.css";
import "hover.css";
import "./Home.css";

function Home({ user }) {
  // console.log(user);

  const [signoutClicked, setSignoutClicked] = useState(false);
  const [settingsClicked, setSettingsClicked] = useState(false);
  const [qrClicked, setQrClicked] = useState(false);
  const [requestClicked, setRequestClicked] = useState(false);

  const navigate = useNavigate();

  const signout = () => {
    setSignoutClicked(true);
    setTimeout(() => {
      setSignoutClicked(false);
      window.location = process.env.REACT_APP_SERVER_URL + "/auth/logout";
    }, 1000);
  };

  const adminActions = (
    <div className="column">
      <div className="actions-card">
        <h2 className="actions-title">Admin</h2>
        <br></br>
        <button
          className="button is-warning block action-btn hvr-grow"
          onClick={() => navigate("/qrscan")}
        >
          QR Scanner
        </button>
        <br></br>
        <button className="button is-warning block action-btn hvr-grow">
          Sign In/Out Requests
        </button>
        <br></br>
        <button className="button is-info block action-btn hvr-grow">
          Student Roster
        </button>
        <br></br>
        <button className="button is-info block action-btn hvr-grow">
          Attendance Data
        </button>
        <br></br>
        <br></br>
        <button className="button is-danger is-light block action-btn hvr-grow">
          Signout All Students
        </button>
        <br></br>
      </div>
    </div>
  );

  return (
    <div>
      <section className="hero-pattern">
        <div className="container sign-out block">
          <button
            className="button is-link is-light settings-btn animate__animated animate__fadeIn"
            onClick={() => setSettingsClicked(true)}
          >
            Settings
          </button>
          <button
            className={
              "button is-danger animate__animated animate__fadeIn" +
              (signoutClicked ? " is-loading" : "")
            }
            onClick={() => signout()}
          >
            Log Out
          </button>
        </div>
        <div className="container user-info animate__animated animate__fadeInUp">
          {user.admin ? (
            <span className="tag is-success is-light">Admin</span>
          ) : null}
          <h1 className="name">{user.name}</h1>
          <h2 className="email">{user.email.split("@")[0]}</h2>
          <h3 className="department-grade">
            {user.department} Department | Grade {user.current_grade}
          </h3>
          <span className="tag is-info attendance-tag">
            {user.present ? "Signed In" : "Signed Out"}
          </span>
        </div>
        <div className="columns animate__animated animate__fadeInUp">
          <div className="column">
            <div className="actions-card">
              <h2 className="actions-title">Student</h2>
              <br></br>
              <button
                className="button is-warning block action-btn hvr-grow"
                onClick={() => setQrClicked(true)}
              >
                QR Code
              </button>
              <br></br>
              <button
                className="button is-warning block action-btn hvr-grow"
                onClick={() => setRequestClicked(true)}
              >
                Request Sign In/Out
              </button>
              <br></br>
            </div>
          </div>
          {user.admin ? adminActions : null}
        </div>
        <SettingsModal
          user={user}
          settingsClicked={settingsClicked}
          setSettingsClicked={setSettingsClicked}
        />
        <QRModal
          user={user}
          qrClicked={qrClicked}
          setQrClicked={setQrClicked}
        />
        <RequestModal
          user={user}
          requestClicked={requestClicked}
          setRequestClicked={setRequestClicked}
        />
      </section>
    </div>
  );
}

export default Home;
