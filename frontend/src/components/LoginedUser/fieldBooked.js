import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Card, CardContent, TextField, Button, Typography, Grid, Box, Modal, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const FieldBooked = () => {
    const location = useLocation();  // Receive data from state
    const navigate = useNavigate();
    const { field } = location.state || {};  // Get field from state

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
            alert('You need to log in to book a field.');
            return;
        }

        setUserId(storedUserId);
        setToken(storedToken);

        if (!field) {
            setError('Field data is not available. Please try again.');
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
            setError('Missing field ID. Please try again.');
            return;
        }
        if (!userId) {
            setError('User data is not available. Please log in.');
            return;
        }

        const details = selectedSlot ? {
            ...bookingDetails,
            startTime: selectedSlot.split('-')[0],
            endTime: selectedSlot.split('-')[1],
        }
            : bookingDetails;

        if (!details.date || !details.startTime || !details.endTime) {
            alert('Please enter the full date, start time, and end time.');
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
            alert('Field booking request sent successfully! Click OK to navigate to the booking history page!');
            navigate('/historyFieldBooked');
        } catch (error) {
            console.error('Field booking error:', error);

            if (error.response && error.response.status === 400) {
                const { message, availableSlots } = error.response.data;
                setError(message);
                setAvailableSlots(availableSlots || []);
                setShowModal(true);  // Show modal with available slots
            } else if (error.response && error.response.status === 409) {
                // Handle time conflict
                const { availableSlots } = error.response.data;
                setError('The booking time conflicts with an existing booking. Please select another time slot.');
                setAvailableSlots(availableSlots || []); // Show available time slots
                setShowModal(true);  // Show modal with available slots
            } else {
                setError('An error occurred while booking the field.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/');
    };

    const handleBackClick = () => {
        navigate(-1);
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 5 }}>
            <Box sx={{ position: 'relative' }}>
    {/* Lớp phủ toàn màn hình khi đang xử lý */}
    {isLoading && (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)', // Màu nền mờ
                zIndex: 1300, // Đảm bảo lớp phủ nằm trên tất cả
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Typography
                sx={{
                    color: 'white',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                }}
            >
                PROCESSING THE REQUEST...
            </Typography>
        </Box>
    )}
    {/* Nút quay lại */}
    <IconButton
        onClick={handleBackClick}
        sx={{ position: 'absolute', top: 16, left: 16, backgroundColor: 'white' }}
        disabled={isLoading} // Vô hiệu hóa khi đang xử lý
    >
        <ArrowBackIcon />
    </IconButton>
    {/* Nội dung chính */}
    <Card sx={{ boxShadow: 3 }}>
        <CardContent>
            <Typography
                variant="h4"
                gutterBottom
                sx={{
                    textAlign: 'center',
                    backgroundColor: 'primary.main',
                    color: 'white',
                    padding: 2,
                    borderRadius: 1,
                    fontSize: '2rem',
                }}
            >
                Book Field
            </Typography>
            <Typography variant="h6" gutterBottom sx={{ fontSize: '1.5rem' }}>
                Field: {field?.name || 'Unknown'}
            </Typography>
            <Grid container spacing={2}>
                {/* Trường ngày */}
                <Grid item xs={12}>
                    <TextField
                        label="Date"
                        type="date"
                        value={bookingDetails.date}
                        onChange={(e) => handleBookingChange('date', e.target.value)}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        required
                        inputProps={{ style: { fontSize: '1.2rem' } }}
                        disabled={isLoading} // Vô hiệu hóa khi đang xử lý
                    />
                </Grid>
                {/* Giờ bắt đầu và kết thúc */}
                <Grid item xs={6}>
                    <TextField
                        label="Start Time"
                        type="time"
                        value={bookingDetails.startTime}
                        onChange={(e) => handleBookingChange('startTime', e.target.value)}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        required
                        inputProps={{ style: { fontSize: '1.2rem' } }}
                        disabled={isLoading}
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        label="End Time"
                        type="time"
                        value={bookingDetails.endTime}
                        onChange={(e) => handleBookingChange('endTime', e.target.value)}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        required
                        inputProps={{ style: { fontSize: '1.2rem' } }}
                        disabled={isLoading}
                    />
                </Grid>
                {/* Số người */}
                <Grid item xs={12}>
                    <TextField
                        label="Number of People"
                        select
                        SelectProps={{ native: true }}
                        value={bookingDetails.numberOfPeople}
                        onChange={(e) => handleBookingChange('numberOfPeople', Number(e.target.value))}
                        fullWidth
                        required
                        inputProps={{ style: { fontSize: '1.2rem' } }}
                        disabled={isLoading}
                    >
                        <option value="5">{field.type}</option>
                    </TextField>
                </Grid>
                {/* Nút hành động */}
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            setIsLoading(true); // Kích hoạt trạng thái xử lý
                            handleBookField();
                        }}
                        disabled={isLoading}
                        sx={{ fontSize: '1.2rem' }}
                    >
                        Confirm Booking
                    </Button>
                    <Button
                        variant="contained"
                        sx={{ backgroundColor: 'red', fontSize: '1.2rem' }}
                        onClick={handleCancel}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                </Grid>
            </Grid>
            {/* Thông báo lỗi */}
            {error && (
                <Typography color="error" sx={{ mt: 2, fontSize: '1.2rem' }}>
                    {error}
                </Typography>
            )}
        </CardContent>
    </Card>
