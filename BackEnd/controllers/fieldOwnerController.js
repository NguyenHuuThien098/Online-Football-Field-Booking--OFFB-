const User = require('../models/User');
const Field = require('../models/Field');
const admin = require('../firebase');

// Đăng nhập bằng Google cho Field Owner
const googleLogin = async (req, res) => {
    const { token } = req.body;

    try {
        // const user = await User.verifyGoogleToken(token);

        // Đặt vai trò cho người dùng
        await User.setUserRole(user.uid, 'fieldOwner');
        res.status(200).send({ message: 'Đăng nhập thành công với tư cách Field Owner', uid: user.uid });
    } catch (error) {
        console.error('Error during Google login:', error); // Ghi log lỗi
        res.status(400).send({ error: error.message });
    }
};

// Thêm sân lớn mới
const addLargeField = async (req, res) => {
    const { name, address, otherInfo, images, operatingHours } = req.body;
    const ownerId = req.user.uid; // Lấy ownerId từ thông tin người dùng đã xác thực

    try {
        // Lấy thông tin người dùng từ Firebase
        const userSnapshot = await admin.database().ref(`users/${ownerId}`).once('value');
        if (!userSnapshot.exists()) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }
        const userData = userSnapshot.val();
        const ownerName = userData.fullName || 'Không rõ'; // Lấy tên chủ sân từ thông tin người dùng
        const ownerPhone = userData.phoneNumber || 'Không có'; // Lấy số điện thoại chủ sân từ thông tin người dùng

        const largeFieldData = {
            name,
            address,
            otherInfo,
            images: images || [], // Sử dụng danh sách ảnh
            operatingHours,
            ownerId,
            ownerName, // Thêm tên chủ sân
            ownerPhone  // Thêm số điện thoại chủ sân
        };

        const newLargeField = await Field.createLargeField(largeFieldData);
        res.status(201).json({ message: 'Thêm sân lớn thành công', largeField: newLargeField });
    } catch (error) {
        console.error('Error when adding large field:', error); // Ghi log lỗi
        res.status(500).json({ message: 'Lỗi khi thêm sân lớn', error: error.message });
    }
};

// Thêm sân nhỏ mới
const addSmallField = async (req, res) => {
    const { largeFieldId } = req.params;
    const { name, type, price, images, description } = req.body;
    const ownerId = req.user.uid; // Lấy ownerId từ thông tin người dùng đã xác thực

    try {
        // Lấy thông tin người dùng từ Firebase
        const userSnapshot = await admin.database().ref(`users/${ownerId}`).once('value');
        if (!userSnapshot.exists()) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }
        const userData = userSnapshot.val();
        const ownerName = userData.fullName || 'Không rõ'; // Lấy tên chủ sân từ thông tin người dùng
        const ownerPhone = userData.phoneNumber || 'Không có'; // Lấy số điện thoại chủ sân từ thông tin người dùng

        // Lấy thông tin sân lớn từ Firebase
        const largeFieldSnapshot = await admin.database().ref(`largeFields/${largeFieldId}`).once('value');
        if (!largeFieldSnapshot.exists()) {
            return res.status(404).json({ message: 'Sân lớn không tồn tại' });
        }
        const largeFieldData = largeFieldSnapshot.val();
        const largeFieldAddress = largeFieldData.address; // Lấy địa chỉ sân lớn

        // Kiểm tra loại sân hợp lệ
        const validTypes = ['5 người', '7 người', '11 người'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ message: 'Loại sân không hợp lệ. Vui lòng chọn từ 5 người, 7 người, hoặc 11 người.' });
        }

        const smallFieldData = {
            name,
            type,
            price,
            images: images || [], // Sử dụng danh sách ảnh
            description,
            isAvailable: true,
            bookingSlots: {},
            ownerName, // Thêm tên chủ sân
            ownerPhone, // Thêm số điện thoại chủ sân
            largeFieldAddress // Thêm địa chỉ sân lớn
        };

        const newSmallField = await Field.createSmallField(largeFieldId, smallFieldData);
        res.status(201).json({ message: 'Thêm sân nhỏ thành công', smallField: newSmallField });
    } catch (error) {
        console.error('Error when adding small field:', error); // Ghi log lỗi
        res.status(500).json({ message: 'Lỗi khi thêm sân nhỏ', error: error.message });
    }
};

// Cập nhật thông tin sân lớn
const updateLargeField = async (req, res) => {
    const { largeFieldId } = req.params;
    const data = req.body;

    try {
        // Cập nhật thông tin sân lớn
        await Field.updateLargeField(largeFieldId, data);
        const updatedField = await Field.getLargeFieldById(largeFieldId); // Lấy thông tin sân sau khi cập nhật
        res.status(200).json({ message: 'Cập nhật sân lớn thành công', largeField: updatedField });
    } catch (error) {
        console.error('Error when updating large field:', error); // Ghi log lỗi
        res.status(500).json({ message: 'Lỗi khi cập nhật sân lớn', error: error.message });
    }
};

