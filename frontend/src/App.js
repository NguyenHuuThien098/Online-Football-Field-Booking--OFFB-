import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PlayerPage from './components/PlayerPage';
import FieldOwnerDashboard from './components/FieldOwnerDashboard';
import Home from "./pages/home";
import History_MatchJoined from './pages/History_Matchjoined';
import History_FieldBooked from './pages/History_FieldBooked';
import Login from './pages/login';
import Register from './components/Register'; // Import trang đăng ký
import Report from './pages/report';

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
                    element={<Home setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />} 
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
                    path="/player-page" 
                    element={isAuthenticated && userRole === 'player' ? <PlayerPage /> : <Navigate to="/login" />} 
                />
                <Route 
                    path="/field-owner-dashboard" 
                    element={isAuthenticated && userRole === 'field_owner' ? <FieldOwnerDashboard /> : <Navigate to="/login" />} 
                />
                <Route 
                    path="/history-matchjoined" 
                    element={isAuthenticated ? <History_MatchJoined /> : <Navigate to="/login" />} 
                />
                <Route 
                    path="/history-fieldbooked" 
                    element={isAuthenticated ? <History_FieldBooked /> : <Navigate to="/login" />} 
                />
                <Route 
                    path="/report" 
                    element={isAuthenticated ? <Report /> : <Navigate to="/login" />} 
                />
            </Routes>
        </Router>
    );
};

export default App;