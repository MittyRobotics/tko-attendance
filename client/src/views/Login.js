import React from "react";

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.callBackendAPI();
  }

  callBackendAPI = async () => {
    const response = await fetch("/login");
    const body = await response.json();

    if (response.status !== 200) {
      throw Error(body.message);
    }
    return body;
  };

  render() {
    return (
      <div>
        <h1>Login</h1>
        <a href="/login">Sign in with google</a>
      </div>
    );
  }
}

export default Login;
