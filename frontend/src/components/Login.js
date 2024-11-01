// src/components/Login.js
import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { provider } from '../firebase';
import { ref, get } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { database } from '../firebase';

const Login = ({ setIsAuthenticated, setUserRole }) => {
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const userId = user.uid;

            // Lấy token
            const token = await user.getIdToken(); // Lấy token từ đối tượng người dùng

            // Kiểm tra xem người dùng đã tồn tại chưa
            const userRef = ref(database, 'users/' + userId);
            const snapshot = await get(userRef);

            if (snapshot.exists()) {
                const userData = snapshot.val();
                setIsAuthenticated(true);
                setUserRole(userData.role);

                // Nếu bạn không cần sử dụng token ở đây, hãy bỏ qua.
                // Nếu bạn cần sử dụng token, hãy thêm một hàm gửi nó đến backend ở đây.
                console.log("User Token: ", token); // Bạn có thể kiểm tra token ở đây

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
