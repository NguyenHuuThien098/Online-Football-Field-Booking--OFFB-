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
        const fetchMatches = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/matches', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = response.data;
                if (Array.isArray(data)) {
                    setMatches(data);
                } else {
                    setError('Dữ liệu trả về không hợp lệ');
                }
            } catch (error) {
                console.error("Error fetching matches:", error);
                setError('Có lỗi xảy ra khi tải danh sách trận đấu.');
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
    }, []);

    if (loading) {
        return <p>Đang tải danh sách trận đấu...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    return (
        <div>
            <h1>Player Page</h1>
            <p>Welcome to the Player Page!</p>
            <h2>Danh sách trận đấu:</h2>
            <ul>
                {matches.map((match) => (
                    <li key={match.id}>{match.title}</li>
                ))}
            </ul>
        </div>
    );
};

export default PlayerPage;
