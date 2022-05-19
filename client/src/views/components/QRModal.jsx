import React from "react";
import QRCode from "react-qr-code";

function QRModal({ user, qrClicked, setQrClicked }) {
  return (
    <div id="qr-modal" className={"modal " + (qrClicked ? "is-active" : "")}>
      <div
        className="modal-background"
        onClick={() => setQrClicked(false)}
      ></div>
      <div className="modal-content">
        <div className="box">
          <div className="qr-code-container">
            <QRCode value={user.google_id} size={250} />
          </div>
          <h1 className="modal-title">{user.name}</h1>
          <br></br>
          <button
            className="button is-link is-light"
            onClick={() => setQrClicked(false)}
          >
            Close
          </button>
        </div>
      </div>
      <button
        className="modal-close is-large"
        aria-label="close"
        onClick={() => setQrClicked(false)}
      ></button>
    </div>
  );
}

export default QRModal;
