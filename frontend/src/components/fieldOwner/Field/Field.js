import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Button, Grid, Card, CardContent, Typography, TextField, Box, Tabs, Tab, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, CardMedia, IconButton, Menu, MenuItem, Backdrop } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

const Field = () => {
    const [largeFields, setLargeFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newLargeField, setNewLargeField] = useState({
        name: '',
        address: '',
        otherInfo: '',
        images: '',
        operatingHours: ''
    });
    const [deletingFieldId, setDeletingFieldId] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [fieldToDelete, setFieldToDelete] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedFieldId, setSelectedFieldId] = useState(null);
    const token = localStorage.getItem('token');
    const ownerId = localStorage.getItem('userId');
    const navigate = useNavigate();

    const defaultImage = "https://thptlethipha.edu.vn/wp-content/uploads/2023/03/SAN-BONG.jpg";

    useEffect(() => {
        fetchLargeFields();
    }, []);

    const fetchLargeFields = async () => {
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
            // Fetch large fields
            const largeFieldsResponse = await axios.get(`http://localhost:5000/api/field-owner/fields/${ownerId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const largeFieldsData = largeFieldsResponse.data;
            if (Array.isArray(largeFieldsData)) {
                if (largeFieldsData.length === 0) {
                    setError('No large fields found');
                }
                setLargeFields(largeFieldsData);
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
            setLargeFields([...largeFields, response.data.largeField]);
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
        setDeletingFieldId(largeFieldId);
        setConfirmDelete(false); // Close the confirmation dialog
        try {
            await axios.delete(`http://localhost:5000/api/field-owner/large-field/${largeFieldId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setLargeFields(largeFields.filter(largeField => largeField.largeFieldId !== largeFieldId));
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setError('Resource not found.');
            } else {
                console.error("Error deleting large field:", error);
                setError('An error occurred while deleting the large field.');
            }
        } finally {
            setDeletingFieldId(null);
        }
    };

    const handleConfirmDelete = (largeFieldId) => {
        setFieldToDelete(largeFieldId);
        setConfirmDelete(true);
    };

    const handleCancelDelete = () => {
        setFieldToDelete(null);
        setConfirmDelete(false);
    };

    const handleLargeFieldDetail = (largeField) => {
        navigate(`/largeField/${largeField.largeFieldId}`, { state: largeField });
    };

    const handleMenuClick = (event, fieldId) => {
        setAnchorEl(event.currentTarget);
        setSelectedFieldId(fieldId);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedFieldId(null);
    };

    const handleCardClick = (event, largeField) => {
        if (event.target.closest('.settings-icon') || event.target.closest('.MuiMenu-root')) {
            return;
        }
        handleLargeFieldDetail(largeField);
    };

    return (
        <div>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={deletingFieldId !== null}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            <Typography variant="h3" gutterBottom align="center" sx={{ backgroundColor: 'primary.main', color: 'white', padding: 2, marginTop: 2, borderRadius: 1 }}>
                Your Large Fields
            </Typography>
            <Button variant="contained" color="primary" onClick={scrollToAddField} sx={{ my: 2, width: '100%', fontSize: '1.6rem', backgroundColor: 'green', color: 'white', padding: 2, borderRadius: 1 }}>
                Add New Large Field +
            </Button>
            <hr />
            <Grid container spacing={2}>
                {largeFields.map((largeField, index) => (
                    <Grid item xs={12} sm={6} md={6} key={index}>
                        <div onClick={(event) => handleCardClick(event, largeField)} style={{ textDecoration: 'none', cursor: 'pointer' }}>
                            <Card key={largeField.fieldId} variant="outlined" sx={{ border: '1px solid #ccc', boxShadow: 3, borderRadius: 2, height: '100%', backgroundColor: '#f5f5f5', color: 'black', position: 'relative' }}>
                                <IconButton
                                    aria-label="settings"
                                    onClick={(event) => handleMenuClick(event, largeField.largeFieldId)}
                                    className="settings-icon"
                                    sx={{ position: 'absolute', top: 8, right: 8 }}
                                >
                                    <SettingsIcon />
                                </IconButton>
                                <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                                    <CardMedia
                                        component="img"
                                        sx={{ width: 160, height: 160, marginRight: 2, borderRadius: 2 }}
                                        image={largeField.images || defaultImage}
                                        alt={largeField.name || 'Unnamed Field'}
                                    />
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="h4" sx={{ fontWeight: 'bold', textAlign: 'center' }}>{largeField.name || 'Unnamed Field'}</Typography>
                                        <Divider sx={{ marginBottom: 2, borderBottomWidth: 2 }} />
                                        <Typography variant="body1"><strong>Location:</strong> {largeField.address}</Typography>
                                        <Typography variant="body1"><strong>Contact Number:</strong> {largeField.ownerPhone}</Typography>
                                        <Typography variant="body1"><strong>Operating Hours:</strong> {largeField.operatingHours}</Typography>
                                        <Typography variant="body1"><strong>Description:</strong> {largeField.otherInfo}</Typography>
                                    </Box>
                                </CardContent>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl) && selectedFieldId === largeField.largeFieldId}
                                    onClose={handleMenuClose}
                                    className="MuiMenu-root"
                                >
                                    <MenuItem onClick={() => { handleUpdateField(largeField.largeFieldId); handleMenuClose(); }}>Update</MenuItem>
                                    <MenuItem onClick={() => { handleConfirmDelete(largeField.largeFieldId); handleMenuClose(); }}>Delete</MenuItem>
                                </Menu>
                            </Card>
                        </div>
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
                </form>            </Box>            <Dialog open={confirmDelete} onClose={handleCancelDelete}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this field? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDelete} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={() => handleDeleteLargeField(fieldToDelete)} color="primary" autoFocus>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Field;