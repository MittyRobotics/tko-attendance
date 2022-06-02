import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Login from "./views/Login";
import Home from "./views/Home";
import QRScanPage from "./views/QRScanPage";
import ReactLoading from "react-loading";
import RosterPage from "./views/RosterPage";
import AttendancePage from "./views/AttendancePage";
import RequestsPage from "./views/RequestsPage";
import NotFoundPage from "./views/NotFoundPage";

function App() {
  const [user, setUser] = React.useState(null);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      fetch(process.env.REACT_APP_SERVER_URL + "/auth/login/success", {
        method: "GET",
        credentials: "include",
        mode: "cors",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Access-Control-Allow-Credentials": true,
        },
      })
        .then((response) => {
          if (response.status === 401) {
            return {
              user: false,
            };
          }
          return response.json();
        })
        .then((responseJson) => {
          if (!responseJson.user) {
            setUser(false);
          }
          setUser(responseJson.user);
        });
    } else {
      setUser(false);
    }
  }, []);

  if (user === null) {
    return (
      <div className="loading-bars">
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
            user && user.admin ? <QRScanPage /> : <Navigate to="/" replace />
          }
        />
        <Route
          path="roster"
          element={
            user && user.admin ? <RosterPage /> : <Navigate to="/" replace />
          }
        />
        <Route
          path="attendance"
          element={
            user && user.admin ? (
              <AttendancePage />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="requests"
          element={
            user && user.admin ? <RequestsPage /> : <Navigate to="/" replace />
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
