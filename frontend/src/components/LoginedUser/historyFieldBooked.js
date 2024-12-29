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

const HistoryFieldBooked = () => {
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
            // Comment out the actual fetch call and use mock data instead
            fetchBookings(userId, token, role);
            //setBookings(mockBookings);
        } else {
            setError('You are not logged in.');
        }
    }, []);

    // // Mock data for demonstration
    // const mockBookings = [
    //     {
    //         bookingId: '1',
    //         fieldName: 'Large Field A',
    //         fieldNamesmall: 'Small Field 1',
    //         location: '123 Main St',
    //         date: '2023-10-01',
    //         startTime: '10:00',
    //         endTime: '12:00',
    //         numberOfPeople: 10,
    //         playerName: 'John Doe',
    //         phoneNumber: '1234567890',
    //         status: '0', // Pending Confirmation
    //     },
    //     {
    //         bookingId: '2',
    //         fieldName: 'Large Field B',
    //         fieldNamesmall: 'Small Field 2',
    //         location: '456 Elm St',
    //         date: '2023-10-02',
    //         startTime: '14:00',
    //         endTime: '16:00',
    //         numberOfPeople: 8,
    //         playerName: 'Jane Smith',
    //         phoneNumber: '0987654321',
    //         status: '1', // Confirmed
    //     },
    //     {
    //         bookingId: '3',
    //         fieldName: 'Large Field C',
    //         fieldNamesmall: 'Small Field 3',
    //         location: '789 Oak St',
    //         date: '2023-10-03',
    //         startTime: '09:00',
    //         endTime: '11:00',
    //         numberOfPeople: 12,
    //         playerName: 'Alice Johnson',
    //         phoneNumber: '1122334455',
    //         status: '2', // Cancelled
    //     },
    // ];

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

            // Create smallFieldsData from largeFields
            const smallFieldsData = {};
            Object.keys(largeFieldsData).forEach(largeFieldId => {
                const largeField = largeFieldsData[largeFieldId];
                if (largeField.smallFields) {
                    Object.keys(largeField.smallFields).forEach(smallFieldId => {
                        smallFieldsData[smallFieldId] = {
                            ...largeField.smallFields[smallFieldId],
                            largeFieldAddress: largeField.address, // Large field address
                            largeFieldName: largeField.name,      // Large field name
                        };
                    });
                }
            });

            // Case for role 'field_owner'
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
                            fieldName: smallField.largeFieldName || 'Large field name not available',
                            fieldNamesmall: smallField.name || 'Small field name not available',
                            location: smallField.largeFieldAddress || 'Address not available',
                            date: booking.date,
                            startTime: booking.startTime,
                            endTime: booking.endTime,
                            numberOfPeople: booking.numberOfPeople,
                            playerName: userInfo.fullName || 'Name not available',
                            phoneNumber: userInfo.phoneNumber || 'Phone number not available',
                            status: booking.status,
                        };
                    })
                );
            } else {
                // Case for user
                bookingsData = Object.keys(bookingsDataRaw)
                    .filter(key => bookingsDataRaw[key].userId === userId)
                    .map(key => {
                        const booking = bookingsDataRaw[key];
                        const smallField = smallFieldsData[booking.smallFieldId] || {};
                        const userInfo = usersData[booking.userId] || {};

                        return {
                            bookingId: key,
                            fieldName: smallField.largeFieldName || 'Large field name not available',
                            fieldNamesmall: smallField.name || 'Small field name not available',
                            location: smallField.largeFieldAddress || 'Address not available',
                            date: booking.date,
                            startTime: booking.startTime,
                            endTime: booking.endTime,
                            numberOfPeople: booking.numberOfPeople,
                            playerName: userInfo.fullName || 'Name not available',
                            phoneNumber: userInfo.phoneNumber || 'Phone number not available',
                            status: booking.status,
                        };
                    });
            }

            setBookings(bookingsData);
        } catch (err) {
            console.error(err);
            setError('Unable to fetch booking history.');
        } finally {
            setIsLoading(false);
        }
    };


    const cancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;

        const token = localStorage.getItem('token');
        setIsLoading(true);
        try {
            await axios.delete(
                `http://localhost:5000/api/player/bookings/${bookingId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Booking cancelled successfully!');
            const userId = localStorage.getItem('userId');
            fetchBookings(userId, token, localStorage.getItem('role'));
        } catch (err) {
            console.error(err.response ? err.response.data : err);
            setError('Unable to cancel booking.');
        } finally {
            setIsLoading(false);
        }
    };

    const confirmBooking = async (bookingId) => {
        if (!bookingId) {
            alert('Invalid booking ID.');
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
            alert('You have accepted the booking request!');
            setBookings(prevBookings =>
                prevBookings.filter(booking => booking.bookingId !== bookingId)
            );
        } catch (err) {
            console.error(err.response ? err.response.data : err);
            setError('Unable to confirm booking.');
        } finally {
            setIsLoading(false);
        }
    };

    const rejectBooking = async (bookingId) => {
        if (!bookingId) {
            alert('Invalid booking ID.');
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
            alert('You have rejected the booking request!');
            setBookings(prevBookings =>
                prevBookings.filter(booking => booking.bookingId !== bookingId)
            );
        } catch (err) {
            console.error(err.response ? err.response.data : err);
            setError('Unable to reject booking.');
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
            <Title>{isOwner ? 'Manage Booking Requests' : 'Booking History'}</Title>
            {error && <ErrorAlert>{error}</ErrorAlert>}
            {isLoading ? (
                <div style={{ textAlign: 'center' }}>
                    <CircularProgress />
                </div>
            ) : (
                <>
                    <StatusSelectWrapper>
                        <label className="mr-2">Filter by status:</label>
                        <Select
                            value={statusFilter}
                            onChange={handleStatusChange}
                            fullWidth
                            variant="outlined"
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="0">Pending Confirmation</MenuItem>
                            <MenuItem value="1">Confirmed</MenuItem>
                            <MenuItem value="2">Cancelled</MenuItem>
                        </Select>
                    </StatusSelectWrapper>
                    <TableWrapper>
                        <Table>
                            <thead>
                                <TableRow>
                                    <TableHeader>Large Field</TableHeader>
                                    <TableHeader>Small Field Name</TableHeader>
                                    <TableHeader>Address</TableHeader>
                                    <TableHeader>Date</TableHeader>
                                    <TableHeader>Time</TableHeader>
                                    <TableHeader>Number of People</TableHeader>
                                    <TableHeader>Booker</TableHeader>
                                    <TableHeader>Phone Number</TableHeader>
                                    <TableHeader>Status</TableHeader>
                                    <TableHeader>Action</TableHeader>
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
                                            <TableCell>{booking.numberOfPeople} people</TableCell>
                                            <TableCell>{booking.playerName}</TableCell>
                                            <TableCell>{booking.phoneNumber}</TableCell>
                                            <TableCell>
    {booking.status === '0' ? 'Pending Confirmation' :
        booking.status === '1' ? 'Confirmed' :
            booking.status === '2' ? 'Cancelled' : 'Finished'
    }
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
                                                            Confirm
                                                        </Button>
                                                        <Button
                                                            variant="contained"
                                                            color="secondary"
                                                            onClick={() => rejectBooking(booking.bookingId)}
                                                            disabled={isLoading}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </>
                                                ) : isOwner && booking.status !== '2' ? (
                                                    <Button
                                                        variant="contained"
                                                        color="error"
                                                        onClick={() => cancelBooking(booking.bookingId)}
                                                        disabled={isLoading}
                                                    >
                                                        Cancel
                                                    </Button>
                                                ) : (
                                                    booking.status === '1' && (
                                                        <Button
                                                            variant="contained"
                                                            color="error"
                                                            onClick={() => cancelBooking(booking.bookingId)}
                                                            disabled={isLoading}
                                                        >
                                                            Cancel Booking
                                                        </Button>
                                                    )
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan="10" style={{ textAlign: 'center' }}>
                                            No booking requests found.
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

export default HistoryFieldBooked;
