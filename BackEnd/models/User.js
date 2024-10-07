// models/User.js
const admin = require('../firebase'); // Đảm bảo bạn đã cấu hình Firebase

class User {
    // Tạo người dùng mới
    static async createUser(email, role) {
        try {
            const userRecord = await admin.auth().createUser({
                email,
            });
            return { uid: userRecord.uid, email, role }; // Trả về thông tin người dùng đã tạo
        } catch (error) {
            console.error('Error creating user:', error);
            throw new Error('Could not create user');
        }
    }

    // Lấy thông tin người dùng theo email
    static async getUserByEmail(email) {
        try {
            const userRecord = await admin.auth().getUserByEmail(email);
            return userRecord; // Trả về thông tin người dùng nếu tồn tại
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                return null; // Trả về null nếu không tồn tại
            }
            console.error('Error fetching user by email:', error);
            throw new Error('Could not retrieve user');
        }
    }
}

module.exports = User;