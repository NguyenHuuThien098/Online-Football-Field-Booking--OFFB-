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

            // Lấy ID token
            const token = await user.getIdToken();

            // Kiểm tra xem người dùng đã tồn tại chưa
            const userRef = ref(database, 'users/' + userId);
            const snapshot = await get(userRef);

            if (snapshot.exists()) {
                const userData = snapshot.val();
                setIsAuthenticated(true);
                setUserRole(userData.role);

// <<<<<<< homepageview
//                 // Cập nhật token vào Realtime Database
//                 // await set(ref(database, 'tokens/' + userId), { token });
// =======
//                 // Lưu token và ownerId vào local storage
//                 localStorage.setItem('token', token);
//                 localStorage.setItem('ownerId', userId);
// >>>>>>> main

                // Điều hướng dựa trên vai trò người dùng
                if (userData.role === 'field_owner') {
                    navigate('/field-owner-dashboard');
                } else if (userData.role === 'player') {
                    navigate('/player-page');
                } else {
                    navigate('/'); // Trang mặc định nếu không có vai trò
                }
            } else {
                setError('Tài khoản không tồn tại. Vui lòng đăng ký.');
            }
        } catch (error) {
            console.error("Lỗi khi đăng nhập bằng Google:", error);
            setError(error.message);
        }
    };

    return (
        <div>
            <h2>Đăng Nhập</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button onClick={handleGoogleLogin}>
                Đăng Nhập Bằng Google
            </button>
        </div>
    );
};

export default Login;