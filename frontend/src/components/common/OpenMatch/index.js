import React, { useEffect, useState } from "react";
import SearchTool from "../SearchTool";
import Item from "../Item";
import axios from "axios";
import Compressor from 'compressorjs';
import { Container, Row, Col } from 'react-bootstrap';
import { Typography, Paper } from '@mui/material';
import { Card } from '@mui/material';
import { styled } from '@mui/material/styles';

const Hover = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  display: 'flex',
  transition: 'transform 0.3s linear',
  '&:active': {
    transform: 'scale(0.99)', // Subtle hover scale effect
    boxShadow: theme.shadows[5], // Apply shadow effect from theme
  },
}));

const OpenMatch = () => {
  const [fields, setFields] = useState([]); // List of fields
  const [matches, setMatches] = useState([]); // List of matches
  const [searchParams, setSearchParams] = useState({
    name: "",
    date: "",
    startTime: "",
    endTime: "",
    type: "",
  });
  const [loadingFields, setLoadingFields] = useState(false);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [errorFields, setErrorFields] = useState("");
  const [errorMatches, setErrorMatches] = useState("");

  const role = localStorage.getItem("userRole");
  
  useEffect(() => {
    fetchDefaultFields(); // Load default fields
    fetchMatches(); // Load matches
  }, []);

  // Fetch default fields
  const fetchDefaultFields = async () => {
    setLoadingFields(true);
    setErrorFields("");

    try {
      const response = await axios.get("http://localhost:5000/api/guest/fields");
      setFields(response.data);
    } catch (error) {
      console.error("Error fetching default fields:", error);
      setErrorFields("An error occurred while loading the list of fields.");
    } finally {
      setLoadingFields(false);
    }
  };

  // Fetch matches
  const fetchMatches = async () => {
    setLoadingMatches(true);
    setErrorMatches("");

    try {
      const response = await axios.get("http://localhost:5000/api/matches/all");
      setMatches(response.data);
    } catch (error) {
      console.error("Error fetching matches:", error);
      setErrorMatches("An error occurred while loading the list of matches.");
    } finally {
      setLoadingMatches(false);
    }
  };

  // Search fields
  const searchFields = async () => {
    setLoadingFields(true);
    setErrorFields("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorFields("You need to log in to search.");
        return;
      }

      const response = await axios.get("http://localhost:5000/api/guest/search", {
        params: searchParams,
        headers: { Authorization: `Bearer ${token}` },
      });
      setFields(response.data);
    } catch (error) {
      console.error("Error searching fields:", error);
      setErrorFields("An error occurred while searching for fields.");
    } finally {
      setLoadingFields(false);
    }
  };

  return (      
      <div className="bg-light p-3">
        <Hover>
          <SearchTool
            searchParams={searchParams}
            setSearchParams={setSearchParams}
            searchFields={searchFields}
          />
        </Hover>

        {/* Fields Section */}

        <Container
          className="shadow p-4 mt-5 border-top border-primary"
          style={{ background: "white", borderRadius: '50px' }}
        >
          {/* Matches Section */}

          <Paper
            className="w-100"
            elevation={3}
            sx={{
              borderRadius: '8px',
              textAlign: 'center',
              backgroundColor: '#1976d2', // Set background color here
            }}
          >
            <Typography variant="h2" component="h2" color="white" className="mt-4">
              Open Matches List
            </Typography>
          </Paper>

          {loadingMatches ? (
            <p className="text-center">Loading matches...</p>
          ) : errorMatches ? (
            <p style={{ color: "red" }} className="text-center">{errorMatches}</p>
          ) : matches.length > 0 ? (
            <div className="d-flex flex-wrap justify-content-center">
              {matches.map((match) => (
                <Item key={match.id} match={match} />
              ))}
            </div>
          ) : (
            <p className="text-center">No open matches found.</p>
          )}
        </Container>
      </div>
  );
};

export default OpenMatch;
