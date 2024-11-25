import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MainLayout from "../layouts/MainLayout";
import Compressor from 'compressorjs';

const UserProfile = () => {
    const [userData, setUserData] = useState({
        fullName: '',
        phoneNumber: '',
        birthDate: '',
        address: '',
        image: '',
        email: '',
        role: '',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [isNewUser, setIsNewUser] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                const confirm = window.confirm('Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.');
                if (confirm) {
                    navigate('/login');
                }
                return;
            }

            try {
                const response = await axios.get('http://localhost:5000/api/user/me', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.data.fullName || !response.data.phoneNumber || !response.data.birthDate || !response.data.address) {
                    setIsNewUser(true);
                }

                setUserData(response.data);
                setIsLoading(false);
            } catch (error) {
                console.error('Lỗi khi lấy thông tin người dùng:', error);
                alert('Lỗi khi tải thông tin người dùng. Vui lòng thử lại.');
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleChange = (e) => {
        setUserData({
            ...userData,
            [e.target.name]: e.target.value,
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        const maxSize = 2 * 1024 * 1024; // 2MB

        if (file && file.size > maxSize) {
            alert('Kích thước ảnh không được vượt quá 2MB');
            return;
        }

        if (file) {
            new Compressor(file, {
                quality: 0.6, // Giảm chất lượng ảnh xuống 60%
                success: (compressedFile) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setUserData({
                            ...userData,
                            image: reader.result,
                        });
                    };
                    reader.readAsDataURL(compressedFile);
                },
                error(err) {
                    console.error('Error compressing image:', err);
                },
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const currentDate = new Date();
        const birthDate = new Date(userData.birthDate);

        if (birthDate > currentDate) {
            alert('Ngày sinh không thể lớn hơn ngày hiện tại.');
            return;
        }

        if (!/^[0-9]{10,15}$/.test(userData.phoneNumber)) {
            alert('Số điện thoại không hợp lệ');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const { email, role, ...userDataToUpdate } = userData;

            const response = await axios.put('http://localhost:5000/api/user/me', userDataToUpdate, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setMessage(response.data.message);
            setIsNewUser(false);
        } catch (error) {
            console.error('Lỗi khi cập nhật thông tin:', error);
            alert('Cập nhật thông tin thất bại. Vui lòng thử lại.');
        }
    };

    return (
        <MainLayout>
            <div style={{ padding: "20px" }}>
                <h2>Thông tin người dùng</h2>
                {message && <p style={{ color: "green" }}>{message}</p>}
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
                                <label>Ngày sinh</label>
                                <input
                                    type="date"
                                    name="birthDate"
                                    value={userData.birthDate}
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
                        <p>Ngày sinh: {userData.birthDate}</p>
                        <p>Địa chỉ: {userData.address}</p>
                        <p>Email: {userData.email}</p>
                        <p>Vai trò: {userData.role}</p>
                        {userData.image ? (
                            <img src={userData.image} alt="Ảnh người dùng" width="100" />
                        ) : (
                            <p>Không có ảnh.</p>
                        )}
                        <button onClick={() => setIsNewUser(true)}>Cập nhật thông tin</button>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default UserProfile;
