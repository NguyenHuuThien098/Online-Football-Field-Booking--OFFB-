import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Card, CardContent, TextField, Button, Typography, Grid, Box, Modal } from '@mui/material';

const FieldBooked = () => {
    const location = useLocation();  // Nhận dữ liệu từ state
    const navigate = useNavigate();

    const { field } = location.state || {};  // Lấy field từ state

    const [userId, setUserId] = useState('');
    const [token, setToken] = useState('');
    const [largeFieldId, setLargeFieldId] = useState('');
    const [smallFieldId, setSmallFieldId] = useState('');

    const [bookingDetails, setBookingDetails] = useState({
        date: '',
        startTime: '',
        endTime: '',
        numberOfPeople: 5,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        const storedToken = localStorage.getItem('token');

        if (!storedUserId || !storedToken) {
            alert('Bạn cần đăng nhập để đặt sân.');
            navigate('/login');
            return;
        }

        setUserId(storedUserId);
        setToken(storedToken);

        if (!field) {
            setError('Dữ liệu sân không khả dụng. Vui lòng thử lại.');
        }

        setLargeFieldId(field?.largeFieldId || '');
        setSmallFieldId(field?.smallFieldId || '');
    }, [navigate, field]);

    const handleBookingChange = (key, value) => {
        setBookingDetails((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleBookField = async (selectedSlot = null) => {
        if (!field?.id) {
            setError('Thiếu ID sân. Vui lòng thử lại.');
            return;
        }
        if (!userId) {
            setError('Dữ liệu người dùng không khả dụng. Vui lòng đăng nhập.');
            return;
        }

        const details = selectedSlot ? {
                  ...bookingDetails,
                  startTime: selectedSlot.split('-')[0],
                  endTime: selectedSlot.split('-')[1],
              }
            : bookingDetails;

        if (!details.date || !details.startTime || !details.endTime) {
            alert('Vui lòng nhập đầy đủ ngày, giờ bắt đầu và giờ kết thúc.');
            return;
        }

        setIsLoading(true);
        try {
            await axios.post(
                `http://localhost:5000/api/player/book-field`,
                {
                    smallFieldId: field.id,
                    largeFieldId,
                    userId,
                    date: details.date,
                    startTime: details.startTime,
                    endTime: details.endTime,
                    numberOfPeople: details.numberOfPeople,
                    status: '0',
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Đã gửi yêu cầu đặt sân thành công!');
            navigate('/player-page');
        } catch (error) {
            console.error('Lỗi đặt sân:', error);

            if (error.response && error.response.status === 400) {
                const { message, availableSlots } = error.response.data;
                setError(message);
                setAvailableSlots(availableSlots || []);
                setShowModal(true);  // Show modal with available slots
            } else if (error.response && error.response.status === 409) {
                // Handle time conflict
                const { availableSlots } = error.response.data;
                setError('Lịch đặt trùng với một lịch đã có. Vui lòng chọn lại khung giờ.');
                setAvailableSlots(availableSlots || []); // Show available time slots
                setShowModal(true);  // Show modal with available slots
            } else {
                setError('Có lỗi xảy ra khi đặt sân.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/');
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 5 }}>
            <Card sx={{ boxShadow: 3 }}>
                <CardContent>
                    <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', backgroundColor: 'primary.main', color: 'white', padding: 2, borderRadius: 1 }}>
                        Đặt Sân
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                        Sân: {field?.name || 'Không xác định'}
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label="Ngày"
                                type="date"
                                value={bookingDetails.date}
                                onChange={(e) => handleBookingChange('date', e.target.value)}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                required
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Giờ Bắt Đầu"
                                type="time"
                                value={bookingDetails.startTime}
                                onChange={(e) => handleBookingChange('startTime', e.target.value)}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                required
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Giờ Kết Thúc"
                                type="time"
                                value={bookingDetails.endTime}
                                onChange={(e) => handleBookingChange('endTime', e.target.value)}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Số Người"
                                select
                                SelectProps={{ native: true }}
                                value={bookingDetails.numberOfPeople}
                                onChange={(e) => handleBookingChange('numberOfPeople', Number(e.target.value))}
                                fullWidth
                                required
                            >
                                <option value="5">5 Người</option>
                                <option value="7">7 Người</option>
                                <option value="11">11 Người</option>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Button variant="contained" color="primary" onClick={() => handleBookField()} disabled={isLoading}>
                                Xác Nhận Đặt Sân
                            </Button>
                            <Button variant="contained" color="secondary" onClick={handleCancel} disabled={isLoading}>
                                Hủy
                            </Button>
                        </Grid>
                    </Grid>
                    {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
                </CardContent>
            </Card>

            <Modal open={showModal} onClose={() => setShowModal(false)}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    border: '2px solid #000',
                    boxShadow: 24,
                    p: 4,
                }}>
                    <Typography variant="h6" component="h2">
                        Các khung giờ còn trống
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                        {availableSlots.map((slot, index) => (
                            <Button
                                key={index}
                                variant="outlined"
                                sx={{ m: 1 }}
                                onClick={() => handleBookField(slot)}
                                disabled={isLoading}
                            >
                                {slot}
                            </Button>
                        ))}
                    </Box>
                    <Button onClick={() => setShowModal(false)} variant="contained" color="error" sx={{ mt: 2 }}>
                        Đóng
                    </Button>
                </Box>
            </Modal>
        </Container>
    );
};

export default FieldBooked;