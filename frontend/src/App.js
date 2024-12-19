import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import PlayerPage from "./components/PlayerPage";
import FieldOwnerDashboard from "./components/FieldOwnerDashboard";
import Register from "./components/Register";
import Home from "./pages/homePage";
import History_MatchJoined from "./pages/History_Matchjoined";
import History_FieldBooked from "./pages/History_FieldBooked";
import Login from "./pages/login";
import Report from "./pages/report";
import FieldDetail from "./components/common/FieldDetail";
import FieldBookied from "./pages/fieldBookied"; // Import FieldBookied
import Personal from "./pages/Personal"; // Import trang cá nhân

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("isAuthenticated") === "true"
  );
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole"));

  useEffect(() => {
    localStorage.setItem("isAuthenticated", isAuthenticated);
    localStorage.setItem("userRole", userRole);
  }, [isAuthenticated, userRole]);

  const ProtectedRoute = ({ element, role }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    if (role && userRole !== role) {
      return <Navigate to="/" />;
    }
    return element;
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
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

        {/* Protected Routes */}
        <Route
          path="/field-owner-dashboard"
          element={
            <ProtectedRoute
              element={<FieldOwnerDashboard />}
              role="field_owner"
            />
          }
        />
        <Route
          path="/player-page"
          element={<ProtectedRoute element={<PlayerPage />} role="player" />}
        />
        <Route
          path="/fieldBookied"
          element={<ProtectedRoute element={<FieldBookied />} role="player" />}
        />
        <Route
          path="/personal"
          element={<ProtectedRoute element={<Personal />} />}
        />
        <Route
          path="/fieldDetail"
          element={<ProtectedRoute element={<FieldDetail />} />}
        />
        <Route
          path="/History_MatchJoined"
          element={<ProtectedRoute element={<History_MatchJoined />} />}
        />
        <Route
          path="/History_FieldBooked"
          element={<ProtectedRoute element={<History_FieldBooked />} />}
        />
        <Route
          path="/Report"
          element={<ProtectedRoute element={<Report />} role="field_owner" />}
        />
      </Routes>
    </Router>
  );
};

export default App;
