const admin = require('../firebase');

class Field {
    // Tạo sân lớn
    static async createField(fieldData) {
        const bookingSlots = {};

        for (let hour = 0; hour < 24; hour++) {
            const start = `${hour.toString().padStart(2, '0')}:00`;
            const end = `${(hour + 1).toString().padStart(2, '0')}:00`;
            bookingSlots[`${start}-${end}`] = null;
        }

        const newFieldRef = await admin.database().ref('fields').push({
            ...fieldData,
            bookingSlots
        });

        return { fieldId: newFieldRef.key, ...fieldData };
    }

    // Tạo sân nhỏ
    static async createSmallField(fieldData) {
        const bookingSlots = {};

        for (let hour = 0; hour < 24; hour++) {
            const start = `${hour.toString().padStart(2, '0')}:00`;
            const end = `${(hour + 1).toString().padStart(2, '0')}:00`;
            bookingSlots[`${start}-${end}`] = null;
        }

        const newSmallFieldRef = await admin.database().ref('smallFields').push({
            ...fieldData,
            bookingSlots
        });

        return { fieldId: newSmallFieldRef.key, ...fieldData };
    }

    // Cập nhật thông tin sân
    static async updateField(fieldId, data) {
        await admin.database().ref(`fields/${fieldId}`).update(data);
    }

    // Lấy thông tin sân theo ID
    static async getFieldById(fieldId) {
        const snapshot = await admin.database().ref(`fields/${fieldId}`).once('value');
        if (!snapshot.exists()) {
            throw new Error('Sân không tồn tại');
        }
        return { fieldId: fieldId, ...snapshot.val() };
    }

    // Lấy danh sách sân của Field Owner
    static async getFieldsByOwner(ownerId) {
        const snapshot = await admin.database().ref('fields').orderByChild('ownerId').equalTo(ownerId).once('value');
        const fields = snapshot.val() || {};
        return Object.keys(fields).map(key => ({ fieldId: key, ...fields[key] }));
    }

    // Xóa sân
    static async deleteField(fieldId) {
        await admin.database().ref(`fields/${fieldId}`).remove();
    }

    // Lấy tất cả sân
    static async getAllFields(limit = 10, startAfter = null) {
        let query = admin.database().ref('fields').limitToFirst(limit);

        if (startAfter) {
            query = query.startAfter(startAfter);
        }

        const snapshot = await query.once('value');
        const fields = snapshot.val() || {};

        return Object.keys(fields).map(key => ({ fieldId: key, ...fields[key] }));
    }

    // Lấy các thời gian còn trống trong sân
    static async getAvailableTimeSlots(fieldId, date) {
        const snapshot = await admin.database().ref(`fields/${fieldId}/bookingSlots/${date}`).once('value');
        const slots = snapshot.val() || {};

        return Object.keys(slots).filter(slot => slots[slot] === null);
    }
}

module.exports = Field;
