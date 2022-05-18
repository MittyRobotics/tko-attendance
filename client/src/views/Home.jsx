import React, { useState } from "react";
import "bulma/css/bulma.min.css";
import "animate.css";
import "./Home.css";

function Home({ user, authenticated }) {
  console.log(user);

  const [signoutClicked, setSignoutClicked] = useState(false);
  const [settingsClicked, setSettingsClicked] = useState(false);

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
        <button className="button is-warning block action-btn">
          QR Scanner
        </button>
        <br></br>
        <button className="button is-warning block action-btn">
          Signout Requests
        </button>
        <br></br>
        <button className="button is-info block action-btn">
          Student Roster
        </button>
        <br></br>
        <button className="button is-info block action-btn">
          Attendance Data
        </button>
        <br></br>
        <br></br>
        <button className="button is-danger is-light block action-btn">
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
            className="button is-link is-light settings-btn"
            onClick={() => setSettingsClicked(true)}
          >
            Settings
          </button>
          <button
            className={
              "button is-danger animate__animated animate__jackInTheBox" +
              (signoutClicked ? " is-loading" : "")
            }
            onClick={() => signout()}
          >
            Sign Out
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
        </div>
        <div className="columns">
          <div className="column">
            <div className="actions-card">
              <h2 className="actions-title">Student</h2>
              <br></br>
              <button className="button is-warning block action-btn">
                QR Code
              </button>
              <br></br>
              <button className="button is-warning block action-btn">
                Request Signout
              </button>
              <br></br>
            </div>
          </div>
          {user.admin ? adminActions : null}
        </div>
        <div class={"modal" + (settingsClicked ? "is-active" : "")}>
          <div
            class="modal-background"
            onClick={() => setSettingsClicked(false)}
          ></div>
          <div class="modal-content">
            <div class="box">test</div>
          </div>
          <button
            class="modal-close is-large"
            aria-label="close"
            onClick={() => setSettingsClicked(false)}
          ></button>
        </div>
      </section>
    </div>
  );
}

export default Home;
