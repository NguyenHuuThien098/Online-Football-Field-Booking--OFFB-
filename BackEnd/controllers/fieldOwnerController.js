const User = require('../models/User');
const Field = require('../models/Field');


// Đăng nhập bằng Google cho Field Owner
const googleLogin = async (req, res) => {
    const { token } = req.body;
   
    try {
        
        console.log('User:', user); 


        // Đặt vai trò cho người dùng
        await User.setUserRole(user.uid, 'fieldOwner');
        res.status(200).send({ message: 'Đăng nhập thành công với tư cách Field Owner', uid: user.uid });
    } catch (error) {
        console.error('Error during Google login:', error);
        res.status(400).send({ error: error.message });
    }
};


// Thêm sân mới
const addField = async (req, res) => {
    const { name, location, type, price, image, ownerId, contactNumber, operatingHours } = req.body;
   
    
    const validTypes = ['5 người', '7 người', '11 người'];
    if (!validTypes.includes(type)) {
        return res.status(400).json({ message: 'Loại sân không hợp lệ. Vui lòng chọn từ 5 người, 7 người, hoặc 11 người.' });
    }


    try {
        const fieldData = {
            name,
            location,
            type,
            price,
            image,
            ownerId,
            contactNumber,
            operatingHours,
            isAvailable: true,
            bookingSlots: {}
        };


        const newField = await Field.createField(fieldData);
        res.status(201).json({ message: 'Thêm sân thành công', field: newField });
    } catch (error) {
        console.error('Error when adding field:', error); // Ghi log lỗi
        res.status(500).json({ message: 'Lỗi khi thêm sân', error: error.message });
    }
};


// Cập nhật thông tin sân
const updateField = async (req, res) => {
    const { fieldId } = req.params;
    const data = req.body;

   
    if (data.type) {
        const validTypes = ['5 người', '7 người', '11 người'];
        if (!validTypes.includes(data.type)) {
            return res.status(400).json({ message: 'Loại sân không hợp lệ. Vui lòng chọn từ 5 người, 7 người, hoặc 11 người.' });
        }
    }

    try {
       
        await Field.updateField(fieldId, data);
        const updatedField = await Field.getFieldById(fieldId); 
        res.status(200).json({ message: 'Cập nhật sân thành công', field: updatedField });
    } catch (error) {
        console.error('Error when updating field:', error); 
        res.status(500).json({ message: 'Lỗi khi cập nhật sân', error: error.message });
    }
};


// Xóa sân
const deleteField = async (req, res) => {
    const { fieldId } = req.params;

    try {
        
        await Field.deleteField(fieldId);
        res.status(200).json({ message: 'Xóa sân thành công' });
    } catch (error) {
        console.error('Error when deleting field:', error); 
        res.status(500).json({ message: 'Lỗi khi xóa sân', error: error.message });
    }
};


// Lấy danh sách sân của Field Owner
const getOwnedFields = async (req, res) => {
    const { ownerId } = req.params;

    try {
      
        const fields = await Field.getFieldsByOwner(ownerId);
        res.status(200).json(fields);
    } catch (error) {
        console.error('Error when fetching owned fields:', error); 
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
    addField,
    updateField,
    deleteField,
    getOwnedFields,
    fieldOwnerHome
};
