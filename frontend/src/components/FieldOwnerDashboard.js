import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Button, Grid, Card, CardContent, Typography, TextField, Collapse, IconButton, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

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
    const [openFieldForm, setOpenFieldForm] = useState(false);
    const [openMatchForm, setOpenMatchForm] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchFieldsAndMatches = async () => {
            try {
                const token = localStorage.getItem('token');
                const ownerId = localStorage.getItem('userId');
                const role = localStorage.getItem('userRole');
                if (!ownerId) {
                    setError('Không tìm thấy ownerId');
                    setLoading(false);
                    return;
                }
                if (role !== 'field_owner') {
                    setError('Không phải owner');
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
    }, []);

    const handleAddField = async () => {
        try {
            const token = localStorage.getItem('token');
            const ownerId = localStorage.getItem('userId');
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
            const ownerId = localStorage.getItem('userId');
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
            const ownerId = localStorage.getItem('userId');
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
        return (
            <Typography variant="h4" align="center">Đang tải danh sách sân và trận đấu...</Typography>
        );
    }

    if (error) {
        return (
            <Typography variant="h6" color="error" align="center">{error}</Typography>
        );
    }

    return (
        <Container>
            <Typography variant="h3" align="center" gutterBottom>
                Field Owner Dashboard
            </Typography>
            <Button variant="contained" color="primary" onClick={() => navigate('/')}>
                Back to Homepage
            </Button>
            <Typography variant="h5" align="center" gutterBottom>
                Welcome to the Field Owner Dashboard!
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Typography variant="h4" gutterBottom>
                        Danh sách sân của bạn:
                    </Typography>
                    {fields.map((field) => (
                        <Card key={field.fieldId} variant="outlined" sx={{ mb: 2 }}>
                            <CardContent>
                                <Typography variant="h5">{field.name || 'Tên sân không xác định'}</Typography>
                                <Typography variant="body1">Địa điểm: {field.location}</Typography>
                                <Typography variant="body1">Loại sân: {field.type}</Typography>
                                <Typography variant="body1">Giá: {field.price}</Typography>
                                <Typography variant="body1">Hình ảnh: {field.image}</Typography>
                                <Typography variant="body1">Số điện thoại liên hệ: {field.contactNumber}</Typography>
                                <Typography variant="body1">Giờ hoạt động: {field.operatingHours}</Typography>
                                <Button variant="contained" color="primary" onClick={() => handleUpdateField(field.fieldId)} sx={{ mt: 2, mr: 2 }}>
                                    Cập nhật
                                </Button>
                                <Button variant="contained" color="secondary" onClick={() => handleDeleteField(field.fieldId)} sx={{ mt: 2 }}>
                                    Xóa
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </Grid>
                <Grid item xs={12} md={6}>
                    <Typography variant="h4" gutterBottom>
                        Danh sách trận đấu mở:
                    </Typography>
                    {matches.map((match) => (
                        <Card key={match.id} variant="outlined" sx={{ mb: 2 }}>
                            <CardContent>
                                <Typography variant="h5">Địa chỉ: {match.address}</Typography>
                                <Typography variant="body1">Thời gian: {match.time}</Typography>
                                <Typography variant="body1">Tên chủ sân: {match.ownerName}</Typography>
                                <Typography variant="body1">Số lượng người chơi: {match.playerCount}</Typography>
                                <Typography variant="body1">Ghi chú: {match.notes}</Typography>
                                <Typography variant="body1">Câu hỏi: {match.questions}</Typography>
                                <Button variant="contained" color="primary" onClick={() => handleUpdateMatch(match.id)} sx={{ mt: 2, mr: 2 }}>
                                    Cập nhật
                                </Button>
                                <Button variant="contained" color="secondary" onClick={() => handleDeleteMatch(match.id)} sx={{ mt: 2 }}>
                                    Xóa
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </Grid>
            </Grid>
            <Box sx={{ border: '1px solid #ccc', borderRadius: '8px', mt: 4, p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Thêm sân mới:
                </Typography>
                <form onSubmit={handleAddField}>
                    <TextField
                        label="Tên sân"
                        value={newField.name}
                        onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        label="Địa điểm"
                        value={newField.location}
                        onChange={(e) => setNewField({ ...newField, location: e.target.value })}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        label="Loại sân"
                        value={newField.type}
                        onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        label="Giá thuê (VNĐ/giờ)"
                        value={newField.price}
                        onChange={(e) => setNewField({ ...newField, price: e.target.value })}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        label="Link ảnh sân"
                        value={newField.image}
                        onChange={(e) => setNewField({ ...newField, image: e.target.value })}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Số điện thoại liên hệ"
                        value={newField.contactNumber}
                        onChange={(e) => setNewField({ ...newField, contactNumber: e.target.value })}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        label="Giờ hoạt động"
                        value={newField.operatingHours}
                        onChange={(e) => setNewField({ ...newField, operatingHours: e.target.value })}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <Button variant="contained" color="primary" type="submit" sx={{ mt: 2 }}>
                        Thêm sân
                    </Button>
                </form>
            </Box>
            <Box sx={{ border: '1px solid #ccc', borderRadius: '8px', mt: 4, p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Thêm trận đấu mở:
                </Typography>
                <form onSubmit={handleAddMatch}>
                    <TextField
                        label="Địa chỉ"
                        value={newMatch.address}
                        onChange={(e) => setNewMatch({ ...newMatch, address: e.target.value })}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        label="Thời gian"
                        value={newMatch.time}
                        onChange={(e) => setNewMatch({ ...newMatch, time: e.target.value })}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        label="Tên chủ sân"
                        value={newMatch.ownerName}
                        onChange={(e) => setNewMatch({ ...newMatch, ownerName: e.target.value })}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        label="Số lượng người chơi"
                        value={newMatch.playerCount}
                        onChange={(e) => setNewMatch({ ...newMatch, playerCount: e.target.value })}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        label="Ghi chú"
                        value={newMatch.notes}
                        onChange={(e) => setNewMatch({ ...newMatch, notes: e.target.value })}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Câu hỏi"
                        value={newMatch.questions}
                        onChange={(e) => setNewMatch({ ...newMatch, questions: e.target.value })}
                        fullWidth
                        margin="normal"
                    />
                    <Button variant="contained" color="primary" type="submit" sx={{ mt: 2 }}>
                        Thêm trận đấu
                    </Button>
                </form>
            </Box>
        </Container>
    );
};

export default FieldOwnerDashboard;