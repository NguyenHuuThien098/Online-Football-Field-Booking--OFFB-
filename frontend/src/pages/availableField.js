import React, { useEffect, useState } from "react";
import SearchTool from "../components/common/SearchTool";
import Item from "../components/common/Item";
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
    boxShadow: theme.shadows[5], // Áp dụng hiệu ứng đổ bóng từ theme
  },

}));

const AvailableField = () => {
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
      // Fallback data
      setFields([
        { fieldId: 1, name: "Default Field 1", largeFieldAddress: "Default Address 1", largeFieldName: "Default Large Field 1", price: 100000 },
        { fieldId: 2, name: "Default Field 2", largeFieldAddress: "Default Address 2", largeFieldName: "Default Large Field 2", price: 200000 }
      ]);
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
      // Fallback data
      setMatches([
        { matchId: 1, ownerName: "Default Owner 1", address: "Default Address 1", time: "2023-10-01T10:00:00" },
        { matchId: 2, ownerName: "Default Owner 2", address: "Default Address 2", time: "2023-10-02T14:00:00" }
      ]);
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
      // Fallback data
      setFields([
        { fieldId: 1, name: "Default Field 1", largeFieldAddress: "Default Address 1", largeFieldName: "Default Large Field 1", price: 100000 },
        { fieldId: 2, name: "Default Field 2", largeFieldAddress: "Default Address 2", largeFieldName: "Default Large Field 2", price: 200000 }
      ]);
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
          sx={{

          }}
        >

          <Paper
            className="w-100 mt-2"
            elevation={3}
            sx={{
              borderRadius: '8px',
              textAlign: 'center',
              backgroundColor: '#1976d2', // Set background color here
              // border: "2px solid gray"
            }}
          >
            <Typography variant="h2" component="h2" color="white" className="mt-4">
              List of football fields
            </Typography>
          </Paper>

          {loadingFields ? (
            <p className="text-center">Loading list of fields...</p>
          ) : errorFields ? (
            <p style={{ color: "red" }} className="text-center">{errorFields}</p>
          ) : fields.length > 0 ? (
            <div className="d-flex flex-wrap justify-content-center">
              {fields.map((field) => (
                <Item key={field.fieldId} field={field} />
              ))}
            </div>
          ) : (
            <p className="text-center">No fields found.</p>
          )}
        </Container>
      </div>
  );
};

export default AvailableField;
