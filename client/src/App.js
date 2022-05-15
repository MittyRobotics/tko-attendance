import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./views/Login";
import Home from "./views/Home";

class App extends React.Component {
  state = {
    user: {},
    authenticated: false,
    error: null,
  };

  componentDidMount() {
    fetch(process.env.REACT_APP_SERVER_URL + "/auth/login/success", {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true,
      },
    })
      .then((response) => {
        if (response.status === 200) return response.json();
        throw new Error("failed to authenticate user");
      })
      .then((responseJson) => {
        this.setState({
          authenticated: true,
          user: responseJson.user,
        });
      })
      .catch((error) => {
        this.setState({
          authenticated: false,
          error: "failed to authenticate user",
        });
      });
  }

  render() {
    return (
      <div>
        <Router>
          <Routes>
            <Route
              path="/"
              exact={true}
              element={
                this.state.authenticated ? (
                  <Home
                    user={this.state.user}
                    authenticated={this.state.authenticated}
                  />
                ) : (
                  <Login />
                )
              }
            />
          </Routes>
        </Router>
      </div>
    );
  }
}

export default App;
