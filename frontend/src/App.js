import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Homepage from './components/Homepage_temp'; // Import đúng Homepage
import PlayerPage from './components/PlayerPage';
import FieldOwnerDashboard from './components/FieldOwnerDashboard';
import Login from './components/Login'; // Nhập component Login
import Register from './components/Register'; // Nhập component Register

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('isAuthenticated') === 'true');
    const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));

    useEffect(() => {
        localStorage.setItem('isAuthenticated', isAuthenticated);
        localStorage.setItem('userRole', userRole);
    }, [isAuthenticated, userRole]);

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
                    path="/register" 
                    element={<Register setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />} 
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