const admin = require('../firebase');

class Field {
// Tạo một sân lớn mới với thông tin chi tiết
static async createLargeField(fieldData) {
    try {
        const newFieldRef = await admin.database().ref('largeFields').push(fieldData);
        return { largeFieldId: newFieldRef.key, ...fieldData }; // Trả về largeFieldId
    } catch (error) {
        console.error('Error creating large field:', error.message);
        throw new Error('Không thể tạo sân lớn mới');
    }
}

// Tạo một sân nhỏ mới với thông tin chi tiết
static async createSmallField(largeFieldId, smallFieldData) {
    const bookingSlots = {};

    // Tạo các khung giờ từ 0:00 đến 23:00, mỗi khung cách nhau 1 tiếng
    for (let hour = 0; hour < 24; hour++) {
        const start = `${hour.toString().padStart(2, '0')}:00`;
        const end = `${(hour + 1).toString().padStart(2, '0')}:00`;
        bookingSlots[`${start}-${end}`] = null; // Khởi tạo các khung giờ trống
    }

    try {
        // Lấy thông tin sân lớn
        const largeFieldSnapshot = await admin.database().ref(`largeFields/${largeFieldId}`).once('value');
        if (!largeFieldSnapshot.exists()) {
            throw new Error('Sân lớn không tồn tại');
        }
        const largeFieldData = largeFieldSnapshot.val();

        // Thêm thông tin sân lớn vào dữ liệu sân nhỏ
        const newSmallFieldData = {
            ...smallFieldData,
            bookingSlots,
            largeFieldName: largeFieldData.name,
            largeFieldAddress: largeFieldData.address,
            ownerName: largeFieldData.ownerName, // Thêm tên chủ sân
            ownerPhone: largeFieldData.ownerPhone // Thêm số điện thoại chủ sân
        };

        const newFieldRef = await admin.database().ref(`largeFields/${largeFieldId}/smallFields`).push(newSmallFieldData);

        return { smallFieldId: newFieldRef.key, ...newSmallFieldData }; // Trả về smallFieldId
    } catch (error) {
        console.error('Error creating small field:', error.message);
        throw new Error('Không thể tạo sân nhỏ mới');
    }
}
    
    // Cập nhật sân lớn hiện có
    static async updateLargeField(largeFieldId, data) {
        try {
            const fieldRef = admin.database().ref(`largeFields/${largeFieldId}`);
            const snapshot = await fieldRef.once('value');
            if (!snapshot.exists()) {
                throw new Error('Sân lớn không tồn tại');
            }
            await fieldRef.update(data);
        } catch (error) {
            console.error('Error updating large field:', error.message);
            throw new Error('Không thể cập nhật sân lớn');
        }
    }

    // Cập nhật sân nhỏ hiện có
    static async updateSmallField(largeFieldId, smallFieldId, data) {
        try {
            const fieldRef = admin.database().ref(`largeFields/${largeFieldId}/smallFields/${smallFieldId}`);
            const snapshot = await fieldRef.once('value');
            if (!snapshot.exists()) {
                throw new Error('Sân nhỏ không tồn tại');
            }
            await fieldRef.update(data);
        } catch (error) {
            console.error('Error updating small field:', error.message);
            throw new Error('Không thể cập nhật sân nhỏ');
        }
    }

    // Xóa sân lớn theo ID
    static async deleteLargeField(largeFieldId) {
        try {
            const fieldRef = admin.database().ref(`largeFields/${largeFieldId}`);
            const snapshot = await fieldRef.once('value');
            if (!snapshot.exists()) {
                throw new Error('Sân lớn không tồn tại');
            }
            await fieldRef.remove();
        } catch (error) {
            console.error('Error deleting large field:', error.message);
            throw new Error('Không thể xóa sân lớn');
        }
    }

    // Xóa sân nhỏ theo ID
    static async deleteSmallField(largeFieldId, smallFieldId) {
        try {
            const fieldRef = admin.database().ref(`largeFields/${largeFieldId}/smallFields/${smallFieldId}`);
            const snapshot = await fieldRef.once('value');
            if (!snapshot.exists()) {
                throw new Error('Sân nhỏ không tồn tại');
            }
            await fieldRef.remove();
        } catch (error) {
            console.error('Error deleting small field:', error.message);
            throw new Error('Không thể xóa sân nhỏ');
        }
    }

