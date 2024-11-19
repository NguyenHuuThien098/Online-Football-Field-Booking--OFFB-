import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaHome, FaUser, FaTimes, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import Register from './Register';
import Login from './Login';
import { useNavigate } from 'react-router-dom';
import './Homepage.css';

const Homepage = ({ setIsAuthenticated, setUserRole }) => {
    const [showAuth, setShowAuth] = useState(false);
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isRegistering, setIsRegistering] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isAuthenticated') === 'true');
    const [userRole, setUserRoleState] = useState(localStorage.getItem('userRole'));
    const [showDropdown, setShowDropdown] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchFields = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/guest/fields');
                const data = response.data;
                setFields(data);
            } catch (error) {
                console.error("Error fetching fields:", error);
                setError('Có lỗi xảy ra khi tải danh sách sân.');
            } finally {
                setLoading(false);
            }
        };

        fetchFields();
    }, []);

    const handleHomeClick = () => {
        window.location.href = '/';
    };

    const handleAuthClick = () => {
        setShowAuth(!showAuth);
    };

    const handleCloseAuth = () => {
        setShowAuth(false);
    };

    const toggleAuthMode = () => {
        setIsRegistering(!isRegistering);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userRole');
        localStorage.removeItem('ownerId');
        setIsAuthenticated(false);
        setUserRole('');
        setIsLoggedIn(false);
        navigate('/');
    };

    const handleProfileClick = () => {
        setShowDropdown(!showDropdown);
    };

    const handleNavigateToDashboard = () => {
        if (userRole === 'player') {
            navigate('/player-page');
        } else if (userRole === 'field_owner') {
            navigate('/field-owner-dashboard');
        }
        
    };

    return (
        <div className="homepage">
            <header className="homepage-header">
                <div className="left-section" onClick={handleHomeClick}>
                    <FaHome className="icon home-icon" />
                    <h1 className="offb-title">OFFB</h1>
                </div>
                <div className="right-section">
                    {isLoggedIn ? (
                        <div className="profile-section">
                            <FaUserCircle className="icon user-icon" onClick={handleProfileClick} />
                            {showDropdown && (
                                <div className="dropdown-menu">
                                    <button onClick={handleNavigateToDashboard}>Trang cá nhân</button>
                                    <button onClick={handleLogout}>Đăng xuất</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <FaUser className="icon user-icon" onClick={handleAuthClick} />
                    )}
                </div>
            </header>
            <hr className="header-separator" />
            <main>
                {loading ? (
                    <p>Đang tải danh sách sân...</p>
                ) : error ? (
                    <p style={{ color: 'red' }}>{error}</p>
                ) : (
                    <div>
                        <h2>Danh sách sân bóng:</h2>
                        <ul>
                            {fields.map((field) => (
                                <li key={field.id}>{field.name}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </main>
            {showAuth && (
                <div className="overlay">
                    <div className="auth-container">
                        <FaTimes className="icon close-icon" onClick={handleCloseAuth} />
                        {isRegistering ? (
                            <Register setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />
                        ) : (
                            <Login setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />
                        )}
                        <button onClick={toggleAuthMode}>
                            {isRegistering ? 'Đã có tài khoản? Đăng Nhập' : 'Cần tài khoản? Đăng Ký'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Homepage;