import React, { useState, useEffect } from "react";
import logo from "../../../img/iconTraiBanh.png";
import defaultAvatar from "../../../img/avatar.png";
import style from "./Header.module.scss";
import axios from 'axios';
import { Typography, Menu, MenuItem, Badge } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNavigate } from "react-router-dom";

const Header = () => {
    const [role, setRole] = useState('');
    const [userData, setUserData] = useState({});
    const [anchorEl, setAnchorEl] = useState(null);
    const [notificationsCount, setNotificationsCount] = useState(0); // Số thông báo chưa đọc
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.setItem('isAuthenticated', 'false');
        localStorage.setItem('token', '');
        localStorage.setItem('userRole', '');
        localStorage.setItem('userId', '');
        window.location.reload();
    };

    const handleSettingsClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    useEffect(() => {
        setRole(localStorage.getItem("userRole"));

        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await axios.get('http://localhost:5000/api/user/me', {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    setUserData(response.data);
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        // Lấy số lượng thông báo chưa đọc
        const fetchNotificationsCount = async () => {
            const token = localStorage.getItem("token");
            const userId = localStorage.getItem("userId");
            const role = localStorage.getItem("role");

            try {
                const endpoint = role === "field_owner"
                    ? `http://localhost:5000/api/notifications/owner/${userId}`
                    : `http://localhost:5000/api/notifications/player/${userId}`;

                const response = await axios.get(endpoint, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                // Set số lượng thông báo chưa đọc
                const unreadCount = response.data.notifications.filter(notification => !notification.isRead).length;
                setNotificationsCount(unreadCount);
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };

        if (isAuthenticated) {
            fetchNotificationsCount();
        }
    }, [isAuthenticated]);

    // Hàm xử lý khi người dùng nhấp vào thông báo (đánh dấu đã đọc)
    const markNotificationsAsRead = async () => {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        const role = localStorage.getItem("role");

        try {
            const endpoint = role === "field_owner"
                ? `http://localhost:5000/api/notifications/owner/${userId}/markAsRead`
                : `http://localhost:5000/api/notifications/player/${userId}/markAsRead`;

            // Gửi yêu cầu cập nhật trạng thái thông báo
            await axios.post(endpoint, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Cập nhật lại số lượng thông báo
            setNotificationsCount(0);
        } catch (error) {
            console.error("Error marking notifications as read:", error);
        }
    };

    const formatRole = (role) => {
        switch (role) {
            case 'field_owner':
                return 'Field Owner';
            case 'player':
                return 'Player';
            default:
                return 'Guest';
        }
    };

    return (
        <div className="row border" style={{ padding: '10px 0' }}>
            <div name="left" className="col-2 p-0 border-end d-flex align-items-center">
                <div className="row">
                    <div className="col-4">
                        <img className={style.icon + " img-fluid d-block icon-homepage mx-4"} src={logo} alt="iconTraiBanh" />
                    </div>
                    <div className="col m-0 p-0">
                        <h1 className="mx-3" style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>OFFB</h1>
                    </div>
                </div>
            </div>
            <div name="middle" className="col-7 d-flex align-items-center justify-content-between">
                <h1 name="role" style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>{formatRole(role)}</h1>
                {isAuthenticated && (
                    <Typography variant="body2" sx={{ fontSize: '1.2rem', borderBottom: '2px solid #007bff' }}>{userData.fullName}</Typography>
                )}
            </div>
            <div name="right" className="col border-start">
                <div className="row d-flex justify-content-evenly">
                    {isAuthenticated ? (
                        <>
                            <div className="col d-flex flex-column align-items-center justify-content-center">
                                <div name="avatar" onClick={() => navigate('/personal')} style={{ cursor: 'pointer' }}>
                                    <img src={userData.image || defaultAvatar} className={style.icon + " img-fluid d-block icon-homepage"} alt="avatar" style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover', border: '2px solid #007bff', transition: 'transform 0.3s ease, box-shadow 0.3s ease' }} 
                                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
                                    />
                                </div>
                            </div>
                            <div className="col d-flex align-items-center justify-content-center" name="notification">
                                <Badge
                                    badgeContent={notificationsCount} // Hiển thị số lượng thông báo
                                    color={notificationsCount > 0 ? "error" : "default"} // Màu đỏ nếu có thông báo chưa đọc
                                >
                                    <NotificationsIcon
                                        fontSize="large"
                                        sx={{ transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}
                                        onMouseEnter={(e) => { 
                                            e.currentTarget.style.transform = 'scale(1.1)'; 
                                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)'; 
                                        }}
                                        onMouseLeave={(e) => { 
                                            e.currentTarget.style.transform = 'scale(1)'; 
                                            e.currentTarget.style.boxShadow = 'none'; 
                                        }}
                                        onClick={() => {
                                            navigate('/Nofi'); // Điều hướng đến trang thông báo
                                            markNotificationsAsRead(); // Đánh dấu thông báo đã đọc
                                        }}
                                    />
                                </Badge>
                            </div>
                            <div className="col d-flex align-items-center justify-content-center" name="setting">
                                <SettingsIcon fontSize="large" onClick={handleSettingsClick} sx={{ transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}
                                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
                                />
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleClose}
                                >
                                    <MenuItem sx={{ m: 2 }}>
                                        <Typography variant="body2" sx={{ mr: 1 }}>Logout: </Typography>
                                        <button onClick={handleLogout} className="btn btn-danger">
                                            Logout
                                        </button>
                                    </MenuItem>
                                </Menu>
                            </div>
                        </>
                    ) : (
                        <div className="col d-flex flex-column align-items-center justify-content-center">
                            <div name="avatar" onClick={() => navigate('/personal')} style={{ cursor: 'pointer' }}>
                                <img src={defaultAvatar} className={style.icon + " img-fluid d-block icon-homepage"} alt="avatar" style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover', border: '2px solid #007bff', transition: 'transform 0.3s ease, box-shadow 0.3s ease' }} 
                                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
                                />
                            </div>
                            <button onClick={() => navigate('/login')} className="btn btn-primary mt-2">
                                Login
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Header;
