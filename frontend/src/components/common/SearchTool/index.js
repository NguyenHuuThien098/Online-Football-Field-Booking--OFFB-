import React, { useState } from "react";
import { TextField, Stack, Box, InputAdornment, Typography, Button } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

// Chuyển đổi thời gian từ định dạng HH:mm sang số phút kể từ 00:00
const convertTimeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const SearchTool = ({ setSearchParams }) => {
  const [searchParams, setSearch] = useState({
    name: "",
    address: "",
    date: "",
    from: "",
    to: "",
    time: "",
  });

  // Cập nhật giá trị input
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setSearch((prev) => ({ ...prev, [id]: value }));
  };

  // Thực hiện tìm kiếm khi nhấn Enter trong trường "name" hoặc "address"
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch(); // Gọi hàm tìm kiếm khi nhấn Enter
    }
  };

  // Kiểm tra dữ liệu trước khi tìm kiếm và gọi API
  const handleSearch = () => {
    // Kiểm tra ít nhất một tiêu chí tìm kiếm
    if (
      !searchParams.name.trim() &&
      !searchParams.address.trim() &&
      !searchParams.date &&
      !searchParams.from &&
      !searchParams.to &&
      !searchParams.time
    ) {
      alert("Vui lòng nhập ít nhất một tiêu chí tìm kiếm.");
      return;
    }

    // Chuyển từ giờ phút (HH:mm) sang số phút để gửi đến backend
    const fromInMinutes = searchParams.from ? convertTimeToMinutes(searchParams.from) : null;
    const toInMinutes = searchParams.to ? convertTimeToMinutes(searchParams.to) : null;

    const queryParams = new URLSearchParams({
      ...searchParams,
      from: fromInMinutes,
      to: toInMinutes,
    }).toString();

    const url = `http://localhost:5000/api/player/fields?${queryParams}`;

    fetch(url, {
      method: "GET", // Sử dụng GET thay vì POST
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Kết quả tìm kiếm:", data); // Hiển thị kết quả tìm kiếm từ backend
        // Xử lý kết quả tìm kiếm ở đây (hiển thị dữ liệu, cập nhật state, v.v.)
      })
      .catch((error) => {
        console.error("Có lỗi xảy ra:", error);
        alert("Đã xảy ra lỗi khi tìm kiếm.");
      });
  };

  return (
    <Box
      className="w-100"
      sx={{
        borderTop: "10px solid #1976d2",
        borderBottom: "10px solid #1976d2",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={0}
        sx={{
          px: 0,
          py: 3,
          backgroundColor: "white",
          color: "#1565c0",
        }}
      >
        {/* Day Selector */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pl: 3,
          }}
        >
          <Typography variant="body1" sx={{ minWidth: "50px", fontWeight: "bold" }}>
            Day
          </Typography>
          <TextField
            fullWidth
            type="date"
            variant="outlined"
            id="date"
            value={searchParams.date}
            onChange={handleInputChange}
            InputProps={{
              sx: {
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#1976d2",
                "&:hover": {
                  borderColor: "#1565c0",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderWidth: 1,
                  borderColor: "#1565c0",
                },
              },
            }}
          />
        </Box>

        {/* From Selector */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
          }}
        >
          <Typography variant="body1" sx={{ minWidth: "50px", fontWeight: "bold" }}>
            From
          </Typography>
          <TextField
            fullWidth
            type="time"
            variant="outlined"
            id="from"
            value={searchParams.from}
            onChange={handleInputChange}
            InputProps={{
              sx: {
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#1976d2",
                "&:hover": {
                  borderColor: "#1565c0",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderWidth: 1,
                  borderColor: "#1565c0",
                },
              },
            }}
          />
        </Box>

        {/* To Selector */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
          }}
        >
          <Typography variant="body1" sx={{ minWidth: "50px", fontWeight: "bold" }}>
            To
          </Typography>
          <TextField
            fullWidth
            type="time"
            variant="outlined"
            id="to"
            value={searchParams.to}
            onChange={handleInputChange}
            InputProps={{
              sx: {
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#1976d2",
                "&:hover": {
                  borderColor: "#1565c0",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderWidth: 1,
                  borderColor: "#1565c0",
                },
              },
            }}
          />
        </Box>

        {/* Duration */}
        <Box
          sx={{
            flex: 1,
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="body1" sx={{ mr: 1, fontWeight: "bold" }}>
            Time
          </Typography>
          <TextField
            type="number"
            id="time"
            value={searchParams.time}
            onChange={handleInputChange}
            placeholder="1"
            variant="outlined"
            InputProps={{
              sx: {
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#1976d2",
                "&:hover": {
                  borderColor: "#1565c0",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderWidth: 1,
                  borderColor: "#1565c0",
                },
              },
            }}
          />
          <Typography variant="body1" sx={{ ml: 1, fontWeight: "bold" }}>
            Hours
          </Typography>
        </Box>

        {/* Search Input */}
        <Box sx={{ px: 5, flex: 4 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by name or address"
            id="name"
            value={searchParams.name}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress} // Gọi handleSearch khi nhấn Enter
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 50,
                borderWidth: 1,
                borderColor: "#1976d2",
                "&:hover": {
                  borderColor: "#1565c0",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderWidth: 1,
                  borderColor: "#1565c0",
                },
              },
            }}
          />
        </Box>

        {/* Search Button */}
        <Box sx={{ px: 2 }}>
          <Button
            variant="contained"
            color="primary"
            sx={{
              height: "100%",
              borderRadius: 10,
            }}
            onClick={handleSearch} // Gọi hàm tìm kiếm khi nhấn nút
          >
            Search
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default SearchTool;
