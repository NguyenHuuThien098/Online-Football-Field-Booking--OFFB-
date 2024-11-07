import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
    const [userData, setUserData] = useState({
        fullName: '',
        phoneNumber: '',
        birthYear: '',
        address: '',
        image: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/user/me', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setUserData(response.data);
            } catch (error) {
                setError('Không thể tải thông tin người dùng.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        // Yêu cầu xác nhận trước khi gửi dữ liệu
        const isConfirmed = window.confirm('Bạn có chắc chắn muốn cập nhật thông tin không?');
        if (!isConfirmed) return;

        try {
            await axios.put('http://localhost:5000/api/user/me', userData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            alert('Cập nhật thông tin thành công!');
            navigate('/');
        } catch (error) {
            // Hiển thị lỗi chi tiết nếu có
            if (error.response && error.response.data) {
                setError(error.response.data.message || 'Có lỗi xảy ra khi cập nhật thông tin.');
            } else {
                setError('Không thể kết nối đến server. Vui lòng thử lại sau.');
            }
        }
    };

    const handleBackToHome = () => {
        navigate('/');
    };

    return (
        <div className="user-profile">
            <h2>Thông tin cá nhân</h2>
            {loading ? (
                <p>Đang tải...</p>
            ) : (
                <form onSubmit={handleFormSubmit}>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    <div>
                        <label>Họ và tên:</label>
                        <input
                            type="text"
                            name="fullName"
                            value={userData.fullName}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <label>Số điện thoại:</label>
                        <input
                            type="text"
                            name="phoneNumber"
                            value={userData.phoneNumber}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <label>Năm sinh:</label>
                        <input
                            type="number"
                            name="birthYear"
                            value={userData.birthYear}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <label>Địa chỉ:</label>
                        <input
                            type="text"
                            name="address"
                            value={userData.address}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <label>Ảnh đại diện (URL):</label>
                        <input
                            type="text"
                            name="image"
                            value={userData.image}
                            onChange={handleInputChange}
                        />
                    </div>
                    <button type="submit">Cập nhật thông tin</button>
                </form>
            )}
            <button onClick={handleBackToHome}>Về trang chủ</button>
        </div>
    );
};

export default UserProfile;
