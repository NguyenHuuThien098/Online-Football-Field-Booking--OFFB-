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
            image={field.image || 'https://thptlethipha.edu.vn/wp-content/uploads/2023/03/SAN-BONG.jpg'}
            alt="green iguana"
          />
        </CardActionArea>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', flex: 1, p: 5 }}>
          <Typography variant="h5" component="div">
            {field.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Địa chỉ: {field.largeFieldAddress}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Thời gian: {field.time}
          </Typography>
          <Typography variant="body2" color="success" fontSize={24}>
            Giá: 200k/h
          </Typography>
          <div>

          </div>
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" sx={{ width: 150, height: 40 }} onClick={handleBookingClick}>
              Đặt sân
            </Button>
          </Box>
        </CardContent>
      </StyledCard>
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
