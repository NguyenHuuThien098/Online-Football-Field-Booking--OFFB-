const LargeField = require('../models/LargeField');
const Field = require('../models/Field');

// Tạo sân lớn mới
exports.createLargeField = async (req, res) => {
    const { address, phoneNumber, otherInfo, image, operatingHours } = req.body;

    try {
        const largeFieldData = {
            address,
            phoneNumber,
            otherInfo,
            image,
            operatingHours
        };

        const newLargeField = await LargeField.createLargeField(largeFieldData);
        res.status(201).json({ message: 'Thêm sân lớn thành công', largeField: newLargeField });
    } catch (error) {
        console.error('Error when adding large field:', error);
        res.status(500).json({ message: 'Lỗi khi thêm sân lớn', error: error.message });
    }
};

// Lấy thông tin sân lớn theo ID
exports.getLargeFieldById = async (req, res) => {
    const { largeFieldId } = req.params;

    try {
        const largeField = await LargeField.getLargeFieldById(largeFieldId);
        res.status(200).json(largeField);
    } catch (error) {
        console.error('Error when fetching large field:', error);
        res.status(500).json({ message: 'Lỗi khi lấy thông tin sân lớn', error: error.message });
    }
};

// Cập nhật thông tin sân lớn
exports.updateLargeField = async (req, res) => {
    const { largeFieldId } = req.params;
    const data = req.body;

    try {
        await LargeField.updateLargeField(largeFieldId, data);
        const updatedLargeField = await LargeField.getLargeFieldById(largeFieldId);
        res.status(200).json({ message: 'Cập nhật sân lớn thành công', largeField: updatedLargeField });
    } catch (error) {
        console.error('Error when updating large field:', error);
        res.status(500).json({ message: 'Lỗi khi cập nhật sân lớn', error: error.message });
    }
};

// Xóa sân lớn
exports.deleteLargeField = async (req, res) => {
    const { largeFieldId } = req.params;

    try {
        await LargeField.deleteLargeField(largeFieldId);
        res.status(200).json({ message: 'Xóa sân lớn thành công' });
    } catch (error) {
        console.error('Error when deleting large field:', error);
        res.status(500).json({ message: 'Lỗi khi xóa sân lớn', error: error.message });
    }
};

// Lấy danh sách tất cả các sân lớn
exports.getAllLargeFields = async (req, res) => {
    try {
        const largeFields = await LargeField.getAllLargeFields();
        res.status(200).json(largeFields);
    } catch (error) {
        console.error('Error when fetching all large fields:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách sân lớn', error: error.message });
    }
};

// Lấy danh sách sân nhỏ thuộc sân lớn
exports.getFieldsByLargeField = async (req, res) => {
    const { largeFieldId } = req.params;

    try {
        const fields = await Field.getSmallFieldsByLargeFieldId(largeFieldId);
        res.status(200).json(fields);
    } catch (error) {
        console.error('Error when fetching fields by large field:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách sân nhỏ', error: error.message });
    }
};