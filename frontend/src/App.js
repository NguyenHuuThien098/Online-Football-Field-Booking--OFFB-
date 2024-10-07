// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Homepage from './components/Homepage_temp'; // Import đúng Homepage
import PlayerPage from './components/PlayerPage';
import FieldOwnerDashboard from './components/FieldOwnerDashboard';
import Login from './components/Login'; // Nhập component Login

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null); // Lưu vai trò người dùng

    return (
        <Router>
            <Routes>
                <Route 
                    path="/" 
                    element={<Homepage setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />} 
                />
                <Route 
                    path="/login" 
                    element={<Login setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />} 
                />
                <Route 
                    path="/field-owner-dashboard" 
                    element={isAuthenticated && userRole === 'field_owner' ? <FieldOwnerDashboard /> : <Navigate to="/" />} 
                />
                <Route 
                    path="/player-page" 
                    element={isAuthenticated && userRole === 'player' ? <PlayerPage /> : <Navigate to="/" />} 
                />
            </Routes>
        </Router>
    );
};

export default App;