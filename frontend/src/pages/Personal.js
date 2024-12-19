import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Compressor from 'compressorjs';
import { Container, Card, CardContent, CardHeader, TextField, Button, Typography, Grid, Avatar, Alert } from '@mui/material';

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
        <Container maxWidth="lg" sx={{ mt: 5 }}>
            <Card sx={{ padding: 4 }}>
                <CardHeader title="Thông tin người dùng" sx={{ backgroundColor: 'primary.main', color: 'white', fontSize: '2rem' }} />
                <CardContent>
                    {message && <Alert severity="success" sx={{ fontSize: '1.5rem' }}>{message}</Alert>}
                    {isNewUser ? (
                        <div>
                            <Typography variant="body1" gutterBottom sx={{ fontSize: '1.5rem' }}>Chào mừng bạn, vui lòng cập nhật thông tin của bạn!</Typography>
                            <form onSubmit={handleSubmit}>
                                {userData.image && <Avatar src={userData.image} alt="Ảnh người dùng" sx={{ width: 150, height: 150, mb: 3, mx: 'auto' }} />}
                                <Button
                                    variant="contained"
                                    component="label"
                                    fullWidth
                                    sx={{ mb: 3, fontSize: '1.5rem' }}
                                >
                                    Tải ảnh lên
                                    <input
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        onChange={handleImageChange}
                                    />
                                </Button>
                                <TextField
                                    label="Họ và tên"
                                    name="fullName"
                                    value={userData.fullName}
                                    onChange={handleChange}
                                    fullWidth
                                    margin="normal"
                                    required
                                    InputProps={{ style: { fontSize: '1.5rem' } }}
                                    InputLabelProps={{ style: { fontSize: '1.5rem' } }}
                                />
                                <TextField
                                    label="Số điện thoại"
                                    name="phoneNumber"
                                    value={userData.phoneNumber}
                                    onChange={handleChange}
                                    fullWidth
                                    margin="normal"
                                    required
                                    InputProps={{ style: { fontSize: '1.5rem' } }}
                                    InputLabelProps={{ style: { fontSize: '1.5rem' } }}
                                />
                                <TextField
                                    label="Ngày sinh"
                                    name="birthDate"
                                    type="date"
                                    value={userData.birthDate}
                                    onChange={handleChange}
                                    fullWidth
                                    margin="normal"
                                    InputLabelProps={{ shrink: true, style: { fontSize: '1.5rem' } }}
                                    InputProps={{ style: { fontSize: '1.5rem' } }}
                                    required
                                />
                                <TextField
                                    label="Địa chỉ"
                                    name="address"
                                    value={userData.address}
                                    onChange={handleChange}
                                    fullWidth
                                    margin="normal"
                                    required
                                    InputProps={{ style: { fontSize: '1.5rem' } }}
                                    InputLabelProps={{ style: { fontSize: '1.5rem' } }}
                                />
                                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3, fontSize: '1.5rem' }}>
                                    Cập nhật thông tin
                                </Button>
                            </form>
                        </div>
                    ) : (
                        <div>
                            <Typography variant="h4" gutterBottom sx={{ fontSize: '2.5rem', fontWeight: 'bold', textAlign: 'center', mb: 4, color: 'primary.main' }}>
                                Thông tin của bạn
                            </Typography>
                            {userData.image && <Avatar src={userData.image} alt="Ảnh người dùng" sx={{ width: 150, height: 150, mb: 3, mx: 'auto' }} />}
                            <Grid container spacing={3} alignItems="center">
                                <Grid item xs={4}>
                                    <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '1.5rem' }}>Họ và tên:</Typography>
                                </Grid>
                                <Grid item xs={8}>
                                    <Typography variant="body2" sx={{ mb: 2, fontSize: '1.5rem' }}>{userData.fullName}</Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '1.5rem' }}>Số điện thoại:</Typography>
                                </Grid>
                                <Grid item xs={8}>
                                    <Typography variant="body2" sx={{ mb: 2, fontSize: '1.5rem' }}>{userData.phoneNumber}</Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '1.5rem' }}>Ngày sinh:</Typography>
                                </Grid>
                                <Grid item xs={8}>
                                    <Typography variant="body2" sx={{ mb: 2, fontSize: '1.5rem' }}>{userData.birthDate}</Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '1.5rem' }}>Địa chỉ:</Typography>
                                </Grid>
                                <Grid item xs={8}>
                                    <Typography variant="body2" sx={{ mb: 2, fontSize: '1.5rem' }}>{userData.address}</Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '1.5rem' }}>Email:</Typography>
                                </Grid>
                                <Grid item xs={8}>
                                    <Typography variant="body2" sx={{ mb: 2, fontSize: '1.5rem' }}>{userData.email}</Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '1.5rem' }}>Vai trò:</Typography>
                                </Grid>
                                <Grid item xs={8}>
                                    <Typography variant="body2" sx={{ mb: 2, fontSize: '1.5rem' }}>{userData.role}</Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '1.5rem' }}>Ảnh:</Typography>
                                </Grid>
                                <Grid item xs={8}>
                                    {userData.image ? (
                                        <Avatar src={userData.image} alt="Ảnh người dùng" sx={{ width: 150, height: 150, mt: 2 }} />
                                    ) : (
                                        <Typography variant="body2" sx={{ mb: 2, fontSize: '1.5rem' }}>Không có ảnh.</Typography>
                                    )}
                                </Grid>
                            </Grid>
                            <Button variant="contained" color="primary" fullWidth sx={{ mt: 3, fontSize: '1.5rem' }} onClick={() => setIsNewUser(true)}>
                                Cập nhật thông tin
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </Container>
    );
};

export default UserProfile;
