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
import AvailableField from "./pages/availableField";
import OpenMatch from "./pages/openMatch";
import History_MatchJoined from "./pages/History_Matchjoined";
import History_FieldBooked from "./pages/History_FieldBooked";
import Login from "./pages/login";
import Report from "./pages/report";
import FieldDetail from "./components/common/FieldDetail";
import FieldBookied from "./pages/fieldBookied"; // Import FieldBookied
import Personal from "./pages/Personal"; // Import trang cá nhân
import MainLayout from "./layouts/MainLayout";
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
            <MainLayout>
              <AvailableField
                setIsAuthenticated={setIsAuthenticated}
                setUserRole={setUserRole}
              />
            </MainLayout>
          }
        />
        <Route
          path="/openMatch"
          element={
            <MainLayout>
              <OpenMatch
                setIsAuthenticated={setIsAuthenticated}
                setUserRole={setUserRole}
              />
            </MainLayout>
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
            <MainLayout>

              <ProtectedRoute
                element={<FieldOwnerDashboard />}
                role="field_owner"
              />
            </MainLayout>
          }
        />
        <Route
          path="/player-page"
          element={<ProtectedRoute element={
            <MainLayout>
              <PlayerPage />
            </MainLayout>
          } role="player" />}
        />
        <Route
          path="/fieldBookied"
          element={<ProtectedRoute element={
            <MainLayout>
              <FieldBookied />
            </MainLayout>
          } role="player" />}
        />
        <Route
          path="/personal"
          element={
            <MainLayout>
              <ProtectedRoute element={<Personal />} />
            </MainLayout>
          }
        />
        <Route
          path="/fieldDetail"
          element={<ProtectedRoute element={
            <MainLayout>
              <FieldDetail />
            </MainLayout>
          } />}
        />
        <Route
          path="/History_MatchJoined"
          element={<ProtectedRoute element={
            <MainLayout>
              <History_MatchJoined />
            </MainLayout>
          } />}
        />
        <Route
          path="/History_FieldBooked"
          element={<ProtectedRoute element={
            <MainLayout>
              <History_FieldBooked />
            </MainLayout>
          } />}
        />
        <Route
          path="/Report"
          element={<ProtectedRoute element={
            <MainLayout>
              <Report />
            </MainLayout>
          } role="field_owner" />}
        />
      </Routes>
    </Router>
  );
};

export default App;
