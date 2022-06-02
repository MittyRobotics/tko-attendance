import React, { useState } from "react";
import SettingsModal from "./components/SettingsModal";
import QRModal from "./components/QRModal";
import RequestModal from "./components/RequestModal";

import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/shift-toward.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faQrcode,
  faArrowRightToBracket,
  faTrophy,
  faClipboardUser,
  faDatabase,
  faBolt,
  faGear,
  faArrowRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

import "bulma/css/bulma.min.css";
import "animate.css";
import "hover.css";
import "./Home.css";
import SuperSignoutModal from "./components/SuperSignoutModal";

function Home({ user }) {
  const [signoutClicked, setSignoutClicked] = useState(false);
  const [settingsClicked, setSettingsClicked] = useState(false);
  const [qrClicked, setQrClicked] = useState(false);
  const [requestClicked, setRequestClicked] = useState(false);
  const [adminPresentTagClicked, setAdminPresentTagClicked] = useState(false);
  const [ssmClicked, setSsmClicked] = useState(false);

  const signout = () => {
    setSignoutClicked(true);
    setTimeout(() => {
      setSignoutClicked(false);
      localStorage.removeItem("token");
      window.location.reload();
    }, 1000);
  };

  const adminActions = (
    <div className="column">
      <div className="actions-card">
        <h2 className="actions-title">Admin</h2>
        <br></br>
        <button
          className="button is-warning block action-btn hvr-grow"
          onClick={() => (window.location = "/qrscan")}
        >
          <FontAwesomeIcon icon={faQrcode} /> QR Scanner
        </button>
        <br></br>
        <button
          className="button is-warning block action-btn hvr-grow"
          onClick={() => (window.location = "/requests")}
        >
          <FontAwesomeIcon icon={faArrowRightToBracket} /> Requests
        </button>
        <br></br>
        <button
          className="button is-link block action-btn hvr-grow"
          onClick={() => (window.location = "/roster")}
        >
          <FontAwesomeIcon icon={faClipboardUser} /> Student Roster
        </button>
        <br></br>
        <button
          className="button is-link block action-btn hvr-grow"
          onClick={() => (window.location = "/attendance")}
        >
          <FontAwesomeIcon icon={faDatabase} /> Attendance Data
        </button>
        <br></br>
        <br></br>
        <button
          className="button is-danger is-light block action-btn hvr-grow"
          onClick={() => setSsmClicked(true)}
        >
          <FontAwesomeIcon icon={faBolt} /> Sign Out All
        </button>
        <br></br>
      </div>
    </div>
  );

  const adminToggle = () => {
    if (user.admin) {
      setAdminPresentTagClicked(true);
      fetch(process.env.REACT_APP_SERVER_URL + `/user/update/${user.id}`, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          google_id: user.google_id,
          togglePresent: true,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setAdminPresentTagClicked(false);
            window.location.reload();
          }
        });
    }
  };

  return (
    <div>
      <section className="hero-pattern">
        <div className="container sign-out block">
          <button
            className="button is-link is-light settings-btn animate__animated animate__fadeIn"
            onClick={() => setSettingsClicked(true)}
          >
            <FontAwesomeIcon icon={faGear} /> Settings
          </button>
          <button
            className={
              "button is-danger animate__animated animate__fadeIn" +
              (signoutClicked ? " is-loading" : "")
            }
            onClick={() => signout()}
          >
            <FontAwesomeIcon icon={faArrowRightFromBracket} /> Log Out
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
          <span
            className={
              "tag is-info attendance-tag" +
              (adminPresentTagClicked ? " loading-span" : "")
            }
            onClick={() => adminToggle()}
          >
            {user.present ? "Signed In" : "Signed Out"}
          </span>
        </div>
        <div className="columns home-actions animate__animated animate__fadeInUp">
          <div className="column">
            <div className="actions-card">
              <h2 className="actions-title">Student</h2>
              <br></br>
              <button
                className="button is-warning block action-btn hvr-grow"
                onClick={() => setQrClicked(true)}
              >
                <FontAwesomeIcon icon={faQrcode} /> QR Code
              </button>
              <br></br>
              <button
                className="button is-warning block action-btn hvr-grow"
                onClick={() => setRequestClicked(true)}
              >
                <FontAwesomeIcon
                  icon={
                    user.present
                      ? faArrowRightFromBracket
                      : faArrowRightToBracket
                  }
                />{" "}
                Request {user.present ? "Sign Out" : "Sign In"}
              </button>
              <br></br>
              <Tippy
                content="Under Construction ™ ® ©"
                animation="shift-toward"
              >
                <div>
                  <button className="button is-link block action-btn" disabled>
                    <FontAwesomeIcon icon={faTrophy} /> Achievements
                  </button>
                </div>
              </Tippy>
            </div>
          </div>
          <br></br>

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
        <SuperSignoutModal
          user={user}
          ssmClicked={ssmClicked}
          setSsmClicked={setSsmClicked}
        />
      </section>
    </div>
  );
}

export default Home;
