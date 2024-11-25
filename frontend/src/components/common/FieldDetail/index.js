import { Container, Card, Button, Row, Col, ListGroup, Accordion, Form, FormGroup, FormControl, FormLabel } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
// import style from "/FieldDetail.module.scss";
import Image from 'react-bootstrap/Image';
import axios from "axios";
import React, { useEffect, useState } from "react";



const FieldDetail = () => {
    const location = useLocation();
    const field = location.state;

    const [users, setUsers] = useState([]);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
  
    useEffect(() => {
      const fetchUsersAndMatches = async () => {
        try {
          // Fetch fields
          const usersResponse = await axios.get(
            "http://localhost:5000/api/user/me"
          );
          const usersData = usersResponse.data;
          setUsers(usersData);
  
        } catch (error) {
          console.error("Error fetching users and matches:", error);
          setError("Có lỗi xảy ra khi tải danh sách sân và trận đấu.");
        } finally {
          setLoading(false);
        }
      };
  
      fetchUsersAndMatches();
    }, []);
    return (
        <Container className="mt-5">
        <Row className='justify-content-center'>
          <Col md={6}>
            <Card className='shadow rounded'>
              <Card.Img variant="top" src={field.image} rounded />
              <Card.Body>
                <Card.Title>{field.name}</Card.Title>
                <Card.Text>
                  <b>Chủ sân:</b> {field.ownerId} <br />
                  <b>SĐT:</b> 0796942241 <br />
                  <b>Địa chỉ:</b> {field.location}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card className='shadow rounded'>
              <Card.Body>
                <div className="d-flex justify-content-end">
                  <Button variant="primary">Đặt sân</Button>
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
}
            {/* test */}
            {/* <pre>{JSON.stringify(field, null, 2)}</pre> */}
export default FieldDetail;