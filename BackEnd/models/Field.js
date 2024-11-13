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

        const newFieldRef = await admin.database().ref('fields').push({
            ...fieldData,
            bookingSlots
        });

        return { fieldId: newFieldRef.key, ...fieldData };
    }


    // Cập nhật sân hiện có
    static async updateField(fieldId, data) {
        await admin.database().ref(`fields/${fieldId}`).update(data);
    }


    // Kiểm tra khung giờ đặt sân có còn trống không
    static async isTimeSlotAvailable(fieldId, date, timeSlot) {
        const snapshot = await admin.database().ref(`fields/${fieldId}/bookingSlots/${date}/${timeSlot}`).once('value');
        return !snapshot.exists(); // Trả về true nếu khung giờ còn trống
    }


    // Đặt sân vào một khung giờ nhất định
    static async bookTimeSlot(fieldId, date, timeSlot, bookingId) {
        await admin.database().ref(`fields/${fieldId}/bookingSlots/${date}`).update({
            [timeSlot]: bookingId
        });
    }


    // Xóa sân theo ID
    static async deleteField(fieldId) {
        await admin.database().ref(`fields/${fieldId}`).remove();
    }


    // Lấy thông tin một sân theo ID
    static async getFieldById(fieldId) {
        const snapshot = await admin.database().ref(`fields/${fieldId}`).once('value');
        if (!snapshot.exists()) {
            throw new Error('Sân không tồn tại');
        }
        return { fieldId: fieldId, ...snapshot.val() }; // Trả về fieldId
    }


    // Lấy danh sách sân thuộc về một chủ sân cụ thể
    static async getFieldsByOwner(ownerId) {
        const snapshot = await admin.database().ref('fields').orderByChild('ownerId').equalTo(ownerId).once('value');
        const fields = snapshot.val() || {};
        return Object.keys(fields).map(key => ({ fieldId: key, ...fields[key] })); // Trả về fieldId
    }

    // Lấy tất cả các sân hiện có với phân trang
    static async getAllFields(limit = 10, startAfter = null) {
        let query = admin.database().ref('fields').limitToFirst(limit);


        if (startAfter) {
            query = query.startAfter(startAfter);
        }


        const snapshot = await query.once('value');
        const fields = snapshot.val() || {};


        return Object.keys(fields).map(key => ({ fieldId: key, ...fields[key] })); // Trả về fieldId
    }


    // Lấy các khung giờ có thể đặt của sân
    static async getAvailableTimeSlots(fieldId, date) {
        const snapshot = await admin.database().ref(`fields/${fieldId}/bookingSlots/${date}`).once('value');
        const slots = snapshot.val() || {};


        // Trả về danh sách các khung giờ còn trống
        return Object.keys(slots).filter(slot => slots[slot] === null);
    }
}


module.exports = Field;