import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Container, Typography, Box, Alert, IconButton } from '@mui/material';
import { ArrowBack, ArrowForward, ArrowBackIos } from '@mui/icons-material';

const JoinMatch = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const matchData = location.state; // Data passed through navigate
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Index of the currently displayed image

  useEffect(() => {
    const playerId = localStorage.getItem('userId');
    setPlayerId(playerId);
  }, []);

  const getToken = () => localStorage.getItem('token');

  const handleError = (err) => {
    if (err.response) {
      const errorMessage = err.response?.data?.error || 'An error occurred';
      setError(errorMessage);
    } else {
      setError('Cannot connect to the server. Please try again later.');
    }
  };

  const handleJoinMatch = async () => {
    const token = getToken();
    if (!token) {
      alert('You are not logged in. Please log in to continue.');
      return;
    }
    if (!playerId) {
      alert('Player ID not found. Please try again.');
      return;
    }

    const confirmJoin = window.confirm('Are you sure you want to join this match?');
    if (!confirmJoin) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/join/joinm',
        { matchId: matchData.id, playerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(response.data.message || 'Request to join successfully sent');
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelJoinMatch = async () => {
    const token = getToken();
    if (!token) {
      alert('You are not logged in. Please log in to continue.');
      return;
    }
    if (!playerId) {
      alert('Player ID not found. Please try again.');
      return;
    }

    const confirmCancel = window.confirm('Are you sure you want to cancel joining this match?');
    if (!confirmCancel) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.delete(
        'http://localhost:5000/api/join/cancel',
        {
          data: { matchId: matchData.id, playerId },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert(response.data.message || 'Successfully canceled joining');
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNextImage = () => {
    if (matchData?.images && matchData.images.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % matchData.images.length);
    }
  };

  const handlePreviousImage = () => {
    if (matchData?.images && matchData.images.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        (prevIndex - 1 + matchData.images.length) % matchData.images.length
      );
    }
  };

  return (
    <Container sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', py: 2 }}>
      {/* Back Button */}
      <Button
        onClick={() => navigate(-1)}
        variant="outlined"
        sx={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          borderRadius: '8px',
          borderColor: '#1976d2',
          color: '#1976d2',
          '&:hover': {
            backgroundColor: '#1976d2',
            color: 'white',
          },
        }}
      >
        <ArrowBackIos /> Back
      </Button>

      <Box
        sx={{
          backgroundColor: 'white',
          padding: 4,
          borderRadius: '12px',
          boxShadow: 3,
          width: '100%',
          maxWidth: '800px', // Increased maxWidth to make the container wider
          textAlign: 'center',
          marginTop: 4,
        }}
      >
        <Typography variant="h4" sx={{ color: '#1976d2', marginBottom: 2 }}>
          Match Details
        </Typography>

        {matchData?.images && matchData.images.length > 0 ? (
          <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <IconButton
              onClick={handlePreviousImage}
              sx={{ position: 'absolute', left: '-10%', zIndex: 1, color: '#1976d2' }}
            >
              <ArrowBack />
            </IconButton>

            <img
              src={matchData.images[currentImageIndex]}
              alt={`match-image-${currentImageIndex}`}
              style={{
                width: '100%',
                maxWidth: '500px',
                height: 'auto',
                borderRadius: '12px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              }}
            />

            <IconButton
              onClick={handleNextImage}
              sx={{ position: 'absolute', right: '-10%', zIndex: 1, color: '#1976d2' }}
            >
              <ArrowForward />
            </IconButton>
          </Box>
        ) : (
          <Typography>No images available for this match.</Typography>
        )}

        <Typography sx={{ color: '#1976d2', mt: 2 }}><strong>Time:</strong> {new Date(matchData?.time).toLocaleString()}</Typography>
        <Typography sx={{ color: '#1976d2' }}><strong>Owner:</strong> {matchData?.ownerName}</Typography>
        <Typography sx={{ color: '#1976d2' }}><strong>Large Field Address:</strong> {matchData?.largeFieldAddress}</Typography>
        <Typography sx={{ color: '#1976d2' }}><strong>Notes:</strong> {matchData?.notes}</Typography>
        <Typography sx={{ color: '#1976d2' }}><strong>Player Count:</strong> {matchData?.playerCount}</Typography>
        <Typography sx={{ color: '#1976d2' }}><strong>Number of players remaining:</strong> {matchData?.remainingPlayerCount}</Typography>
        
        {loading && <Typography>Processing...</Typography>}
        {error && <Alert severity="error">{error}</Alert>}

        <Button
          onClick={handleJoinMatch}
          disabled={loading || matchData?.remainingPlayerCount <= 0}
          variant="contained"
          color="primary"
          sx={{ mt: 2, width: '200px' }}
        >
          Book field
        </Button>
      </Box>
    </Container>
  );
};

export default JoinMatch;
