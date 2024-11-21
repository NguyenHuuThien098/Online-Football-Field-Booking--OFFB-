const cors = require('cors');
const express = require('express');
const admin = require('./firebase'); // Import Firebase Admin SDK
const app = express();


const authRoutes = require('./routes/authRoutes'); // Import route
const fieldOwnerRoutes = require('./routes/fieldOwnerRoutes');
const playerRoutes = require('./routes/playerRoutes');
const guestRoutes = require('./routes/guestRoutes');
const historyRoutes = require('./routes/histotyRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes =  require('./routes/adminRoutes');
const matchRoutes = require('./routes/matchRoutes'); // Thêm import cho matchRoutes

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


app.use('/api/auth', authRoutes); // Sử dụng route cho đăng ký và đăng nhập
app.use('/api/field-owner', fieldOwnerRoutes); // Route cho chủ sân
app.use('/api/player', playerRoutes); // Route cho người chơi
app.use('/api/guest', guestRoutes); // Route cho khách
app.use('/api/history', historyRoutes); // Route cho lịch sử đặt sân
app.use('/api/user', userRoutes);//thay doi thong tin nguoi dùng
app.use('/api/admin', adminRoutes);
// Sử dụng route cho trận đấu
app.use('/api/matches', matchRoutes); 

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});