import React, { useRef, useEffect } from "react";
import "bulma/css/bulma.min.css";
import "./Login.css";

function Login() {
  const divRef = useRef(null);

  useEffect(() => {
    if (divRef.current) {
      window.google.accounts.id.initialize({
        client_id:
          "859260869527-nt54jdscsnm70asufovfuc35prua0m9c.apps.googleusercontent.com",
        callback: (res, error) => {
          fetch(
            process.env.REACT_APP_SERVER_URL + `/auth/google/one-tap/callback`,
            {
              method: "POST",
              credentials: "include",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                Accept: "application/json",
                "Content-Type": "application/json",
                "Access-Control-Allow-Credentials": true,
              },
              body: JSON.stringify({
                credential: res.credential,
                clientId: res.clientId,
                select_by: res.select_by,
              }),
            }
          )
            .then((res) => res.json())
            .then((data) => {
              if (data.token) {
                localStorage.setItem("token", data.token);
                window.location.reload();
              }
            });
        },
      });
      window.google.accounts.id.renderButton(divRef.current, {
        theme: "outline",
        size: "large",
        type: "standard",
      });
      window.google.accounts.id.prompt();
    }
  }, []);

  return (
    <div>
      <section className="login-pat">
        <div className="login-img">
          <img src={require("../img/tko_logo.png")} alt="TKO Logo" />
        </div>

        <h1 className="page-title">Attendance</h1>

        <div className="login-msg">
          <div className="google-auth-wrapper">
            <div className="block tag-wrapper">
              <span className="tag is-warning">New & Returning Students</span>
            </div>
            <div className="block">
              <div ref={divRef}></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Login;
