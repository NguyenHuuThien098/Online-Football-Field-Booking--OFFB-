import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PlayerPage = () => {
    const [fields, setFields] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [searchParams, setSearchParams] = useState({
        name: '',
        location: '',
        type: '',
        date: '',
        time: ''
    });
    const [userId, setUserId] = useState('');
    const [selectedField, setSelectedField] = useState(null);
    const [numberOfPeople, setNumberOfPeople] = useState(5);
    const [error, setError] = useState('');
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUserId = localStorage.getItem('userId');
        setUserId(storedUserId);
        if (token && storedUserId) {
            getUserBookings(storedUserId, token);
        }
    }, []);

    const getUserBookings = async (userId, token) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/player/bookings/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const validBookings = response.data.filter(booking => booking.fieldId !== undefined);
            setBookings(validBookings);
        } catch (error) {
            console.error("Error fetching bookings:", error.response ? error.response.data : error.message);
            setError('Có lỗi xảy ra khi lấy lịch sử đặt sân.');
        }
    };

    const handleSearchFields = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`http://localhost:5000/api/player/fields`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params: searchParams,
            });
            setFields(response.data);
        } catch (error) {
            console.error("Error searching fields:", error.response ? error.response.data : error.message);
            setError('Có lỗi xảy ra khi tìm kiếm sân.');
        }
    };

    const openBookingModal = (field) => {
        setSelectedField(field);
        setIsBookingModalOpen(true);
    };

    const handleBookField = async () => {
        const token = localStorage.getItem('token');
        if (!searchParams.date || !searchParams.time || ![5, 7, 11].includes(numberOfPeople)) {
            setError('Số lượng người phải là 5, 7 hoặc 11 và tất cả thông tin phải được cung cấp.');
            return;
        }

        const bookingData = {
            fieldId: selectedField.id,
            userId: userId,
            date: searchParams.date,
            time: searchParams.time,
            numberOfPeople: numberOfPeople,
        };

        try {
            const response = await axios.post(`http://localhost:5000/api/player/book-field`, bookingData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            alert(response.data.message);
            getUserBookings(userId, token);
            setIsBookingModalOpen(false);
            resetBookingForm();
        } catch (error) {
            console.error("Error booking field:", error.response ? error.response.data : error.message);
            setError('Có lỗi xảy ra khi đặt sân.');
        }
    };

    const resetBookingForm = () => {
        setSelectedField(null);
        setNumberOfPeople(5);
        setError('');
        setSearchParams({
            name: '',
            location: '',
            type: '',
            date: '',
            time: ''
        });
    };

    const handleCancelBooking = async (bookingId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.delete(`http://localhost:5000/api/player/bookings/${bookingId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            alert(response.data.message);
            getUserBookings(userId, token);
        } catch (error) {
            console.error("Error cancelling booking:", error.response ? error.response.data : error.message);
            setError('Có lỗi xảy ra khi hủy đặt sân.');
        }
    };

    return (
        <div>
            <h1>Trang Chủ Của Người Chơi</h1>

            {/* Form tìm kiếm sân */}
            <div>
                <input
                    type="text"
                    placeholder="Tên sân"
                    value={searchParams.name}
                    onChange={e => setSearchParams({ ...searchParams, name: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Địa điểm"
                    value={searchParams.location}
                    onChange={e => setSearchParams({ ...searchParams, location: e.target.value })}
                />
                <select
                    value={searchParams.type}
                    onChange={e => setSearchParams({ ...searchParams, type: e.target.value })}
                >
                    <option value="">Chọn loại sân</option>
                    <option value="5 người">5 người</option>
                    <option value="7 người">7 người</option>
                    <option value="11 người">11 người</option>
                </select>
                <input
                    type="date"
                    value={searchParams.date}
                    onChange={e => setSearchParams({ ...searchParams, date: e.target.value })}
                />
                <input
                    type="time"
                    value={searchParams.time}
                    onChange={e => setSearchParams({ ...searchParams, time: e.target.value })}
                />
                <button onClick={handleSearchFields}>Tìm Kiếm</button>
            </div>

            {/* Hiển thị danh sách sân tìm thấy */}
            <div>
                <h2>Các Sân Tìm Thấy</h2>
                {fields.length > 0 ? (
                    <ul>
                        {fields.map(field => (
                            <li key={field.id}>
                                {field.name} - {field.location} - {field.type}
                                <button onClick={() => openBookingModal(field)}>Đặt Sân</button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Không tìm thấy sân nào.</p>
                )}
            </div>

            {/* Hiển thị lịch sử đặt sân */}
            <div>
                <h2>Lịch Sử Đặt Sân</h2>
                {bookings.length > 0 ? (
                    <ul>
                        {bookings.map(booking => (
                            <li key={booking.id}>
                                Sân: {booking.fieldId || "N/A"} - Ngày: {booking.date} - Thời gian: {booking.time}
                                <button onClick={() => handleCancelBooking(booking.id)}>Hủy Đặt</button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Chưa có đặt sân nào.</p>
                )}
            </div>

            {/* Hiển thị lỗi nếu có */}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* Modal đặt sân */}
            {isBookingModalOpen && (
                <div className="modal">
                    <h2>Đặt Sân</h2>
                    <p>Sân: {selectedField.name}</p>
                    <label>
                        Số lượng người:
                        <select
                            value={numberOfPeople}
                            onChange={e => setNumberOfPeople(Number(e.target.value))}
                        >
                            <option value={5}>5 </option>
                            <option value={7}>7 </option>
                            <option value={11}>11 </option>
                        </select>
                    </label>
                    <div>
                        <label>
                            Ngày:
                            <input
                                type="date"
                                value={searchParams.date}
                                onChange={e => setSearchParams({ ...searchParams, date: e.target.value })}
                            />
                        </label>
                    </div>
                    <div>
                        <label>
                            Thời gian:
                            <input
                                type="time"
                                value={searchParams.time}
                                onChange={e => setSearchParams({ ...searchParams, time: e.target.value })}
                            />
                        </label>
                    </div>
                    <button onClick={handleBookField}>Đặt Sân</button>
                    <button onClick={() => setIsBookingModalOpen(false)}>Hủy</button>
                </div>
            )}
        </div>
    );
};

export default PlayerPage;
