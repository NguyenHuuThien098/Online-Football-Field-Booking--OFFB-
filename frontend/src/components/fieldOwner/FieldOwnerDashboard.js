import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Button, Grid, Card, CardContent, Typography, TextField, Box, Tabs, Tab } from '@mui/material';

const FieldOwnerDashboard = () => {
    const [fields, setFields] = useState([]);
    const [matches, setMatches] = useState([]);
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
    const [newMatch, setNewMatch] = useState({
        address: '',
        time: '',
        ownerName: '',
        playerCount: '',
        notes: '',
        questions: '',
        type: '5 person'
    });
    const [newLargeField, setNewLargeField] = useState({
        name: '',
        address: '',
        otherInfo: '',
        images: '',
        operatingHours: ''
    });
    const [tabIndex, setTabIndex] = useState(0);
   
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFieldsAndMatches = async () => {
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

                // Fetch matches
                const matchesResponse = await axios.get(`http://localhost:5000/api/matches/owner/${ownerId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const matchesData = matchesResponse.data;
                if (Array.isArray(matchesData)) {
                    setMatches(matchesData);
                } else {
                    setError('Invalid data returned');
                }
            } catch (error) {
                if (error.response && error.response.status === 403) {
                    setError('You do not have access to this resource.');
                } else {
                    console.error("Error fetching fields and matches:", error);
                    setError('An error occurred while loading the list of fields and matches.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchFieldsAndMatches();
    }, []);

    const scrollToAddField = () => {
        document.getElementById('add-field-section').scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToAddMatch = () => {
        document.getElementById('add-match-section').scrollIntoView({ behavior: 'smooth' });
    };



    const handleDeleteLargeField = async (largeFieldId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/field-owner/large-field/${largeFieldId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setFields(fields.filter(field => field.fieldId !== largeFieldId));
        } catch (error) {
            console.error("Error deleting large field:", error);
            setError('An error occurred while deleting the large field.');
        }
    };

    const handleAddMatch = async () => {
        try {
            const token = localStorage.getItem('token');
            const ownerId = localStorage.getItem('userId');
            const response = await axios.post('http://localhost:5000/api/matches', {
                ...newMatch,
                ownerId
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setMatches([...matches, response.data]);
            setNewMatch({
                address: '',
                time: '',
                ownerName: '',
                playerCount: '',
                notes: '',
                questions: '',
                type: '5 person'
            });
        } catch (error) {
            console.error("Error adding match:", error);
            setError('An error occurred while adding the match.');
        }
    };

    const handleUpdateMatch = async (matchId) => {
        try {
            const token = localStorage.getItem('token');
            const ownerId = localStorage.getItem('userId');
            const response = await axios.put(`http://localhost:5000/api/matches/${matchId}`, {
                ...newMatch,
                ownerId
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setMatches(matches.map(match => match.id === matchId ? response.data.match : match));
            setNewMatch({
                address: '',
                time: '',
                ownerName: '',
                playerCount: '',
                notes: '',
                questions: '',
                type: '5 person'
            });
        } catch (error) {
            console.error("Error updating match:", error);
            setError('An error occurred while updating the match.');
        }
    };

    const handleDeleteMatch = async (matchId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/matches/${matchId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setMatches(matches.filter(match => match.id !== matchId));
        } catch (error) {
            console.error("Error deleting match:", error);
            setError('An error occurred while deleting the match.');
        }
    };

    const handleAddLargeField = async () => {
        try {
            const token = localStorage.getItem('token');
            const ownerId = localStorage.getItem('userId');
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
            console.error("Error adding large field:", error);
            setError('An error occurred while adding the large field.');
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    const handleUpdateField = async (fieldId) => {
    }




return (
    <>
        <Typography variant="h3" align="center" gutterBottom sx={{ backgroundColor: 'primary.main', color: 'white', padding: 2, borderRadius: 1 }}>
            Field Owner Dashboard
        </Typography>
        <Container>
            <Tabs value={tabIndex} onChange={handleTabChange} centered>
                <Tab label="Fields" sx={{ fontSize: '1.2rem' }} />
                <Tab label="Matches" sx={{ fontSize: '1.2rem' }} />
            </Tabs>
            {tabIndex === 0 && (
                <div>
                    <Typography variant="h3" gutterBottom align="center" sx={{ backgroundColor: 'primary.main', color: 'white', padding: 2, marginTop: 2, borderRadius: 1 }}>
                        Your Fields
                    </Typography>
                    <Button variant="contained" color="primary" onClick={scrollToAddField} sx={{ my: 2, width: '100%', fontSize: '1.6rem', backgroundColor: 'green', color: 'white', padding: 2, borderRadius: 1 }}>
                        Add New Large Field +
                    </Button>
                    <hr/>
                    {fields.map((field, index) => (
                        <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                            <Grid item xs={12} sm={6}>
                                <Card key={field.fieldId} variant="outlined" sx={{ border: '1px solid #ccc', boxShadow: 3, borderRadius: 2, height: '100%', backgroundColor: '#f5f5f5', color: 'black' }}>
                                    <CardContent>
                                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{field.name || 'Unnamed Field'}</Typography>
                                        <Typography variant="body1">Location: {field.address}</Typography>
                                        <Typography variant="body1">Contact Number: {field.ownerPhone}</Typography>
                                        <Typography variant="body1">Operating Hours: {field.operatingHours}</Typography>
                                        <Button variant="contained" color="primary" onClick={() => handleUpdateField(field.fieldId)} sx={{ mt: 2, mr: 2, width: 'calc(50% - 8px)', fontSize: '1rem' }}>
                                            Update
                                        </Button>
                                        <Button variant="contained" onClick={() => handleDeleteLargeField(field.fieldId)} sx={{ backgroundColor: 'red', mt: 2, width: 'calc(50% - 8px)', fontSize: '1rem' }}>
                                            Delete
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    ))}
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
            )}
            {tabIndex === 1 && (
                <div>
                    <Typography variant="h3" gutterBottom align='center' sx={{ backgroundColor: 'primary.main', color: 'white', padding: 2, marginTop: 2, borderRadius: 1 }}>
                        Open Matches:
                    </Typography>
                    <Button variant="contained" color="primary" onClick={scrollToAddMatch} sx={{ my: 2, width: '100%', fontSize: '1.6rem', backgroundColor: 'green', color: 'white', padding: 2, borderRadius: 1 }}>
                        Add New Match +
                    </Button>
                    <hr/>
                    {matches.map((match, index) => (
                        <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                            <Grid item xs={12} sm={6}>
                                <Card key={match.id} variant="outlined" sx={{ border: '1px solid #ccc', boxShadow: 3, borderRadius: 2, height: '100%', backgroundColor: '#f5f5f5', color: 'black' }}>
                                    <CardContent>
                                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Address: {match.address}</Typography>
                                        <Typography variant="body1">Time: {match.time}</Typography>
                                        <Typography variant="body1">Owner Name: {match.ownerName}</Typography>
                                        <Typography variant="body1">Player Count: {match.playerCount}</Typography>
                                        <Typography variant="body1">Notes: {match.notes}</Typography>
                                        <Typography variant="body1">Questions: {match.questions}</Typography>
                                        <Button variant="contained" color="primary" onClick={() => handleUpdateMatch(match.id)} sx={{ mt: 2, mr: 2, width: 'calc(50% - 8px)', fontSize: '1rem' }}>
                                            Update
                                        </Button>
                                        <Button variant="contained" color="secondary" onClick={() => handleDeleteMatch(match.id)} sx={{ backgroundColor: 'red', mt: 2, width: 'calc(50% - 8px)', fontSize: '1rem' }}>
                                            Delete
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                            {matches[index + 1] && (
                                <Grid item xs={12} sm={6}>
                                    <Card key={matches[index + 1].id} variant="outlined" sx={{ border: '1px solid #ccc', boxShadow: 3, borderRadius: 2, height: '100%', backgroundColor: '#f5f5f5', color: 'black' }}>
                                        <CardContent>
                                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Address: {matches[index + 1].address}</Typography>
                                            <Typography variant="body1">Time: {matches[index + 1].time}</Typography>
                                            <Typography variant="body1">Owner Name: {matches[index + 1].ownerName}</Typography>
                                            <Typography variant="body1">Player Count: {matches[index + 1].playerCount}</Typography>
                                            <Typography variant="body1">Notes: {matches[index + 1].notes}</Typography>
                                            <Typography variant="body1">Questions: {matches[index + 1].questions}</Typography>
                                            <Button variant="contained" color="primary" onClick={() => handleUpdateMatch(matches[index + 1].id)} sx={{ mt: 2, mr: 2, width: 'calc(50% - 8px)', fontSize: '1rem' }}>
                                                Update
                                            </Button>
                                            <Button variant="contained" color="secondary" onClick={() => handleDeleteMatch(matches[index + 1].id)} sx={{ backgroundColor: 'red', mt: 2, width: 'calc(50% - 8px)', fontSize: '1rem' }}>
                                                Delete
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            )}
                        </Grid>
                    ))}
                    <Box id="add-match-section" sx={{ border: '1px solid #ccc', borderRadius: '8px', mt: 4, p: 3, color: 'white', boxShadow: 3 }}>
                        <Typography variant="h4" gutterBottom sx={{ backgroundColor: 'primary.main', color: 'white', padding: 2, borderRadius: 1 }}>
                            Add New Match:
                        </Typography>
                        <form onSubmit={handleAddMatch}>
                            <TextField
                                label="Address"
                                value={newMatch.address}
                                onChange={(e) => setNewMatch({ ...newMatch, address: e.target.value })}
                                fullWidth
                                margin="normal"
                                required
                                InputLabelProps={{ style: { color: 'black', fontSize: '1.2rem' } }}
                                InputProps={{ style: { color: 'black', backgroundColor: 'white', fontSize: '1.2rem' } }}
                            />
                            <TextField
                                label="Time"
                                value={newMatch.time}
                                onChange={(e) => setNewMatch({ ...newMatch, time: e.target.value })}
                                fullWidth
                                margin="normal"
                                required
                                InputLabelProps={{ style: { color: 'black', fontSize: '1.2rem' } }}
                                InputProps={{ style: { color: 'black', backgroundColor: 'white', fontSize: '1.2rem' } }}
                            />
                            <TextField
                                label="Owner Name"
                                value={newMatch.ownerName}
                                onChange={(e) => setNewMatch({ ...newMatch, ownerName: e.target.value })}
                                fullWidth
                                margin="normal"
                                required
                                InputLabelProps={{ style: { color: 'black', fontSize: '1.2rem' } }}
                                InputProps={{ style: { color: 'black', backgroundColor: 'white', fontSize: '1.2rem' } }}
                            />
                            <TextField
                                label="Player Count"
                                value={newMatch.playerCount}
                                onChange={(e) => setNewMatch({ ...newMatch, playerCount: e.target.value })}
                                fullWidth
                                margin="normal"
                                required
                                InputLabelProps={{ style: { color: 'black', fontSize: '1.2rem' } }}
                                InputProps={{ style: { color: 'black', backgroundColor: 'white', fontSize: '1.2rem' } }}
                            />
                            <TextField
                                label="Type"
                                value={newMatch.type}
                                onChange={(e) => setNewMatch({ ...newMatch, type: e.target.value })}
                                fullWidth
                                margin="normal"
                                required
                                select
                                InputLabelProps={{ style: { color: 'black', fontSize: '1.2rem' } }}
                                InputProps={{ style: { color: 'black', backgroundColor: 'white', fontSize: '1.2rem' } }}
                            >
                                <option value="5 person">5 Person</option>
                                <option value="7 person">7 Person</option>
                                <option value="11 person">11 Person</option>
                            </TextField>
                            <TextField
                                label="Notes"
                                value={newMatch.notes}
                                onChange={(e) => setNewMatch({ ...newMatch, notes: e.target.value })}
                                fullWidth
                                margin="normal"
                                InputLabelProps={{ style: { color: 'black', fontSize: '1.2rem' } }}
                                InputProps={{ style: { color: 'black', backgroundColor: 'white', fontSize: '1.2rem' } }}
                            />
                            <TextField
                                label="Questions"
                                value={newMatch.questions}
                                onChange={(e) => setNewMatch({ ...newMatch, questions: e.target.value })}
                                fullWidth
                                margin="normal"
                                InputLabelProps={{ style: { color: 'black', fontSize: '1.2rem' } }}
                                InputProps={{ style: { color: 'black', backgroundColor: 'white', fontSize: '1.2rem' } }}
                            />
                            <Button variant="contained" color="primary" type="submit" sx={{ mt: 2, width: '100%', fontSize: '1.2rem' }}>
                                Add Match
                            </Button>
                        </form>
                    </Box>
                </div>
            )}
        </Container>
    </>
);
};

export default FieldOwnerDashboard;