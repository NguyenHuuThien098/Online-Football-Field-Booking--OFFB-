import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "bootstrap/dist/css/bootstrap.min.css";
import MainLayout from "../layouts/MainLayout";
import { getDatabase, ref, get } from 'firebase/database';

const History_FieldBooked = () => {
    const [bookings, setBookings] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');  // State for the selected status filter

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const role = localStorage.getItem('role');

        if (token && userId) {
            setIsOwner(role === 'field_owner');
            fetchBookings(userId, token, role);
        } else {
            setError('Bạn chưa đăng nhập.');
        }
    }, []);

    const fetchBookings = async (userId, token, role) => {
        setIsLoading(true);
        try {
            let bookingsData = [];
    
            const db = getDatabase();
            const largeFieldsRef = ref(db, 'largeFields');
            const smallFieldsRef = ref(db, 'smallFields');
            const usersRef = ref(db, 'users');
    
            const [largeFieldsSnapshot, smallFieldsSnapshot, usersSnapshot] = await Promise.all([
                get(largeFieldsRef),
                get(smallFieldsRef),
                get(usersRef)
            ]);
    
            const largeFieldsData = largeFieldsSnapshot.exists() ? largeFieldsSnapshot.val() : {};
            const smallFieldsData = smallFieldsSnapshot.exists() ? smallFieldsSnapshot.val() : {};
            const usersData = usersSnapshot.exists() ? usersSnapshot.val() : {};
    
            if (role === 'field_owner') {
                const response = await axios.get(`http://localhost:5000/api/confirmed/owner/${userId}/bookings`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
    
                bookingsData = response.data.data.flatMap(field =>
                    field.bookings.filter(booking => booking.status === '0').map(booking => {
                        const smallField = smallFieldsData[booking.smallFieldId] || {};
                        const largeField = largeFieldsData[booking.largeFieldId] || {};
                        const userInfo = usersData[booking.userId] || {};
    
                        const fieldName = smallField.name || largeField.name || 'Tên sân chưa lấy được';
    
                        return {
                            bookingId: booking.bookingId,
                            fieldName: fieldName,
                            location: smallField.largeFieldAddress || largeField.address || 'Địa chỉ không có',
                            date: booking.date,
                            startTime: booking.startTime,
                            endTime: booking.endTime,
                            numberOfPeople: booking.numberOfPeople,
                            playerName: userInfo.fullName || 'Chưa có tên',
                            phoneNumber: userInfo.phoneNumber || 'Chưa có số điện thoại',
                            status: booking.status,
                        };
                    })
                );
            } else {
                const bookingsRef = ref(db, 'bookings');
                const snapshot = await get(bookingsRef);
    
                if (snapshot.exists()) {
                    const data = snapshot.val();
    
                    bookingsData = Object.keys(data)
                        .filter(key => data[key].userId === userId)
                        .map(key => {
                            const booking = data[key];
                            const smallField = smallFieldsData[booking.smallFieldId] || {};
                            const largeField = largeFieldsData[booking.largeFieldId] || {};
                            const userInfo = usersData[booking.userId] || {};
    
                            const fieldNamelarg  = smallField.name || largeField.name || 'Tên sân chưa lấy được';
                            const fieldNamesmall = smallField.largeFieldName ;             
                            return {
                                bookingId: key,
                                fieldNamelarg: fieldNamelarg,
                                fieldNamesmall: fieldNamesmall,
                                location: smallField.largeFieldAddress || largeField.address || 'Địa chỉ không có',
                                date: booking.date,
                                startTime: booking.startTime,
                                endTime: booking.endTime,
                                numberOfPeople: booking.numberOfPeople,
                                playerName: userInfo.fullName || 'Chưa có tên',
                                phoneNumber: userInfo.phoneNumber || 'Chưa có số điện thoại',
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
            fetchBookings(userId, token, localStorage.getItem('role'));
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
            alert('Bạn đã chấp nhận yêu cầu đặt sân!');
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
            alert('Bạn đã từ chối yêu cầu đặt sân!');
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

    // Handle status filter change
    const handleStatusChange = (e) => {
        setStatusFilter(e.target.value);
    };

    // Filter bookings based on the selected status
    const filteredBookings = bookings.filter(booking => {
        return statusFilter ? booking.status === statusFilter : true;
    });

    return (
        <MainLayout>
            <div className="container mt-5">
                <h1 className="text-center mb-4">{isOwner ? 'Quản lý yêu cầu Đặt Sân' : 'Lịch Sử Đặt Sân'}</h1>
                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}
                {isLoading ? (
                    <p className="text-center">Đang tải dữ liệu...</p>
                ) : (
                    <>
                        {/* Status Filter Dropdown */}
                        <div className="mb-4">
                            <label className="mr-2">Lọc theo trạng thái:</label>
                            <select
                                className="form-select"
                                value={statusFilter}
                                onChange={handleStatusChange}
                            >
                                <option value="">Tất cả</option>
                                <option value="0">Chờ xác nhận</option>
                                <option value="1">Đã xác nhận</option>
                                <option value="2">Đã hủy</option>
                            </select>
                        </div>

                        <div className="table-responsive">
                            <table className="table table-striped table-bordered table-hover">
                                <thead className="thead-dark">
                                    <tr>
                                        <th scope="col">Sân lớn</th>
                                        <th scope="col">Tên sân nhỏ</th>
                                        <th scope="col">Địa chỉ</th>
                                        <th scope="col">Ngày</th>
                                        <th scope="col">Giờ</th>
                                        <th scope="col">Số người</th>
                                        <th scope="col">Người đặt</th>
                                        <th scope="col">Số điện thoại</th>
                                        <th scope="col">Trạng thái</th>
                                        <th scope="col">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredBookings.length > 0 ? (
                                        filteredBookings.map((booking) => (
                                            <tr key={booking.bookingId}>
                                                <td>{booking.fieldNamelarg}</td>
                                                <td> {booking.fieldNamesmall}</td>
                                                <td>{booking.location}</td>
                                                <td>{booking.date}</td>
                                                <td>{`${booking.startTime} - ${booking.endTime}`}</td>
                                                <td>{booking.numberOfPeople} người</td>
                                                <td>{booking.playerName}</td>
                                                <td>{booking.phoneNumber}</td>
                                                <td>
                                                    {booking.status === '0' ? 'Chờ chủ sân xác nhận' :
                                                     booking.status === '1' ? 'Chủ sân đã xác nhận yêu cầu' : 'Chủ sân từ đã từ chối yêu cầu'}
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
                    </>
                )}
            </div>
        </MainLayout>
    );
};

export default History_FieldBooked;
