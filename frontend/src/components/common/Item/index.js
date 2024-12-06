import React, { useState, useEffect } from "react";
import style from "./Item.module.scss";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import { getDatabase, ref, get } from "firebase/database"; // Import Firebase functions
import { Col } from "react-bootstrap";

const Item = ({ field, match }) => {
  const [ownerName, setOwnerName] = useState(null); // State để lưu tên chủ sân
  const [ownerPhone, setOwnerPhone] = useState(null); // State để lưu số điện thoại
  const navigate = useNavigate();

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
        setOwnerName(userData.fullName || "Không rõ"); // Lấy tên hoặc hiển thị "Không rõ"
        setOwnerPhone(userData.phoneNumber || "Không có"); // Lấy số điện thoại hoặc hiển thị "Không có"
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

  const handleBookingClick = () => {
    if (field) {
      navigate(`/fieldDetail/`, { state: field }); // Chuyển đến trang chi tiết sân
    }
  };

  if (field) {
    return (
      <div>
        <div className={style.br50 + " border border-black h-50 w-100"}>
          <div className="row h-100">
            <div className="col-4 border-end border-black">
              {field.image && (
                <img
                  src={field.image}
                  alt={field.name}
                  className={style.br50 + " img-fluid h-100 w-100"}
                  style={{ objectFit: "cover", borderRadius: "49px"}}
                />
              )}
            </div>
            <div className="col">
              <div className="row d-flex flex-row-reverse">
                <div className="p-3">
                  <Button variant="success" onClick={handleBookingClick}>
                    Booking
                  </Button>
                </div>
                <h3>{field.name}</h3>
                <p>Chủ sân: {ownerName || "Đang tải..."}</p>
                <p>Số điện thoại: {ownerPhone || "Đang tải..."}</p>
                <p>Địa chỉ: {field.location}</p>
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
            <div className="col-4 border-end border-black">
              {match.image && (
                <img
                src={match.image ? match.image : 'https://thptlethipha.edu.vn/wp-content/uploads/2023/03/SAN-BONG.jpg'}
                alt={match.ownerName}
                  className="img-fluid h-100 w-100"
                  style={{ objectFit: "cover", borderRadius: "10px" }}
                />
              )}
            </div>
            <div className="col">
              <div className="row d-flex flex-row-reverse">
                <a href="MatchInformation-view.html" className="btn btn-primary m-5 h-100 w-auto">
                  Join
                </a>
                <h3>{match.ownerName}</h3>
                <p>Địa chỉ: {match.address}</p>
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
