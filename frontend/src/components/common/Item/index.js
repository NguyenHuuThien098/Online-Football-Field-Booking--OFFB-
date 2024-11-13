import React from "react";
import style from "./Item.module.scss";

const Item = ({ field, match }) => {
  if (field) {
    return (
      <div className="m-5">
        <div className={style.br50 + " border border-black h-50 w-100"}>
          <div className="row h-100">
            <div className="col-4 border-end border-black"></div>
            <div className="col">
              <div className="row d-flex flex-row-reverse">
                <a href="FieldInformation-view.html" className="btn btn-primary m-5 h-100 w-auto">
                  Booking
                </a>
                <h3>{field.name}</h3>
                <h3>***</h3>
                <p>Address: {field.location}</p>
                <p>Ghi chú: {field.notes}</p>
                <p>Đánh giá: {field.rating}</p>
              </div>
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