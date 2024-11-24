import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MainLayout from "../layouts/MainLayout";


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

    useEffect(() => {
        const fetchFieldsAndMatches = async () => {
            try {
                const token = localStorage.getItem('token');
                const ownerId = localStorage.getItem('ownerId'); // Lấy ownerId từ local storage

                if (!ownerId) {
                    setError('Không tìm thấy ownerId');
                    setLoading(false);
                    return;
                }

                // Fetch fields
                const fieldsResponse = await axios.get(`http://localhost:5000/api/field-owner/fields/${ownerId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
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
                        'Authorization': `Bearer ${token}`
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
            const token = localStorage.getItem('token');
            const ownerId = localStorage.getItem('ownerId');
            const response = await axios.post('http://localhost:5000/api/field-owner/add-field', {
                ...newField,
                ownerId
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
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
            const token = localStorage.getItem('token');
            const response = await axios.put(`http://localhost:5000/api/field-owner/update-field/${fieldId}`, newField, {
                headers: {
                    'Authorization': `Bearer ${token}`
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
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/field-owner/delete-field/${fieldId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
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
            const token = localStorage.getItem('token');
            const ownerId = localStorage.getItem('ownerId');
            const response = await axios.post('http://localhost:5000/api/matches', {
                ...newMatch,
                ownerId
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
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
            const token = localStorage.getItem('token');
            const ownerId = localStorage.getItem('ownerId');
            const response = await axios.put(`http://localhost:5000/api/matches/${matchId}`, {
                ...newMatch,
                ownerId
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
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
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/matches/${matchId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
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

    const role = 'Field owner'
    return (
        <div>
            <MainLayout role={role}>
                <div class="container-fluid m-5">

                    <button className='btn btn-dark' onClick={() => navigate('/')}>Back to Homepage</button>
                    <h1>Field Owner Dashboard</h1>
                    <p>Welcome to the Field Owner Dashboard!</p>
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
                    <h2>Danh sách trận đấu mở:</h2>
                    <ul>
                        {matches.map((match) => (
                            <li key={match.id}>
                                <p>Địa chỉ: {match.address}</p>
                                <p>Thời gian: {match.time}</p>
                                <p>Tên chủ sân: {match.ownerName}</p>
                                <p>Số lượng người chơi: {match.playerCount}</p>
                                <p>Ghi chú: {match.notes}</p>
                                <p>Câu hỏi: {match.questions}</p>
                                <button onClick={() => handleUpdateMatch(match.id)}>Cập nhật</button>
                                <button onClick={() => handleDeleteMatch(match.id)}>Xóa</button>
                            </li>
                        ))}
                    </ul>
                    <h2>Thêm sân mới:</h2>
                    <form onSubmit={(e) => { e.preventDefault(); handleAddField(); }}>
                        <input type="text" placeholder="Tên sân" value={newField.name} onChange={(e) => setNewField({ ...newField, name: e.target.value })} required />
                        <input type="text" placeholder="Địa điểm" value={newField.location} onChange={(e) => setNewField({ ...newField, location: e.target.value })} required />
                        <select value={newField.type} onChange={(e) => setNewField({ ...newField, type: e.target.value })}>
                            <option value="5 người">5 người</option>
                            <option value="7 người">7 người</option>
                            <option value="11 người">11 người</option>
                        </select>
                        <input type="number" placeholder="Giá" value={newField.price} onChange={(e) => setNewField({ ...newField, price: e.target.value })} required />
                        <input type="text" placeholder="Hình ảnh" value={newField.image} onChange={(e) => setNewField({ ...newField, image: e.target.value })} />
                        <input type="text" placeholder="Số điện thoại liên hệ" value={newField.contactNumber} onChange={(e) => setNewField({ ...newField, contactNumber: e.target.value })} required />
                        <input type="text" placeholder="Giờ hoạt động" value={newField.operatingHours} onChange={(e) => setNewField({ ...newField, operatingHours: e.target.value })} required />
                        <button type="submit">Thêm sân</button>
                    </form>
                    <h2>Thêm trận đấu mở:</h2>
                    <form onSubmit={(e) => { e.preventDefault(); handleAddMatch(); }}>
                        <input type="text" placeholder="Địa chỉ" value={newMatch.address} onChange={(e) => setNewMatch({ ...newMatch, address: e.target.value })} required />
                        <input type="datetime-local" placeholder="Thời gian" value={newMatch.time} onChange={(e) => setNewMatch({ ...newMatch, time: e.target.value })} required />
                        <input type="text" placeholder="Tên chủ sân" value={newMatch.ownerName} onChange={(e) => setNewMatch({ ...newMatch, ownerName: e.target.value })} required />
                        <input type="number" placeholder="Số lượng người chơi" value={newMatch.playerCount} onChange={(e) => setNewMatch({ ...newMatch, playerCount: e.target.value })} required />
                        <textarea placeholder="Ghi chú" value={newMatch.notes} onChange={(e) => setNewMatch({ ...newMatch, notes: e.target.value })}></textarea>
                        <textarea placeholder="Câu hỏi" value={newMatch.questions} onChange={(e) => setNewMatch({ ...newMatch, questions: e.target.value })}></textarea>
                        <button type="submit">Thêm trận đấu</button>
                    </form>
                </div>
            </MainLayout>
        </div>

    );
};

export default FieldOwnerDashboard;