    // Lấy thông tin một sân lớn theo ID
    static async getLargeFieldById(largeFieldId) {
        try {
            const snapshot = await admin.database().ref(`largeFields/${largeFieldId}`).once('value');
            if (!snapshot.exists()) {
                throw new Error('Sân lớn không tồn tại');
            }
            return { largeFieldId, ...snapshot.val() }; // Trả về largeFieldId cùng dữ liệu sân lớn
        } catch (error) {
            console.error('Error fetching large field by ID:', error.message);
            throw error; // Ném lại lỗi để có thể xử lý ở nơi gọi
        }
    }

    // Lấy thông tin một sân nhỏ theo ID
    static async getSmallFieldById(largeFieldId, smallFieldId) {
        try {
            const snapshot = await admin.database().ref(`largeFields/${largeFieldId}/smallFields/${smallFieldId}`).once('value');
            if (!snapshot.exists()) {
                throw new Error(`Sân nhỏ với ID ${smallFieldId} không tồn tại trong sân lớn ${largeFieldId}`);
            }
            return { smallFieldId, ...snapshot.val() };
        } catch (error) {
            console.error('Lỗi khi lấy sân nhỏ theo ID:', error.message);
            throw new Error(`Lỗi khi lấy dữ liệu sân nhỏ: ${error.message}`);
        }
    }

    // Lấy danh sách sân nhỏ thuộc về một sân lớn cụ thể
    static async getSmallFieldsByLargeField(largeFieldId) {
        try {
            const snapshot = await admin.database().ref(`largeFields/${largeFieldId}/smallFields`).once('value');
            const fields = snapshot.val() || {};
            return Object.keys(fields).map(key => ({ smallFieldId: key, ...fields[key] })); // Trả về smallFieldId
        } catch (error) {
            console.error('Error fetching small fields by large field:', error.message);
            throw new Error('Không thể lấy danh sách sân nhỏ');
        }
    }

// Lấy tất cả các sân nhỏ hiện có với phân trang
static async getAllSmallFields(limit = 10, startAfter = null) {
    try {
        let query = admin.database().ref('largeFields').limitToFirst(limit);

        if (startAfter) {
            query = query.startAfter(startAfter);
        }

        const snapshot = await query.once('value');
        const fields = snapshot.val() || {};

        // Lấy tất cả sân nhỏ
        const allSmallFields = [];

        // Lặp qua các sân lớn
        for (let fieldId in fields) {
            const largeField = fields[fieldId];

            // Nếu có sân nhỏ, lưu thông tin sân nhỏ
            if (largeField.smallFields) {
                for (let smallFieldId in largeField.smallFields) {
                    const smallField = largeField.smallFields[smallFieldId];

                    allSmallFields.push({
                        id: smallFieldId, // ID của sân nhỏ
                        name: smallField.name,
                        type: smallField.type,
                        price: smallField.price,
                        description: smallField.description,
                        isAvailable: smallField.isAvailable,
                        bookingSlots: smallField.bookingSlots,
                        largeFieldId: fieldId, // Liên kết với sân lớn
                        largeFieldName: largeField.name, // Tên sân lớn
                        largeFieldAddress: largeField.address, // Địa chỉ sân lớn
                        images: smallField.image,  // Sử dụng 'image' thay vì 'images'
                    });
                }
            }
        }

        return allSmallFields;
    } catch (error) {
        console.error('Error fetching small fields:', error);
        throw new Error('Could not fetch small fields');
    }
}



