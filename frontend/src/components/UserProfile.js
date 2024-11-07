import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
    const [userData, setUserData] = useState({
        fullName: '',
        phoneNumber: '',
        birthYear: '',
        address: '',
        image: '',
        email: '',  // email không thay đổi
        role: '',   // role không thay đổi
    });
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [isNewUser, setIsNewUser] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Lấy thông tin người dùng khi component được render lần đầu
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token'); // Giả sử token lưu trong localStorage
                const response = await axios.get('http://localhost:5000/api/user/me', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                
                // Kiểm tra nếu người dùng chưa có thông tin
                if (!response.data.fullName || !response.data.phoneNumber || !response.data.birthYear || !response.data.address) {
                    setIsNewUser(true); // Đánh dấu là người dùng mới, yêu cầu cập nhật thông tin
                }

                // Lưu thông tin người dùng vào state
                setUserData(response.data);
                setIsLoading(false);
            } catch (error) {
                console.error('Lỗi khi lấy thông tin người dùng:', error);
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleChange = (e) => {
        setUserData({
            ...userData,
            [e.target.name]: e.target.value,
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        const imageUrl = URL.createObjectURL(file);
        setUserData({
            ...userData,
            image: imageUrl,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const { email, role, ...userDataToUpdate } = userData; // Loại bỏ email và role khi gửi lên server
            const response = await axios.put('http://localhost:5000/api/user/me', userDataToUpdate, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setMessage(response.data.message);
        } catch (error) {
            console.error('Lỗi khi cập nhật thông tin:', error);
            setMessage('Cập nhật thông tin thất bại.');
        }
    };

    const handleBackToHome = () => {
        navigate('/');
    };

    if (isLoading) {
        return <div>Đang tải thông tin người dùng...</div>;
    }

    return (
        <div>
            <h2>Thông tin người dùng</h2>
            {message && <p>{message}</p>}
            {isNewUser ? (
                <div>
                    <p>Chào mừng bạn, vui lòng cập nhật thông tin của bạn!</p>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label>Họ và tên</label>
                            <input
                                type="text"
                                name="fullName"
                                value={userData.fullName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label>Số điện thoại</label>
                            <input
                                type="text"
                                name="phoneNumber"
                                value={userData.phoneNumber}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label>Năm sinh</label>
                            <input
                                type="text"
                                name="birthYear"
                                value={userData.birthYear}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label>Địa chỉ</label>
                            <input
                                type="text"
                                name="address"
                                value={userData.address}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label>Ảnh</label>
                            <input type="file" accept="image/*" onChange={handleImageChange} />
                            {userData.image && <img src={userData.image} alt="Ảnh người dùng" width="100" />}
                        </div>
                        <button type="submit">Cập nhật thông tin</button>
                    </form>
                </div>
            ) : (
                <div>
                    <p>Thông tin của bạn:</p>
                    <p>Họ và tên: {userData.fullName}</p>
                    <p>Số điện thoại: {userData.phoneNumber}</p>
                    <p>Năm sinh: {userData.birthYear}</p>
                    <p>Địa chỉ: {userData.address}</p>
                    <p>Email: {userData.email}</p>
                    <p>Vai trò: {userData.role}</p>
                    {userData.image && <img src={userData.image} alt="Ảnh người dùng" width="100" />}
                    <button onClick={() => setIsNewUser(true)}>Cập nhật thông tin</button>
                </div>
            )}
            <button onClick={handleBackToHome}>Về trang chủ</button>
        </div>
    );
};

export default UserProfile;