// Cập nhật thông tin sân nhỏ
const updateSmallField = async (req, res) => {
    const { largeFieldId, smallFieldId } = req.params;
    const data = req.body;
    const ownerId = req.user.uid; // Lấy ownerId từ thông tin người dùng đã xác thực

    try {
        // Lấy thông tin người dùng từ Firebase
        const userSnapshot = await admin.database().ref(`users/${ownerId}`).once('value');
        if (!userSnapshot.exists()) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }
        const userData = userSnapshot.val();
        const ownerName = userData.fullName || 'Không rõ'; // Lấy tên chủ sân từ thông tin người dùng
        const ownerPhone = userData.phoneNumber || 'Không có'; // Lấy số điện thoại chủ sân từ thông tin người dùng

        // Lấy thông tin sân nhỏ hiện tại
        const smallFieldSnapshot = await admin.database().ref(`largeFields/${largeFieldId}/smallFields/${smallFieldId}`).once('value');
        if (!smallFieldSnapshot.exists()) {
            return res.status(404).json({ message: 'Sân nhỏ không tồn tại' });
        }
        const smallFieldData = smallFieldSnapshot.val();

        // Cập nhật thông tin sân nhỏ với dữ liệu mới và thông tin chủ sân
        const updatedSmallFieldData = {
            ...smallFieldData,
            ...data,
            ownerName, // Cập nhật tên chủ sân
            ownerPhone // Cập nhật số điện thoại chủ sân
        };

        // Cập nhật thông tin sân nhỏ
        await Field.updateSmallField(largeFieldId, smallFieldId, updatedSmallFieldData);
        const updatedField = await Field.getSmallFieldById(largeFieldId, smallFieldId); // Lấy thông tin sân sau khi cập nhật
        res.status(200).json({ message: 'Cập nhật sân nhỏ thành công', smallField: updatedField });
    } catch (error) {
        console.error('Error when updating small field:', error); // Ghi log lỗi
        res.status(500).json({ message: 'Lỗi khi cập nhật sân nhỏ', error: error.message });
    }
};

// Xóa sân lớn
const deleteLargeField = async (req, res) => {
    const { largeFieldId } = req.params;

    try {
        // Xóa sân lớn bằng ID
        await Field.deleteLargeField(largeFieldId);
        res.status(200).json({ message: 'Xóa sân lớn thành công' });
    } catch (error) {
        console.error('Error when deleting large field:', error); // Ghi log lỗi
        res.status(500).json({ message: 'Lỗi khi xóa sân lớn', error: error.message });
    }
};

// Xóa sân nhỏ
const deleteSmallField = async (req, res) => {
    const { largeFieldId, smallFieldId } = req.params;

    try {
        // Xóa sân nhỏ bằng ID
        await Field.deleteSmallField(largeFieldId, smallFieldId);
        res.status(200).json({ message: 'Xóa sân nhỏ thành công' });
    } catch (error) {
        console.error('Error when deleting small field:', error); // Ghi log lỗi
        res.status(500).json({ message: 'Lỗi khi xóa sân nhỏ', error: error.message });
    }
};

// Lấy danh sách sân của Field Owner
const getOwnedFields = async (req, res) => {
    const { ownerId } = req.params;

    try {
        // Lấy danh sách sân thuộc sở hữu của Field Owner
        const fields = await Field.getFieldsByOwner(ownerId);
        res.status(200).json(fields);
    } catch (error) {
        console.error('Error when fetching owned fields:', error); // Ghi log lỗi
        res.status(500).json({ message: 'Lỗi khi lấy danh sách sân', error: error.message });
    }
};

// Lấy thông tin sân lớn theo ID
const getLargeFieldById = async (req, res) => {
    const { largeFieldId } = req.params;

    try {
        const largeField = await Field.getLargeFieldById(largeFieldId);
        res.status(200).json(largeField);
    } catch (error) {
        console.error('Error when fetching large field:', error);
        res.status(500).json({ message: 'Lỗi khi lấy thông tin sân lớn', error: error.message });
    }
};

// Lấy danh sách tất cả các sân lớn
const getAllLargeFields = async (req, res) => {
    try {
        const largeFields = await Field.getAllLargeFields();
        res.status(200).json(largeFields);
    } catch (error) {
        console.error('Error when fetching all large fields:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách sân lớn', error: error.message });
    }
};

// Lấy danh sách sân nhỏ thuộc sân lớn
const getFieldsByLargeField = async (req, res) => {
    const { largeFieldId } = req.params;

    try {
        const fields = await Field.getSmallFieldsByLargeField(largeFieldId);
        res.status(200).json(fields);
    } catch (error) {
        console.error('Error when fetching fields by large field:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách sân nhỏ', error: error.message });
    }
};

// Trang chủ của Field Owner
const fieldOwnerHome = (req, res) => {
    res.status(200).send('Đây là trang chủ của Field Owner');
};

// Export tất cả các hàm
module.exports = {
    googleLogin,
    addLargeField,
    addSmallField,
    updateLargeField,
    updateSmallField,
    deleteLargeField,
    deleteSmallField,
    getOwnedFields,
    getLargeFieldById,
    getAllLargeFields,
    getFieldsByLargeField,
    fieldOwnerHome
};