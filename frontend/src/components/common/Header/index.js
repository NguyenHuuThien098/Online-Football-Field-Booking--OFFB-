import React, { useState, useEffect } from "react";
import logo from "../../../img/iconTraiBanh.png";
import defaultAvatar from "../../../img/avatar.png";
import style from "./Header.module.scss";
import axios from 'axios';
import { Typography, Menu, MenuItem } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNavigate } from "react-router-dom";

const Header = () => {
    const [role, setRole] = useState('');
    const [userData, setUserData] = useState({});
    const [anchorEl, setAnchorEl] = useState(null);
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
            <div name="middle" className="col-7 d-flex align-items-center">
                <h1 name="role" style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>{formatRole(role)}</h1>
            </div>
            <div name="right" className="col border-start">
                <div className="row d-flex justify-content-evenly">
                    {isAuthenticated ? (
                        <>
                            <div className="col d-flex flex-column align-items-center justify-content-center">
                                <div name="avatar" onClick={() => navigate('/personal')} style={{ cursor: 'pointer' }}>
                                    <img src={userData.image || defaultAvatar} className={style.icon + " img-fluid d-block icon-homepage"} alt="avatar" style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover' }} />
                                </div>
                                <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>{userData.fullName}</Typography>
                            </div>
                            <div className="col d-flex align-items-center justify-content-center" name="notification">
                                <NotificationsIcon fontSize="large" />
                            </div>
                            <div className="col d-flex align-items-center justify-content-center" name="setting">
                                <SettingsIcon fontSize="large" onClick={handleSettingsClick} />
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
                                <img src={defaultAvatar} className={style.icon + " img-fluid d-block icon-homepage"} alt="avatar" style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover' }} />
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
