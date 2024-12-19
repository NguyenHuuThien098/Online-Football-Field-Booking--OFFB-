import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

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

        const details = selectedSlot
            ? {
                  ...bookingDetails,
                  startTime: selectedSlot.split('-')[0],
                  endTime: selectedSlot.split('-')[1],
              }
            : bookingDetails;

        if (!details.date || !details.startTime || !details.endTime) {
            const missingFields = [];
            if (!details.date) missingFields.push("Ngày");
            if (!details.startTime) missingFields.push("Giờ Bắt Đầu");
            if (!details.endTime) missingFields.push("Giờ Kết Thúc");

            alert('Vui lòng nhập đầy đủ ngày, giờ bắt đầu và giờ kết thúc.');
            return;
        }

        setIsLoading(true);
        try {
            await axios.post(
                `http://localhost:5000/api/player/book-field`,
                {
                    fieldId: field.id,
                    largeFieldId,
                    smallFieldId: smallFieldId || null,
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
        navigate('/player-page');
    };

    return (
        <div style={{ padding: '20px', margin: 'auto', maxWidth: '400px' }}>
            <h3>Đặt Sân</h3>
            <p>Sân: {field?.name || 'Không xác định'}</p>

            <label>Ngày:</label>
            <input
                type="date"
                value={bookingDetails.date}
                onChange={(e) => handleBookingChange('date', e.target.value)}
                required
            />
            <br />
            <br />

            <label>Giờ Bắt Đầu:</label>
            <input
                type="time"
                value={bookingDetails.startTime}
                onChange={(e) => handleBookingChange('startTime', e.target.value)}
                required
            />
            <br />
            <br />

            <label>Giờ Kết Thúc:</label>
            <input
                type="time"
                value={bookingDetails.endTime}
                onChange={(e) => handleBookingChange('endTime', e.target.value)}
                required
            />
            <br />
            <br />

            <label>Số Người:</label>
            <select
                value={bookingDetails.numberOfPeople}
                onChange={(e) => handleBookingChange('numberOfPeople', Number(e.target.value))}
            >
                <option value="5">5 Người</option>
                <option value="7">7 Người</option>
                <option value="11">11 Người</option>
            </select>
            <br />
            <br />

            <button onClick={() => handleBookField()} disabled={isLoading}>
                Xác Nhận Đặt Sân
            </button>
            <button onClick={handleCancel} disabled={isLoading} style={{ marginLeft: '10px' }}>
                Hủy
            </button>

            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

            {showModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000,
                    }}
                >
                    <div
                        style={{
                            background: 'white',
                            padding: '20px',
                            borderRadius: '10px',
                            width: '90%',
                            maxWidth: '500px',
                            textAlign: 'center',
                        }}
                    >
                        <h4>Các khung giờ còn trống</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px' }}>
                            {availableSlots.map((slot, index) => (
                                <button
                                    key={index}
                                    style={{
                                        padding: '10px 15px',
                                        borderRadius: '5px',
                                        border: '1px solid #ccc',
                                        background: '#f0f0f0',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => handleBookField(slot)}
                                >
                                    {slot}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowModal(false)}
                            style={{
                                marginTop: '20px',
                                padding: '10px 20px',
                                borderRadius: '5px',
                                border: 'none',
                                background: '#d9534f',
                                color: 'white',
                                cursor: 'pointer',
                            }}
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FieldBooked;
