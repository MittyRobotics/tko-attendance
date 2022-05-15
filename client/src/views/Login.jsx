import React from "react";
import "bulma/css/bulma.min.css";
import "./Login.css";

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div>
        <h1>Login</h1>
        <a href={process.env.REACT_APP_SERVER_URL + "/auth/google"}>
          Sign in with google
        </a>
      </div>
    );
  }
}

export default Login;
