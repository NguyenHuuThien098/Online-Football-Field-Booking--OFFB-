const User = require('../models/User');
const Field = require('../models/Field');

// Đăng nhập bằng Google cho Field Owner
const googleLogin = async (req, res) => {
    const { token } = req.body;

    try {
        // const user = await User.verifyGoogleToken(token);
        console.log('User:', user); // Ghi log thông tin người dùng

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
    const { address, phoneNumber, otherInfo, image, operatingHours, ownerId } = req.body;

    try {
        const largeFieldData = {
            address,
            phoneNumber,
            otherInfo,
            image,
            operatingHours,
            ownerId
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
    const { name, type, price, image, description } = req.body;

    // Kiểm tra loại sân hợp lệ
    const validTypes = ['5 người', '7 người', '11 người'];
    if (!validTypes.includes(type)) {
        return res.status(400).json({ message: 'Loại sân không hợp lệ. Vui lòng chọn từ 5 người, 7 người, hoặc 11 người.' });
    }

    try {
        const smallFieldData = {
            name,
            type,
            price,
            image,
            description,
            isAvailable: true,
            bookingSlots: {}
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
        res.status(200).json({ message: 'Cập nhật sân lớn thành công', field: updatedField });
    } catch (error) {
        console.error('Error when updating large field:', error); // Ghi log lỗi
        res.status(500).json({ message: 'Lỗi khi cập nhật sân lớn', error: error.message });
    }
};

// Cập nhật thông tin sân nhỏ
const updateSmallField = async (req, res) => {
    const { largeFieldId, smallFieldId } = req.params;
    const data = req.body;

    // Kiểm tra loại sân hợp lệ nếu có
    if (data.type) {
        const validTypes = ['5 người', '7 người', '11 người'];
        if (!validTypes.includes(data.type)) {
            return res.status(400).json({ message: 'Loại sân không hợp lệ. Vui lòng chọn từ 5 người, 7 người, hoặc 11 người.' });
        }
    }

    try {
        // Cập nhật thông tin sân nhỏ
        await Field.updateSmallField(largeFieldId, smallFieldId, data);
        const updatedField = await Field.getSmallFieldById(largeFieldId, smallFieldId); // Lấy thông tin sân sau khi cập nhật
        res.status(200).json({ message: 'Cập nhật sân nhỏ thành công', field: updatedField });
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
    fieldOwnerHome
};