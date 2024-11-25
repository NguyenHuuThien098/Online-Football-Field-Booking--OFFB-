import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "bootstrap/dist/css/bootstrap.min.css";
import MainLayout from "../layouts/MainLayout";

const History_FieldBooked = () => {
    const [bookings, setBookings] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        if (token && userId) {
            fetchBookings(userId, token);
        } else {
            setError('Bạn chưa đăng nhập.');
        }
    }, []);

    const fetchBookings = async (userId, token) => {
        setIsLoading(true);
        try {
            const response = await axios.get(
                `http://localhost:5000/api/player/bookings/${userId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setBookings(response.data);
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
            // Cập nhật danh sách đặt sân
            const userId = localStorage.getItem('userId');
            fetchBookings(userId, token);
        } catch (err) {
            console.error(err);
            setError('Không thể hủy đặt sân.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="container mt-5">
                <h1>Lịch Sử Đặt Sân</h1>
                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}
                {isLoading ? (
                    <p>Đang tải dữ liệu...</p>
                ) : (
                    <table className="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Tên sân</th>
                                <th scope="col">Địa chỉ</th>
                                <th scope="col">Ngày</th>
                                <th scope="col">Giờ</th>
                                <th scope="col">Số người</th>
                                <th scope="col">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.length > 0 ? (
                                bookings.map((booking, index) => (
                                    <tr key={booking.id}>
                                        <th scope="row">{index + 1}</th>
                                        <td>{booking.fieldName}</td>
                                        <td>{booking.location}</td>
                                        <td>{booking.date}</td>
                                        <td>{`${booking.startTime} - ${booking.endTime}`}</td>
                                        <td>{booking.numberOfPeople} người</td>
                                        <td>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => cancelBooking(booking.id)}
                                                disabled={isLoading}
                                            >
                                                Hủy
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center">
                                        Chưa có đặt sân nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </MainLayout>
    );
};

export default History_FieldBooked;
