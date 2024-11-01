// BackEnd/middleware/auth.js
const admin = require('../firebase'); // Import Firebase Admin SDK

exports.authenticateUser = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).send({ error: 'Unauthorized' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken; // Lưu thông tin người dùng vào req.user
        next();
    } catch (error) {
        console.error('Error during token verification:', error);
        return res.status(403).send({ error: 'Forbidden' });
    }
};

exports.authorizeRole = (roles) => {
    return (req, res, next) => {
        // Kiểm tra xem người dùng đã được xác thực và có trong danh sách vai trò cho phép
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).send({ error: 'Forbidden' });
        }
        next();
    };
};

 //module.exports = { authenticateUser, authorizeRole };