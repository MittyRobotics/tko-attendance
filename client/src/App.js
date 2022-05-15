import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import "./App.css";
import Landing from "./views/Landing";
import Login from "./views/Login";

const App = () => {
  return (
    <div>
      <Router>
        <nav>
          <ul>
            <li>
              <Link to="/">Landing</Link>
            </li>
            <li>
              <Link to="/login">Login</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" exact={true} element={<Landing />} />
          <Route path="/login" exact={true} element={<Login />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
