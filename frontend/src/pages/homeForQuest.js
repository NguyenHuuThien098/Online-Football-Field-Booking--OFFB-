import React, { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
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
  border: '0.1px solid #ccc',
  display: 'flex',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.02)', // Subtle hover scale effect
    boxShadow: theme.shadows[5], // Áp dụng hiệu ứng đổ bóng từ theme
  },
}));

const Home = () => {
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
      const response = await axios.get(
        "http://localhost:5000/api/guest/search",
        { params: searchParams }
      );
      setFields(response.data); // Hiển thị kết quả tìm kiếm
    } catch (error) {
      console.error("Error searching fields:", error);
      setErrorFields("Có lỗi xảy ra khi tìm kiếm sân.");
    } finally {
      setLoadingFields(false);
    }
  };

  return (
    <MainLayout>
      {/* Search Tool */}
      <SearchTool
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        searchFields={searchFields}
      />
      <div className="bg-light p-3">

        {/* Fields Section */}

        <Container 
          className="shadow p-4 mt-4" 
          style={{ background: "white", borderRadius: '50px' }} 
          sx={{
            
          }}
        >

            <Paper
              className="w-100 mt-2"
              elevation={3}
              sx={{
                borderRadius: '4px',
                textAlign: 'center',
                backgroundColor: '#1976d2', // Đặt màu nền tại đây
                // border: "2px solid gray"
              }}
            >
              <Typography variant="h2" component="h2" color="white">
                Danh sách sân bóng
              </Typography>
            </Paper>

          {loadingFields ? (
            <p className="text-center">Đang tải danh sách sân...</p>
          ) : errorFields ? (
            <p style={{ color: "red" }} className="text-center">{errorFields}</p>
          ) : fields.length > 0 ? (
            <ul>
              {fields.map((field) => (
                <Item key={field.fieldId} field={field} />
              ))}
            </ul>
          ) : (
            <p className="text-center">Không tìm thấy sân nào.</p>
          )}

          {/* Matches Section */}

            <Paper
              className="w-100"
              elevation={3}
              sx={{
                borderRadius: '16px',
                textAlign: 'center',
                backgroundColor: '#1976d2', // Đặt màu nền tại đây
                // border: "1px solid gray"
              }}
            >

              <Typography variant="h2" component="h2" color="white">
                Danh sách trận đấu mở
              </Typography>
            </Paper>

          
          {loadingMatches ? (
            <p className="text-center">Đang tải danh sách trận đấu...</p>
          ) : errorMatches ? (
            <p style={{ color: "red" }} className="text-center">{errorMatches}</p>
          ) : matches.length > 0 ? (
            <div className="d-flex flex-wrap justify-content-center">
              {matches.map((match) => (
                <Item key={match.id} match={match} />
              ))}
            </div>
          ) : (
            <p className="text-center">Không có trận đấu nào được mở.</p>
          )}
        </Container>
      </div>
    </MainLayout>
  );
};

export default Home;
