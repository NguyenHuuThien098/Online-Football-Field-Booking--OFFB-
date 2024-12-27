import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, CardMedia, Typography, Box, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const LargeField = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const field = location.state;

    const handleBackClick = () => {
        navigate(-1);
    };

    const defaultImage = "https://thptlethipha.edu.vn/wp-content/uploads/2023/03/SAN-BONG.jpg";
    const fieldImage = field.images || defaultImage;

    return (
        <Box className="largeField" sx={{ padding: 2, position: 'relative' }}>
            <IconButton
                onClick={handleBackClick}
                sx={{ position: 'absolute', top: 16, left: 16, backgroundColor: 'white' }}
            >
                <ArrowBackIcon />
            </IconButton>
            <Card sx={{ marginTop: 6 }}>
                <CardMedia
                    component="img"
                    height="300"
                    image={fieldImage}
                    alt={field.images ? field.name : "Default Image"}
                />
                <CardContent>
                    <Typography variant="h4" component="div">
                        {field.name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {field.address}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {field.otherInfo}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {field.operatingHours}
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
}

export default LargeField;