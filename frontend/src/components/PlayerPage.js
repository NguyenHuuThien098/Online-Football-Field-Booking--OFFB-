import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { getDatabase, ref, get } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { debounce } from 'lodash';

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
    const [userRole, setUserRole] = useState(''); 
    const [isLoading, setIsLoading] = useState(false); // Trạng thái tải

    const navigate = useNavigate();

    // Lấy userId từ Firebase khi người chơi đăng nhập
    useEffect(() => {
        const token = localStorage.getItem('token');
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);  
                getUserRole(user.uid);  
                if (token) {
                    getUserBookings(user.uid, token); 
                }
            } else {
                navigate('/google-login');  
            }
        });

        return () => unsubscribe();  
    }, []);

    // Lấy vai trò người dùng
    const getUserRole = async (userId) => {
        try {
            const db = getDatabase();
            const userRef = ref(db, 'users/' + userId);
            const snapshot = await get(userRef);
            if (snapshot.exists()) {
                setUserRole(snapshot.val().role);  
            } else {
                console.log('No data available for user:', userId);
            }
        } catch (error) {
            console.error('Error fetching user role:', error);
        }
    };

    // Lấy lịch sử đặt sân
    const getUserBookings = async (userId, token) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/player/bookings/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const validBookings = response.data.filter(booking => booking.fieldId !== undefined);
            setBookings(validBookings);
        } catch (error) {
            console.error("Error fetching bookings:", error);
            setError('Có lỗi xảy ra khi lấy lịch sử đặt sân.');
        }
    };

    // Tìm kiếm sân
    const handleSearchFields = useCallback(debounce(async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`http://localhost:5000/api/player/fields`, {
                headers: { 'Authorization': `Bearer ${token}` },
                params: searchParams,
            });
            setFields(response.data);
        } catch (error) {
            console.error("Error searching fields:", error);
            setError('Có lỗi xảy ra khi tìm kiếm sân.');
        }
    }, 500), [searchParams]);

    // Mở modal đặt sân
    const openBookingModal = (field) => {
        setSelectedField(field);
        setIsBookingModalOpen(true);
    };

    // Xác nhận và đặt sân
    const handleBookField = async () => {
        const token = localStorage.getItem('token');
        if (!searchParams.date || !searchParams.time || ![5, 7, 11].includes(numberOfPeople)) {
            setError('Tất cả thông tin phải được cung cấp.');
            return;
        }

        if (!selectedField || !selectedField.fieldId) {
            setError('Chưa chọn sân.');
            return;
        }

        const bookingData = {
            fieldId: selectedField.fieldId,
            userId: userId,
            date: searchParams.date,
            time: searchParams.time,
            numberOfPeople: numberOfPeople,
        };

        const confirmBooking = window.confirm('Bạn có chắc chắn muốn đặt sân không?');
        if (confirmBooking) {
            setIsLoading(true);  // Bắt đầu tải
            try {
                const response = await axios.post(`http://localhost:5000/api/player/book-field`, bookingData, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                alert('Đặt sân thành công!');  
                
                getUserBookings(userId, token);
                setIsBookingModalOpen(false);
                resetBookingForm();
            } catch (error) {
                console.error("Error booking field:", error);
                setError('Có lỗi xảy ra khi đặt sân.');
            } finally {
                setIsLoading(false);  // Kết thúc tải
            }
        }
    };

    // Reset form đặt sân
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

    // Hủy đặt sân
    const handleCancelBooking = async (bookingId) => {
        const token = localStorage.getItem('token');
        const confirmCancel = window.confirm('Bạn có chắc chắn muốn hủy đặt sân này không?');
        if (confirmCancel) {
            setIsLoading(true);  // Bắt đầu tải
            try {
                const response = await axios.delete(`http://localhost:5000/api/player/bookings/${bookingId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                alert('Hủy đặt sân thành công!');  
                getUserBookings(userId, token);
            } catch (error) {
                console.error("Error cancelling booking:", error);
                setError('Có lỗi xảy ra khi hủy đặt sân.');
            } finally {
                setIsLoading(false);  // Kết thúc tải
            }
        }
    };

    // Điều hướng về trang chủ
    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <div>
            <h1>Trang Chủ Của Người Chơi</h1>
            <button onClick={handleGoHome}>Trở lại Trang Chủ</button>

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

            {isLoading && <p>Đang xử lý...</p>}

            <div>
                <h2>Các Sân Tìm Thấy</h2>
                {fields.length > 0 ? (
                    <ul>
                        {fields.map(field => (
                            <li key={field.id}>
                                <h3>{field.name}</h3>
                                <p>Địa điểm: {field.location}</p>
                                <p>Loại sân: {field.type}</p>
                                <button onClick={() => openBookingModal(field)}>Đặt Sân</button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Không tìm thấy sân phù hợp</p>
                )}
            </div>

            {isBookingModalOpen && selectedField && (
                <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '5px', width: '300px' }}>
                    <h3>Đặt Sân {selectedField.name}</h3>

                    <label>Ngày:</label>
                    <input
                        type="date"
                        value={searchParams.date}
                        onChange={e => setSearchParams({ ...searchParams, date: e.target.value })}
                        required
                    /><br /><br />

                    <label>Giờ:</label>
                    <input
                        type="time"
                        value={searchParams.time}
                        onChange={e => setSearchParams({ ...searchParams, time: e.target.value })}
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

                    <button onClick={handleBookField} disabled={isLoading}>Xác Nhận Đặt Sân</button>
                    <button onClick={() => setIsBookingModalOpen(false)}>Hủy</button>
                </div>
            )}

            <div>
                <h2>Lịch Sử Đặt Sân</h2>
                {bookings.length > 0 ? (
                    <ul>
                        {bookings.map(booking => (
                            <li key={booking.id}>
                                <p>Sân: {booking.fieldName }</p>
                                <p>Ngày: {booking.date}</p>
                                <p>Giờ: {booking.time}</p>
                                <button onClick={() => handleCancelBooking(booking.id)} disabled={isLoading}>Hủy Đặt Sân</button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Chưa có lịch sử đặt sân</p>
                )}
            </div>
        </div>
    );
};

export default PlayerPage;
