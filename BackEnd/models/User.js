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

    // Cập nhật thông tin người dùng
    static async updateUser(uid, userData) {
        await admin.database().ref(`users/${uid}`).update(userData);
    }

    // Lấy thông tin người dùng
    static async getUserById(uid) {
        const snapshot = await admin.database().ref(`users/${uid}`).once('value');
        if (!snapshot.exists()) {
            throw new Error('User does not exist');
        }
        return { uid: uid, ...snapshot.val() };
    }

    // Xác thực token Google
    static async verifyGoogleToken(token) {
        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            return decodedToken; // Trả về thông tin người dùng nếu token hợp lệ
        } catch (error) {
            console.error('Error verifying Google token:', error);
            throw new Error('Invalid token');
        }
    }
}

module.exports = User;
