import React, { useState } from 'react';
import { signInWithGoogle, database } from '../firebase';
import { ref, set, get } from 'firebase/database';
import { useNavigate } from 'react-router-dom';

const Register = ({ setIsAuthenticated, setUserRole }) => {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [role, setRole] = useState('player');
    const navigate = useNavigate();

    const handleGoogleLogin = async () => {
        try {
            const user = await signInWithGoogle();
            const userId = user.uid;

            // Lấy ID token
            const token = await user.getIdToken();

            const userRef = ref(database, 'users/' + userId);
            const snapshot = await get(userRef);

            if (snapshot.exists()) {
                const userData = snapshot.val();
                setIsAuthenticated(true);
                setUserRole(userData.role);

                // Lưu token vào local storage
                localStorage.setItem('token', token);

                if (userData.role === 'field_owner') {
                    navigate('/field-owner-dashboard');
                } else {
                    navigate('/player-page');
                }
                return;
            }

            // Ghi thông tin người dùng vào Realtime Database
            await set(ref(database, 'users/' + userId), {
                email: user.email,
                role: role,
                token: token,
            });

            setSuccess('Đăng ký thành công với vai trò: ' + role);
            setIsAuthenticated(true);
            setUserRole(role);

            // Lưu token vào local storage
            localStorage.setItem('token', token);

            if (role === 'field_owner') {
                navigate('/field-owner-dashboard');
            } else {
                navigate('/player-page');
            }
        } catch (error) {
            console.error("Lỗi khi đăng nhập bằng Google:", error);
            setError(error.message);
        }
    };

    return (
        <div>
            <h2>Đăng Ký</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
            <div>
                <label>
                    <input
                        type="radio"
                        value="player"
                        checked={role === 'player'}
                        onChange={() => setRole('player')}
                    />
                    Player
                </label>
                <label>
                    <input
                        type="radio"
                        value="field_owner"
                        checked={role === 'field_owner'}
                        onChange={() => setRole('field_owner')}
                    />
                    Field Owner
                </label>
            </div>
            <button onClick={handleGoogleLogin}>
                Đăng Ký Bằng Google
            </button>
        </div>
    );
};

export default Register;