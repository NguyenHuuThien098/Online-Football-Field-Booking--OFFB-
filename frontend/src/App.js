import React, { useState, useEffect } from "react";
import axios from 'axios';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Dashboard from "./components/fieldOwner/Dashboard";
import LargeField from "./components/fieldOwner/Field/LargeField";
import Register from "./components/UserManagerment/Register";
import AvailableField from "./components/common/AvailableField";
import OpenMatch from "./components/common/OpenMatch";
import HistoryMatchJoined from "./components/LoginedUser/historyMatchjoined";
import HistoryFieldBooked from "./components/LoginedUser/historyFieldBooked";
import Login from "./pages/login";
import Report from "./components/fieldOwner/report";
import FieldDetail from "./components/common/FieldDetail";
import FieldBookied from "./components/LoginedUser/fieldBooked"; // Import FieldBookied
import Personal from "./components/LoginedUser/Personal"; // Import trang cá nhân
import MainLayout from "./layouts/MainLayout";
import SmallField from "./components/fieldOwner/Field/SmallField"; // Import SmallFieldDetail
import Nofi from "./pages/Nofi";
import Join_match from "./pages/join_match";
import AdminDashboard from "./components/admin/dashboard"; // Import AdminDashboard

import handleLogout from "./components/UserManagerment/logout";
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
      return <Navigate to="/" />;
    }
    if (role && !role.includes(userRole)) {
      return <Navigate to="/" />;
    }
    return element;
  };

  const checkTokenValidity = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }

    try {
      const response = await axios.get('http://localhost:5000/api/auth/check-token', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 300) {
        console.log('Token is valid');
        return true;
      }
    } catch (error) {
      alert('Token is invalid');
      handleLogout();
      return false;
    }
  };

  useEffect(() => {
    checkTokenValidity();
  }, []);

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
        {/* Logined */}
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
          path="/historyFieldBooked"
          element={
            <MainLayout>
              <ProtectedRoute element={<HistoryFieldBooked />} />
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
        {/* Field owner */}
        <Route
          path="/field-owner-dashboard"
          element={
            <MainLayout>
              <ProtectedRoute
                element={<Dashboard />}
                role={["field_owner"]}
              />
            </MainLayout>
          }
        />
        <Route
          path="/largeField/:fieldId"
          element={
            <MainLayout>
              <ProtectedRoute
                element={<LargeField />}
                role={["field_owner"]}
              />
            </MainLayout>
          }
        />
        <Route
          path="/smallField/:fieldId"
          element={
            <MainLayout>
              <ProtectedRoute
                element={<SmallField />}
                role={["field_owner"]}
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
        {/* Admin */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute
              element={<AdminDashboard />}
              role={["admin"]}
            />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
