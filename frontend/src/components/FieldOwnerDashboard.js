import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const FieldOwnerDashboard = () => {
    const [fields, setFields] = useState([]);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newField, setNewField] = useState({
        name: '',
        location: '',
        type: '5 người',
        price: '',
        image: '',
        contactNumber: '',
        operatingHours: ''
    });
    const [newMatch, setNewMatch] = useState({
        address: '',
        time: '',
        ownerName: '',
        playerCount: '',
        notes: '',
        questions: ''
    });

    const navigate = useNavigate();
    const [token, setToken] = useState(null);

    useEffect(() => {
        const fetchFieldsAndMatches = async () => {
            try {
                // Lấy token từ localStorage và in ra console để kiểm tra
                const tokenFromStorage = localStorage.getItem('token');
                console.log('Token from localStorage:', tokenFromStorage); // In ra token
                setToken(tokenFromStorage); // Lưu token vào state

                const ownerId = localStorage.getItem('ownerId'); // Lấy ownerId từ local storage

                if (!ownerId) {
                    setError('Không tìm thấy ownerId');
                    setLoading(false);
                    return;
                }

                // Fetch fields
                const fieldsResponse = await axios.get(`http://localhost:5000/api/field-owner/fields/${ownerId}`, {
                    headers: {
                        'Authorization': `Bearer ${tokenFromStorage}`
                    }
                });
                const fieldsData = fieldsResponse.data;
                if (Array.isArray(fieldsData)) {
                    setFields(fieldsData);
                } else {
                    setError('Dữ liệu trả về không hợp lệ');
                }

                // Fetch matches
                const matchesResponse = await axios.get(`http://localhost:5000/api/matches/owner/${ownerId}`, {
                    headers: {
                        'Authorization': `Bearer ${tokenFromStorage}`
                    }
                });
                const matchesData = matchesResponse.data;
                if (Array.isArray(matchesData)) {
                    setMatches(matchesData);
                } else {
                    setError('Dữ liệu trả về không hợp lệ');
                }
            } catch (error) {
                console.error("Error fetching fields and matches:", error);
                setError('Có lỗi xảy ra khi tải danh sách sân và trận đấu.');
            } finally {
                setLoading(false);
            }
        };

        fetchFieldsAndMatches();
    }, []); // Chỉ chạy một lần khi component được mount

    const handleAddField = async () => {
        try {
            const tokenFromStorage = localStorage.getItem('token');
            const ownerId = localStorage.getItem('ownerId');
            const response = await axios.post('http://localhost:5000/api/field-owner/add-field', {
                ...newField,
                ownerId
            }, {
                headers: {
                    'Authorization': `Bearer ${tokenFromStorage}`
                }
            });
            setFields([...fields, response.data.field]);
            setNewField({
                name: '',
                location: '',
                type: '5 người',
                price: '',
                image: '',
                contactNumber: '',
                operatingHours: ''
            });
        } catch (error) {
            console.error("Error adding field:", error);
            setError('Có lỗi xảy ra khi thêm sân.');
        }
    };

    const handleUpdateField = async (fieldId) => {
        try {
            const tokenFromStorage = localStorage.getItem('token');
            const response = await axios.put(`http://localhost:5000/api/field-owner/update-field/${fieldId}`, newField, {
                headers: {
                    'Authorization': `Bearer ${tokenFromStorage}`
                }
            });
            setFields(fields.map(field => field.fieldId === fieldId ? response.data.field : field));
            setNewField({
                name: '',
                location: '',
                type: '5 người',
                price: '',
                image: '',
                contactNumber: '',
                operatingHours: ''
            });
        } catch (error) {
            console.error("Error updating field:", error);
            setError('Có lỗi xảy ra khi cập nhật sân.');
        }
    };

    const handleDeleteField = async (fieldId) => {
        try {
            const tokenFromStorage = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/field-owner/delete-field/${fieldId}`, {
                headers: {
                    'Authorization': `Bearer ${tokenFromStorage}`
                }
            });
            setFields(fields.filter(field => field.fieldId !== fieldId));
        } catch (error) {
            console.error("Error deleting field:", error);
            setError('Có lỗi xảy ra khi xóa sân.');
        }
    };

    const handleAddMatch = async () => {
        try {
            const tokenFromStorage = localStorage.getItem('token');
            const ownerId = localStorage.getItem('ownerId');
            const response = await axios.post('http://localhost:5000/api/matches', {
                ...newMatch,
                ownerId
            }, {
                headers: {
                    'Authorization': `Bearer ${tokenFromStorage}`
                }
            });
            setMatches([...matches, response.data]);
            setNewMatch({
                address: '',
                time: '',
                ownerName: '',
                playerCount: '',
                notes: '',
                questions: ''
            });
        } catch (error) {
            console.error("Error adding match:", error);
            setError('Có lỗi xảy ra khi thêm trận đấu.');
        }
    };

    const handleUpdateMatch = async (matchId) => {
        try {
            const tokenFromStorage = localStorage.getItem('token');
            const ownerId = localStorage.getItem('ownerId');
            const response = await axios.put(`http://localhost:5000/api/matches/${matchId}`, {
                ...newMatch,
                ownerId
            }, {
                headers: {
                    'Authorization': `Bearer ${tokenFromStorage}`
                }
            });
            setMatches(matches.map(match => match.id === matchId ? response.data.match : match));
            setNewMatch({
                address: '',
                time: '',
                ownerName: '',
                playerCount: '',
                notes: '',
                questions: ''
            });
        } catch (error) {
            console.error("Error updating match:", error);
            setError('Có lỗi xảy ra khi cập nhật trận đấu.');
        }
    };

    const handleDeleteMatch = async (matchId) => {
        try {
            const tokenFromStorage = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/matches/${matchId}`, {
                headers: {
                    'Authorization': `Bearer ${tokenFromStorage}`
                }
            });
            setMatches(matches.filter(match => match.id !== matchId));
        } catch (error) {
            console.error("Error deleting match:", error);
            setError('Có lỗi xảy ra khi xóa trận đấu.');
        }
    };

    if (loading) {
        return <p>Đang tải danh sách sân và trận đấu...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    return (
        <div>
            <h1>Field Owner Dashboard</h1>
            <p>Welcome to the Field Owner Dashboard!</p>
            <button onClick={() => navigate('/')}>Back to Homepage</button>

            {/* In token ra console */}
            <div>
                <p><strong>Token:</strong> {token}</p>
            </div>
            
            <h2>Danh sách sân của bạn:</h2>
            <ul>
                {fields.map((field) => (
                    <li key={field.fieldId}>
                        <p>Tên sân: {field.name ? field.name : 'Tên sân không xác định'}</p>
                        <p>Địa điểm: {field.location}</p>
                        <p>Loại sân: {field.type}</p>
                        <p>Giá: {field.price}</p>
                        <p>Hình ảnh: {field.image}</p>
                        <p>Số điện thoại liên hệ: {field.contactNumber}</p>
                        <p>Giờ hoạt động: {field.operatingHours}</p>
                        <button onClick={() => handleUpdateField(field.fieldId)}>Cập nhật</button>
                        <button onClick={() => handleDeleteField(field.fieldId)}>Xóa</button>
                    </li>
                ))}
            </ul>

            {/* Các phần còn lại */}
        </div>
    );
};

export default FieldOwnerDashboard;
