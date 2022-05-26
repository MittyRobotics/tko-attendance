import React from "react";
import "bulma/css/bulma.min.css";
import "./Login.css";

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      google_button_clicked: false,
    };
  }

  loginButton() {
    this.setState({ google_button_clicked: true });
    setTimeout(() => {
      this.setState({ google_button_clicked: false });
      window.location = process.env.REACT_APP_SERVER_URL + "/auth/google";
    }, 1000);
  }

  render() {
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
                <button
                  id="google-auth-btn-id"
                  className={
                    "button is-success is-light google-auth-btn is-outlined" +
                    (this.state.google_button_clicked ? " is-loading" : "")
                  }
                  onClick={() => this.loginButton()}
                >
                  Log in with Google
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

export default Login;
