import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from "../layouts/MainLayout";
import Item from "../components/common/Item";
import SearchTool from "../components/common/SearchTool";
import Container from "react-bootstrap/Container";
import { useNavigate } from 'react-router-dom';
import Compressor from 'compressorjs';
const PlayerPage = () => {
    const [fields, setFields] = useState([]);
    const [matches, setMatches] = useState([]);
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
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUserId = localStorage.getItem('userId');
        if (token && storedUserId) {
            setUserId(storedUserId);
            fetchBookings(storedUserId, token);
            fetchMatches(token);
        } else {
            setError('Bạn chưa đăng nhập.');
        }
        fetchDefaultFields(token);
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

    const fetchDefaultFields = async (token) => {
        setLoading(true);
        try {
            const response = await axios.get(
                `http://localhost:5000/api/player/fields`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setFields(response.data);
        } catch (err) {
            console.error("Error fetching default fields:", err);
            setError("Không thể tải danh sách sân.");
        } finally {
            setLoading(false);
        }
    };

    const fetchMatches = async (token) => {
        setLoading(true);
        try {
            const response = await axios.get(
                `http://localhost:5000/api/matches/all`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMatches(response.data);
        } catch (err) {
            console.error("Error fetching matches:", err);
            setError("Không thể tải danh sách trận đấu.");
        } finally {
            setLoading(false);
        }
    };

    const searchFields = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("Bạn cần đăng nhập để tìm kiếm.");
            return;
        }
        setLoading(true);
        try {
            const response = await axios.get(
                `http://localhost:5000/api/player/fields`,
                { headers: { Authorization: `Bearer ${token}` }, params: searchParams }
            );
            setFields(response.data);
            setError(response.data.length === 0 ? "Không tìm thấy sân nào phù hợp." : "");
        } catch (err) {
            console.error("Error searching fields:", err);
            setError("Có lỗi khi tìm kiếm sân.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/'); 
    };

    return (
        <MainLayout>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Trang Người Chơi</h1>
               
            </div>

            <SearchTool
                searchParams={searchParams}
                setSearchParams={setSearchParams}
                searchFields={searchFields}
            />

            <h2>Danh sách sân:</h2>
            {loading ? (
                <p>Đang tải danh sách sân và trận đấu...</p>
            ) : error ? (
                <p style={{ color: "red" }}>{error}</p>
            ) : fields.length > 0 ? (
                <ul>
                    {fields.map((field) => (
                        <Item key={field.fieldId} field={field} />
                    ))}
                </ul>
            ) : (
                <p>Không tìm thấy sân nào.</p>
            )}

            <h2>Danh sách trận đấu mở:</h2>
            {loading ? (
                <p>Đang tải danh sách sân và trận đấu...</p>
            ) : error ? (
                <p style={{ color: "red" }}>{error}</p>
            ) : matches.length > 0 ? (
                <ul>
                    {matches.map((match) => (
                        <Item key={match.id} match={match} />
                    ))}
                </ul>
            ) : (
                <p>Không có trận đấu nào được mở.</p>
            )}
        </MainLayout>
    );
};

export default PlayerPage;
