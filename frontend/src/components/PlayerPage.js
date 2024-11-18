import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { getDatabase, ref, get, onValue, onChildAdded, onChildChanged, onChildRemoved } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';

const PlayerPage = () => {
    const [fields, setFields] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isAuthenticated') === 'true');
    const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));
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
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);
                getUserRole(user.uid);
                if (token) {
                    getUserBookings(user.uid, token);
                }
                listenToFieldChanges(user.uid);
                listenToBookingChanges(user.uid);
            } else {
                navigate('/google-login');
            }
        });

        return () => unsubscribe();
    }, []);

    const getUserRole = async (userId) => {
        try {
            const db = getDatabase();
            const userRef = ref(db, 'users/' + userId);
            const snapshot = await get(userRef);
            if (snapshot.exists()) {
                setUserRole(snapshot.val().role);
            }
        } catch (error) {
            console.error('Error fetching user role:', error);
        }
    };

    const getUserBookings = async (userId, token) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/player/bookings/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setBookings(response.data);
        } catch (error) {
            console.error("Error fetching bookings:", error);
            window.confirm('Có lỗi xảy ra khi lấy lịch sử đặt sân.');
        }
    };

    const listenToFieldChanges = (userId) => {
        const db = getDatabase();
        const fieldsRef = ref(db, 'fields');
        
        onValue(fieldsRef, (snapshot) => {
            const fieldsData = [];
            snapshot.forEach((childSnapshot) => {
                fieldsData.push(childSnapshot.val());
            });
            console.log("Dữ liệu các sân hiện tại:", fieldsData);
            setFields(fieldsData);
        });
    };

    const listenToBookingChanges = (userId) => {
        const db = getDatabase();
        const bookingsRef = ref(db, `bookings/${userId}`);
        
        onChildAdded(bookingsRef, (snapshot) => {
            const newBooking = snapshot.val();
            setBookings((prevBookings) => [...prevBookings, newBooking]);
        });

        onChildChanged(bookingsRef, (snapshot) => {
            const updatedBooking = snapshot.val();
            setBookings((prevBookings) =>
                prevBookings.map((booking) =>
                    booking.id === updatedBooking.id ? updatedBooking : booking
                )
            );
        });

        onChildRemoved(bookingsRef, (snapshot) => {
            const removedBookingId = snapshot.key;
            setBookings((prevBookings) =>
                prevBookings.filter((booking) => booking.id !== removedBookingId)
            );
        });
    };

    const handleSearchFields = useCallback(async () => {
        const token = localStorage.getItem('token');
        setIsLoading(true);
        try {
            const response = await axios.get(`http://localhost:5000/api/player/fields`, {
                headers: { 'Authorization': `Bearer ${token}` },
                params: searchParams,
            });
            setFields(response.data);
        } catch (error) {
            console.error("Error searching fields:", error);
            window.confirm('Có lỗi xảy ra khi tìm kiếm sân.');
        } finally {
            setIsLoading(false);
        }
    }, [searchParams]);

    const openBookingModal = (field) => {
        setSelectedField(field);
        setIsBookingModalOpen(true);
    };

    const handleBookField = async () => {
        const token = localStorage.getItem('token');
        if (!searchParams.date || !searchParams.time || ![5, 7, 11].includes(numberOfPeople)) {
            window.confirm('Tất cả thông tin phải được cung cấp.');
            return;
        }

        const selectedDate = new Date(searchParams.date);
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        if (selectedDate < currentDate) {
            window.confirm('Ngày đặt sân không thể là ngày trong quá khứ.');
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
            setIsLoading(true);
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
                setIsLoading(false);
            }
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
        const confirmCancel = window.confirm('Bạn có chắc chắn muốn hủy đặt sân này không?');
        if (confirmCancel) {
            setIsLoading(true);
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
                setIsLoading(false);
            }
        }
    };

    const handleNavigateToProfile = () => {
        navigate('/user-profile');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userRole');
        localStorage.removeItem('ownerId');
        setIsLoggedIn(false);
        setUserRole('');
        navigate('/');
    };

    return (
        <div>
            <h1>Trang Chủ Của Người Chơi</h1>
            
            {/* Nút Chỉnh Trang cá nhân */}
            <button onClick={handleNavigateToProfile}>Chỉnh Trang cá nhân</button>

           {/* Nút Đăng xuất */} 
            <button onClick={handleLogout}>đăng xuất</button>

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
                                <h4> {field.image && <img src={field.image} alt={field.name} />}</h4>
                                <p>Địa điểm: {field.location}</p>
                                <p>Loại sân: {field.type}</p>
                                <p>Giá: {field.price} VND</p> 
                                <p>Đánh giá: {field.rating}</p>
                                <p>Tình trạng: {field.isAvailable ? 'Còn trống' : 'Đã đặt'}</p>
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
                    <p>Giá: {selectedField.price} VND</p>
                    
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
                                <h3>Tên sân: {booking.fieldName}</h3>
                                <p>Giá sân: {booking.fieldPrice} VND</p> 
                                <p>Ngày đặt: {new Date(booking.createdAt).toLocaleString()}</p>
                                <p>Giờ tham gia: {booking.time}</p>
                                <p>Số người: {booking.numberOfPeople}</p>
                                <button onClick={() => handleCancelBooking(booking.id)}>Hủy Đặt</button>
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
