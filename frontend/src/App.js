// import React from 'react';
// import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
// import Homepage from './components/Homepage_temp'; // Import Homepage
// import Login from './components/Login'; // Import Login
// import Register from './components/Register'; // Import Register

// const App = () => {
//     return (
//         <div>
//             <Homepage />
//         </div>
//     );
// };

// export default App;


// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Homepage from './components/Homepage_temp';
import PlayerPage from './components/PlayerPage';
import FieldOwnerDashboard from './components/FieldOwnerDashboard';
import Login from './components/Login'; // Nhập component Login

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null); // Lưu vai trò người dùng

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Homepage />} />
                <Route 
                    path="/login" 
                    element={<Login setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />} 
                />
                <Route path="/field-owner-dashboard" element={<FieldOwnerDashboard />} />
                <Route path="/player-page" element={<PlayerPage />} />
            </Routes>
        </Router>
        // <Router>
        //     <Routes>
        //         <Route path="/" path="/" 
        //             element={<Homepage setIsAuthenticated={setIsAuthenticated} />}  />
        //         <Route 
        //             path="/login" 
        //             element={<Login setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />} 
        //         />
        //         <Route 
        //             path="/field-owner-dashboard" 
        //             element={isAuthenticated && userRole === 'field_owner' ? <FieldOwnerDashboard /> : <Navigate to="/FieldOwnerDashboard" />} 
        //         />
        //         <Route 
        //             path="/player-page" 
        //             element={isAuthenticated && userRole === 'player' ? <PlayerPage /> : <Navigate to="/PlayerPage" />} 
        //         />
        //     </Routes>
        // </Router>
    );
};

export default App;