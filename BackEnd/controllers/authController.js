// controllers/authController.js
const User = require('../models/User'); // Đảm bảo rằng bạn có model User
const { database } = require('../firebase'); // Hoặc đường dẫn chính xác đến file firebase.js

exports.register = async (req, res) => {
    const { email, role } = req.body; // Nhận email và role từ yêu cầu
    try {
        // Kiểm tra xem người dùng đã tồn tại chưa
        const existingUser = await User.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).send({ error: 'User already exists' });
        }

        // Nếu người dùng chưa tồn tại, tạo mới
        const newUser = await User.createUser(email, role);
        // Lưu thông tin người dùng vào Realtime Database
        await database.ref(`users/${newUser.uid}`).set({ email, role });
        res.status(201).send({ uid: newUser.uid, email, role });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(400).send({ error: error.message });
    }
};

exports.loginWithGoogle = async (req, res) => {
    const { googleId, email, role } = req.body; // Nhận googleId và email từ yêu cầu

    try {
        // Kiểm tra xem người dùng đã tồn tại chưa
        const existingUser = await User.getUserByEmail(email);
        if (!existingUser) {
            // Nếu người dùng chưa tồn tại, tạo mới
            const newUser = await User.createUser(email, role);
            // Lưu thông tin người dùng vào Realtime Database
            await database.ref(`users/${newUser.uid}`).set({ email, role });
            return res.status(201).send({ uid: newUser.uid, email, role });
        }

        // Nếu người dùng đã tồn tại, trả về thông tin người dùng
        res.send({ uid: existingUser.uid, email: existingUser.email, role: existingUser.role });
    } catch (error) {
        console.error('Error during Google login:', error);
        res.status(400).send({ error: error.message });
    }
};