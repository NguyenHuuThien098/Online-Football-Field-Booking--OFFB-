const Field = require('../models/Field');


// Lấy tất cả thông tin sân công khai (không cần đăng nhập)
const getAllFieldsPublic = async (req, res) => {
    try {
        const fields = await Field.getAllFields();
        res.status(200).json(fields);
    } catch (error) {
        console.error('Error fetching fields:', error); // Ghi log lỗi
        res.status(500).json({ message: 'Lỗi khi lấy danh sách sân', error: error.message });
    }
};


module.exports = {
    getAllFieldsPublic
};
