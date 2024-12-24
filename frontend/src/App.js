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
import History_MatchJoined from "./pages/History_Matchjoined";
import History_FieldBooked from "./pages/History_FieldBooked";
import Join_match from "./pages/Join_match";
import Login from "./pages/login";
import Report from "./pages/report";
import FieldDetail from "./components/common/FieldDetail";
import FieldBookied from "./pages/fieldBookied"; // Import FieldBookied
import Personal from "./pages/Personal"; // Import trang cá nhân
import MainLayout from "./layouts/MainLayout";
import Nofi from "./pages/Nofi";
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
          path="/Join_match"
          element={
            <MainLayout>
              <ProtectedRoute element={<Join_match />} />
            </MainLayout>
          }
        />
        <Route
          path="/Nofi"
          element={
            <MainLayout>
              <ProtectedRoute element={<Nofi />} />
            </MainLayout>
          }
        />
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
          path="/History_MatchJoined"
          element={
            <MainLayout>
              <ProtectedRoute element={<History_MatchJoined />} />
            </MainLayout>
          }
        />
<Route
          path="/History_FieldBooked"
          element={
            <MainLayout>
              <ProtectedRoute element={<History_FieldBooked />} />
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
      </Routes>
    </Router>
  );
};

export default App;
