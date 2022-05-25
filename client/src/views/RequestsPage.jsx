import React, { useState } from "react";

import "bulma/css/bulma.min.css";
import "animate.css";
import "hover.css";
import "./Home.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleLeft } from "@fortawesome/free-solid-svg-icons";

function RequestsPage({ user }) {
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
        <div className="roster-table"></div>
      </section>
    </div>
  );
}

export default RequestsPage;
