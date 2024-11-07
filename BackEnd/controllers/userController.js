// controllers/userController.js
const User = require('../models/User');

class UserController {
   
    static async updateUser(req, res) {
        const uid = req.user.uid; 
        const { fullName, phoneNumber, birthYear, address, image } = req.body;

        try {
            const userData = {
                fullName,
                phoneNumber,
                birthYear,
                address,
                image 
            };
            await User.updateUser(uid, userData);
            res.status(200).send({ message: 'Cập nhật thông tin thành công' });
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    }

    // Lấy thông tin người dùng
    static async getUser(req, res) {
        const uid = req.user.uid; 

        try {
            const user = await User.getUserById(uid);
            res.status(200).send(user);
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    }
}

module.exports = UserController;
