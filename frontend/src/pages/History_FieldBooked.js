import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "bootstrap/dist/css/bootstrap.min.css";
import MainLayout from "../layouts/MainLayout";
import { getDatabase, ref, get } from 'firebase/database'; // Import Firebase SDK

const History_FieldBooked = () => {
    const [bookings, setBookings] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOwner, setIsOwner] = useState(false);  // Thêm state để kiểm tra nếu người dùng là chủ sân

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const role = localStorage.getItem('role'); // Lấy role của người dùng từ localStorage

        if (token && userId) {
            setIsOwner(role === 'field_owner');  // Kiểm tra role và cập nhật isOwner
            fetchBookings(userId, token, role);
        } else {
            setError('Bạn chưa đăng nhập.');
        }
    }, []);

    const fetchBookings = async (userId, token, role) => {
        setIsLoading(true);
        try {
            let bookingsData = [];
    
            if (role === 'field_owner') {
                // Lấy tất cả các yêu cầu đặt sân của chủ sân từ API
                const response = await axios.get(`http://localhost:5000/api/confirmed/owner/${userId}/bookings`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
    
                const db = getDatabase();
                const largeFieldsRef = ref(db, 'largeFields');
                const smallFieldsRef = ref(db, 'smallFields');
                const largeFieldsSnapshot = await get(largeFieldsRef);
                const smallFieldsSnapshot = await get(smallFieldsRef);
    
                const largeFieldsData = largeFieldsSnapshot.exists() ? largeFieldsSnapshot.val() : {};
                const smallFieldsData = smallFieldsSnapshot.exists() ? smallFieldsSnapshot.val() : {};
    
                bookingsData = response.data.data.flatMap(field => 
                    field.bookings.filter(booking => booking.status === '0').map(booking => {
                        // Lấy thông tin sân từ Firebase dựa trên fieldId
                        const largeField = largeFieldsData[booking.largeFieldId] || {};
                        const smallField = smallFieldsData[booking.smallFieldId] || {};
    
                        return {
                            bookingId: booking.bookingId,
                            fieldName: smallField.name || largeField.name || 'Tên sân chưa lấy được',  // Tên sân
                            location: largeField.address || smallField.address || 'Địa chỉ không có',  // Địa chỉ sân
                            date: booking.date,
                            startTime: booking.startTime,
                            endTime: booking.endTime,
                            numberOfPeople: booking.numberOfPeople,
                            playerName: booking.playerName,
                            status: booking.status,
                        };
                    })
                );
            } else {
                // Dành cho người chơi (player)
                const db = getDatabase();
                const bookingsRef = ref(db, 'bookings');
                const snapshot = await get(bookingsRef);
    
                if (snapshot.exists()) {
                    const data = snapshot.val();
    
                    // Lấy dữ liệu các sân lớn và sân nhỏ
                    const largeFieldsRef = ref(db, 'largeFields');
                    const smallFieldsRef = ref(db, 'smallFields');
                    const largeFieldsSnapshot = await get(largeFieldsRef);
                    const smallFieldsSnapshot = await get(smallFieldsRef);
    
                    const largeFieldsData = largeFieldsSnapshot.exists() ? largeFieldsSnapshot.val() : {};
                    const smallFieldsData = smallFieldsSnapshot.exists() ? smallFieldsSnapshot.val() : {};
    
                    bookingsData = Object.keys(data).filter(key => data[key].userId === userId).map(key => {
                        const booking = data[key];
                        const largeField = largeFieldsData[booking.largeFieldId] || {};
                        const smallField = smallFieldsData[booking.smallFieldId] || {};
    
                        return {
                            bookingId: key,
                            fieldName: smallField.name || largeField.name || 'Tên sân chưa lấy được',  // Lấy tên sân
                            location: largeField.address || smallField.address || 'Địa chỉ không có',  // Lấy địa chỉ sân
                            date: booking.date,
                            startTime: booking.startTime,
                            endTime: booking.endTime,
                            numberOfPeople: booking.numberOfPeople,
                            playerName: booking.playerName,
                            status: booking.status,
                        };
                    });
                } else {
                    setError('Không có lịch sử đặt sân.');
                }
            }
    
            setBookings(bookingsData);
        } catch (err) {
            console.error(err);
            setError('Không thể lấy lịch sử đặt sân.');
        } finally {
            setIsLoading(false);
        }
    };

    const cancelBooking = async (bookingId) => {
        if (!window.confirm('Bạn có chắc muốn hủy đặt sân này không?')) return;

        const token = localStorage.getItem('token');
        setIsLoading(true);
        try {
            await axios.delete(
                `http://localhost:5000/api/player/bookings/${bookingId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Hủy đặt sân thành công!');
            const userId = localStorage.getItem('userId');
            fetchBookings(userId, token, localStorage.getItem('role')); // Tải lại dữ liệu
        } catch (err) {
            console.error(err.response ? err.response.data : err);
            setError('Không thể hủy đặt sân.');
        } finally {
            setIsLoading(false);
        }
    };

    const confirmBooking = async (bookingId) => {
        if (!bookingId) {
            alert('ID đặt sân không hợp lệ.');
            return;
        }
        const token = localStorage.getItem('token');
        setIsLoading(true);
        try {
            await axios.post(
                `http://localhost:5000/api/confirmed/bookings/${bookingId}/confirm`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Đặt sân đã được xác nhận!');
            // Loại bỏ booking đã xác nhận khỏi danh sách
            setBookings(prevBookings => 
                prevBookings.filter(booking => booking.bookingId !== bookingId)
            );
        } catch (err) {
            console.error(err.response ? err.response.data : err);
            setError('Không thể xác nhận đặt sân.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const rejectBooking = async (bookingId) => {
        if (!bookingId) {
            alert('ID đặt sân không hợp lệ.');
            return;
        }
        const token = localStorage.getItem('token');
        setIsLoading(true);
        try {
            await axios.post(
                `http://localhost:5000/api/confirmed/bookings/${bookingId}/reject`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Đặt sân đã bị từ chối!');
            // Loại bỏ booking đã từ chối khỏi danh sách
            setBookings(prevBookings => 
                prevBookings.filter(booking => booking.bookingId !== bookingId)
            );
        } catch (err) {
            console.error(err.response ? err.response.data : err);
            setError('Không thể từ chối đặt sân.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="container mt-5">
                <h1 className="text-center mb-4">{isOwner ? 'Yêu cầu Đặt Sân' : 'Lịch Sử Đặt Sân'}</h1>
                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}
                {isLoading ? (
                    <p className="text-center">Đang tải dữ liệu...</p>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-striped table-bordered table-hover">
                            <thead className="thead-dark">
                                <tr>
                                    <th scope="col">Tên sân</th>
                                    <th scope="col">Địa chỉ</th>
                                    <th scope="col">Ngày</th>
                                    <th scope="col">Giờ</th>
                                    <th scope="col">Số người</th>
                                    <th scope="col">Trạng thái</th>
                                    <th scope="col">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.length > 0 ? (
                                    bookings.map((booking) => (
                                        <tr key={booking.bookingId}>
                                            <td>{booking.fieldName}</td>
                                            <td>{booking.location}</td>
                                            <td>{booking.date}</td>
                                            <td>{`${booking.startTime} - ${booking.endTime}`}</td>
                                            <td>{booking.numberOfPeople} người</td>
                                            <td>
                                                {booking.status === '0' ? 'Chờ xác nhận' :
                                                 booking.status === '1' ? 'Đã xác nhận' : 'Đã hủy'}
                                            </td>
                                            <td>
                                                {booking.status === '0' && isOwner ? (
                                                    <>
                                                        <button className="btn btn-outline-success btn-sm mr-2" onClick={() => confirmBooking(booking.bookingId)} disabled={isLoading}>
                                                            Xác nhận
                                                        </button>
                                                        <button className="btn btn-outline-danger btn-sm" onClick={() => rejectBooking(booking.bookingId)} disabled={isLoading}>
                                                            Từ chối
                                                        </button>
                                                    </>
                                                ) : isOwner ? (
                                                    booking.status !== '2' && (
                                                        <button
                                                            className="btn btn-outline-warning btn-sm"
                                                            onClick={() => cancelBooking(booking.bookingId)}
                                                            disabled={isLoading}
                                                        >
                                                            Hủy
                                                        </button>
                                                    )
                                                ) : (
                                                    booking.status === '1' && (
                                                        <button
                                                            className="btn btn-outline-danger btn-sm"
                                                            onClick={() => cancelBooking(booking.bookingId)}
                                                            disabled={isLoading}
                                                        >
                                                            Hủy đặt sân
                                                        </button>
                                                    )
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center">
                                            Chưa có yêu cầu đặt sân nào.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default History_FieldBooked;
    