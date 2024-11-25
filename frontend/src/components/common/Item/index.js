import React from "react";
import style from "./Item.module.scss";
import FieldDetail from "../FieldDetail";
import { useNavigate } from 'react-router-dom';
import { Container, Button, Row, Col, ListGroup, Accordion, Form, FormGroup, FormControl, FormLabel } from 'react-bootstrap';


const Item = ({ field, match }) => {
  const navigate = useNavigate();
  const handleBookingClick = () => {
    if (field) { // Ensure field data exists before navigation
      navigate(`/fieldDetail/`, { state: field }); // Pass field data
      // console.log(field);
    }
  };

  if (field) {
    return (
      <div>
        <div className={style.br50 + " border border-black h-50 w-100"}>
          <div className="row h-100">
            <div className="col-4 border-end border-black"></div>
            <div className="col">
              <div className="row d-flex flex-row-reverse">
                <h3 className="py-4">{field.name}</h3>
                <h3>***</h3>
                <p>Address: {field.location}</p>
                <p>Ghi chú: {field.notes}</p>
                <p>Đánh giá: {field.rating}</p>
              </div>
                <Col className="px-4 py-4 d-flex justify-content-end">
                  <Button variant="danger" className="px-4 py-2" onClick={() => handleBookingClick()}>
                    <h4>Booking</h4>
                  </Button>
                </Col>
              
            </div>
          </div>
        </div>
        <hr className={style.hr} />
      </div>
    );
  }

  if (match) {
    return (
      <div className="m-5">
        <div className={style.br50 + " border border-black h-50 w-100"}>
          <div className="row h-100">
            <div className="col-4 border-end border-black"></div>
            <div className="col">
              <div className="row d-flex flex-row-reverse">
                <a href="MatchInformation-view.html" className="btn btn-primary m-5 h-100 w-auto">
                  Join
                </a>
                <h3>{match.ownerName}</h3>
                <h3>***</h3>
                <p>Address: {match.address}</p>
                <p>Thời gian: {match.time}</p>
                <p>Số lượng người chơi: {match.playerCount}</p>
                <p>Ghi chú: {match.notes}</p>
                <p>Câu hỏi: {match.questions}</p>
              </div>
            </div>
          </div>
        </div>
        <hr className={style.hr} />
      </div>
    );
  }

  return null;
};

export default Item;