
const cors = require('cors');
const express = require('express');
const admin = require('./firebase'); // Import firebase Admin SDK
const app = express();



app.use(cors({
    origin: 'http://localhost:3001' // Cho phép frontend truy cập
}));
app.use(express.json()); // Để phân tích JSON request body

// Endpoint để lấy danh sách người dùng
app.get('/api/users', async (req, res) => {
    try {
        const snapshot = await admin.database().ref('users').once('value');
        const users = snapshot.val();
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: 'Có lỗi xảy ra!' });
    }
});

// Endpoint để thêm người dùng
app.post('/api/users', async (req, res) => {
    const { userId, email } = req.body;

    try {
        await admin.database().ref(`users/${userId}`).set({ email });
        res.status(201).json({ message: 'Người dùng đã được thêm thành công!' });
    } catch (error) {
        console.error("Error adding user:", error);
        res.status(500).json({ error: 'Có lỗi xảy ra!' });
    }
});

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
