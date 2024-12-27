import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Button, Grid, Card, CardContent, Typography, TextField, Box, Tabs, Tab } from '@mui/material';
import LargeField from './Field/Field';
import Match from './Match/Match';
const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tabIndex, setTabIndex] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

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
                    <LargeField />
                )}
                {tabIndex === 1 && (
                    <Match />
                )}
            </Container>
        </>
    );
};

export default Dashboard;