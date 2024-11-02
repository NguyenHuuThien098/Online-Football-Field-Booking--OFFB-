const cors = require('cors');
const express = require('express');
const admin = require('./firebase'); // Import Firebase Admin SDK
const app = express();
const authRoutes = require("./routes/authRoutes");
const matchRoutes = require("./routes/matchRoutes"); // Thêm import cho matchRoutes

// Middleware để log các yêu cầu
app.use((req, res, next) => {
    console.log(`Received ${req.method} request for '${req.url}'`);
    next();
});

// CORS middleware
app.use(cors({
    origin: 'http://localhost:3001' // Cho phép frontend truy cập
}));

app.use(express.json()); // Để phân tích JSON request body

// Sử dụng route cho đăng ký, đăng nhập và lấy danh sách người dùng
app.use('/api/auth', authRoutes); 

// Sử dụng route cho trận đấu
app.use('/api/matches', matchRoutes); 

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});