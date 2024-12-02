const admin = require('../firebase');

class LargeField {
    // Tạo sân lớn mới
    static async createLargeField(data) {
        try {
            const largeFieldRef = admin.database().ref('largeFields').push();
            await largeFieldRef.set(data);
            return { id: largeFieldRef.key, ...data };
        } catch (error) {
            console.error('Error creating large field:', error);
            throw new Error('Could not create large field');
        }
    }

    // Lấy thông tin sân lớn theo ID
    static async getLargeFieldById(largeFieldId) {
        try {
            const snapshot = await admin.database().ref(`largeFields/${largeFieldId}`).once('value');
            const largeField = snapshot.val();
            if (!largeField) {
                throw new Error('Large field not found');
            }
            return { id: largeFieldId, ...largeField };
        } catch (error) {
            console.error('Error fetching large field:', error);
            throw new Error('Could not fetch large field');
        }
    }

    // Cập nhật sân lớn
    static async updateLargeField(largeFieldId, data) {
        try {
            await admin.database().ref(`largeFields/${largeFieldId}`).update(data);
        } catch (error) {
            console.error('Error updating large field:', error);
            throw new Error('Could not update large field');
        }
    }

    // Xóa sân lớn
    static async deleteLargeField(largeFieldId) {
        try {
            await admin.database().ref(`largeFields/${largeFieldId}`).remove();
        } catch (error) {
            console.error('Error deleting large field:', error);
            throw new Error('Could not delete large field');
        }
    }

    // Lấy danh sách tất cả các sân lớn
    static async getAllLargeFields() {
        try {
            const snapshot = await admin.database().ref('largeFields').once('value');
            const largeFields = snapshot.val() || {};
            return Object.keys(largeFields).map(key => ({ id: key, ...largeFields[key] }));
        } catch (error) {
            console.error('Error fetching all large fields:', error);
            throw new Error('Could not fetch large fields');
        }
    }
}

module.exports = LargeField;