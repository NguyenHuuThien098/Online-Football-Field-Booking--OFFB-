import React, { useState, useEffect } from "react";
import logo from "../../../img/iconTraiBanh.png";
import avatar from "../../../img/avatar.png";
import style from "./Header.module.scss";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    useNavigate,
} from "react-router-dom";

const Header = () => {
    const [role, setRole] = useState('');
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.setItem('isAuthenticated', 'false');
        localStorage.setItem('token', '');
        localStorage.setItem('userRole', '');
        localStorage.setItem('userId', '');
        window.location.reload();
    };
    const handleLogin = () => {
        navigate('/login');
    };
    useEffect(() => {
        setRole(localStorage.getItem("userRole"));
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
        <div className="row border">
            <div name="left" className="col-2 p-0 border-end d-flex align-items-center">
                <div className="row">
                    <div className="col-4">
                        <img className={style.icon + " img-fluid d-block icon-homepage mx-4"} src={logo} alt="iconTraiBanh" />
                    </div>
                    <div className="col m-0 p-0">
                        <h1 className="mx-3">OFFB</h1>
                    </div>
                </div>
            </div>
            <div name="middle" className="col-7 d-flex align-items-center">
                <h1 name="role">{formatRole(role)}</h1>
            </div>
            <div name="right" className="col border-start">
                <div className="row d-flex justify-content-evenly">
                    <div className="col"></div>
                    <div className="col"></div>
                    <div className="col d-flex flex-column align-items-center justify-content-center">
                        <div name="avatar">
                            <img src={avatar} className={style.icon + " img-fluid d-block icon-homepage"} alt="avatar" />
                        </div>
                        {role ? (
                            <button onClick={handleLogout} className="btn btn-danger">
                                Logout
                            </button>
                        ) : (
                            <button onClick={handleLogin} className="btn btn-primary">
                                Login
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;
