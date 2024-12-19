import React, { useEffect, useState } from "react";
import SearchTool from "../components/common/SearchTool";
import axios from "axios";
import { Container, Paper, Typography } from '@mui/material';
import { Card } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

import Item from "../components/common/Item";
const Hover = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  display: 'flex',
  transition: 'transform 0.3s linear',
  '&:active': {
    transform: 'scale(0.99)', // Subtle hover scale effect
    boxShadow: theme.shadows[5], // Áp dụng hiệu ứng đổ bóng từ theme
  },
}));

const PlayerPage = () => {
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
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");

    if (token && storedUserId) {
      setUserId(storedUserId);
      fetchDefaultFields(token); // Tải danh sách sân
      fetchMatches(token);
    } else {
      navigate("/login"); // Chuyển hướng đến trang đăng nhập nếu không có token
    }
  }, [navigate]);

  // Lấy danh sách sân mặc định
  const fetchDefaultFields = async (token) => {
    setLoadingFields(true);
    setErrorFields("");

    try {
      const response = await axios.get("http://localhost:5000/api/guest/fields", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFields(response.data);
    } catch (error) {
      console.error("Error fetching fields:", error);
      setErrorFields("Có lỗi xảy ra khi tải danh sách sân.");
    } finally {
      setLoadingFields(false);
    }
  };

  // Lấy danh sách trận đấu
  const fetchMatches = async (token) => {
    setLoadingMatches(true);
    setErrorMatches("");

    try {
      const response = await axios.get("http://localhost:5000/api/matches/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
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
              borderRadius: '8px',
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
  );
};

export default PlayerPage;
