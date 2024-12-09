import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import { getDatabase, ref, get } from "firebase/database"; // Import Firebase functions
import dayjs from "dayjs";
import { ContainerItem, CoverLayout, Modal } from "./item.styled";
const Item = ({ field, match }) => {
  const [ownerName, setOwnerName] = useState(null); // State để lưu tên chủ sân
  const [ownerPhone, setOwnerPhone] = useState(null); // State để lưu số điện thoại
  const [isOpenModal, setIsOpenModal] = useState(false); // State để lưu số điện thoại
  const navigate = useNavigate();
  const emptyImage = 'https://www.sporta.vn/assets/default_venue_0-dc1f6687f619915230b62712508933a71a6e9529c390237b9766acc0d59539ab.webp'

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

  const renderModal = () => {
    return (
      <>
        <CoverLayout
          style={{
            opacity: 0.5,
            backgroundColor: "black",
          }}
        ></CoverLayout>
        <CoverLayout>

          <Modal>
            <div
              onClick={() => setIsOpenModal(false)}
              style={{
                position: "absolute",
                top: "-30px",
                right: "-30px",
                cursor: "pointer",
                padding: "2px 10px",
                backgroundColor: "white",
                borderRadius: "50%",
              }}>x</div>
            <div
              style={{
                width: "100%",
                height: "200px",
              }}
            >
              <img
                src={field?.image ?? match?.image ?? emptyImage}
                alt={field?.name}
                className={" img-fluid h-100 w-100"}
                style={{ objectFit: "cover", borderTopLeftRadius: "10px", borderTopRightRadius: "10px" }}
              />
            </div>
            <div
              style={{
                padding: "10px",
              }}
            >
              {field ? (
                <div className="row d-flex flex-row-reverse">
                  <div
                    onClick={() => handleBookingClick()}
                    style={{
                      marginRight: "10px",
                    }}
                    className="btn btn-primary h-100 w-auto"
                  >
                    Booking
                  </div>
                  <h3>{field?.name}</h3>
                  <p>Chủ sân: {ownerName || "Đang tải..."}</p>
                  <p>Số điện thoại: {ownerPhone || "Đang tải..."}</p>
                  <p>Địa chỉ: {field?.location}</p>
                  <p>Ghi chú: {field?.notes}</p>
                  <p>Đánh giá: {field?.rating}</p>
                </div>
              ) : (
                <div className="row d-flex flex-row-reverse">
                  <a
                    href="MatchInformation-view.html"
                    style={{
                      marginRight: "10px",
                    }}
                    className="btn btn-primary h-100 w-auto"
                  >
                    Join
                  </a>
                  <h3>{match.ownerName}</h3>
                  <p>Địa chỉ: {match.address}</p>
                  <p>Thời gian: {match.time}</p>
                  <p>Số lượng người chơi: {match.playerCount}</p>
                  <p>Ghi chú: {match.notes}</p>
                  <p>Câu hỏi: {match.questions}</p>
                </div>
              )}
            </div>
          </Modal>
        </CoverLayout >
      </>
    );
  };

  return (
    <ContainerItem>
      {isOpenModal && renderModal()}
      <img
        src={field?.image ?? match?.image ?? emptyImage}
        alt={field?.name}
        className={" img-fluid h-100 w-100"}
        style={{ objectFit: "cover" }}
      />
      <div
        style={{
          width: "100%",
          height: "100%",
          top: 0,
          display: "flex",
          padding: 10,
          justifyContent: "end",
          flexDirection: "column",
          position: "absolute",
          backgroundImage:
            "linear-gradient(rgba(66, 58, 54, 0) 0%, rgba(66, 58, 54, 0.24) 36.24%, rgba(66, 58, 54, 0.47) 59.07%)",
        }}
      >
        <div
          className="view-button"
          style={{
            display: "none",
            position: "absolute",
            top: 10,
            right: 10,
          }}
        >
          <Button onClick={() => setIsOpenModal(true)} variant="contained">
            Xem
          </Button>
        </div>

        <div
          style={{
            color: "white",
            fontWeight: "bold",
          }}
        >
          {match.ownerName}
        </div>
        <div
          style={{
            color: "white",
          }}
        >
          {match ? dayjs(match.time).isValid() ? dayjs(match.time).format("hh:mm DD/MM/YYYY") : '' : ownerName + ': ' + ownerPhone}
        </div>
      </div>
    </ContainerItem>
  );
  // if (field) {
  //   return (
  //     <div>
  //       <div className={style.br50 + " border border-black h-50 w-100"}>
  //         <div className="row h-100">
  //           <div className="col-4 border-end border-black">
  //             {field.image && (
  //               <img
  //                 src={field.image}
  //                 alt={field.name}
  //                 className={style.br50 + " img-fluid h-100 w-100"}
  //                 style={{ objectFit: "cover", borderRadius: "49px" }}
  //               />
  //             )}
  //           </div>
  //           <div className="col">
  //             <div className="row d-flex flex-row-reverse">
  //               <div className="p-3">
  //                 <Button variant="success" onClick={handleBookingClick}>
  //                   Booking
  //                 </Button>
  //               </div>
  //               <h3>{field.name}</h3>
  //               <p>Chủ sân: {ownerName || "Đang tải..."}</p>
  //               <p>Số điện thoại: {ownerPhone || "Đang tải..."}</p>
  //               <p>Địa chỉ: {field.location}</p>
  //               <p>Ghi chú: {field.notes}</p>
  //               <p>Đánh giá: {field.rating}</p>
  //             </div>

  //           </div>
  //         </div>
  //       </div>
  //       <hr className={style.hr} />
  //     </div>
  //   );
  // }

  // if (match) {
  //   return (
  //     <div className="m-5">
  //       <div className={style.br50 + " border border-black h-50 w-100"}>
  //         <div className="row h-100">
  //           <div className="col-4 border-end border-black">
  //             {match.image && (
  //               <img
  //                 src={match.image}
  //                 alt={match.ownerName}
  //                 className="img-fluid h-100 w-100"
  //                 style={{ objectFit: "cover", borderRadius: "10px" }}
  //               />
  //             )}
  //           </div>
  //           <div className="col">
  //             <div className="row d-flex flex-row-reverse">
  //               <a href="MatchInformation-view.html" className="btn btn-primary m-5 h-100 w-auto">
  //                 Join
  //               </a>
  //               <h3>{match.ownerName}</h3>
  //               <p>Địa chỉ: {match.address}</p>
  //               <p>Thời gian: {match.time}</p>
  //               <p>Số lượng người chơi: {match.playerCount}</p>
  //               <p>Ghi chú: {match.notes}</p>
  //               <p>Câu hỏi: {match.questions}</p>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //       <hr className={style.hr} />
  //     </div>
  //   );
  // }

  // return null;
};

export default Item;
