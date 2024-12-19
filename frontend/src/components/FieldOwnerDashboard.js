import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Button, Row, Col, ListGroup, Accordion, Form, FormGroup, FormControl, FormLabel } from 'react-bootstrap';


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
        return (
                <h1>Đang tải danh sách sân và trận đấu...</h1>
        );

    }

    if (error) {
        return (
                <p style={{ color: 'red' }}>{error}</p>
        );
    }

    const role = 'Field owner';

    return (
        <div>
                <Container fluid className="p-5">

                    <h1>Field Owner Dashboard</h1>
                    <Button variant="dark" onClick={() => navigate('/')}>
                        Back to Homepage
                    </Button>

                    <p>Welcome to the Field Owner Dashboard!</p>
                    {/* Chưa chạy được */}
                    <Row className='border p-5'>
                        <Col>
                            <Row>
                                <h2 className="text-center">Danh sách sân của bạn:</h2>
                                {fields.map((field) => (
                                    <Col key={field.fieldId} md={6}>
                                        <Accordion>
                                            <Accordion.Item eventKey={field.fieldId}>
                                                <Accordion.Header>
                                                    {field.name || 'Tên sân không xác định'}</Accordion.Header>
                                                <Accordion.Body>
                                                    <ListGroup variant="flush">
                                                        <ListGroup.Item>Địa điểm: {field.location}</ListGroup.Item>
                                                        <ListGroup.Item>Loại sân:  {field.type}</ListGroup.Item>
                                                        <ListGroup.Item>Giá:  {field.price}</ListGroup.Item>
                                                        <ListGroup.Item>Hình ảnh:  {field.image}</ListGroup.Item>
                                                        <ListGroup.Item>Số điện thoại liên hệ:  {field.contactNumber}</ListGroup.Item>
                                                        <ListGroup.Item>Giờ hoạt động:  {field.operatingHours}</ListGroup.Item>
                                                        <ListGroup.Item className='d-flex justify-content-end'>
                                                            <Button variant="primary" className='me-2' onClick={() => handleUpdateField(field.fieldId)}>Cập nhật</Button>
                                                            <Button variant="danger" onClick={() => handleDeleteField(field.fieldId)}>Xóa</Button>
                                                        </ListGroup.Item>
                                                    </ListGroup>
                                                </Accordion.Body>
                                            </Accordion.Item>
                                        </Accordion>

                                    </Col>
                                ))}
                            </Row>
                        </Col>
                        <Col className="border-start">
                            <h2 className="text-center">Danh sách trận đấu mở:</h2>
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
                        </Col>
                    </Row>


                    <Container>
                        <Row>
                            <Col>
                                <h2>Thêm sân mới:</h2>
                                <Form onSubmit={handleAddField}>
                                    <FormGroup>
                                        <FormLabel>Tên sân</FormLabel>
                                        <FormControl
                                            type="text"
                                            placeholder="Tên sân"
                                            value={newField.name}
                                            onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                                            required
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <FormLabel>Địa điểm</FormLabel>
                                        <FormControl
                                            type="text"
                                            placeholder="Địa điểm"
                                            value={newField.location}
                                            onChange={(e) => setNewField({ ...newField, location: e.target.value })}
                                            required
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <FormLabel>Loại sân</FormLabel>
                                        <FormControl
                                            as="select"
                                            value={newField.type}
                                            onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                                            required
                                        >
                                            <option value="">Chọn loại sân</option>
                                            <option value="5 người">5 người</option>
                                            <option value="7 người">7 người</option>
                                            <option value="11 người">11 người</option>
                                        </FormControl>
                                    </FormGroup>
                                    <FormGroup>
                                        <FormLabel>Giá thuê (VNĐ/giờ)</FormLabel>
                                        <FormControl
                                            type="number"
                                            placeholder="Giá thuê"
                                            value={newField.price}
                                            onChange={(e) => setNewField({ ...newField, price: e.target.value })}
                                            required
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <FormLabel>Link ảnh sân</FormLabel>
                                        <FormControl
                                            type="text"
                                            placeholder="Link ảnh"
                                            value={newField.image}
                                            onChange={(e) => setNewField({ ...newField, image: e.target.value })}
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <FormLabel>Số điện thoại liên hệ</FormLabel>
                                        <FormControl
                                            type="tel"
                                            placeholder="Số điện thoại"
                                            value={newField.contactNumber}
                                            onChange={(e) => setNewField({ ...newField, contactNumber: e.target.value })}
                                            required
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <FormLabel>Giờ hoạt động</FormLabel>
                                        <FormControl
                                            type="text"
                                            placeholder="Giờ hoạt động"
                                            value={newField.operatingHours}
                                            onChange={(e) => setNewField({ ...newField, operatingHours: e.target.value })}
                                            required
                                        />
                                    </FormGroup>
                                    <Button variant="primary" type="submit" className='my-3'>
                                        Thêm sân
                                    </Button>
                                </Form>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <h2>Thêm trận đấu mở:</h2>
                                <Form onSubmit={handleAddMatch}>
                                    <FormGroup>
                                        <FormLabel>Địa chỉ</FormLabel>
                                        <FormControl
                                            type="text"
                                            placeholder="Địa chỉ"
                                            value={newMatch.address}
                                            onChange={(e) => setNewMatch({ ...newMatch, address: e.target.value })}
                                            required
                                        />
                                    </FormGroup>
                                    {/* Other form fields for newMatch */}
                                    <Button variant="primary" type="submit" className='my-3'>
                                        Thêm trận đấu
                                    </Button>
                                </Form>
                            </Col>
                        </Row>
                    </Container>
                </Container>
        </div>

    );
};

export default FieldOwnerDashboard;