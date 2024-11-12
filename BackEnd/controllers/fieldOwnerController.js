const User = require('../models/User');
const Field = require('../models/Field');
const admin = require('firebase-admin');

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


// Tạo sân lớn
const addLargeField = async (req, res) => {
    const { name, location, type, price, image, contactNumber, operatingHours } = req.body;
    const { uid: ownerId, email } = req.user;  // Lấy email và ownerId từ thông tin người dùng sau khi đăng nhập

    try {
        const largeFieldData = {
            email,
            name,
            location: {
                city: location.city,
                district: location.district,
                commune: location.commune,
                streetNumber: location.streetNumber || '',
            },
            
            image,
            ownerId,
            contactNumber,
            isAvailable: true,
            rating: 0,
        };

        const newLargeField = await Field.createLargeField(largeFieldData);
        if (!newLargeField || typeof newLargeField !== 'object') {
            return res.status(500).json({ message: 'Lỗi khi thêm sân lớn. Dữ liệu không hợp lệ.' });
        }

        res.status(201).json({ message: 'Thêm sân lớn thành công', field: newLargeField });
    } catch (error) {
        console.error('Lỗi khi thêm sân lớn:', error);
        res.status(500).json({ message: 'Lỗi khi thêm sân lớn', error: error.message });
    }
};

// Tạo sân nhỏ
const addSmallField = async (req, res) => {
    const { price, participants, image, operatingHours, largeFieldId } = req.body;  // Thêm largeFieldId vào req.body
    const { uid: ownerId } = req.user;  // Lấy ownerId từ thông tin người dùng sau khi đăng nhập

    // Kiểm tra số lượng người tham gia
    if (!['5', '7', '11'].includes(participants.toString())) {
        return res.status(400).json({ message: 'Số người tham gia không hợp lệ. Vui lòng chọn từ 5, 7, hoặc 11.' });
    }

    try {
        // Lấy sân lớn từ ID sân lớn đã gửi lên
        const largeField = await Field.getFieldById(largeFieldId);

        if (!largeField) {
            return res.status(40).json({ message: 'Sân lớn không tồn tại hoặc không tìm thấy.' });
        }

        // Kiểm tra xem sân lớn có thuộc về Field Owner này không
        if (largeField.ownerId !== ownerId) {
            return res.status(403).json({ message: 'Sân lớn này không thuộc quyền sở hữu của bạn.' });
        }

        // Dữ liệu sân nhỏ
        const smallFieldData = {
            largeFieldId: largeFieldId,  
            image,
            
            price,
            participants,
            operatingHours,
            location: largeField.location,  
            ownerId,
            isAvailable: true,
            rating: 0,
            bookingSlots: {} 
        };

        // Tạo sân nhỏ
        const newSmallField = await Field.createSmallField(smallFieldData);

        // Kiểm tra nếu dữ liệu sân nhỏ không hợp lệ
        if (!newSmallField || typeof newSmallField !== 'object') {
            return res.status(500).json({ message: 'Lỗi khi thêm sân nhỏ. Dữ liệu không hợp lệ.' });
        }

        res.status(201).json({ message: 'Thêm sân nhỏ thành công', field: newSmallField });
    } catch (error) {
        console.error('Lỗi khi thêm sân nhỏ:', error);
        res.status(500).json({ message: 'Lỗi khi thêm sân nhỏ', error: error.message });
    }
};

// Cập nhật thông tin sân
const updateField = async (req, res) => {
    const { fieldId } = req.params;
    const data = req.body;

    // Kiểm tra loại sân
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
        console.error('Lỗi khi cập nhật sân:', error); 
        res.status(500).json({ message: 'Lỗi khi cập nhật sân', error: error.message });
    }
};

// Xóa sân
const deleteField = async (req, res) => {
    const { fieldId } = req.params;

    try {
        // Lấy thông tin sân cần xóa
        const fieldToDelete = await Field.getFieldById(fieldId);

        if (!fieldToDelete) {
            return res.status(404).json({ message: 'Không tìm thấy sân với ID đã cho' });
        }

        // Kiểm tra xem đây có phải là sân nhỏ hay sân lớn
        if (fieldToDelete.fieldType === 'small') {
            // Xóa sân nhỏ, nhưng không cần kiểm tra thêm vì không ảnh hưởng đến các sân khác
            await Field.deleteField(fieldId);
            res.status(200).json({ message: 'Xóa sân nhỏ thành công' });
        } else if (fieldToDelete.fieldType === 'large') {
            // Trường hợp sân lớn, cần kiểm tra và xóa các sân nhỏ liên quan
            const smallFields = await Field.getSmallFieldsByLargeFieldId(fieldId);
            if (smallFields && smallFields.length > 0) {
                // Xóa tất cả các sân nhỏ liên quan đến sân lớn này
                await Promise.all(smallFields.map(field => Field.deleteField(field._id)));
            }

            // Xóa sân lớn
            await Field.deleteField(fieldId);
            res.status(200).json({ message: 'Xóa sân lớn và các sân nhỏ liên quan thành công' });
        } else {
            return res.status(400).json({ message: 'Loại sân không hợp lệ' });
        }

    } catch (error) {
        console.error('Lỗi khi xóa sân:', error); 
        res.status(500).json({ message: 'Lỗi khi xóa sân', error: error.message });
    }
};

// Lấy danh sách sân của Field Owner
const getOwnedFields = async (req, res) => {
    const { ownerId } = req.params;

    try {
        // Lấy tất cả sân của Field Owner
        let fields = await Field.getFieldsByOwner(ownerId);

        // Kiểm tra xem fields có phải là mảng không
        if (!Array.isArray(fields)) {
            fields = [];  // Nếu không phải mảng, trả về một mảng rỗng
        }

        // Phân loại sân lớn và sân nhỏ
        const largeFields = fields.filter(field => field.fieldType === 'large');
        const smallFields = fields.filter(field => field.fieldType === 'small');

        res.status(200).json({ largeFields, smallFields });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách sân:', error);
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
    updateField,
    deleteField,
    getOwnedFields,
    fieldOwnerHome
};
