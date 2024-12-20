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
  const [fields, setFields] = useState([]); // Danh sách sân
  const [matches, setMatches] = useState([]); // Danh sách trận đấu
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
    fetchDefaultFields(); // Tải danh sách sân mặc định
    fetchMatches(); // Tải danh sách trận đấu
  }, []);

  // Lấy danh sách sân mặc định
  const fetchDefaultFields = async () => {
    setLoadingFields(true);
    setErrorFields("");

    try {
      const response = await axios.get("http://localhost:5000/api/guest/fields");
      setFields(response.data);
    } catch (error) {
      console.error("Error fetching default fields:", error);
      setErrorFields("Có lỗi xảy ra khi tải danh sách sân.");
    } finally {
      setLoadingFields(false);
    }
  };

  // Lấy danh sách trận đấu
  const fetchMatches = async () => {
    setLoadingMatches(true);
    setErrorMatches("");

    try {
      const response = await axios.get("http://localhost:5000/api/matches/all");
      setMatches(response.data);
    } catch (error) {
      console.error("Error fetching matches:", error);
      setErrorMatches("Có lỗi xảy ra khi tải danh sách trận đấu.");
    } finally {
      setLoadingMatches(false);
    }
  };

// Tìm kiếm sân
  const searchFields = async () => {
    setLoadingFields(true);
    setErrorFields("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorFields("Bạn cần đăng nhập để tìm kiếm.");
        return;
      }

      const response = await axios.get("http://localhost:5000/api/guest/search", {
        params: searchParams,
        headers: { Authorization: `Bearer ${token}` },
      });
      setFields(response.data);
    } catch (error) {
      console.error("Error searching fields:", error);
      setErrorFields("Có lỗi xảy ra khi tìm kiếm sân.");
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
              backgroundColor: '#1976d2', // Đặt màu nền tại đây
              // border: "2px solid gray"
            }}
          >
            <Typography variant="h2" component="h2" color="white" className="mt-4">
              Danh sách sân bóng
            </Typography>
          </Paper>

          {loadingFields ? (
            <p className="text-center">Đang tải danh sách sân...</p>
          ) : errorFields ? (
            <p style={{ color: "red" }} className="text-center">{errorFields}</p>
          ) : fields.length > 0 ? (
            <div className="d-flex flex-wrap justify-content-center">
              {fields.map((field) => (
                <Item key={field.fieldId} field={field} />
              ))}
            </div>
          ) : (
            <p className="text-center">Không tìm thấy sân nào.</p>
          )}
        </Container>
      </div>
  );
};

export default AvailableField;
