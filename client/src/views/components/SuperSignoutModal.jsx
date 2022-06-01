import { faSkull } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";

function SuperSignoutModal({ user, ssmClicked, setSsmClicked }) {
  const [loading, setLoading] = useState(false);
  const [checkboxSelected, setCheckboxSelected] = useState(false);

  const handleCheckboxChange = () => {
    setCheckboxSelected(!checkboxSelected);
  };

  const closeModal = () => {
    setLoading(false);
    setCheckboxSelected(false);
    setSsmClicked(false);
  };

  const signOutAll = () => {
    if (user.admin) {
      setLoading(true);
      fetch(process.env.REACT_APP_SERVER_URL + "/user/signout", {
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
            closeModal();
          } else {
            alert("supersignout modal: " + data.message);
            closeModal();
          }
        });
    }
  };

  return (
    <div id="qr-modal" className={"modal " + (ssmClicked ? "is-active" : "")}>
      <div className="modal-background" onClick={() => closeModal()}></div>
      <div className="modal-content">
        <div className="box">
          <h1 className="modal-title">Are You Sure?</h1>
          <h1 className="modal-desc">
            Signing out all students is a{" "}
            <span className="destructive">non-reversible</span>,{" "}
            <span className="destructive">resource-intensive</span> action.
            Depending on the number of students, it may take a few minutes to
            complete.
          </h1>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={checkboxSelected}
              onChange={() => handleCheckboxChange()}
            />
            This checkbox adds unnecessary tension
          </label>
          <br></br>
          <br></br>
          <button
            className={"button is-danger" + (loading ? " is-loading" : "")}
            onClick={() => signOutAll()}
            disabled={!checkboxSelected}
          >
            <FontAwesomeIcon icon={faSkull} /> Confirm
          </button>
        </div>
      </div>
      <button
        className="modal-close is-large"
        aria-label="close"
        onClick={() => closeModal()}
      ></button>
    </div>
  );
}

export default SuperSignoutModal;
