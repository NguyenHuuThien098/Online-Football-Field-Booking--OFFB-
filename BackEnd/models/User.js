// models/User.js
const admin = require('../firebase'); // Đảm bảo bạn đã cấu hình Firebase

class User {
    static async createUser(email, password) {
        const userRecord = await admin.auth().createUser({
            email,
            password,
        });
        return userRecord;
    }

    static async getUserByEmail(email) {
        const userRecord = await admin.auth().getUserByEmail(email);
        return userRecord;
    }
}

module.exports = User;