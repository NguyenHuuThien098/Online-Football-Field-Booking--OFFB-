import React, { useEffect, useState } from "react";
import SearchTool from "../SearchTool";
import Item from "../Item";
import axios from "axios";
import { Container } from 'react-bootstrap';
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
  const [searchParams, setSearchParams] = useState({
    name: "",
    date: "",
    startTime: "",
    endTime: "",
    type: "",
  });
  const [loadingFields, setLoadingFields] = useState(false);
  const [errorFields, setErrorFields] = useState("");

  useEffect(() => {
    fetchDefaultFields(); // Load default fields
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
        <Paper
          className="w-100 mt-2"
          elevation={3}
          sx={{
            borderRadius: '8px',
            textAlign: 'center',
            backgroundColor: '#1976d2', // Set background color here
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
