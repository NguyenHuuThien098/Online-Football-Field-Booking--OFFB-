const admin = require('../firebase');
const Notification = require('./Notification');
const User = require('./User');
const Field = require('./Field');


class Booking {
    // Tạo mới một booking
    static async createBooking(fieldId, userId, date, time, numberOfPeople) {
       
        if (![5, 7, 11].includes(numberOfPeople)) {
            throw new Error('Số người không hợp lệ. Chọn 5, 7 hoặc 11.');
        }


        // Lấy thông tin sân để thông báo cho chủ sân
        const field = await Field.getFieldById(fieldId);
        const bookingData = {
            fieldId,
            userId,
            date,
            time,
            numberOfPeople,
            createdAt: new Date().toISOString(),
        };


        // Tạo booking mới trong cơ sở dữ liệu
        const newBookingRef = await admin.database().ref('bookings').push(bookingData);


        // Gửi thông báo cho chủ sân
        await Notification.notifyFieldOwner(field.ownerId, {
            message: `Sân của bạn đã được đặt vào ${date} lúc ${time}`,
            bookingId: newBookingRef.key,
        });


        
        const owner = await User.getUserById(field.ownerId);
       


        return { id: newBookingRef.key, ...bookingData };
    }


   
    static async getBookingsByUser(userId) {
        const snapshot = await admin.database().ref('bookings')
            .orderByChild('userId')
            .equalTo(userId)
            .once('value');
       
        const bookings = snapshot.val() || {};
        return Object.keys(bookings).map(key => ({ id: key, ...bookings[key] }));
    }


    // Lấy danh sách booking theo fieldId
    static async getBookingsByField(fieldId) {
        const snapshot = await admin.database().ref('bookings')
            .orderByChild('fieldId')
            .equalTo(fieldId)
            .once('value');
       
        const bookings = snapshot.val() || {};
        return Object.keys(bookings).map(key => ({ id: key, ...bookings[key] }));
    }


    
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


    // Lấy thông tin booking theo ID
    static async getBookingById(bookingId) {
        const snapshot = await admin.database().ref(`bookings/${bookingId}`).once('value');
        if (!snapshot.exists()) {
            throw new Error('Booking không tồn tại');
        }
        return { id: bookingId, ...snapshot.val() };
    }


    // Xóa booking theo ID
    static async deleteBooking(bookingId) {
        await admin.database().ref(`bookings/${bookingId}`).remove();
    }
}


module.exports = Booking;
