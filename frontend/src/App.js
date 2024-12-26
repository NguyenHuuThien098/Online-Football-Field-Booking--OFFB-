import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import FieldOwnerDashboard from "./components/FieldOwnerDashboard";
import Register from "./components/Register";
import AvailableField from "./pages/availableField";
import OpenMatch from "./pages/openMatch";
import HistoryMatchJoined from "./pages/historyMatchjoined";
import HistoryFieldBooked from "./pages/historyFieldBooked";
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
    localStorage.setItem("isAuthenticated", isAuthenticated.toString());
    localStorage.setItem("userRole", userRole || "");
  }, [isAuthenticated, userRole]);

  const ProtectedRoute = ({ element, role }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    if (role && !role.includes(userRole)) {
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
              <AvailableField />
            </MainLayout>
          }
        />
        <Route
          path="/openMatch"
          element={
            <MainLayout>
              <OpenMatch />
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
                role={["field_owner"]}
              />
            </MainLayout>
          }
        />
        <Route
          path="/fieldBookied"
          element={
            <MainLayout>
              <ProtectedRoute
                element={<FieldBookied />}
                role={["player", "field_owner"]}
              />
            </MainLayout>
          }
        />
        <Route
          path="/personal"
          element={
            <MainLayout>
              <ProtectedRoute
                element={<Personal />}
                role={["player", "field_owner"]}
              />
            </MainLayout>
          }
        />
        <Route
          path="/fieldDetail"
          element={
            <MainLayout>
              <ProtectedRoute
                element={<FieldDetail />}
                role={["player", "field_owner"]}
              />
            </MainLayout>
          }
        />
        <Route
          path="/Report"
          element={
            <MainLayout>
              <ProtectedRoute
                element={<Report />}
                role={["field_owner"]} />
            </MainLayout>
          }
        />
        <Route
          path="/historyMatchJoined"
          element={
            <MainLayout>
              <ProtectedRoute
                element={<HistoryMatchJoined />}
                role={["player", "field_owner"]}
              />
            </MainLayout>
          }
        />
        <Route
          path="/historyFieldBooked"
          element={
            <MainLayout>
              <ProtectedRoute
                element={<HistoryFieldBooked />}
                role={["player", "field_owner"]}
              />
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
