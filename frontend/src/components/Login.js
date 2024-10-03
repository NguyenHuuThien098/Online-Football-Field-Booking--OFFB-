
// import React, { useState } from 'react';
// import { auth } from '../firebase'; // Đảm bảo import đúng
// import { signInWithPopup,signInWithEmailAndPassword } from 'firebase/auth';
// import { provider } from '../firebase'; // Import provider từ firebase.js

// const Login = () => {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [error, setError] = useState('');
//     const [success, setSuccess] = useState('');

//     const handleLogin = async (e) => {
//         e.preventDefault();
//         setError(''); // Đặt lại thông báo lỗi
//         setSuccess(''); // Đặt lại thông báo thành công

//         try {
//             const userCredential = await signInWithEmailAndPassword(auth, email, password);
//             setSuccess('Đăng nhập thành công!'); // Thông báo thành công
//             console.log('Người dùng đã đăng nhập:', userCredential.user);
//         } catch (err) {
//             if (err.code === 'auth/wrong-password') {
//                 setError('Mật khẩu không chính xác.');
//             } else if (err.code === 'auth/user-not-found') {
//                 setError('Người dùng không tồn tại.');
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
//             <h2>Đăng Nhập</h2>
//             {error && <p style={{ color: 'red' }}>{error}</p>}
//             {success && <p style={{ color: 'green' }}>{success}</p>}
//             <form onSubmit={handleLogin}>
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
//                 <button type="submit">Đăng Nhập</button>
//             </form>
//             <button onClick={handleGoogleLogin}>
//                 Đăng Nhập Bằng Google
//             </button>
//         </div>
//     );
// };

// const Login = () => {
//     const [error, setError] = useState('');
//     const [success, setSuccess] = useState('');

//     const handleGoogleLogin = async () => {
//         try {
//             const result = await signInWithPopup(auth, provider);
//             const user = result.user;
//             const userId = user.uid;

//             // Kiểm tra vai trò sau khi đăng nhập
//             const userRef = ref(database, 'users/' + userId);
//             onValue(userRef, (snapshot) => {
//                 const userData = snapshot.val();
//                 if (userData) {
//                     console.log("Vai trò của người dùng:", userData.role);
//                     // Dựa vào vai trò để điều hướng đến trang phù hợp
//                     if (userData.role === 'field_owner') {
//                         // Điều hướng đến trang của Field Owner
//                         window.location.href = '/FieldOwnerDashboard.js';
//                     } else {
//                         // Điều hướng đến trang của Player
//                         window.location.href = '/PlayerPage.js';
//                     }
//                 }
//             });
//             setSuccess('Đăng nhập thành công!');
//         } catch (error) {
//             console.error("Lỗi khi đăng nhập bằng Google:", error);
//             setError(error.message);
//         }
//     };

//     return (
//         <div>
//             <h2>Đăng Nhập</h2>
//             {error && <p style={{ color: 'red' }}>{error}</p>}
//             {success && <p style={{ color: 'green' }}>{success}</p>}
//             <button onClick={handleGoogleLogin}>
//                 Đăng Nhập Bằng Google
//             </button>
//         </div>
//     );
// };

// src/components/Login.js
import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { provider } from '../firebase';
import { ref, onValue,get } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { database } from '../firebase';

const Login = ({ setIsAuthenticated, setUserRole }) => {
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleGoogleLogin = async () => {

        // try {
        //     const result = await signInWithPopup(auth, provider);
        //     const user = result.user;
        //     const userId = user.uid;

        //     const userRef = ref(database, 'users/' + userId);
        //     onValue(userRef, (snapshot) => {
        //         const userData = snapshot.val();
        //         if (userData) {
        //             setIsAuthenticated(true);
        //             setUserRole(userData.role); // Lưu vai trò người dùng

        //             // Điều hướng dựa trên vai trò người dùng
        //             if (userData.role === 'field_owner') {
        //                 navigate('/field-owner-dashboard'); // Đường dẫn đến FieldOwnerDashboard
        //             } else if (userData.role === 'player') {
        //                 navigate('/player-page'); // Đường dẫn đến PlayerPage
        //             } else {
        //                 // Nếu vai trò không xác định, có thể điều hướng về trang mặc định hoặc thông báo lỗi
        //                 navigate('/'); // Ví dụ: điều hướng về trang chính
        //             }
        //         } else {
        //             setError('Không tìm thấy dữ liệu người dùng.');
        //         }
        //     });
        // } catch (error) {
        //     console.error("Lỗi khi đăng nhập bằng Google:", error);
        //     setError(error.message);
        // }

        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const userId = user.uid;

            // Kiểm tra xem người dùng đã tồn tại chưa
            const userRef = ref(database, 'users/' + userId);
            const snapshot = await get(userRef);

            if (snapshot.exists()) {
                const userData = snapshot.val();
                setIsAuthenticated(true);
                setUserRole(userData.role);

                // Điều hướng dựa trên vai trò người dùng
                if (userData.role === 'field_owner') {
                    navigate('/field-owner-dashboard');
                } else if (userData.role === 'player') {
                    navigate('/player-page');
                } else {
                    navigate('/Homepage'); // Trang mặc định nếu không có vai trò
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
// export default Login;