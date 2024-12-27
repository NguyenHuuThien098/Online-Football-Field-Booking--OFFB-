import React from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Typography, Card, CardContent, CardMedia } from '@mui/material';

const SmallFieldDetail = () => {
    const location = useLocation();
    const field = location.state?.field;

    if (!field) {
        return <Typography variant="h5" component="div" sx={{ textAlign: 'center', marginTop: 4 }}>Field details not available.</Typography>;
    }

    return (
        <Box sx={{ padding: 2 }}>
            <Typography variant="h2" component="div" sx={{ textAlign: 'center', marginBottom: 4 }}>
                {field.name}
            </Typography>
            <Card>
                <CardMedia
                    component="img"
                    height="300"
                    image={field.image}
                    alt={field.name}
                />
                <CardContent>
                    <Typography variant="h4" component="div">
                        {field.name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {field.address}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {field.description}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Price: {field.price}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Type: {field.type}
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
};

export default SmallFieldDetail;
