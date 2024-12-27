import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardMedia, Typography, Box, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const SmallField = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { field } = location.state || {};

    if (!field) {
        return <Typography variant="h5">Field not found</Typography>;
    }

    const { name, address, image, type, price, description, isAvailable } = field;

    const handleBackClick = () => {
        navigate(-1);
    };

    return (
        <Box sx={{ padding: 2, position: 'relative' }}>
            <IconButton
                onClick={handleBackClick}
                sx={{ position: 'absolute', top: 16, left: 16, backgroundColor: 'white' }}
            >
                <ArrowBackIcon />
            </IconButton>
            <Card>
                <CardMedia
                    component="img"
                    height="300"
                    image={image || "https://thptlethipha.edu.vn/wp-content/uploads/2023/03/SAN-BONG.jpg"}
                    alt={name}
                />
                <CardContent>
                    <Typography variant="h4" component="div">
                        {name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Address: {address}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Type: {type}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Price: {price}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Description: {description}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Availability: {isAvailable ? "Available" : "Not Available"}
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
}

export default SmallField;