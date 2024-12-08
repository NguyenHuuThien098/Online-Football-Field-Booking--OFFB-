const admin = require('../firebase');

class Field {
    // Tạo một sân lớn mới với thông tin chi tiết
    static async createLargeField(fieldData) {
        try {
            const newFieldRef = await admin.database().ref('largeFields').push(fieldData);
            return { fieldId: newFieldRef.key, ...fieldData }; // Trả về fieldId
        } catch (error) {
            console.error('Error creating large field:', error.message);
            throw new Error('Không thể tạo sân lớn mới');
        }
    }

    // Tạo một sân nhỏ mới với thông tin chi tiết
    static async createSmallField(largeFieldId, smallFieldData) {
        const bookingSlots = {};

        // Tạo các khung giờ từ 0:00 đến 23:00, mỗi khung cách nhau 1 tiếng
        for (let hour = 0; 24; hour++) {
            const start = `${hour.toString().padStart(2, '0')}:00`;
            const end = `${(hour + 1).toString().padStart(2, '0')}:00`;
            bookingSlots[`${start}-${end}`] = null; // Khởi tạo các khung giờ trống
        }

        try {
            const newFieldRef = await admin.database().ref(`largeFields/${largeFieldId}/smallFields`).push({
                ...smallFieldData,
                bookingSlots
            });

            return { fieldId: newFieldRef.key, ...smallFieldData }; // Trả về fieldId
        } catch (error) {
            console.error('Error creating small field:', error.message);
            throw new Error('Không thể tạo sân nhỏ mới');
        }
    }

    // Cập nhật sân lớn hiện có
    static async updateLargeField(fieldId, data) {
        try {
            await admin.database().ref(`largeFields/${fieldId}`).update(data);
        } catch (error) {
            console.error('Error updating large field:', error.message);
            throw new Error('Không thể cập nhật sân lớn');
        }
    }

    // Cập nhật sân nhỏ hiện có
    static async updateSmallField(largeFieldId, fieldId, data) {
        try {
            await admin.database().ref(`largeFields/${largeFieldId}/smallFields/${fieldId}`).update(data);
        } catch (error) {
            console.error('Error updating small field:', error.message);
            throw new Error('Không thể cập nhật sân nhỏ');
        }
    }

    // Xóa sân lớn theo ID
    static async deleteLargeField(fieldId) {
        try {
            await admin.database().ref(`largeFields/${fieldId}`).remove();
        } catch (error) {
            console.error('Error deleting large field:', error.message);
            throw new Error('Không thể xóa sân lớn');
        }
    }

    // Xóa sân nhỏ theo ID
    static async deleteSmallField(largeFieldId, fieldId) {
        try {
            await admin.database().ref(`largeFields/${largeFieldId}/smallFields/${fieldId}`).remove();
        } catch (error) {
            console.error('Error deleting small field:', error.message);
            throw new Error('Không thể xóa sân nhỏ');
        }
    }

    // Lấy thông tin một sân lớn theo ID
    static async getLargeFieldById(fieldId) {
        try {
            const snapshot = await admin.database().ref(`largeFields/${fieldId}`).once('value');
            if (!snapshot.exists()) {
                throw new Error('Sân lớn không tồn tại');
            }
            return { fieldId: fieldId, ...snapshot.val() }; // Trả về fieldId cùng dữ liệu sân
        } catch (error) {
            console.error('Error fetching large field by ID:', error.message);
            throw error; // Ném lại lỗi để có thể xử lý ở nơi gọi
        }
    }

    // Lấy thông tin một sân nhỏ theo ID
    static async getSmallFieldById(largeFieldId, fieldId) {
        try {
            const snapshot = await admin.database().ref(`largeFields/${largeFieldId}/smallFields/${fieldId}`).once('value');
            if (!snapshot.exists()) {
                throw new Error('Sân nhỏ không tồn tại');
            }
            return { fieldId: fieldId, ...snapshot.val() }; // Trả về fieldId cùng dữ liệu sân
        } catch (error) {
            console.error('Error fetching small field by ID:', error.message);
            throw error; // Ném lại lỗi để có thể xử lý ở nơi gọi
        }
    }

    // Lấy danh sách sân nhỏ thuộc về một sân lớn cụ thể
    static async getSmallFieldsByLargeField(largeFieldId) {
        try {
            const snapshot = await admin.database().ref(`largeFields/${largeFieldId}/smallFields`).once('value');
            const fields = snapshot.val() || {};
            return Object.keys(fields).map(key => ({ fieldId: key, ...fields[key] })); // Trả về fieldId
        } catch (error) {
            console.error('Error fetching small fields by large field:', error.message);
            throw new Error('Không thể lấy danh sách sân nhỏ');
        }
    }

    // Lấy tất cả các sân lớn hiện có với phân trang
    static async getAllLargeFields(limit = 10, startAfter = null) {
        try {
            let query = admin.database().ref('largeFields').limitToFirst(limit);

            if (startAfter) {
                query = query.startAfter(startAfter);
            }

            const snapshot = await query.once('value');
            const fields = snapshot.val() || {};

            return Object.keys(fields).map(key => ({ fieldId: key, ...fields[key] })); // Trả về fieldId
        } catch (error) {
            console.error('Error fetching all large fields:', error.message);
            throw new Error('Không thể lấy danh sách tất cả các sân lớn');
        }
    }

    // Lấy các khung giờ có thể đặt của sân nhỏ
    static async getAvailableTimeSlots(largeFieldId, fieldId, date) {
        try {
            const snapshot = await admin.database().ref(`largeFields/${largeFieldId}/smallFields/${fieldId}/bookingSlots/${date}`).once('value');
            const slots = snapshot.val() || {};

            // Trả về danh sách các khung giờ còn trống
            return Object.keys(slots).filter(slot => slots[slot] === null);
        } catch (error) {
            console.error('Error fetching available time slots:', error.message);
            throw new Error('Không thể lấy danh sách khung giờ trống');
        }
    }

    // Lấy danh sách sân thuộc sở hữu của Field Owner
    static async getFieldsByOwner(ownerId) {
        try {
            const snapshot = await admin.database().ref('largeFields').orderByChild('ownerId').equalTo(ownerId).once('value');
            const fields = snapshot.val() || {};
            return Object.keys(fields).map(key => ({ fieldId: key, ...fields[key] })); // Trả về fieldId
        } catch (error) {
            console.error('Error fetching fields by owner:', error.message);
            throw new Error('Không thể lấy danh sách sân');
        }
    }
}

module.exports = Field;