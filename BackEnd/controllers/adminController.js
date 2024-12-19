// controllers/adminController.js

const admin = require('../firebase'); // Import Firebase Admin SDK

const googleLogin = async (req, res) => {
    const { token } = req.body;
   
    try {
        // const user = await User.verifyGoogleToken(token);

        // Đặt vai trò cho người dùng
        await User.setUserRole(user.uid, 'admin');
        res.status(200).send({ message: 'Đăng nhập thành công với tư cách admin', uid: user.uid });
    } catch (error) {
        console.error('Error during Google login:', error); // Ghi log lỗi
        res.status(400).send({ error: error.message });
    }
};

// Lấy thông tin chi tiết tài khoản theo UID
const getUserById = async (req, res) => {
    const { uid } = req.params;

    try {
        // Lấy thông tin người dùng từ Realtime Database
        const userSnapshot = await admin.database().ref(`users/${uid}`).once('value');
        const userData = userSnapshot.val();

        if (!userData) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Trả về thông tin đầy đủ của người dùng
        res.status(200).json({
            uid,
            fullName: userData.fullName,
            email: userData.email,
            address: userData.address,
            birthDate: userData.birthDate,
            phoneNumber: userData.phoneNumber,
            role: userData.role,
            image: userData.image,
        });
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        res.status(500).json({ error: 'Error fetching user details' });
    }
};

// Lấy danh sách tất cả tài khoản (chỉ email và role)
const getAllUsers = async (req, res) => {
    try {
        // Lấy tất cả người dùng từ Realtime Database
        const usersSnapshot = await admin.database().ref('users').once('value');
        const users = usersSnapshot.val();

        if (!users) {
            return res.status(404).json({ error: 'No users found' });
        }

        // Chuyển đổi dữ liệu thành danh sách với chỉ email và role
        const userList = Object.keys(users).map(uid => ({
            uid,
            email: users[uid].email,
            role: users[uid].role,
        }));

        res.status(200).json(userList);
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({ error: 'Error fetching users' });
    }
};

// Xóa tài khoản theo UID
const deleteUser = async (req, res) => {
    const { uid } = req.params;

    try {
        // Xóa thông tin người dùng trong Firebase Auth
        await admin.auth().deleteUser(uid);

        // Xóa thông tin người dùng trong Realtime Database
        await admin.database().ref(`users/${uid}`).remove();

        res.status(200).json({ message: `User with UID ${uid} has been deleted successfully.` });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Error deleting user' });
    }
};

// Thay đổi vai trò tài khoản
const updateUserRole = async (req, res) => {
    const { uid } = req.params;
    const { newRole } = req.body;

    if (!['admin', 'player', 'field_owner', 'guest'].includes(newRole)) {
        return res.status(400).json({ error: 'Invalid role provided' });
    }

    try {
        // Kiểm tra người dùng tồn tại trong Realtime Database
        const userSnapshot = await admin.database().ref(`users/${uid}`).once('value');
        const userData = userSnapshot.val();

        if (!userData) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Cập nhật vai trò trong Realtime Database
        await admin.database().ref(`users/${uid}`).update({ role: newRole });

        res.status(200).json({ message: `Role for user ${uid} has been updated to ${newRole}.` });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ error: 'Error updating user role' });
    }
};

module.exports = {
    googleLogin,
    getUserById,
    getAllUsers,
    deleteUser,
    updateUserRole,
};
