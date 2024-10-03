
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, database } from '../firebase'; // Đảm bảo rằng import đúng
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { provider } from '../firebase'; // Import provider từ firebase.js
import { signInWithPopup } from "firebase/auth";

// const Register = () => {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [error, setError] = useState('');
//     const [success, setSuccess] = useState('');

//     const handleRegister = async (e) => {
//         e.preventDefault();
//         setError(''); // Đặt lại thông báo lỗi
//         setSuccess(''); // Đặt lại thông báo thành công

//         try {
//             const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//             const userId = userCredential.user.uid;

//             // Ghi thông tin người dùng vào Realtime Database
//             await set(ref(database, 'users/' + userId), {
//                 email: email,
//                 // Không lưu mật khẩu
//             });

//             setSuccess('Đăng ký thành công!'); // Thông báo thành công
//         } catch (err) {
//             if (err.code === 'auth/email-already-in-use') {
//                 setError('Email đã được sử dụng.');
//             } else {
//                 setError(err.message);
//             }
//         }
//     };

//     const handleGoogleLogin = async () => {
//         try {
//             const result = await signInWithPopup(auth, provider);
//             const user = result.user;
//             console.log("Người dùng đã đăng nhập bằng Google:", user);
//             setSuccess('Đăng nhập bằng Google thành công!');
//         } catch (error) {
//             console.error("Lỗi khi đăng nhập bằng Google:", error);
//             setError(error.message);
//         }
//     };

//     return (
//         <div>
//             <h2>Đăng Ký</h2>
//             {error && <p style={{ color: 'red' }}>{error}</p>}
//             {success && <p style={{ color: 'green' }}>{success}</p>}
//             <form onSubmit={handleRegister}>
//                 <input
//                     type="email"
//                     placeholder="Email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     required
//                 />
//                 <input
//                     type="password"
//                     placeholder="Mật khẩu"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     required
//                 />
//                 <button type="submit">Đăng Ký</button>
//             </form>
//             <button onClick={handleGoogleLogin}>
//                 Đăng Nhập Bằng Google
//             </button>
//         </div>
//     );
// };

const Register = () => {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [role, setRole] = useState('player'); // Mặc định vai trò là player
    const navigate = useNavigate(); // Khởi tạo hook navigate


    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const userId = user.uid;

             // Kiểm tra xem người dùng đã tồn tại chưa
             const userRef = ref(database, 'users/' + userId);
             const snapshot = await get(userRef);
 
             if (snapshot.exists()) {
                 // Nếu người dùng đã tồn tại, lấy thông tin vai trò và điều hướng
                 const userData = snapshot.val();
                 const existingRole = userData.role;
 
                 if (existingRole === 'field_owner') {
                     navigate('/field-owner-dashboard');
                 } else {
                     navigate('/player-page');
                 }
                 return;
             }

            // Ghi thông tin người dùng vào Realtime Database
            await set(ref(database, 'users/' + userId), {
                email: user.email,
                role: role, // Lưu vai trò của người dùng
            });

            setSuccess('Đăng ký thành công với vai trò: ' + role);
            if (role === 'field_owner') {
                navigate('/field-owner-dashboard'); // Điều hướng đến FieldOwnerDashboard
            } else {
                navigate('/player-page'); // Điều hướng đến PlayerPage
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