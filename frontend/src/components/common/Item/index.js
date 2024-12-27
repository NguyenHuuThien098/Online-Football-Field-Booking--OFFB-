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
  const [ownerName, setOwnerName] = useState(null); // State to store owner's name
  const [ownerPhone, setOwnerPhone] = useState(null); // State to store owner's phone number
  const navigate = useNavigate();
  useEffect(() => {
    if (field?.ownerId) {
      fetchOwnerInfo(field.ownerId); // Fetch owner info when ownerId is available
    }
  }, [field]);

  const fetchOwnerInfo = async (ownerId) => {
    try {
      const db = getDatabase();
      const userRef = ref(db, `users/${ownerId}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.val();
        setOwnerName(userData.fullName || "Unknown"); // Get name or display "Unknown"
        setOwnerPhone(userData.phoneNumber || "Not available"); // Get phone number or display "Not available"
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

  const handleBookingClick = () => {
    if (field) {
      navigate(`/fieldDetail/`, { state: field }); // Navigate to field detail page
    }
  };

  const formatDateTime = (dateTimeString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateTimeString).toLocaleDateString('en-GB', options);
  };

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
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
            {field.name || "Field Name"}
          </Typography>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems:"center"}}>
            <Typography variant="body2" color="text.secondary">
              Address: {field.largeFieldAddress || "Address"}
            </Typography>
            <Chip label={field.type || "Type"}
              className="text-success my-2"
              sx={{
                backgroundColor: '#FCE0D3',
                fontSize: '14px',
                width: '80px',
                height: '30px',
              }}
            />
          </div>

          <Typography variant="body2" color="text.secondary">
              Large field names: {field.largeFieldName || "Large Field Name"}
            </Typography>

          <Typography variant="body2" color="success" fontSize={24}>
            Price: {formatPrice(field.price) || "0"} VND
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" sx={{ width: 150, height: 40 }} onClick={handleBookingClick}>
              Book field
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
            {match.ownerName || "Owner Name"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Address: {match.address || "Address"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Time: {formatDateTime(match.time) || "Time"}
          </Typography>
          <div>

          </div>
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" sx={{ width: 150, height: 40 }}>
              Join
            </Button>
          </Box>
        </CardContent>
      </StyledCard>

    );
  }

  return null;
};

export default Item;
