// controllers/authController.js
const User = require('../models/User'); // Đảm bảo rằng bạn có model User
const { database } = require('../firebase'); // Hoặc đường dẫn chính xác đến file firebase.js

exports.register = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.createUser(email, password);
        // Save user role to the Realtime Database
        await database.ref(`users/${user.uid}`).set({ email, role });
        res.status(201).send({ uid: user.uid, email: user.email, role });
    } catch (error) {
        console.error('Error during registration:', error); // Ghi lại lỗi
        res.status(400).send({ error: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.getUserByEmail(email); // Lấy user từ model
        // Thực hiện xác thực mật khẩu ở đây (có thể sử dụng bcrypt)
        res.send({ uid: user.uid, email: user.email, role: user.role });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

// exports.playerpage = async (req, res) => {
//     res.send('This is the Player Page.');
// }


// exports.fieldownerdashboard = async (req, res) => {
//     res.send('This is the Field Owner Dashboard.');

// }