
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
// import Homepage from './components/Homepage_temp'; // Import đúng Homepage
import PlayerPage from "./components/PlayerPage";
import FieldOwnerDashboard from "./components/FieldOwnerDashboard";
// import Login from './components/Login'; // Nhập component Login
import Register from "./components/Register"; // Nhập component Register

import Home from "./pages/homeForQuest";
import History_MatchJoined from "./pages/History_Matchjoined";
import History_FieldBooked from "./pages/History_FieldBooked";
import Login from './pages/login';
import Report from "./pages/report";
import FieldDetail from "./components/common/FieldDetail";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("isAuthenticated") === "true"
  );
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole"));

  useEffect(() => {
    localStorage.setItem("isAuthenticated", isAuthenticated);
    localStorage.setItem("userRole", userRole);
  }, [isAuthenticated, userRole]);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Home
              setIsAuthenticated={setIsAuthenticated}
              setUserRole={setUserRole}
            />
          }
        />
        <Route
          path="/login"
          element={
            <Login
              setIsAuthenticated={setIsAuthenticated}
              setUserRole={setUserRole}
            />
          }
        />
        <Route
          path="/register"
          element={
            <Register
              setIsAuthenticated={setIsAuthenticated}
              setUserRole={setUserRole}
            />
          }
        />
        <Route
          path="/field-owner-dashboard"
          element={
            isAuthenticated && userRole === "field_owner" ? (
              <FieldOwnerDashboard />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/player-page"
          element={
            isAuthenticated && userRole === "player" ? (
              <PlayerPage />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
          path="/fieldDetail/"
          element={<FieldDetail />}
        />

        {/* <Route 
                    path="/history" 
                    element={isAuthenticated ? <History /> : <Navigate to="/login" />} 
                /> */}
        <Route path="/History_MatchJoined" element={<History_MatchJoined />} />
        <Route path="/History_FieldBooked" element={<History_FieldBooked />} />
        <Route path="/Report" element={<Report />} />
      </Routes>
    </Router>
  );
};

export default App;
