const admin = require('../firebase');

class Field {
    // Tạo một sân mới với thông tin chi tiết
    static async createField(fieldData) {
        const bookingSlots = {};

        // Tạo các khung giờ từ 0:00 đến 23:00, mỗi khung cách nhau 1 tiếng
        for (let hour = 0; hour < 24; hour++) {
            const start = `${hour.toString().padStart(2, '0')}:00`;
            const end = `${(hour + 1).toString().padStart(2, '0')}:00`;
            bookingSlots[`${start}-${end}`] = null; // Khởi tạo các khung giờ trống
        }

        try {
            const newFieldRef = await admin.database().ref('fields').push({
                ...fieldData,
                bookingSlots
            });

            return { fieldId: newFieldRef.key, ...fieldData }; // Trả về fieldId
        } catch (error) {
            console.error('Error creating field:', error.message);
            throw new Error('Không thể tạo sân mới');
        }
    }

    // Cập nhật sân hiện có
    static async updateField(fieldId, data) {
        try {
            await admin.database().ref(`fields/${fieldId}`).update(data);
        } catch (error) {
            console.error('Error updating field:', error.message);
            throw new Error('Không thể cập nhật sân');
        }
    }

    // Kiểm tra khung giờ đặt sân có còn trống không
    static async isTimeSlotAvailable(fieldId, date, timeSlot) {
        try {
            const snapshot = await admin.database().ref(`fields/${fieldId}/bookingSlots/${date}/${timeSlot}`).once('value');
            return !snapshot.exists(); // Trả về true nếu khung giờ còn trống
        } catch (error) {
            console.error('Error checking time slot availability:', error.message);
            throw new Error('Không thể kiểm tra khung giờ');
        }
    }

    // Đặt sân vào một khung giờ nhất định
    static async bookTimeSlot(fieldId, date, timeSlot, bookingId) {
        try {
            await admin.database().ref(`fields/${fieldId}/bookingSlots/${date}`).update({
                [timeSlot]: bookingId
            });
        } catch (error) {
            console.error('Error booking time slot:', error.message);
            throw new Error('Không thể đặt sân');
        }
    }

    // Xóa sân theo ID
    static async deleteField(fieldId) {
        try {
            await admin.database().ref(`fields/${fieldId}`).remove();
        } catch (error) {
            console.error('Error deleting field:', error.message);
            throw new Error('Không thể xóa sân');
        }
    }

    // Lấy thông tin một sân theo ID
    static async getFieldById(fieldId) {
        try {
            console.log('Fetching field with ID:', fieldId);  // Log ID sân cần tìm
            const snapshot = await admin.database().ref(`fields/${fieldId}`).once('value');
            if (!snapshot.exists()) {
                throw new Error('Sân không tồn tại');
            }
            console.log('Field data:', snapshot.val()); // Log dữ liệu sân
            return { fieldId: fieldId, ...snapshot.val() }; // Trả về fieldId cùng dữ liệu sân
        } catch (error) {
            console.error('Error fetching field by ID:', error.message);
            throw error; // Ném lại lỗi để có thể xử lý ở nơi gọi
        }
    }
    
    
    // Lấy danh sách sân thuộc về một chủ sân cụ thể
    static async getFieldsByOwner(ownerId) {
        try {
            const snapshot = await admin.database().ref('fields').orderByChild('ownerId').equalTo(ownerId).once('value');
            const fields = snapshot.val() || {};
            return Object.keys(fields).map(key => ({ fieldId: key, ...fields[key] })); // Trả về fieldId
        } catch (error) {
            console.error('Error fetching fields by owner:', error.message);
            throw new Error('Không thể lấy danh sách sân');
        }
    }

    // Lấy tất cả các sân hiện có với phân trang
    static async getAllFields(limit = 10, startAfter = null) {
        try {
            let query = admin.database().ref('fields').limitToFirst(limit);

            if (startAfter) {
                query = query.startAfter(startAfter);
            }

            const snapshot = await query.once('value');
            const fields = snapshot.val() || {};

            return Object.keys(fields).map(key => ({ fieldId: key, ...fields[key] })); // Trả về fieldId
        } catch (error) {
            console.error('Error fetching all fields:', error.message);
            throw new Error('Không thể lấy danh sách tất cả các sân');
        }
    }

    // Lấy các khung giờ có thể đặt của sân
    static async getAvailableTimeSlots(fieldId, date) {
        try {
            const snapshot = await admin.database().ref(`fields/${fieldId}/bookingSlots/${date}`).once('value');
            const slots = snapshot.val() || {};

            // Trả về danh sách các khung giờ còn trống
            return Object.keys(slots).filter(slot => slots[slot] === null);
        } catch (error) {
            console.error('Error fetching available time slots:', error.message);
            throw new Error('Không thể lấy danh sách khung giờ trống');
        }
    }
}

module.exports = Field;
