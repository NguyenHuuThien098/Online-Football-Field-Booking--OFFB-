import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from "../layouts/MainLayout";
const PlayerPage = () => {
    const [fields, setFields] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [searchParams, setSearchParams] = useState({
        name: '',
        location: '',
        type: '',
        date: '',
        startTime: '',
        endTime: '',
    });
    const [userId, setUserId] = useState('');
    const [selectedField, setSelectedField] = useState(null);
    const [numberOfPeople, setNumberOfPeople] = useState(5);
    const [error, setError] = useState('');
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUserId = localStorage.getItem('userId');
        if (token && storedUserId) {
            setUserId(storedUserId);
            fetchBookings(storedUserId, token);
        } else {
            setError('Bạn chưa đăng nhập.');
        }
    }, []);

    const fetchBookings = async (userId, token) => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/player/bookings/${userId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setBookings(response.data);
        } catch (err) {
            console.error(err);
            setError('Không thể lấy lịch sử đặt sân.');
        }
    };

    const searchFields = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Bạn cần đăng nhập để tìm kiếm.');
            return;
        }

        try {
            const response = await axios.get(
                `http://localhost:5000/api/player/fields`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    params: searchParams,
                }
            );
            setFields(response.data);
            setError(response.data.length === 0 ? 'Không tìm thấy sân nào phù hợp.' : '');
        } catch (err) {
            console.error(err);
            setError('Có lỗi khi tìm kiếm sân.');
        }
    };

    const bookField = async () => {
        const token = localStorage.getItem('token');
        if (!searchParams.date || !searchParams.startTime || !searchParams.endTime || ![5, 7, 11].includes(numberOfPeople)) {
            setError('Vui lòng nhập đầy đủ thông tin và chọn số lượng người hợp lệ.');
            return;
        }
        const today = new Date();
        const selectedDate = new Date(searchParams.date);
        if (selectedDate < today.setHours(0, 0, 0, 0)) {
            window.confirm('Không thể đặt sân trong ngày quá khứ.');
            return;
        }
        const startTime = new Date(`1970-01-01T${searchParams.startTime}:00`);
    const endTime = new Date(`1970-01-01T${searchParams.endTime}:00`);
    if (startTime >= endTime) {
        window.confirm('Giờ bắt đầu không thể lớn hơn hoặc bằng giờ kết thúc.');
        return;
    }
        setIsLoading(true);
        try {
            await axios.post(
                `http://localhost:5000/api/player/book-field`,
                {
                    fieldId: selectedField.fieldId,
                    userId,
                    date: searchParams.date,
                    startTime: searchParams.startTime,
                    endTime: searchParams.endTime,
                    numberOfPeople,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Đặt sân thành công!');
            fetchBookings(userId, token);
            setIsBookingModalOpen(false);
        } catch (err) {
            console.error(err);
            setError('Có lỗi khi đặt sân.');
        } finally {
            setIsLoading(false);
        }
    };

    const cancelBooking = async (bookingId) => {
        if (!window.confirm('Bạn có chắc muốn hủy đặt sân này không?')) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(
                `http://localhost:5000/api/player/bookings/${bookingId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Hủy đặt sân thành công!');
            fetchBookings(userId, token);
        } catch (err) {
            console.error(err);
            setError('Không thể hủy đặt sân.');
        }
    };

    const openBookingModal = (field) => {
        setSelectedField(field);
        setIsBookingModalOpen(true);
    };

    return (
        
        <div className="player-page">
            <h1>Trang Người Chơi</h1>

            {/* Form tìm kiếm sân */}
            <div className="search-form">
                <input
                    type="text"
                    placeholder="Tên sân"
                    value={searchParams.name}
                    onChange={(e) => setSearchParams({ ...searchParams, name: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Địa điểm"
                    value={searchParams.location}
                    onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
                />
                <select
                    value={searchParams.type}
                    onChange={(e) => setSearchParams({ ...searchParams, type: e.target.value })}
                >
                    <option value="">Loại sân</option>
                    <option value="5 người">5 người</option>
                    <option value="7 người">7 người</option>
                    <option value="11 người">11 người</option>
                </select>
                <button onClick={searchFields}>Tìm kiếm</button>
            </div>

            {/* Danh sách sân */}
            <div className="fields-list">
                <h2>Kết quả tìm kiếm</h2>
                {fields.length ? (
                    <ul>
                        {fields.map((field) => (
                            <li key={field.id}>
                                <img src={field.image} alt={field.name} style={{ width: 100, height: 100 }} />
                                <p>{field.name}</p>
                                <p>Địa chỉ: {field.location}</p>
                                <p>Giá: {field.price.toLocaleString()} VND</p>
                                <p>Loại sân: {field.type}</p>
                                <button onClick={() => openBookingModal(field)}>Đặt sân</button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Không tìm thấy sân nào.</p>
                )}
            </div>

           {/* Modal đặt sân */}
{isBookingModalOpen && selectedField && (
    <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '5px', width: '300px' }}>
        <h3>Đặt Sân {selectedField.name}</h3>
        <p>Địa chỉ: {selectedField.location}</p> {/* Hiển thị địa chỉ sân */}
        <p>Giá: {selectedField.price} VND</p>
        <label>Ngày:</label>
        <input
            type="date"
            value={searchParams.date}
            onChange={e => setSearchParams({ ...searchParams, date: e.target.value })}
            required
        /><br /><br />
        <label>Giờ Bắt Đầu:</label>
        <input
            type="time"
            value={searchParams.startTime}
            onChange={e => setSearchParams({ ...searchParams, startTime: e.target.value })}
            required
        /><br /><br />
        <label>Giờ Kết Thúc:</label>
        <input
            type="time"
            value={searchParams.endTime}
            onChange={e => setSearchParams({ ...searchParams, endTime: e.target.value })}
            required
        /><br /><br />
        <label>Số Người:</label>
        <select
            value={numberOfPeople}
            onChange={e => setNumberOfPeople(Number(e.target.value))}
        >
            <option value="5">5 Người</option>
            <option value="7">7 Người</option>
            <option value="11">11 Người</option>
        </select><br /><br />
        <button onClick={bookField} disabled={isLoading}>Xác Nhận Đặt Sân</button>
        <button onClick={() => setIsBookingModalOpen(false)}>Hủy</button>
    </div>
)}


{/* Lịch sử đặt sân */}
<div className="booking-history">
    <h2>Lịch sử Đặt Sân</h2>
    {bookings.length ? (
        <ul>
            {bookings.map((booking) => (
                <li key={booking.id}>
                    <h3>Sân: {booking.fieldName}</h3>
                    <p>Địa chỉ: {booking.location || booking.field?.location}</p> 
                    <p>Ngày: {booking.date}</p>
                    <p>Giờ: {booking.startTime} - {booking.endTime}</p>
                    <p>Số Người tham gia: {booking.numberOfPeople}</p> 
                    <button onClick={() => cancelBooking(booking.id)}>Hủy đặt sân</button>
                </li>
            ))}
        </ul>
    ) : (
        <p>Chưa có đặt sân nào.</p>
    )}
</div>




            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default PlayerPage;
