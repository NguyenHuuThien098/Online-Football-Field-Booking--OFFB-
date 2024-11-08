// controllers/userController.js
const User = require('../models/User');

class UserController {
    // Cập nhật thông tin người dùng
    static async updateUser(req, res) {
        const uid = req.user.uid; // Lấy uid từ thông tin người dùng đã xác thực
        const userData = req.body;

        try {
            await User.updateUser(uid, userData);
            res.status(200).send({ message: 'Cập nhật thông tin thành công' });
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    }

    // Lấy thông tin người dùng
    static async getUser(req, res) {
        const uid = req.user.uid; // Lấy uid từ thông tin người dùng đã xác thực

        try {
            const user = await User.getUserById(uid);
            res.status(200).send(user);
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    }
}

module.exports = UserController;
