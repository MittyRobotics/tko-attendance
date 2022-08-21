import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { QRCodeSVG } from "qrcode.react";

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
            <QRCodeSVG
              value={user.google_id}
              size={256}
              fgColor={"#74ABEE"}
              level={"H"}
              imageSettings={{
                src: require("../../img/blurple_tko_head.png"),
                height: 64,
                width: 64,
                excavate: true,
              }}
            />
          </div>
          <h1 className="modal-title">{user.name}</h1>
          <br></br>
          <button
            className="button is-link is-light"
            onClick={() => setQrClicked(false)}
          >
            <FontAwesomeIcon icon={faCircleXmark} /> Close
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
