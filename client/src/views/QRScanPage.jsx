import React, { useState } from "react";
import QrReader from "react-qr-scanner";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleLeft } from "@fortawesome/free-solid-svg-icons";

import "bulma/css/bulma.min.css";
import "animate.css";
import "hover.css";
import "./Home.css";

function QRScanPage() {
  const blinkSuccess = () => {
    document.getElementById("qr-wrapper").classList.add("blink");
    setTimeout(() => {
      document.getElementById("qr-wrapper").classList.remove("blink");
    }, 100);
  };
  const blinkFail = () => {
    document.getElementById("qr-wrapper").classList.add("blink-red");
    setTimeout(() => {
      document.getElementById("qr-wrapper").classList.remove("blink-red");
    }, 100);
  };

  const [message, setMessage] = useState("");

  const passToBackend = (data) => {
    fetch(process.env.REACT_APP_SERVER_URL + `/user/scan/${data}`, {
      method: "POST",
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
          blinkSuccess();
        } else {
          blinkFail();
        }
        setMessage(data.message);
      });
  };

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
          <h1 className="name block">QR Scanner</h1>
          <h1 className="email">
            Hold scanner in front of QR code to sign students in and out.
          </h1>
        </div>
        <div id="qr-wrapper" className="container qr-wrapper block">
          <QrReader
            onScan={(data) => {
              if (data !== null) passToBackend(data);
            }}
            onError={(err) => {}}
            delay={2000}
            style={{ maxHeight: "50vh", margin: "0 auto" }}
          />
        </div>
        <div className="container qr-message">
          <h1 id="qr-msg" className="email">
            {message}
          </h1>
        </div>
      </section>
    </div>
  );
}

export default QRScanPage;
