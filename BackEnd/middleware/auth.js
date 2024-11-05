const admin = require('../firebase'); // Import Firebase Admin SDK

// Middleware xác thực người dùng
exports.authenticateUser = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Lấy token từ header

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken; // Lưu thông tin người dùng vào req.user

        // Lấy thông tin người dùng từ Realtime Database
        const userSnapshot = await admin.database().ref(`users/${req.user.uid}`).once('value');
        const userData = userSnapshot.val();

        if (userData) {
            req.user.role = userData.role; // Gán vai trò vào req.user
        } else {
            console.error('User data not found in Realtime Database');
            return res.status(403).json({ error: 'Forbidden: User data not found' });
        }

        console.log('User authenticated:', req.user.uid);
        console.log('User details:', req.user); // Log thông tin người dùng
        next();
    } catch (error) {
        console.error('Error during token verification:', error.message);
        return res.status(403).json({ error: 'Forbidden: Invalid token' });
    }
};

// Middleware phân quyền
exports.authorizeRole = (roles) => {
    return (req, res, next) => {
        const userRole = req.user?.role; // Lấy vai trò của người dùng

        // Kiểm tra nếu người dùng chưa được xác thực hoặc vai trò không có trong danh sách cho phép
        if (!req.user || !roles.includes(userRole)) {
            console.error('Access denied: User role not authorized');
            return res.status(403).json({ error: 'Forbidden: Access denied' });
        }

        console.log(`User role: ${userRole}, Allowed roles: ${roles}`); // Log vai trò người dùng và vai trò cho phép
        next();
    };
};