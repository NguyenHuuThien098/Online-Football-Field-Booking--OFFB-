import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Homepage from './components/Homepage_temp'; 
import PlayerPage from './components/PlayerPage';
import FieldOwnerDashboard from './components/FieldOwnerDashboard';
import Login from './components/Login'; 
import Register from './components/Register'; 
import UserProfile from './components/UserProfile'; 

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('isAuthenticated') === 'true');
    const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));

    useEffect(() => {
        localStorage.setItem('isAuthenticated', isAuthenticated);
        localStorage.setItem('userRole', userRole);
    }, [isAuthenticated, userRole]);

    const PrivateRoute = ({ children, role }) => {
        return isAuthenticated && userRole === role ? children : <Navigate to="/" />;
    };

    return (
        <Router>
            <Routes>
                {/* Trang chủ */}
                <Route 
                    path="/" 
                    element={<Homepage setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />} 
                />
                
                {/* Đăng nhập */}
                <Route 
                    path="/login" 
                    element={<Login setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />} 
                />
                
                {/* Đăng ký */}
                <Route 
                    path="/register" 
                    element={<Register setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />} 
                />
                
                {/* Trang Dashboard cho chủ sân (Field Owner) */}
                <Route 
                    path="/field-owner-dashboard" 
                    element={
                        <PrivateRoute role="field_owner">
                            <FieldOwnerDashboard />
                        </PrivateRoute>
                    } 
                />
                
                {/* Trang Player Page cho người chơi */}
                <Route 
                    path="/player-page" 
                    element={
                        <PrivateRoute role="player">
                            <PlayerPage />
                        </PrivateRoute>
                    } 
                />

                {/* Trang UserProfile cho người dùng */}
                <Route 
                    path="/user-profile" 
                    element={
                        <PrivateRoute role={userRole}>
                            <UserProfile />
                        </PrivateRoute>
                    }
                />
            </Routes>
        </Router>
    );
};

export default App;
