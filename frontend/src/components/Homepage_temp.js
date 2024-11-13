import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaHome, FaUser, FaTimes, FaUserCircle } from 'react-icons/fa';
import Register from './Register';
import Login from './Login';
import { useNavigate } from 'react-router-dom';
import './Homepage.css';

const Homepage = ({ setIsAuthenticated, setUserRole }) => {
    const [showAuth, setShowAuth] = useState(false);
    const [fields, setFields] = useState([]);
    const [allFields, setAllFields] = useState([]); // Dữ liệu tất cả các sân
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isRegistering, setIsRegistering] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isAuthenticated') === 'true');
    const [userRole, setUserRoleState] = useState(localStorage.getItem('userRole'));
    const [showDropdown, setShowDropdown] = useState(false);

    const [searchCriteria, setSearchCriteria] = useState({
        name: '',
        location: '',
        type: '',
        date: '',
        time: ''
    });

    const navigate = useNavigate();

    // Fetch all fields when the component mounts
    useEffect(() => {
        fetchFields(); // Lấy tất cả sân khi trang tải
    }, []);

    // Fetch fields based on search criteria
    const fetchFields = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/guest/search');
            setAllFields(response.data);  // Lưu tất cả sân vào allFields
            setFields(response.data); // Lúc đầu hiển thị tất cả các sân
        } catch (error) {
            console.error("Error fetching fields:", error);
            setError('Có lỗi xảy ra khi tải danh sách sân.');
        } finally {
            setLoading(false);
        }
    };

    // Filter fields based on search criteria
    const filterFields = () => {
        const { name, location, type, date, time } = searchCriteria;
        let filteredFields = [...allFields]; // Bắt đầu từ danh sách tất cả các sân

        if (name) {
            filteredFields = filteredFields.filter(field =>
                field.name.toLowerCase().includes(name.toLowerCase())
            );
        }

        if (location) {
            filteredFields = filteredFields.filter(field =>
                field.location.toLowerCase().includes(location.toLowerCase())
            );
        }

        if (type) {
            filteredFields = filteredFields.filter(field =>
                field.type.toLowerCase().includes(type.toLowerCase())
            );
        }

        if (date) {
            filteredFields = filteredFields.filter(field =>
                field.availableDates && field.availableDates.includes(date)
            );
        }

        if (time) {
            filteredFields = filteredFields.filter(field =>
                field.availableTimes && field.availableTimes.includes(time)
            );
        }

        setFields(filteredFields); // Cập nhật danh sách sân sau khi lọc
    };

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

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userRole');
        localStorage.removeItem('ownerId');
        setIsAuthenticated(false);
        setUserRole('');
        setIsLoggedIn(false);
        navigate('/');
    };

    const handleProfileClick = () => {
        setShowDropdown(!showDropdown);
    };

    const handleNavigateToProfile = () => {
        navigate('/user-profile');
    };

    const handleNavigateToDashboard = () => {
        if (userRole === 'player') {
            navigate('/player-page');
        } else if (userRole === 'field_owner') {
            navigate('/field-owner-dashboard');
        }
    };

    const handleSearchChange = (e) => {
        const { name, value } = e.target;
        setSearchCriteria(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        filterFields(); // Lọc các sân theo tiêu chí tìm kiếm
    };

    const handleBookField = async (fieldId) => {
        const token = localStorage.getItem('token');
        const date = searchCriteria.date;
        const time = searchCriteria.time;
        const numberOfPeople = 10; // Đây có thể là giá trị từ input của người dùng

        try {
            const response = await axios.post('http://localhost:5000/api/guest/book', {
                token, fieldId, date, time, numberOfPeople
            });

            alert('Đặt sân thành công!');
        } catch (error) {
            console.error("Error booking field:", error);
            alert('Bạn cần đăng nhập để đặt sân.');
        }
    };

    return (
        <div className="homepage">
            <header className="homepage-header">
                <div className="left-section" onClick={handleHomeClick}>
                    <FaHome className="icon home-icon" />
                    <h1 className="offb-title">OFFB</h1>
                </div>
                <div className="right-section">
                    {isLoggedIn ? (
                        <div className="profile-section">
                            <FaUserCircle className="icon user-icon" onClick={handleProfileClick} />
                            {showDropdown && (
                                <div className="dropdown-menu">
                                  
                                    <button onClick={handleNavigateToDashboard}>Trang cá nhân</button>
                                   
                                </div>
                            )}
                        </div>
                    ) : (
                        <FaUser className="icon user-icon" onClick={handleAuthClick} />
                    )}
                </div>
            </header>
            <hr className="header-separator" />
            <main>
                <div>
                    <h2>Tìm kiếm sân:</h2>
                    <form onSubmit={handleSearchSubmit}>
    <input
        type="text"
        name="name"
        placeholder="Tên sân"
        value={searchCriteria.name}
        onChange={handleSearchChange}
    />
    <input
        type="text"
        name="location"
        placeholder="Địa điểm"
        value={searchCriteria.location}
        onChange={handleSearchChange}
    />
    <select
        name="type"
        value={searchCriteria.type}
        onChange={handleSearchChange}
    >
        <option value="">Chọn loại sân</option>
        <option value="5 người">5 người</option>
        <option value="7 người">7 người</option>
        <option value="11 người">11 người</option>
    </select>
    <input
        type="date"
        name="date"
        value={searchCriteria.date}
        onChange={handleSearchChange}
    />
    <input
        type="time"
        name="time"
        value={searchCriteria.time}
        onChange={handleSearchChange}
    />
    <button type="submit">Tìm kiếm</button>
</form>

                </div>

                {loading ? (
                    <p>Đang tải danh sách sân...</p>
                ) : error ? (
                    <p style={{ color: 'red' }}>{error}</p>
                ) : (
                    <div>
                        <h2>Danh sách sân bóng:</h2>
                        <ul>
                            {fields.map((field) => (
                                <li key={field.fieldId} className="field-item">
                                    <h3>{field.name}</h3>
                                    <p><strong>Địa điểm:</strong> {field.location}</p>
                                    <p><strong>Loại sân:</strong> {field.type}</p>
                                    <p><strong>Giá:</strong> {field.price} VND</p>
                                    <p><strong>Tình trạng:</strong> {field.isAvailable ? 'Có sẵn' : 'Không có sẵn'}</p>
                                    <button onClick={() => handleBookField(field.fieldId)} disabled={!field.isAvailable}>
                                        Đặt sân
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
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
