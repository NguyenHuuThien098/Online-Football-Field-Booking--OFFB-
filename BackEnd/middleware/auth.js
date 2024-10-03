// BackEnd/middleware/auth.js
const admin = require('../firebase'); // Import Firebase Admin SDK

const authenticateUser = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Lấy token từ header
    if (!token) {
        return res.status(401).send({ error: 'Unauthorized' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken; // Lưu thông tin người dùng vào request
        next(); // Tiếp tục đến middleware tiếp theo hoặc route handler
    } catch (error) {
        console.error('Error during token verification:', error);
        return res.status(403).send({ error: 'Forbidden' });
    }
};

const authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).send({ error: 'Forbidden' });
        }
        next();
    };
};

module.exports = { authenticateUser, authorizeRole };