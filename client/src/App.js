import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Login from "./views/Login";
import Home from "./views/Home";
import QRScanner from "./views/QRScanner";
import ReactLoading from "react-loading";

function App() {
  const [user, setUser] = React.useState(null);

  useEffect(() => {
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
        return response.json();
      })
      .then((responseJson) => {
        console.log(responseJson);
        setUser(responseJson.user);
      });
  }, []);

  if (user === null) {
    return (
      <div class="loading-bars">
        <ReactLoading type="spin" color="teal" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Home user={user} /> : <Login />} />
        <Route
          path="qrscan"
          element={
            user ? <QRScanner user={user} /> : <Navigate to="/" replace />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