    // Lấy các khung giờ có thể đặt của sân nhỏ
    static async getAvailableTimeSlots(largeFieldId, smallFieldId, date) {
        try {
            const snapshot = await admin.database().ref(`largeFields/${largeFieldId}/smallFields/${smallFieldId}/bookingSlots/${date}`).once('value');
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
            return Object.keys(fields).map(key => ({ largeFieldId: key, ...fields[key] })); // Trả về largeFieldId
        } catch (error) {
            console.error('Error fetching fields by owner:', error.message);
            throw new Error('Không thể lấy danh sách sân');
        }
    }
    // Lấy tất cả các sân lớn (hoặc tất cả các sân nhỏ từ các sân lớn)
static async getAllFields(limit = 10, startAfter = null) {
    try {
        const snapshot = await admin.database().ref('largeFields').limitToFirst(limit).once('value');
        const fields = snapshot.val() || {};
        return Object.keys(fields).map(key => ({ largeFieldId: key, ...fields[key] }));
    } catch (error) {
        console.error('Error fetching all fields:', error.message);
        throw new Error('Không thể lấy tất cả các sân');
    }
}

static async searchFields(query) {
    try {
        const snapshot = await admin.database().ref('largeFields').once('value');
        const fields = snapshot.val() || {};
        let result = [];

        // Kiểm tra nếu không có dữ liệu
        if (!fields || Object.keys(fields).length === 0) {
            throw new Error("Không có dữ liệu sân");
        }

        // Duyệt qua tất cả các sân lớn
        for (let fieldId in fields) {
            const field = fields[fieldId];
            let matches = true;

            // Kiểm tra tên sân lớn (nếu có query name)
            if (query.name && field.name && !field.name.toLowerCase().includes(query.name.toLowerCase())) {
                matches = false;
            }

            // Kiểm tra địa chỉ sân lớn (nếu có query address)
            if (query.address && field.largeFieldAddress && !field.largeFieldAddress.toLowerCase().includes(query.address.toLowerCase())) {
                matches = false;
            }

            // Kiểm tra tính khả dụng của sân lớn (nếu có query isAvailable)
            if (query.isAvailable !== undefined && field.isAvailable !== query.isAvailable) {
                matches = false;
            }

            // Nếu có query cho bookingSlot, kiểm tra các khung giờ đã có đặt của sân lớn
            if (query.bookingSlot) {
                const bookingSlots = field.bookingSlots || {};

                for (let slot in bookingSlots) {
                    const [slotFrom, slotTo] = slot.split('-').map(time => time.replace('h', '').trim());
                    const queryFrom = query.from.split(':')[0];
                    const queryTo = query.to.split(':')[0];

                    const slotFromMin = parseInt(slotFrom) * 60;
                    const slotToMin = parseInt(slotTo) * 60;
                    const queryFromMin = parseInt(queryFrom) * 60;
                    const queryToMin = parseInt(queryTo) * 60;

                    if ((queryFromMin < slotToMin && queryToMin > slotFromMin)) {
                        matches = false;
                    }
                }
            }

            // Nếu tất cả các tiêu chí của sân lớn khớp, thêm vào kết quả
            if (matches) {
                result.push({ fieldId: fieldId, ...field });
            }

            // Duyệt qua các sân nhỏ của mỗi sân lớn nếu sân lớn thỏa mãn điều kiện
            if (field.smallFields) {
                for (let smallFieldId in field.smallFields) {
                    const smallField = field.smallFields[smallFieldId];
                    let matchesSmallField = true;

                    // Kiểm tra tên sân nhỏ (nếu có query name)
                    if (query.name && smallField.name && !smallField.name.toLowerCase().includes(query.name.toLowerCase())) {
                        matchesSmallField = false;
                    }

                    // Kiểm tra địa chỉ sân nhỏ (nếu có query address)
                    if (query.address && smallField.address && !smallField.address.toLowerCase().includes(query.address.toLowerCase())) {
                        matchesSmallField = false;
                    }

                    // Kiểm tra tính khả dụng của sân nhỏ (nếu có query isAvailable)
                    if (query.isAvailable !== undefined && smallField.isAvailable !== query.isAvailable) {
                        matchesSmallField = false;
                    }

                    // Kiểm tra bookingSlot: Nếu có bất kỳ khung giờ nào trùng nhau, loại bỏ sân này
                    if (query.bookingSlot) {
                        const bookingSlots = smallField.bookingSlots || {};

                        for (let slot in bookingSlots) {
                            const [slotFrom, slotTo] = slot.split('-').map(time => time.replace('h', '').trim());
                            const queryFrom = query.from.split(':')[0];
                            const queryTo = query.to.split(':')[0];

                            const slotFromMin = parseInt(slotFrom) * 60;
                            const slotToMin = parseInt(slotTo) * 60;
                            const queryFromMin = parseInt(queryFrom) * 60;
                            const queryToMin = parseInt(queryTo) * 60;

                            if ((queryFromMin < slotToMin && queryToMin > slotFromMin)) {
                                matchesSmallField = false; // Trùng thì không đưa sân vào kết quả
                            }
                        }
                    }

                    // Nếu tất cả các tiêu chí khớp, thêm vào kết quả
                    if (matchesSmallField) {
                        result.push({ smallFieldId: smallFieldId, ...smallField });
                    }
                }
            }
        }

        // Kiểm tra nếu không tìm thấy kết quả
        if (result.length === 0) {
            return { message: "Không tìm thấy sân theo tiêu chí", error: "Không tìm thấy kết quả phù hợp" };
        }

        return result;
    } catch (error) {
        console.error('Error in searchFields:', error.message);
        throw new Error('Không thể tìm kiếm sân');
    }
}


}


module.exports = Field;