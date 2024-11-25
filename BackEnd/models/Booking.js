const admin = require('../firebase');
const Notification = require('./Notification');
const User = require('./User');
const Field = require('./Field');

class Booking {
    // Kiểm tra xung đột thời gian (ngày và giờ)
static isTimeConflicting(bookingSlots, date, startTime, endTime) {
    const newStart = parseInt(startTime, 10);
    const newEnd = parseInt(endTime, 10);

    if (!bookingSlots[date]) return false; 

    for (const slot of Object.keys(bookingSlots[date])) {
        const [slotStart, slotEnd] = slot.split('-').map(t => parseInt(t, 10));

        // Kiểm tra xung đột nếu cả ngày và giờ đều trùng
        if ((newStart < slotEnd && newStart >= slotStart) || (newEnd > slotStart && newEnd <= slotEnd) || 
            (newStart <= slotStart && newEnd >= slotEnd)) {
            return true;
        }
    }
    return false;
}

// Lấy các khung giờ còn trống trong một ngày
static getAvailableTimeSlots(bookingSlots, date, newStart, newEnd) {
    const availableSlots = [];
    const allPossibleTimes = [
        "00:00-01:00", "01:00-02:00", "02:00-03:00", "03:00-04:00", "04:00-05:00", "05:00-06:00", 
        "06:00-07:00", "07:00-08:00", "08:00-09:00", "09:00-10:00", "10:00-11:00", "11:00-12:00", 
        "12:00-13:00", "13:00-14:00", "14:00-15:00", "15:00-16:00", "16:00-17:00", "17:00-18:00", 
        "18:00-19:00", "19:00-20:00", "20:00-21:00", "21:00-22:00", "22:00-23:00", "23:00-00:00"
    ];

    if (!bookingSlots[date]) {
        return allPossibleTimes; // Nếu không có booking trong ngày, trả về tất cả các khung giờ.
    }

    // Kiểm tra từng khung giờ xem có trùng với thời gian mới không
    for (let start of allPossibleTimes) {
        const [startHour, endHour] = start.split('-');
        const startInt = parseInt(startHour, 10);
        const endInt = parseInt(endHour, 10);

        // Kiểm tra nếu khung giờ này có sự chồng lấn với khoảng thời gian mới
        if ((newStart < endInt && newStart >= startInt) || (newEnd > startInt && newEnd <= endInt) || 
            (newStart <= startInt && newEnd >= endInt)) {
            continue; // Nếu có sự chồng lấn thì bỏ qua khung giờ này.
        }

        // Kiểm tra khung giờ này đã có booking chưa trong ngày đã chọn
        if (!bookingSlots[date][start]) {
            availableSlots.push(start);
        }
    }

    return availableSlots; // Trả về các khung giờ còn trống
}

    
   // Tạo booking mới
static async createBooking(fieldId, userId, date, startTime, endTime, numberOfPeople) {
    if (![5, 7, 11].includes(numberOfPeople)) {
        throw new Error('Số người không hợp lệ. Chọn 5, 7 hoặc 11.');
    }

    const field = await Field.getFieldById(fieldId);
    const bookingData = {
        fieldId,
        userId,
        date,
        startTime,
        endTime,
        numberOfPeople,
        createdAt: new Date().toISOString(),
    };

    // Kiểm tra xung đột trước khi tạo booking
    const conflictResult = Booking.isTimeConflicting(field.bookingSlots, date, startTime, endTime);

    if (conflictResult === true) {
        throw new Error('Khoảng thời gian đã được đặt. Vui lòng chọn thời gian khác.');
    }

    // Kiểm tra các khung giờ còn trống
    const availableSlots = Booking.getAvailableTimeSlots(field.bookingSlots, date, parseInt(startTime), parseInt(endTime));

    if (availableSlots.length === 0) {
        throw new Error(`Khoảng thời gian đã được đặt. Các khung giờ còn trống: ${availableSlots.join(', ')}`);
    }

    const newBookingRef = await admin.database().ref('bookings').push(bookingData);

    // Gửi thông báo cho chủ sân
    await Notification.notifyFieldOwner(field.ownerId, {
        message: `Sân của bạn đã được đặt vào ${date} lúc ${startTime}-${endTime}`,
        bookingId: newBookingRef.key,
    });

    return { id: newBookingRef.key, ...bookingData };
}


    // Lấy booking theo userId
    static async getBookingsByUser(userId) {
        const snapshot = await admin.database().ref('bookings')
            .orderByChild('userId')
            .equalTo(userId)
            .once('value');

        const bookings = snapshot.val() || {};
        const bookingList = Object.keys(bookings).map(key => ({ id: key, ...bookings[key] }));

        const bookingsWithFields = await Promise.all(bookingList.map(async (booking) => {
            const field = await Field.getFieldById(booking.fieldId);
            return {
                ...booking,
                fieldName: field.name,
                location: field.location, // Thêm địa chỉ sân vào dữ liệu trả về
                // fieldLocation: field.location,
                fieldPrice: field.price,
                fieldType: field.type,
            };
        }));

        return bookingsWithFields;
    }

// Lấy booking theo bookingId
static async getBookingById(bookingId) {
    const snapshot = await admin.database().ref('bookings').child(bookingId).once('value');
    const booking = snapshot.val();
    return booking ? { id: bookingId, ...booking } : null; // Trả về booking nếu tìm thấy, ngược lại trả về null
}


    // Lấy booking theo ownerId
    static async getBookingsByFieldOwner(ownerId) {
        const snapshot = await admin.database().ref('fields').orderByChild('ownerId').equalTo(ownerId).once('value');
        const fields = snapshot.val() || {};

        const fieldIds = Object.keys(fields);
        const bookingsPromises = fieldIds.map(fieldId =>
            admin.database().ref('bookings').orderByChild('fieldId').equalTo(fieldId).once('value')
        );

        const bookingsSnapshots = await Promise.all(bookingsPromises);

        const bookings = bookingsSnapshots.flatMap(snapshot => {
            const bookingsData = snapshot.val() || {};
            return Object.keys(bookingsData).map(key => ({ id: key, ...bookingsData[key] }));
        });

        return bookings;
    }

    // Xóa booking
    static async deleteBooking(bookingId) {
        await admin.database().ref(`bookings/${bookingId}`).remove();
    }
}

module.exports = Booking;
