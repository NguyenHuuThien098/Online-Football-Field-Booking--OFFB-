import React, { useState } from 'react';
import { signInWithGoogle, database } from '../firebase';
import { ref, get } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';

const Login = ({ setIsAuthenticated, setUserRole }) => {
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleGoogleLogin = async () => {
        try {
            const user = await signInWithGoogle();
            const userId = user.uid;

            const token = await user.getIdToken();
            const userRef = ref(database, 'users/' + userId);
            const snapshot = await get(userRef);

            if (snapshot.exists()) {
                const userData = snapshot.val();
                setIsAuthenticated(true);
                setUserRole(userData.role);
                localStorage.setItem('token', token);
                localStorage.setItem('userId', userId);

                if (userData.role === 'field_owner') {
                    navigate('/field-owner-dashboard');
                } else if (userData.role === 'player') {
                    navigate('/player-page');
                } else {
                    navigate('/');
                }
            } else {
                setError('Tài khoản không tồn tại. Vui lòng đăng ký.');
            }
        } catch (error) {
            console.error("Lỗi khi đăng nhập bằng Google:", error);
            setError(error.message);
        }
    };

    const handleNavigateToRegister = () => {
        navigate('/register');
    };

    const handleExit = () => {
        navigate('/'); // Chuyển hướng về trang chủ (hoặc trang khác nếu cần)
    };

    const styles = {
        container: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            backgroundColor: '#f8f9fa',
        },
        box: {
            width: '400px',
            padding: '20px',
            border: '1px solid #ccc',
            borderRadius: '10px',
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
        },
        heading: {
            marginBottom: '20px',
            fontSize: '24px',
            color: '#333',
        },
        errorMessage: {
            color: 'red',
            marginBottom: '10px',
        },
        button: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            backgroundColor: '#4285F4',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer',
            marginBottom: '10px',
            width: '100%',
            transition: 'background-color 0.3s',
        },
        buttonHover: {
            backgroundColor: '#357AE8',
        },
        registerButton: {
            backgroundColor: '#34A853',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer',
            marginBottom: '10px',
            width: '100%',
            transition: 'background-color 0.3s',
        },
        registerButtonHover: {
            backgroundColor: '#2C8C47',
        },
        exitButton: {
            backgroundColor: '#FF6347',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer',
            width: '100%',
            transition: 'background-color 0.3s',
        },
        exitButtonHover: {
            backgroundColor: '#E55347',
        },
    };

    return (
        <div style={styles.container}>
            <div style={styles.box}>
                <h2 style={styles.heading}>Đăng Nhập</h2>
                {error && <p style={styles.errorMessage}>{error}</p>}
                <button
                    style={styles.button}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = styles.button.backgroundColor}
                    onClick={handleGoogleLogin}
                >
                    <FontAwesomeIcon icon={faGoogle} />
                    Đăng Nhập Bằng Google
                </button>
                <button
                    style={styles.registerButton}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = styles.registerButtonHover.backgroundColor}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = styles.registerButton.backgroundColor}
                    onClick={handleNavigateToRegister}
                >
                    Đăng Ký
                </button>
                <button
                    style={styles.exitButton}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = styles.exitButtonHover.backgroundColor}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = styles.exitButton.backgroundColor}
                    onClick={handleExit}
                >
                    Thoát
                </button>
            </div>
        </div>
    );
};

export default Login;
