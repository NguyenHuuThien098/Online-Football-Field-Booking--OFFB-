import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Row, Col, ListGroup } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { getDatabase, ref, get } from 'firebase/database'; // Import Firebase functions

const FieldDetail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const field = location.state; // Get field info from route state

    const [ownerName, setOwnerName] = useState(null); // Store owner's name
    const [ownerPhone, setOwnerPhone] = useState(null); // Store owner's phone number
    const [largeField, setLargeField] = useState(null); // State to store large field info

    useEffect(() => {
        if (field?.ownerId) {
            fetchOwnerInfo(field.ownerId); // Fetch owner info when ownerId is available
        } else {
            // Fallback data if no ownerId is available
            setOwnerName("Default Owner");
            setOwnerPhone("000-000-0000");
        }
        if (field?.largeFieldId) {
            fetchLargeField(field.largeFieldId); // Fetch large field info when largeFieldId is available
        } else {
            // Fallback data if no largeFieldId is available
            setLargeField({ name: "Default Large Field", address: "Default Address" });
        }
    }, [field]);

    const fetchOwnerInfo = async (ownerId) => {
        try {
            const db = getDatabase();
            const userRef = ref(db, `users/${ownerId}`);
            const snapshot = await get(userRef);
            if (snapshot.exists()) {
                const userData = snapshot.val();
                setOwnerName(userData.fullName || "Unknown");
                setOwnerPhone(userData.phoneNumber || "Not available");
            } else {
                setOwnerName("Unknown");
                setOwnerPhone("Not available");
            }
        } catch (error) {
            console.error("Error fetching owner info:", error);
            setOwnerName("Unknown");
            setOwnerPhone("Not available");
        }
    };

    const fetchLargeField = async (largeFieldId) => {
        try {
            const db = getDatabase();
            const fieldRef = ref(db, `field-owner/large-field/${largeFieldId}`);
            const snapshot = await get(fieldRef);
            if (snapshot.exists()) {
                const fieldData = snapshot.val();
                setLargeField(fieldData);
            } else {
                console.error("No large field data available");
            }
        } catch (error) {
            console.error("Error fetching large field info:", error);
        }
    };

    const handleBookField = () => {
        const token = localStorage.getItem('token'); // Check token in localStorage

        if (!token) {
            // If not logged in, redirect to login page
            alert('You need to log in to book a field.');
            navigate('/login');
            return;
        }

        if (field) {
            // Navigate to FieldBooked page and pass field info
            navigate('/fieldBookied', { state: { field } });
        } else {
            alert('Field information is not available.');
        }
    };

    const availableTimeSlots = () => {
        if (!field || !field.bookingSlots) {
            return (
                <p style={{ color: '#f44336' }}>
                    Currently unavailable
                </p>
            );
        }

        const today = new Date().toISOString().slice(0, 10); // Get today's date
        const availableSlots = [];

        for (const date in field.bookingSlots) {
            if (date >= today) {
                for (const timeSlot in field.bookingSlots[date]) {
                    if (field.bookingSlots[date][timeSlot]) {
                        availableSlots.push({ date, timeSlot });
                    }
                }
            }
        }

        if (availableSlots.length > 0) {
            return (
                <div>
                    <p style={{ color: 'primary' }}>
                        Available Slots:
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                        {availableSlots.map((slot, index) => (
                            <span key={index} style={{ marginRight: 8, marginBottom: 8, padding: '5px', border: '1px solid #ccc', borderRadius: '5px' }}>
                                {`${slot.date} ${slot.timeSlot}`}
                            </span>
                        ))}
                    </div>
                </div>
            );
        } else {
            return (
                <p style={{ color: '#f44336' }}>
                    Currently unavailable
                </p>
            );
        }
    };

    if (!field) {
        return <p>No field information. Please go back to the previous page.</p>;
    }

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card className="shadow rounded">
                        <Card.Img variant="top" src={field.image || 'https://thptlethipha.edu.vn/wp-content/uploads/2023/03/SAN-BONG.jpg'} rounded />
                        <Card.Body>
                            <Card.Title>{field.name}</Card.Title>
                            <Card.Text>
                                <b>Owner:</b> {ownerName || "Loading..."} <br />
                                <b>Phone:</b> {ownerPhone || "Loading..."} <br />
                                <b>Address:</b> {field.location || "Default Address"} <br />
                                <b>Large field name:</b> {largeField?.name || "Default Large Field"} <br />
                                <b>Large field address:</b> {largeField?.address || "Default Address"}
                            </Card.Text>
                            <div className="d-flex justify-content-end mb-3">
                                <Button variant="primary" onClick={handleBookField}>
                                    Book field
                                </Button>
                            </div>
                            <Card.Title>Available Time Slots</Card.Title>
                            <Card.Text>
                                {availableTimeSlots()}
                            </Card.Text>
                            <Card.Title>Contact information</Card.Title>
                            <Card.Text>
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <b>Zalo:</b> <a href="#" className="btn btn-outline-primary btn-sm">Zalo</a>
                                    </div>
                                    <div>
                                        <b>Facebook:</b> <a href="#" className="btn btn-outline-primary btn-sm">Facebook</a>
                                    </div>
                                </div>
                                <Card.Title>Notes</Card.Title>
                                <ListGroup variant="flush">
                                    <ListGroup.Item>10 AM - 3 PM sale</ListGroup.Item>
                                    <ListGroup.Item>10 AM - 3 PM sale</ListGroup.Item>
                                </ListGroup>
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default FieldDetail;
