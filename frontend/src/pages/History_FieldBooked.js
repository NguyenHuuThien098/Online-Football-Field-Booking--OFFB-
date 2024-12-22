import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "bootstrap/dist/css/bootstrap.min.css";
import { getDatabase, ref, get } from 'firebase/database';
import { Button, Select, MenuItem, CircularProgress } from '@mui/material';
import styled from 'styled-components';

const Container = styled.div`
  padding: 2rem;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 1.5rem;
  color: #1976d2;
`;

const StatusSelectWrapper = styled.div`
  margin-bottom: 1.5rem;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  margin-top: 2rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  background-color: #fff;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
`;

const TableHeader = styled.th`
  background-color: #1976d2;
  color: white;
  padding: 0.8rem;
  text-align: left;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #ddd;
`;

const TableCell = styled.td`
  padding: 0.8rem;
  text-align: left;
`;

const ErrorAlert = styled.div`
  background-color: #f8d7da;
  color: #842029;
  padding: 1rem;
  margin-bottom: 1.5rem;
  border-radius: 0.5rem;
`;

const History_FieldBooked = () => {
    const [bookings, setBookings] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');

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
            const usersRef = ref(db, 'users');
            const bookingsRef = ref(db, 'bookings');
    
            const [largeFieldsSnapshot, usersSnapshot, bookingsSnapshot] = await Promise.all([
                get(largeFieldsRef),
                get(usersRef),
                get(bookingsRef),
            ]);
    
            const largeFieldsData = largeFieldsSnapshot.exists() ? largeFieldsSnapshot.val() : {};
            const usersData = usersSnapshot.exists() ? usersSnapshot.val() : {};
            const bookingsDataRaw = bookingsSnapshot.exists() ? bookingsSnapshot.val() : {};
    
            // Tạo smallFieldsData từ largeFields
            const smallFieldsData = {};
            Object.keys(largeFieldsData).forEach(largeFieldId => {
                const largeField = largeFieldsData[largeFieldId];
                if (largeField.smallFields) {
                    Object.keys(largeField.smallFields).forEach(smallFieldId => {
                        smallFieldsData[smallFieldId] = {
                            ...largeField.smallFields[smallFieldId],
                            largeFieldAddress: largeField.address, // Địa chỉ sân lớn
                            largeFieldName: largeField.name,      // Tên sân lớn
                        };
                    });
                }
            });
    
            // Trường hợp cho role 'field_owner'
            if (role === 'field_owner') {
                const response = await axios.get(`http://localhost:5000/api/confirmed/owner/${userId}/bookings`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
    
                bookingsData = response.data.data.flatMap(field =>
                    field.bookings.filter(booking => booking.status === '0').map(booking => {
                        const smallField = smallFieldsData[booking.smallFieldId] || {};
                        const userInfo = usersData[booking.userId] || {};
    
                        return {
                            bookingId: booking.bookingId,
                            fieldName: smallField.largeFieldName || 'Tên sân lớn chưa lấy được',
                            fieldNamesmall: smallField.name || 'Tên sân nhỏ chưa lấy được',
                            location: smallField.largeFieldAddress || 'Địa chỉ không có',
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
                // Trường hợp người dùng
                bookingsData = Object.keys(bookingsDataRaw)
                    .filter(key => bookingsDataRaw[key].userId === userId)
                    .map(key => {
                        const booking = bookingsDataRaw[key];
                        const smallField = smallFieldsData[booking.smallFieldId] || {};
                        const userInfo = usersData[booking.userId] || {};
    
                        return {
                            bookingId: key,
                            fieldName: smallField.largeFieldName || 'Tên sân lớn chưa lấy được',
                            fieldNamesmall: smallField.name || 'Tên sân nhỏ chưa lấy được',
                            location: smallField.largeFieldAddress || 'Địa chỉ không có',
                            date: booking.date,
                            startTime: booking.startTime,
                            endTime: booking.endTime,
                            numberOfPeople: booking.numberOfPeople,
                            playerName: userInfo.fullName || 'Chưa có tên',
                            phoneNumber: userInfo.phoneNumber || 'Chưa có số điện thoại',
                            status: booking.status,
                        };
                    });
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
            <Container>
                <Title>{isOwner ? 'Quản lý yêu cầu Đặt Sân' : 'Lịch Sử Đặt Sân'}</Title>
                {error && <ErrorAlert>{error}</ErrorAlert>}
                {isLoading ? (
                    <div style={{ textAlign: 'center' }}>
                        <CircularProgress />
                    </div>
                ) : (
                    <>
                        <StatusSelectWrapper>
                            <label className="mr-2">Lọc theo trạng thái:</label>
                            <Select
                                value={statusFilter}
                                onChange={handleStatusChange}
                                fullWidth
                                variant="outlined"
                            >
                                <MenuItem value="">Tất cả</MenuItem>
                                <MenuItem value="0">Chờ xác nhận</MenuItem>
                                <MenuItem value="1">Đã xác nhận</MenuItem>
                                <MenuItem value="2">Đã hủy</MenuItem>
                            </Select>
                        </StatusSelectWrapper>
                        <TableWrapper>
                            <Table>
                                <thead>
                                    <TableRow>
                                        <TableHeader>Sân lớn</TableHeader>
                                        <TableHeader>Tên sân nhỏ</TableHeader>
                                        <TableHeader>Địa chỉ</TableHeader>
                                        <TableHeader>Ngày</TableHeader>
                                        <TableHeader>Giờ</TableHeader>
                                        <TableHeader>Số người</TableHeader>
                                        <TableHeader>Người đặt</TableHeader>
                                        <TableHeader>Số điện thoại</TableHeader>
                                        <TableHeader>Trạng thái</TableHeader>
                                        <TableHeader>Hành động</TableHeader>
                                    </TableRow>
                                </thead>
                                <tbody>
                                    {filteredBookings.length > 0 ? (
                                        filteredBookings.map((booking) => (
                                            <TableRow key={booking.bookingId}>
                                                <TableCell>{booking.fieldName}</TableCell>
                                                <TableCell>{booking.fieldNamesmall}</TableCell>
                                                <TableCell>{booking.location}</TableCell>
                                                <TableCell>{booking.date}</TableCell>
                                                <TableCell>{`${booking.startTime} - ${booking.endTime}`}</TableCell>
                                                <TableCell>{booking.numberOfPeople} người</TableCell>
                                                <TableCell>{booking.playerName}</TableCell>
                                                <TableCell>{booking.phoneNumber}</TableCell>
                                                <TableCell>
                                                    {booking.status === '0' ? 'Chờ chủ sân xác nhận' :
                                                     booking.status === '1' ? 'Đã xác nhận' : 'Đã hủy'}
                                                </TableCell>
                                                <TableCell>
                                                    {booking.status === '0' && isOwner ? (
                                                        <>
                                                            <Button
                                                                variant="contained"
                                                                color="primary"
                                                                onClick={() => confirmBooking(booking.bookingId)}
                                                                disabled={isLoading}
                                                                style={{ marginRight: '5px' }}
                                                            >
                                                                Xác nhận
                                                            </Button>
                                                            <Button
                                                                variant="contained"
                                                                color="secondary"
                                                                onClick={() => rejectBooking(booking.bookingId)}
                                                                disabled={isLoading}
                                                            >
                                                                Từ chối
                                                            </Button>
                                                        </>
                                                    ) : isOwner && booking.status !== '2' ? (
                                                        <Button
                                                            variant="contained"
                                                            color="error"
                                                            onClick={() => cancelBooking(booking.bookingId)}
                                                            disabled={isLoading}
                                                        >
                                                            Hủy
                                                        </Button>
                                                    ) : (
                                                        booking.status === '1' && (
                                                            <Button
                                                                variant="contained"
                                                                color="error"
                                                                onClick={() => cancelBooking(booking.bookingId)}
                                                                disabled={isLoading}
                                                            >
                                                                Hủy đặt sân
                                                            </Button>
                                                        )
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan="10" style={{ textAlign: 'center' }}>
                                                Không có yêu cầu đặt sân nào.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </tbody>
                            </Table>
                        </TableWrapper>
                    </>
                )}
            </Container>
    );
};

export default History_FieldBooked;
