import React, { useState, useEffect } from "react";
import style from "./Item.module.scss";
import { useNavigate } from "react-router-dom";
import { Box, Card, CardContent, CardMedia, Typography, Button, CardActionArea } from '@mui/material';
import { getDatabase, ref, get } from "firebase/database"; // Import Firebase functions
import { styled } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';


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
  const handleJoinClick = () => {
    if (match) {
      navigate(`/join_match`, { state: match }); // Chuyển hướng đến trang join_match với dữ liệu trận đấu
    }
  };

  const availableTimeSlots = () => {
    const today = new Date().toISOString().slice(0, 10); // Get today's date
    const availableSlots = [];

    for (const date in field.bookingSlots) {
      if (date >= today && field.bookingSlots[date]["15:00-16:00"]) {
        availableSlots.push(date);
      }
    }

    if (availableSlots.length > 0) {
      return (
        <div>
          <Typography variant="h6" color="primary">
            Available on:
          </Typography>
          <div sx={{ display: 'flex', flexWrap: 'wrap' }}>
            {availableSlots.map((date) => (
              <Chip key={date} label={date} sx={{ marginRight: 1 }} />
            ))}
          </div>
        </div>
      );
    } else {
      return (
        <Typography variant="h6" color="#f44336">
          Currently unavailable
        </Typography>
      );
    }
  };

  const formatDateTime = (dateTimeString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateTimeString).toLocaleDateString('en-GB', options);
  };

  if (field) {
    return (
      <StyledCard className={`mt-4 mx-3 border-primary `}
        sx={{ width: 600, height: 300 }}
      >
        <CardActionArea sx={{ width: 300, height: 300 }}>
          <CardMedia
            component="img"
            sx={{ width: 300, height: 300, borderRadius: '16px', border: '0.1px solid #ccc' }}
            image={field.images || 'https://thptlethipha.edu.vn/wp-content/uploads/2023/03/SAN-BONG.jpg'}
            alt="Football field"
          />
        </CardActionArea>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', flex: 1, px: 5, py: 2 }}>
          <Typography variant="h5" component="div">
            {field.name}
          </Typography>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems:"center"}}>
            <Typography variant="body2" color="text.secondary">
              Địa chỉ: {field.largeFieldAddress}
            </Typography>
            <Chip label={field.type}
              className="text-secondary my-2"
              sx={{
                backgroundColor: '#FCE0D3',
                fontSize: '13px',
                width: '70px',
                height: '20px',
              }}
            />
          </div>

          <Typography variant="body2" color="text.secondary">
              Tên sân lớn: {field.largeFieldName}
            </Typography>

          <Typography variant="body2">
            {availableTimeSlots()}
          </Typography>

          {/* <Typography variant="body2" color="text.secondary">
            Mô tả: {field.description}
          </Typography> */}
          <Typography variant="body2" color="success" fontSize={24}>
            Giá: {field.price}k/h
          </Typography>
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
            Thời gian: {formatDateTime(match.time)}
          </Typography>
          <div>

          </div>
          <Box sx={{ mt: 2 }}>
          <Button variant="contained" sx={{ width: 150, height: 40 }} onClick={handleJoinClick}>
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
