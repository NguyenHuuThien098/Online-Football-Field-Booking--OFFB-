import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Button, Grid, Card, CardContent, Typography, TextField, Box, Tabs, Tab } from '@mui/material';
const Field = () => {
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newField, setNewField] = useState({
        name: '',
        location: '',
        type: '5 person',
        price: '',
        image: '',
        contactNumber: '',
        operatingHours: ''
    });
    const [newLargeField, setNewLargeField] = useState({
        name: '',
        address: '',
        otherInfo: '',
        images: '',
        operatingHours: ''
    });
    const token = localStorage.getItem('token');
    const ownerId = localStorage.getItem('userId');
    useEffect(() => {
        fetchFields();
    }, []);
    const fetchFields = async () => {
        try {
            const token = localStorage.getItem('token');
            const ownerId = localStorage.getItem('userId');
            const role = localStorage.getItem('userRole');
            if (!ownerId) {
                setError('Owner ID not found');
                setLoading(false);
                return;
            }
            if (role !== 'field_owner') {
                setError('Not an owner');
                setLoading(false);
                return;
            }
            // Fetch fields
            const fieldsResponse = await axios.get(`http://localhost:5000/api/field-owner/fields/${ownerId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const fieldsData = fieldsResponse.data;
            if (Array.isArray(fieldsData)) {
                if (fieldsData.length === 0) {
                    setError('No fields found');
                }
                setFields(fieldsData);
            } else {
                setError('Invalid data returned');
            }
        } catch (error) {
            if (error.response) {
                if (error.response.status === 403) {
                    setError('You do not have access to this resource.');
                } else if (error.response.status === 404) {
                    setError('Resource not found.');
                } else {
                    setError('An error occurred while loading the list of fields and matches.');
                }
            } else {
                console.error("Error fetching fields and matches:", error);
                setError('An error occurred while loading the list of fields and matches.');
            }
        } finally {
            setLoading(false);
        }
    };
    const scrollToAddField = () => {
        document.getElementById('add-field-section').scrollIntoView({ behavior: 'smooth' });
    };
    const handleUpdateField = async (fieldId) => {
    };
    const handleAddLargeField = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/field-owner/large-field', {
                ...newLargeField,
                ownerId
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setFields([...fields, response.data.largeField]);
            setNewLargeField({
                name: '',
                address: '',
                otherInfo: '',
                images: '',
                operatingHours: ''
            });
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setError('Resource not found.');
            } else {
                console.error("Error adding large field:", error);
                setError('An error occurred while adding the large field.');
            }
        }
    };
    const handleDeleteLargeField = async (largeFieldId) => {
        // console.log(largeFieldId);
        // return;
        try {
            await axios.delete(`http://localhost:5000/api/field-owner/large-field/${largeFieldId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setFields(fields.filter(field => field.fieldId !== largeFieldId));
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setError('Resource not found.');
            } else {
                console.error("Error deleting large field:", error);
                setError('An error occurred while deleting the large field.');
            }
        }
    };

    return (
        <div>
            <Typography variant="h3" gutterBottom align="center" sx={{ backgroundColor: 'primary.main', color: 'white', padding: 2, marginTop: 2, borderRadius: 1 }}>
                Your Fields
            </Typography>
            <Button variant="contained" color="primary" onClick={scrollToAddField} sx={{ my: 2, width: '100%', fontSize: '1.6rem', backgroundColor: 'green', color: 'white', padding: 2, borderRadius: 1 }}>
                Add New Large Field +
            </Button>
            <hr />
            {/* {console.log(fields)} */}
            <Grid container spacing={2}>
                {fields.map((field, index) => (
                    <Grid item xs={12} sm={6} md={6} key={index}>
                        <Card key={field.fieldId} variant="outlined" sx={{ border: '1px solid #ccc', boxShadow: 3, borderRadius: 2, height: '100%', backgroundColor: '#f5f5f5', color: 'black' }}>
                            <CardContent>
                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{field.name || 'Unnamed Field'}</Typography>
                                <Typography variant="body1">Location: {field.address}</Typography>
                                <Typography variant="body1">Contact Number: {field.ownerPhone}</Typography>
                                <Typography variant="body1">Operating Hours: {field.operatingHours}</Typography>
                                <Typography variant="body1">Description: {field.otherInfo}</Typography>
                                <Button variant="contained" color="primary" onClick={() => handleUpdateField(field.largeFieldId)} sx={{ mt: 2, mr: 2, width: 'calc(50% - 8px)', fontSize: '1rem' }}>
                                    Update
                                </Button>
                                <Button variant="contained" onClick={() => handleDeleteLargeField(field.largeFieldId)} sx={{ backgroundColor: 'red', mt: 2, width: 'calc(50% - 8px)', fontSize: '1rem' }}>
                                    Delete
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            <Box id="add-field-section" sx={{ border: '1px solid #ccc', borderRadius: '8px', mt: 4, p: 3, color: 'white', boxShadow: 3 }}>
                <Typography variant="h4" gutterBottom sx={{ backgroundColor: 'primary.main', color: 'white', padding: 2, borderRadius: 1 }}>
                    Add New Large Field:
                </Typography>
                <form onSubmit={handleAddLargeField}>
                    <TextField
                        label="Field Name"
                        value={newLargeField.name}
                        onChange={(e) => setNewLargeField({ ...newLargeField, name: e.target.value })}
                        fullWidth
                        margin="normal"
                        required
                        InputLabelProps={{ style: { color: 'black', fontSize: '1.2rem' } }}
                        InputProps={{ style: { color: 'black', backgroundColor: 'white', fontSize: '1.2rem' } }}
                    />
                    <TextField
                        label="Address"
                        value={newLargeField.address}
                        onChange={(e) => setNewLargeField({ ...newLargeField, address: e.target.value })}
                        fullWidth
                        margin="normal"
                        required
                        InputLabelProps={{ style: { color: 'black', fontSize: '1.2rem' } }}
                        InputProps={{ style: { color: 'black', backgroundColor: 'white', fontSize: '1.2rem' } }}
                    />
                    <TextField
                        label="Other Info"
                        value={newLargeField.otherInfo}
                        onChange={(e) => setNewLargeField({ ...newLargeField, otherInfo: e.target.value })}
                        fullWidth
                        margin="normal"
                        InputLabelProps={{ style: { color: 'black', fontSize: '1.2rem' } }}
                        InputProps={{ style: { color: 'black', backgroundColor: 'white', fontSize: '1.2rem' } }}
                    />
                    <TextField
                        label="Images URL"
                        value={newLargeField.images}
                        onChange={(e) => setNewLargeField({ ...newLargeField, images: e.target.value })}
                        fullWidth
                        margin="normal"
                        InputLabelProps={{ style: { color: 'black', fontSize: '1.2rem' } }}
                        InputProps={{ style: { color: 'black', backgroundColor: 'white', fontSize: '1.2rem' } }}
                    />
                    <TextField
                        label="Operating Hours"
                        value={newLargeField.operatingHours}
                        onChange={(e) => setNewLargeField({ ...newLargeField, operatingHours: e.target.value })}
                        fullWidth
                        margin="normal"
                        required
                        InputLabelProps={{ style: { color: 'black', fontSize: '1.2rem' } }}
                        InputProps={{ style: { color: 'black', backgroundColor: 'white', fontSize: '1.2rem' } }}
                    />
                    <Button variant="contained" color="primary" type="submit" sx={{ mt: 2, width: '100%', fontSize: '1.2rem' }}>
                        Add Large Field
                    </Button>
                </form>
            </Box>
        </div>
    );
};
export default Field;