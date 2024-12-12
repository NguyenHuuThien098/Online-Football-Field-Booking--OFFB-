const Field = require('../models/Field');

// Lấy tất cả thông tin sân công khai (không cần đăng nhập)
const getAllFieldsPublic = async (req, res) => {
    try {
        const fields = await Field.getAllLargeFields();
        res.status(200).json(fields);
    } catch (error) {
        console.error('Error fetching fields:', error); // Ghi log lỗi
        res.status(500).json({ message: 'Lỗi khi lấy danh sách sân', error: error.message });
    }
};

// Lấy tất cả thông tin sân nhỏ công khai (không cần đăng nhập)
const getAllSmallFieldsPublic = async (req, res) => {
    try {
        const fields = await Field.getAllSmallFields();
        res.status(200).json(fields);
    } catch (error) {
        console.error('Error fetching small fields:', error); // Ghi log lỗi
        res.status(500).json({ message: 'Lỗi khi lấy danh sách sân nhỏ', error: error.message });
    }
};


module.exports = {
    getAllFieldsPublic,
    getAllSmallFieldsPublic
};