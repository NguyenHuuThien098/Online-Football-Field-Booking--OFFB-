const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes'); // Import route

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3001', // Địa chỉ frontend của bạn
    credentials: true,
}));
app.use(bodyParser.json()); // Để xử lý JSON

// Kết nối các route
app.use('/api/auth', authRoutes); // Sử dụng route cho đăng ký và đăng nhập

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});