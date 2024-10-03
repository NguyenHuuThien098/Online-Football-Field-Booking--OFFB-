import React, { useState, useEffect } from 'react';
import Register from './Register';
import Login from './Login';
import { database } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { FaHome, FaUser, FaTimes } from 'react-icons/fa';
import './Homepage.css';

// const Homepage = () => {
//     const [showAuth, setShowAuth] = useState(false); // Quản lý trạng thái hiển thị đăng nhập/đăng ký
//     const [data, setData] = useState(null); // State để lưu dữ liệu từ Firebase
//     const [isRegistering, setIsRegistering] = useState(true); // Quản lý trạng thái đăng ký/đăng nhập

//     useEffect(() => {
//         const dataRef = ref(database, 'user');
//         const unsubscribe = onValue(dataRef, (snapshot) => {
//             const data = snapshot.val();
//             setData(data);
//         });

//         return () => unsubscribe();
//     }, []);

//     const handleHomeClick = () => {
//         window.location.href = '/';
//     };

//     const handleAuthClick = () => {
//         setShowAuth(!showAuth);
//     };

//     const handleCloseAuth = () => {
//         setShowAuth(false);
//     };

//     const toggleAuthMode = () => {
//         setIsRegistering(!isRegistering);
//     };

//     return (
//         <div className="homepage">
//             <header className="homepage-header">
//                 <div className="left-section" onClick={handleHomeClick}>
//                     <FaHome className="icon home-icon" />
//                     <h1 className="offb-title">OFFB</h1>
//                 </div>
//                 <div className="right-section">
//                     <FaUser className="icon user-icon" onClick={handleAuthClick} />
//                 </div>
//             </header>
//             <hr className="header-separator" />
//             <main>
//                 {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
//             </main>
//             {showAuth && (
//                 <div className="overlay">
//                     <div className="auth-container">
//                         <FaTimes className="icon close-icon" onClick={handleCloseAuth} />
//                         {isRegistering ? <Register /> : <Login />}
//                         <button onClick={toggleAuthMode}>
//                             {isRegistering ? 'Đã có tài khoản? Đăng Nhập' : 'Cần tài khoản? Đăng Ký'}
//                         </button>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

const Homepage = ({ setIsAuthenticated, setUserRole }) => {
    const [showAuth, setShowAuth] = useState(false); // Quản lý trạng thái hiển thị đăng nhập/đăng ký
    const [data, setData] = useState(null); // State để lưu dữ liệu từ Firebase
    const [isRegistering, setIsRegistering] = useState(true); // Quản lý trạng thái đăng ký/đăng nhập

    useEffect(() => {
        const dataRef = ref(database, 'user');
        const unsubscribe = onValue(dataRef, (snapshot) => {
            const data = snapshot.val();
            setData(data);
        });

        return () => unsubscribe();
    }, []);

    const handleHomeClick = () => {
        window.location.href = '/';
    };

    const handleAuthClick = () => {
        setShowAuth(!showAuth);
    };

    const handleCloseAuth = () => {
        setShowAuth(false);
    };

    const toggleAuthMode = () => {
        setIsRegistering(!isRegistering);
    };

    return (
        <div className="homepage">
            <header className="homepage-header">
                <div className="left-section" onClick={handleHomeClick}>
                    <FaHome className="icon home-icon" />
                    <h1 className="offb-title">OFFB</h1>
                </div>
                <div className="right-section">
                    <FaUser className="icon user-icon" onClick={handleAuthClick} />
                </div>
            </header>
            <hr className="header-separator" />
            <main>
                {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
            </main>
            {showAuth && (
                <div className="overlay">
                    <div className="auth-container">
                        <FaTimes className="icon close-icon" onClick={handleCloseAuth} />
                        {isRegistering ? (
                            <Register setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />
                        ) : (
                            <Login setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />
                        )}
                        <button onClick={toggleAuthMode}>
                            {isRegistering ? 'Đã có tài khoản? Đăng Nhập' : 'Cần tài khoản? Đăng Ký'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};


export default Homepage;
