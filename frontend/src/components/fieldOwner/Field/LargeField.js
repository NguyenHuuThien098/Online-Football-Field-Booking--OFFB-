import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, CardMedia, Typography, Box, IconButton, TextField, Grid, MenuItem } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useState, useEffect } from 'react';
import axios from 'axios';

const LargeField = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const largeField = location.state;
    const [smallFields, setSmallFields] = useState([]);
    const [newSmallField, setNewSmallField] = useState({
        name: '',
        type: '5 người',
        price: '',
        images: [],
        description: '',
        isAvailable: true,
        bookingSlots: {}
    });
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchSmallFields();
    }, []);

    const fetchSmallFields = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/field-owner/large-field/${largeField.largeFieldId}/fields`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setSmallFields(response.data);
        } catch (error) {
            console.error("Error fetching small fields:", error);
        }
    };

    const handleBackClick = () => {
        navigate(-1);
    };

    const handleAddSmallField = async (e) => {
        e.preventDefault();

        // Validate required fields
        const validTypes = ['5 người', '7 người', '11 người'];
        if (!newSmallField.name || !newSmallField.type || !newSmallField.price) {
            setErrorMessage("Missing required fields: name, type, or price");
            return;
        }
        if (!validTypes.includes(newSmallField.type)) {
            setErrorMessage("Invalid field type. Please select from 5 người, 7 người, or 11 người.");
            return;
        }

        try {
            const response = await axios.post(`http://localhost:5000/api/field-owner/large-field/${largeField.largeFieldId}/small-field`, {
                name: newSmallField.name,
                type: newSmallField.type,
                price: newSmallField.price,
                images: newSmallField.images,
                description: newSmallField.description,
                isAvailable: newSmallField.isAvailable,
                largeFieldAddress: largeField.address,
                largeFieldName: largeField.name,
                ownerName: largeField.ownerName,
                ownerPhone: largeField.ownerPhone,
                bookingSlots: newSmallField.bookingSlots
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setSmallFields([...smallFields, response.data.smallField]);
            setNewSmallField({
                name: '',
                type: '5 người',
                price: '',
                images: [],
                description: '',
                isAvailable: true,
                bookingSlots: {}
            });
            setErrorMessage('');
        } catch (error) {
            console.error("Error adding small field:", error);
            if (error.response) {
                console.error("Server Response Data:", error.response.data);
                console.error("Server Response Status:", error.response.status);
                console.error("Server Response Headers:", error.response.headers);
                setErrorMessage(error.response.data.message || 'An error occurred while adding the small field.');
            } else if (error.request) {
                console.error("Request made but no response received:", error.request);
                setErrorMessage('Request made but no response received.');
            } else {
                console.error("Error setting up request:", error.message);
                setErrorMessage('Error setting up request.');
            }
        }
    };

    const handleSmallFieldDetail = (smallField) => {
        navigate({
            pathname: `/smallField/${smallField.id}`,
            state: { field: smallField }
        });
    };

    const defaultImage = "https://thptlethipha.edu.vn/wp-content/uploads/2023/03/SAN-BONG.jpg";
    const fieldImage = (largeField.images && largeField.images.length > 0) ? largeField.images[0] : defaultImage;

    return (
        <>
            <Box className="largeField" sx={{ padding: 2, position: 'relative' }}>
                <Typography variant="h2" component="div" sx={{ textAlign: 'center', marginBottom: 4 }}>
                    {largeField.name}
                </Typography>
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
                        alt={largeField.images ? largeField.name : "Default Image"}
                    />
                    <CardContent>
                        <Typography variant="h4" component="div">
                            {largeField.name}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {largeField.address}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {largeField.otherInfo}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {largeField.operatingHours}
                        </Typography>
                    </CardContent>
                </Card>
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h5" gutterBottom>
                        Small Fields
                    </Typography>
                    <Grid container spacing={2}>
                        {smallFields.map((smallField, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Card onClick={() => handleSmallFieldDetail(smallField)}>
                                    <CardMedia
                                        component="img"
                                        height="140"
                                        image={(smallField.images && smallField.images.length > 0) ? smallField.images[0] : defaultImage}
                                        alt={smallField.name}
                                    />
                                    <CardContent>
                                        <Typography variant="h6">{smallField.name}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Type: {smallField.type}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Price: {smallField.price}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h5" gutterBottom>
                        Add New Small Field
                    </Typography>
                    <form onSubmit={handleAddSmallField}>
                        <TextField
                            label="Field Name"
                            value={newSmallField.name}
                            onChange={(e) => setNewSmallField({ ...newSmallField, name: e.target.value })}
                            fullWidth
                            margin="normal"
                            required
                        />
                        <TextField
                            select
                            label="Type"
                            value={newSmallField.type}
                            onChange={(e) => setNewSmallField({ ...newSmallField, type: e.target.value })}
                            fullWidth
                            margin="normal"
                            required
                        >
                            <MenuItem value="5 người">5 person</MenuItem>
                            <MenuItem value="7 người">7 person</MenuItem>
                            <MenuItem value="11 người">11 person</MenuItem>
                        </TextField>
                        <TextField
                            label="Price"
                            value={newSmallField.price}
                            onChange={(e) => setNewSmallField({ ...newSmallField, price: e.target.value })}
                            fullWidth
                            margin="normal"
                            required
                        />
                        <TextField
                            label="Image URL"
                            value={newSmallField.images[0] || ''}
                            onChange={(e) => setNewSmallField({ ...newSmallField, images: [e.target.value] })}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Description"
                            value={newSmallField.description}
                            onChange={(e) => setNewSmallField({ ...newSmallField, description: e.target.value })}
                            fullWidth
                            margin="normal"
                        />
                        {errorMessage && <Typography color="error" variant="body2">{errorMessage}</Typography>}
                        <Button variant="contained" color="primary" type="submit" sx={{ mt: 2 }}>
                            Add Small Field
                        </Button>
                    </form>
                </Box>
            </Box>
        </>
    );
}

export default LargeField;