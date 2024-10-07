const cors = require('cors');
const express = require('express');
const admin = require('./firebase'); // Import Firebase Admin SDK
const app = express();
const authRoutes = require("./routes/authRoutes");
// CORS middleware
app.use(cors({
    origin: 'http://localhost:3001' // Cho phép frontend truy cập
}));
app.use(express.json()); // Để phân tích JSON request body
app.use('/api/auth', authRoutes); // Sử dụng route cho đăng ký và đăng nhập

// Endpoint để lấy danh sách người dùng
app.get('/api/users', async (req, res) => {
    try {
        const snapshot = await admin.database().ref('users').once('value');
        const users = snapshot.val() || {}; // Trả về đối tượng rỗng nếu không có người dùng
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: 'Có lỗi xảy ra khi lấy danh sách người dùng!' });
    }
});

// Endpoint để thêm người dùng
app.post('/api/users', async (req, res) => {
    const { userId, email } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!userId || !email) {
        return res.status(400).json({ error: 'userId và email là bắt buộc!' });
    }
    

    try {
        await admin.database().ref(`users/${userId}`).set({ email });
        res.status(201).json({ message: 'Người dùng đã được thêm thành công!' });
    } catch (error) {
        console.error("Error adding user:", error);
        res.status(500).json({ error: 'Có lỗi xảy ra khi thêm người dùng!' });
    }
});

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});