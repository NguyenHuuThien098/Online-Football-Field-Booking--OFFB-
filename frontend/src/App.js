import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import FieldOwnerDashboard from "./components/fieldOwner/FieldOwnerDashboard";
import Register from "./components/Login/Register";
import AvailableField from "./components/common/AvailableField";
import OpenMatch from "./components/common/OpenMatch";
import HistoryMatchJoined from "./components/LoginedUser/historyMatchjoined";
import HistoryFieldBooked from "./components/LoginedUser/historyFieldBooked";
import Login from "./pages/login";
import Report from "./components/fieldOwner/report";
import FieldDetail from "./components/common/FieldDetail";
import FieldBooked from "./components/LoginedUser/fieldBooked";
import Personal from "./components/LoginedUser/Personal";
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
                role={["field_owner"]}
              />
            </MainLayout>
          }
        />
        <Route
          path="/fieldBooked"
          element={
            <MainLayout>
              <ProtectedRoute
                element={<FieldBooked />}
                role={["player", "field_owner"]}
              />
            </MainLayout>
          }
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
          element={
            <MainLayout>
              <ProtectedRoute element={<FieldDetail />} />
            </MainLayout>
          }
        />
        <Route
          path="/Report"
          element={
            <MainLayout>
              <ProtectedRoute element={<Report />} role={["field_owner"]} />
            </MainLayout>
          }
        />
        <Route
          path="/historyMatchJoined"
          element={
            <MainLayout>
              <ProtectedRoute element={<HistoryMatchJoined />} />
            </MainLayout>
          }
        />
        <Route
          path="/historyFieldBooked"
          element={
            <MainLayout>
              <ProtectedRoute element={<HistoryFieldBooked />} />
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