</Box>



            <Modal open={showModal} onClose={!isLoading ? () => setShowModal(false) : null}>
    <Box
        sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500, // Rộng hơn để phù hợp với bố cục hàng ngang
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            border: 'none',
            pointerEvents: isLoading ? 'none' : 'auto', // Vô hiệu hóa toàn bộ modal khi đang xử lý
            opacity: isLoading ? 0.6 : 1, // Hiệu ứng mờ khi vô hiệu hóa
        }}
    >
        {isLoading ? (
            <Typography
                variant="h6"
                sx={{
                    textAlign: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: 'primary.main',
                }}
            >
                PROCESSING THE REQUEST...
            </Typography>
        ) : (
            <>
                <Typography
                    variant="h6"
                    component="h2"
                    sx={{
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        textAlign: 'center',
                        color: 'primary.main',
                        mb: 2,
                    }}
                >
                    Available Time Slots
                </Typography>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', // Tự động căn đều
                        gap: 2, // Khoảng cách giữa các nút
                        justifyItems: 'center', // Căn giữa nội dung từng ô
                        alignItems: 'center',
                    }}
                >
                    {availableSlots.map((slot, index) => (
                        <Button
                            key={index}
                            variant="outlined"
                            sx={{
                                fontSize: '1rem',
                                padding: '8px 12px',
                                borderRadius: '12px', // Bo tròn nút
                                whiteSpace: 'nowrap', // Không xuống dòng
                                color: 'primary.main',
                                borderColor: 'primary.main',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                },
                                '&:disabled': {
                                    backgroundColor: 'grey.200',
                                    color: 'grey.500',
                                },
                            }}
                            onClick={() => {
                                setIsLoading(true); // Kích hoạt trạng thái đang xử lý
                                handleBookField(slot);
                            }}
                            disabled={isLoading}
                        >
                            {slot}
                        </Button>
                    ))}
                </Box>
                <Button
                    onClick={!isLoading ? () => setShowModal(false) : null}
                    variant="contained"
                    color="error"
                    sx={{
                        mt: 3,
                        fontSize: '1.2rem',
                        display: 'block',
                        mx: 'auto',
                        padding: '10px 30px',
                        borderRadius: '8px',
                    }}
                    disabled={isLoading}
                >
                    Close
                </Button>
            </>
        )}
    </Box>
</Modal>


        </Container>
    );
};

export default FieldBooked;