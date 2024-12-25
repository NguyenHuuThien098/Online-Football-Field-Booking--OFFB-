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
    const [isNewUser, setIsNewUser] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const roleMapping = {
        player: 'Người chơi',
        field_owner: 'Chủ sân',
    };
    const [isLoading, setIsLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                const confirm = window.confirm('You are not logged in. Please log in to continue.');
                if (confirm) {
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
                console.error('Error fetching user data:', error);
                alert('Error loading user data. Please try again.');
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        const maxSize = 2 * 1024 * 1024; // 2MB

        if (file && file.size > maxSize) {
            alert('Image size must not exceed 2MB');
            return;
        }

        if (file) {
            new Compressor(file, {
                quality: 0.6, // Reduce image quality to 60%
                success: (compressedFile) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setUserData({ ...userData, image: reader.result });
                        setImagePreview(reader.result);
                    };
                    reader.readAsDataURL(compressedFile);
                },
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const currentDate = new Date();
        const birthDate = new Date(userData.birthDate);

        if (birthDate > currentDate) {
            alert('Birth date cannot be later than the current date.');
            return;
        }

        if (!/^[0-9]{10,15}$/.test(userData.phoneNumber)) {
            alert('Invalid phone number');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const { email, role, ...userDataToUpdate } = userData;

            const response = await axios.put('http://localhost:5000/api/user/me', userDataToUpdate, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setMessage(response.data.message);
            setIsNewUser(false);
        } catch (error) {
            console.error('Error updating information:', error);
            alert('Failed to update information. Please try again.');
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-GB', options);
    };

    const getRoleDisplay = (role) => {
        switch (role) {
            case 'field_owner':
                return 'Field Owner';
            case 'player':
                return 'Player';
            default:
                return role;
        }
    };

    const handleCancel = () => {
        setIsNewUser(false); // Hide the update form and return to info view
        setMessage(''); // Reset any messages
    };

    return (
        <div maxWidth="lg" sx={{ mt: 5 }}>
            <Card sx={{ padding: 3, fontFamily: 'Helvetica, sans-serif' }}>
                <CardHeader 
                    title={
                        <Typography variant="h3" sx={{ textAlign: 'center', fontFamily: 'Helvetica, sans-serif' }}>
                            Personal
                        </Typography>
                    }
                    sx={{ 
                        backgroundColor: 'primary.main', 
                        color: 'white', 
                        textAlign: 'center' 
                    }} 
                />
                <CardContent>
                    {message && <Alert severity="success" sx={{ fontSize: '1.2rem', fontFamily: 'Helvetica, sans-serif' }}>{message}</Alert>}
                    {isNewUser ? (
                        <div>
                            <Typography variant="body1" gutterBottom sx={{ fontSize: '1.2rem', fontFamily: 'Helvetica, sans-serif' }}>Welcome, please update your information!</Typography>
                            <form onSubmit={handleSubmit}>
                                <TextField
                                    label="Full Name"
                                    name="fullName"
                                    value={userData.fullName}
                                    onChange={handleChange}
                                    fullWidth
                                    margin="normal"
                                    required
                                    InputProps={{ style: { fontSize: '1.2rem', fontFamily: 'Helvetica, sans-serif' } }}
                                    InputLabelProps={{ style: { fontSize: '1.2rem', fontFamily: 'Helvetica, sans-serif' } }}
                                />
                                <TextField
                                    label="Phone Number"
                                    name="phoneNumber"
                                    value={userData.phoneNumber}
                                    onChange={handleChange}
                                    fullWidth
                                    margin="normal"
                                    required
                                    InputProps={{ style: { fontSize: '1.2rem', fontFamily: 'Helvetica, sans-serif' } }}
                                    InputLabelProps={{ style: { fontSize: '1.2rem', fontFamily: 'Helvetica, sans-serif' } }}
                                />
                                <TextField
                                    label="Birth Date"
                                    name="birthDate"
                                    type="date"
                                    value={userData.birthDate}
                                    onChange={handleChange}
                                    fullWidth
                                    margin="normal"
                                    InputLabelProps={{ shrink: true, style: { fontSize: '1.2rem', fontFamily: 'Helvetica, sans-serif' } }}
                                    InputProps={{ style: { fontSize: '1.2rem', fontFamily: 'Helvetica, sans-serif' } }}
                                    required
                                />
                                <TextField
                                    label="Address"
                                    name="address"
                                    value={userData.address}
                                    onChange={handleChange}
                                    fullWidth
                                    margin="normal"
                                    required
                                    InputProps={{ style: { fontSize: '1.2rem', fontFamily: 'Helvetica, sans-serif' } }}
                                    InputLabelProps={{ style: { fontSize: '1.2rem', fontFamily: 'Helvetica, sans-serif' } }}
                                />
                                <input
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    id="avatar-upload"
                                    type="file"
                                    onChange={handleImageChange}
                                />
                                <label htmlFor="avatar-upload">
                                    <Button variant="contained" color="primary" component="span" sx={{ mt: 2, fontSize: '1.2rem', fontFamily: 'Helvetica, sans-serif' }}>
                                        Upload Avatar
                                    </Button>
                                </label>
                                {imagePreview && (
                                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                                        <img src={imagePreview} alt="Preview" style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }} />
                                    </div>
                                )}
                                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2, fontSize: '1.2rem', fontFamily: 'Helvetica, sans-serif' }}>
                                    Update Information
                                </Button>
                            </form>
                        </div>
                    ) : (
                        <div>
                            <Typography variant="h4" gutterBottom sx={{ fontSize: '2rem', fontWeight: 'bold', textAlign: 'center', mb: 3, color: 'primary.main', fontFamily: 'Helvetica, sans-serif' }}>
                                Your Information
                            </Typography>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={4} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 2 }}>
                                    {userData.image && <Avatar src={userData.image} alt="User Image" sx={{ width: 300, height: 300, mb: 2, boxShadow: 3, border: '5px solid #007bff' }} />}
                                </Grid>
                                <Grid item xs={8} sx={{ padding: 2 }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={4}>
                                            <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '1.2rem', fontFamily: 'Helvetica, sans-serif' }}>Full Name:</Typography>
                                        </Grid>
                                        <Grid item xs={8}>
                                            <Typography variant="body2" sx={{ mb: 1, fontSize: '1.2rem', fontFamily: 'Helvetica, sans-serif' }}>{userData.fullName}</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '1.2rem', fontFamily: 'Helvetica, sans-serif' }}>Phone Number:</Typography>
                                        </Grid>
                                        <Grid item xs={8}>
                                            <Typography variant="body2" sx={{ mb: 1, fontSize: '1.2rem', fontFamily: 'Helvetica, sans-serif' }}>{userData.phoneNumber}</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '1.2rem', fontFamily: 'Helvetica, sans-serif' }}>Birth Date:</Typography>
                                        </Grid>
                                        <Grid item xs={8}>
                                            <Typography variant="body2" sx={{ mb: 1, fontSize: '1.2rem', fontFamily: 'Helvetica, sans-serif' }}>{formatDate(userData.birthDate)}</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '1.2rem', fontFamily: 'Helvetica, sans-serif' }}>Address:</Typography>
                                        </Grid>
                                        <Grid item xs={8}>
                                            <Typography variant="body2" sx={{ mb: 1, fontSize: '1.2rem', fontFamily: 'Helvetica, sans-serif' }}>{userData.address}</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '1.2rem', fontFamily: 'Helvetica, sans-serif' }}>Email:</Typography>
                                        </Grid>
                                        <Grid item xs={8}>
                                            <Typography variant="body2" sx={{ mb: 1, fontSize: '1.2rem', fontFamily: 'Helvetica, sans-serif' }}>{userData.email}</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '1.2rem', fontFamily: 'Helvetica, sans-serif' }}>Role:</Typography>
                                        </Grid>
                                        <Grid item xs={8}>
                                            <Typography variant="body2" sx={{ mb: 1, fontSize: '1.2rem', fontFamily: 'Helvetica, sans-serif' }}>{getRoleDisplay(userData.role)}</Typography>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Button variant="contained" color="primary" fullWidth sx={{ mt: 2, fontSize: '1.2rem', fontFamily: 'Helvetica, sans-serif' }} onClick={() => setIsNewUser(true)}>
                                Update Information
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default UserProfile;
