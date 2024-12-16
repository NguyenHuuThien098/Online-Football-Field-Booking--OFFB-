import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Compressor from 'compressorjs';
import MainLayout from "../layouts/MainLayout";
import styled from 'styled-components';

// Styled Components
const ProfileContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
`;

const Card = styled.div`
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
    padding: 30px;
    max-width: 500px;
    width: 100%;
    text-align: center;
    margin-top: 20px;
    transition: all 0.3s ease;

    &:hover {
        box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.4); /* Đổ bóng đậm hơn khi hover */
        border: 2px solid #6a5acd; /* Màu khung khi hover */
        transform: translateY(-5px); /* Khung nổi lên */
    }
`;

const ProfileImage = styled.img`
    width: 150px;
    height: 150px;
    object-fit: cover;
    border-radius: 50%;
    margin-bottom: 20px;
    border: 4px solid #007bff;
`;

const FormContainer = styled.form`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const FormField = styled.div`
    margin-bottom: 20px;
    width: 100%;
    text-align: left;
`;

const Label = styled.label`
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    color: #333;
`;

const Input = styled.input`
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 5px;
`;

const SubmitButton = styled.button`
    padding: 10px 15px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background-color: #0056b3;
        transform: scale(1.05); /* Phóng to nhẹ khi hover */
    }
`;

const InfoText = styled.p`
    margin: 10px 0;
    text-align: left;
    strong {
        font-weight: bold;
        color: #333;
    }
`;

const UpdateButton = styled.button`
    margin-top: 15px;
    padding: 10px 15px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background-color: #218838;
        transform: scale(1.05);
    }
`;

const WelcomeMessage = styled.p`
    font-size: 1.2rem;
    color: #555;
`;

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
    const [isNewUser, setIsNewUser] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const roleMapping = {
        player: 'Người chơi',
        field_owner: 'Chủ sân',
    };

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                if (window.confirm('Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.')) {
                    navigate('/login');
                }
                return;
            }

            try {
                const response = await axios.get('http://localhost:5000/api/user/me', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setIsNewUser(!response.data.fullName);
                setUserData(response.data);
            } catch (error) {
                console.error('Lỗi khi lấy thông tin người dùng:', error);
                alert('Lỗi khi tải thông tin người dùng. Vui lòng thử lại.');
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            new Compressor(file, {
                quality: 0.6,
                success: (compressedFile) => {
                    const reader = new FileReader();
                    reader.onloadend = () => setUserData({ ...userData, image: reader.result });
                    reader.readAsDataURL(compressedFile);
                },
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const { email, role, ...userDataToUpdate } = userData;

            const response = await axios.put('http://localhost:5000/api/user/me', userDataToUpdate, {
                headers: { Authorization: `Bearer ${token}` },
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
            <ProfileContainer>
                <Card>
                    <ProfileImage
                        src={userData.image || 'https://via.placeholder.com/150'}
                        alt="Ảnh người dùng"
                    />
                    <h2>Thông tin người dùng</h2>
                    {message && <p style={{ color: "green" }}>{message}</p>}
                    {isNewUser ? (
                        <>
                            <WelcomeMessage>Chào mừng bạn, vui lòng cập nhật thông tin!</WelcomeMessage>
                            <FormContainer onSubmit={handleSubmit}>
                                <FormField>
                                    <Label>Họ và tên</Label>
                                    <Input type="text" name="fullName" value={userData.fullName} onChange={handleChange} required />
                                </FormField>
                                <FormField>
                                    <Label>Số điện thoại</Label>
                                    <Input type="text" name="phoneNumber" value={userData.phoneNumber} onChange={handleChange} required />
                                </FormField>
                                <FormField>
                                    <Label>Ngày sinh</Label>
                                    <Input type="date" name="birthDate" value={userData.birthDate} onChange={handleChange} required />
                                </FormField>
                                <FormField>
                                    <Label>Địa chỉ</Label>
                                    <Input type="text" name="address" value={userData.address} onChange={handleChange} required />
                                </FormField>
                                <FormField>
                                    <Label>Ảnh</Label>
                                    <Input type="file" accept="image/*" onChange={handleImageChange} />
                                </FormField>
                                <SubmitButton type="submit">Cập nhật thông tin</SubmitButton>
                            </FormContainer>
                        </>
                    ) : (
                        <>
                            <InfoText><strong>Họ và tên:</strong> {userData.fullName}</InfoText>
                            <InfoText><strong>Số điện thoại:</strong> {userData.phoneNumber}</InfoText>
                            <InfoText><strong>Ngày sinh:</strong> {userData.birthDate}</InfoText>
                            <InfoText><strong>Địa chỉ:</strong> {userData.address}</InfoText>
                            <InfoText><strong>Email:</strong> {userData.email}</InfoText>
                            <InfoText><strong>Vai trò:</strong> {roleMapping[userData.role] || userData.role}</InfoText>
                            <UpdateButton onClick={() => setIsNewUser(true)}>Cập nhật thông tin</UpdateButton>
                        </>
                    )}
                </Card>
            </ProfileContainer>
        </MainLayout>
    );
};

export default UserProfile;
