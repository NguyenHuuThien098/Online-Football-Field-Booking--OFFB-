import React, { useState, useEffect } from "react";
import style from "./Item.module.scss";
import { useNavigate } from "react-router-dom";
import { Box, Card, CardContent, CardMedia, Typography, Button, CardActionArea } from '@mui/material';
import { getDatabase, ref, get } from "firebase/database"; // Import Firebase functions
import { Col } from "react-bootstrap";
import { styled } from '@mui/material/styles';


const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  border: '0.1px solid #ccc',
  display: 'flex',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.02)', // Subtle hover scale effect
    boxShadow: theme.shadows[5], // Áp dụng hiệu ứng đổ bóng từ theme
  },
}));

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
                  src={field.image || 'https://www.tinhphuqui.vn/uploads/supply/2023/10/24/14.jpg'}
                  alt={field.name}
                  className={style.br50 + " img-fluid h-100 w-100"}
                  style={{ objectFit: "cover", borderRadius: "49px" }}
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
      <StyledCard className="mt-4 mx-3 border-primary"
      sx={{
        width: 600,
        height: 300
      }}
      >
        <CardActionArea
          sx={{
            width: 300,
            height: 300
          }}
        >
          <CardMedia
            component="img"
            sx={{
              width: 300,
              height: 300,
              borderRadius: '16px',
              border: '0.1px solid #ccc',
            }}
            image={match.image || 'https://thptlethipha.edu.vn/wp-content/uploads/2023/03/SAN-BONG.jpg'}
            alt="green iguana"
          />
        </CardActionArea>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', flex: 1, p: 5 }}>
          <Typography variant="h5" component="div">
            {match.ownerName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Địa chỉ: {match.address}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Thời gian: {match.time}
          </Typography>
          <Typography variant="body2" color="success" fontSize={24}>
            Giá: 200k/h
          </Typography>
          <div>

          </div>
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" sx={{ width: 150, height: 40 }}>
              Tham gia
            </Button>
          </Box>
        </CardContent>
      </StyledCard>

    );
  }

  return null;
};

export default Item;
