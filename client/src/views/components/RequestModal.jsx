import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";

function RequestModal({ user, requestClicked, setRequestClicked }) {
  const [request, setRequest] = useState(user.present ? "Sign Out" : "Sign In");
  const [msg, setMsg] = useState("");
  const [msgSuccess, setMsgSuccess] = useState(true);
  const [submitClicked, setSubmitClicked] = useState(false);

  const handleRequestChange = (e) => {
    let { value } = e.target;

    setRequest(value);
  };

  const closeWindow = () => {
    setMsg("");
    setMsgSuccess(true);
    setRequest(user.present ? "Sign Out" : "Sign In");
    document.getElementById("select-request").value = user.present
      ? "Sign Out"
      : "Sign In";
    setRequestClicked(false);
  };

  const handleSubmit = () => {
    setSubmitClicked(true);
    setMsg("");
    fetch(process.env.REACT_APP_SERVER_URL + "/request", {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        requested_action: request,
        id: user.id,
      }),
    })
      .then((response) => {
        if (response.status === 200) return response.json();
        setSubmitClicked(false);
        throw new Error("failed to authenticate user");
      })
      .then((responseJson) => {
        if (responseJson.success === false) {
          setMsgSuccess(false);
          setMsg(responseJson.message);
        } else {
          setMsgSuccess(true);
          setMsg(responseJson.message);
        }
        setSubmitClicked(false);
      });
  };

  return (
    <div
      id="qr-modal"
      className={"modal " + (requestClicked ? "is-active" : "")}
    >
      <div className="modal-background" onClick={() => closeWindow()}></div>
      <div className="modal-content">
        <div className="box">
          <h1 className="modal-title">
            Request to {user.present ? "Sign Out" : "Sign In"}?
          </h1>
          <br></br>
          <h1 className="modal-desc">
            You may request to{" "}
            <span className="destructive">
              {user.present ? "sign out" : "sign in"}
            </span>{" "}
            of a meeting here.
          </h1>
          <div className="select is-primary">
            <select id="select-request" onChange={handleRequestChange}>
              {user.present ? (
                <option>Sign Out</option>
              ) : (
                <option>Sign In</option>
              )}

              <option>Cancel Current Request</option>
            </select>
          </div>
          <br></br>

          <button
            className={
              "button is-link is-light save-btn" +
              (submitClicked ? " is-loading" : "")
            }
            onClick={() => handleSubmit()}
          >
            <FontAwesomeIcon icon={faPaperPlane} /> Send Request
          </button>
          <h1
            className="req-msg"
            style={{
              color: msgSuccess ? "green" : "red",
              borderColor: msgSuccess ? "green" : "red",
            }}
          >
            {msg}
          </h1>
        </div>
      </div>
      <button
        className="modal-close is-large"
        aria-label="close"
        onClick={() => closeWindow()}
      ></button>
    </div>
  );
}

export default RequestModal;
