const cors = require('cors');
const express = require('express');
const admin = require('./firebase'); // Import Firebase Admin SDK
const app = express();

const authRoutes = require('./routes/authRoutes'); // Import route
const fieldOwnerRoutes = require('./routes/fieldOwnerRoutes');
const playerRoutes = require('./routes/playerRoutes');
const guestRoutes = require('./routes/guestRoutes');
const historyRoutes = require('./routes/histotyRoutes'); // Sửa lại tên file đúng
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const matchRoutes = require('./routes/matchRoutes'); // Thêm import cho matchRoutes
const largeFieldRoutes = require('./routes/largeFieldRoutes'); // Thêm import cho largeFieldRoutes

// Middleware để log các yêu cầu
app.use((req, res, next) => {
    console.log(`Received ${req.method} request for '${req.url}'`);
    next();
});

// CORS middleware
app.use(cors({
    origin: 'http://localhost:3001',  // Cho phép frontend truy cập
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Cho phép các phương thức
    allowedHeaders: ['Content-Type', 'Authorization']  // Các header được phép
}));

// Cấu hình body-parser để tăng giới hạn kích thước của request body
app.use(express.json({ limit: '50mb' })); // Để phân tích JSON request body với giới hạn 50MB
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Để phân tích URL-encoded request body với giới hạn 50MB

app.use('/api/auth', authRoutes); // Sử dụng route cho đăng ký và đăng nhập
app.use('/api/field-owner', fieldOwnerRoutes); // Route cho chủ sân
app.use('/api/player', playerRoutes); // Route cho người chơi
app.use('/api/guest', guestRoutes); // Route cho khách
app.use('/api/history', historyRoutes); // Route cho lịch sử đặt sân
app.use('/api/user', userRoutes); // Route cho thay đổi thông tin người dùng
app.use('/api/admin', adminRoutes); // Route cho admin
app.use('/api/matches', matchRoutes); // Sử dụng route cho trận đấu
app.use('/api/large-fields', largeFieldRoutes); // Sử dụng route cho sân lớn

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});