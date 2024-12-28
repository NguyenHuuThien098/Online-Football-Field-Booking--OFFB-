import React, { useState } from 'react';
import { signInWithGoogle, database } from '../firebase';
import { ref, get } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import Login from '../components/UserManagerment/login';
const LoginForm = ({ setIsAuthenticated, setUserRole }) => {
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
                localStorage.setItem('role', userData.role);
                localStorage.setItem('userId', userId);

                if (userData.role === 'field_owner') {
                    navigate('/field-owner-dashboard');
                } else if (userData.role === 'admin') {
                    navigate('/admin-dashboard');
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



    return (
        <Login handleGoogleLogin={handleGoogleLogin} handleNavigateToRegister={handleNavigateToRegister} />
        // <div style={styles.container}>
        //     <div style={styles.box}>
        //         <h2 style={styles.heading}>Đăng Nhập</h2>
        //         {error && <p style={styles.errorMessage}>{error}</p>}
        //         <button
        //             style={styles.button}
        //             onMouseOver={e => e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor}
        //             onMouseOut={e => e.currentTarget.style.backgroundColor = styles.button.backgroundColor}
        //             onClick={handleGoogleLogin}
        //         >
        //             <FontAwesomeIcon icon={faGoogle} />
        //             Đăng Nhập Bằng Google
        //         </button>
        //         <button
        //             style={styles.registerButton}
        //             onMouseOver={e => e.currentTarget.style.backgroundColor = styles.registerButtonHover.backgroundColor}
        //             onMouseOut={e => e.currentTarget.style.backgroundColor = styles.registerButton.backgroundColor}
        //             onClick={handleNavigateToRegister}
        //         >
        //             Đăng Ký
        //         </button>
        //         <button
        //             style={styles.exitButton}
        //             onMouseOver={e => e.currentTarget.style.backgroundColor = styles.exitButtonHover.backgroundColor}
        //             onMouseOut={e => e.currentTarget.style.backgroundColor = styles.exitButton.backgroundColor}
        //             onClick={handleExit}
        //         >
        //             Thoát
        //         </button>
        //     </div>
        // </div>
    );
};

export default LoginForm;
