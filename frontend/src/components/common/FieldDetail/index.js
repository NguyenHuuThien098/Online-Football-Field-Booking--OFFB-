import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { getDatabase, ref, get } from 'firebase/database'; // Import Firebase functions

const FieldDetail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const field = location.state; // Lấy thông tin sân từ state của route

    const [ownerName, setOwnerName] = useState(null); // Lưu tên chủ sân
    const [ownerPhone, setOwnerPhone] = useState(null); // Lưu số điện thoại chủ sân

    useEffect(() => {
        if (field?.ownerId) {
            fetchOwnerInfo(field.ownerId); // Lấy thông tin chủ sân khi có ownerId
        }
    }, [field]);

    const fetchOwnerInfo = async (ownerId) => {
        try {
            const db = getDatabase();
            const userRef = ref(db, `users/${ownerId}`);
            const snapshot = await get(userRef);
            if (snapshot.exists()) {
                const userData = snapshot.val();
                setOwnerName(userData.fullName || "Không rõ");
                setOwnerPhone(userData.phoneNumber || "Không có");
            } else {
                setOwnerName("Không rõ");
                setOwnerPhone("Không có");
            }
        } catch (error) {
            console.error("Error fetching owner info:", error);
            setOwnerName("Không rõ");
            setOwnerPhone("Không có");
        }
    };

    const handleBookField = () => {
        const token = localStorage.getItem('token'); // Kiểm tra token trong localStorage

        if (!token) {
            // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
            alert('Bạn cần đăng nhập để đặt sân.');
            navigate('/login');
            return;
        }

        if (field) {
            // Điều hướng đến trang FieldBooked và truyền thông tin sân
            navigate('/fieldBookied', { state: { field } });
        } else {
            alert('Thông tin sân không khả dụng.');
        }
    };

    if (!field) {
        return <p>Không có thông tin sân. Vui lòng quay lại trang trước.</p>;
    }

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={6}>
                    <Card className="shadow rounded">
                        <Card.Img variant="top" src={field.image} rounded />
                        <Card.Body>
                            <Card.Title>{field.name}</Card.Title>
                            <Card.Text>
                                <b>Chủ sân:</b> {ownerName || "Đang tải..."} <br />
                                <b>SĐT:</b> {ownerPhone || "Đang tải..."} <br />
                                <b>Địa chỉ:</b> {field.location}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} md={6}>
                    <Card className="shadow rounded">
                        <Card.Body>
                            <div className="d-flex justify-content-end">
                                <Button variant="primary" onClick={handleBookField}>
                                    Đặt sân
                                </Button>
                            </div>
                            <Card.Title>Thông tin liên hệ</Card.Title>
                            <Card.Text>
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <b>Zalo:</b> <a href="#">zalo</a>
                                    </div>
                                    <div>
                                        <b>Facebook:</b> <a href="#">Facebook</a>
                                    </div>
                                </div>
                                <Card.Title>Ghi chú</Card.Title>
                                <ul className="list-group list-group-flush">
                                    <li className="list-group-item">10-sáng - 3h chiều sale</li>
                                    <li className="list-group-item">10-sáng - 3h chiều sale</li>
                                </ul>
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default FieldDetail;
