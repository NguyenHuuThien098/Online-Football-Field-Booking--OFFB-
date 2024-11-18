import React, { useState } from 'react';
import { signInWithGoogle, database } from '../firebase';
import { ref, get } from 'firebase/database';
import { useNavigate } from 'react-router-dom';

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
                localStorage.setItem('ownerId', userId);

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

    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            backgroundColor: '#f0f4f8',
            padding: '20px',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
        },
        heading: {
            marginBottom: '20px',
            color: '#333',
        },
        errorMessage: {
            color: 'red',
            marginBottom: '10px',
        },
        button: {
            backgroundColor: '#4285F4',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer',
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
            transition: 'background-color 0.3s',
            marginTop: '10px',
        },
        registerButtonHover: {
            backgroundColor: '#2C8C47',
        },
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Đăng Nhập</h2>
            {error && <p style={styles.errorMessage}>{error}</p>}
            <button
                style={styles.button}
                onMouseOver={e => e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor}
                onMouseOut={e => e.currentTarget.style.backgroundColor = styles.button.backgroundColor}
                onClick={handleGoogleLogin}
            >
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
        </div>
    );
};

export default Login;