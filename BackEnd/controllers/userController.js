const admin = require('firebase-admin'); // Import Firebase Admin SDK
const db = admin.database();

class UserController {

    static async updateUser(req, res) {
        const uid = req.user?.uid;
        const { fullName, phoneNumber, birthDate, address, image } = req.body;

        try {
            const userData = {};

            // Kiểm tra và cập nhật thông tin người dùng
            if (fullName) userData.fullName = fullName;

            if (phoneNumber) {
                const phoneRegex = /^[0-9]{10,15}$/; // Kiểm tra số điện thoại có độ dài từ 10 đến 15 số
                if (!phoneRegex.test(phoneNumber)) {
                    return res.status(400).send({ error: 'Số điện thoại không hợp lệ' });
                }
                userData.phoneNumber = phoneNumber;
            }

            if (birthDate) {
                const birthDateFormat = new Date(birthDate);
                if (!birthDateFormat.getTime()) {
                    return res.status(400).send({ error: 'Ngày sinh không hợp lệ' });
                }
                userData.birthDate = birthDateFormat.toISOString();
            }

            if (address) userData.address = address;
            if (image) userData.image = image;

            // Cập nhật dữ liệu vào Firebase Realtime Database
            await db.ref(`users/${uid}`).update(userData);

            res.status(200).send({ message: 'Cập nhật thông tin thành công' });
        } catch (error) {
            console.error('Lỗi khi cập nhật người dùng:', error.message);
            res.status(500).send({ error: error.message });
        }
    }

    static async getUser(req, res) {
        const uid = req.user?.uid;

        try {
            const userSnapshot = await db.ref(`users/${uid}`).once('value');

            if (!userSnapshot.exists()) {
                return res.status(200).send({
                    fullName: '',
                    phoneNumber: '',
                    birthDate: '',
                    address: '',
                    image: '',
                    email: req.user?.email || '',
                    role: req.user?.role || 'player',
                });
            }

            const userData = userSnapshot.val();
            userData.email = userData.email || req.user?.email || '';
            userData.role = userData.role || req.user?.role || 'player';

            res.status(200).send(userData);
        } catch (error) {
            console.error('Lỗi khi lấy thông tin người dùng:', error.message);
            res.status(500).send({ error: error.message });
        }
    }
}

module.exports = UserController;
