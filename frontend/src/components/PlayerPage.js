// src/components/PlayerPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PlayerPage = () => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/matches');
                setMatches(response.data);
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