const admin = require('../firebase');
const Notification = require('./Notification');
const User = require('./User');
const Field = require('./Field');

class Booking {
    // Kiểm tra xung đột thời gian (ngày và giờ)
    static isTimeConflicting(bookingSlots, date, startTime, endTime) {
        const newStart = parseInt(startTime, 10);
        const newEnd = parseInt(endTime, 10);
    
        // Kiểm tra nếu ngày chưa có booking
        if (!bookingSlots || !bookingSlots[date]) return false;  // Nếu không có booking nào cho ngày này
    
        for (const slot of Object.keys(bookingSlots[date])) {
            const [slotStart, slotEnd] = slot.split('-').map(t => parseInt(t, 10));
    
            // Kiểm tra xung đột
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
            return allPossibleTimes; 
        }

        // Kiểm tra từng khung giờ xem có trùng với thời gian mới không
        for (let start of allPossibleTimes) {
            const [startHour, endHour] = start.split('-');
            const slotStart = parseInt(startHour, 10);
            const slotEnd = parseInt(endHour, 10);

            if (!this.isTimeConflicting(bookingSlots, date, slotStart, slotEnd)) {
                availableSlots.push(start);
            }
        }

        return availableSlots; // Trả về các khung giờ còn trống
    }

    static async createBooking(largeFieldId, smallFieldId, userId, date, startTime, endTime, numberOfPeople) {
        if (![5, 7, 11].includes(numberOfPeople)) {
            throw new Error('Invalid number of people');
        }
    
        // Lấy thông tin sân lớn và sân nhỏ (nếu có)
        const largeField = await Field.getLargeFieldById(largeFieldId);
        let smallField = null;
        if (smallFieldId) {
            smallField = await Field.getSmallFieldById(largeFieldId, smallFieldId);
        }
    
        const playerName = await getPlayerName(userId); // Lấy tên người chơi
    
        // Khởi tạo bookingSlots cho sân nhỏ nếu có
        if (smallField) {
            if (!smallField.bookingSlots) {
                smallField.bookingSlots = {}; // Đảm bảo bookingSlots tồn tại cho smallField
            }
            if (!smallField.bookingSlots[date]) {
                smallField.bookingSlots[date] = {}; // Tạo bookingSlots cho ngày nếu chưa có
            }
        }
    
        // Chuẩn bị dữ liệu đặt sân
        const bookingData = {
            largeFieldId,
            smallFieldId,
            userId,
            date,
            startTime,
            endTime,
            numberOfPeople,
            status: '0', // Đang chờ xác nhận
            createdAt: new Date().toISOString(),
            playerName,
            bookingTime: new Date().toISOString(), // Thời gian tạo booking
        };
    
        // Lưu booking vào Firebase
        const newBookingRef = admin.database().ref('bookings').push();
        await newBookingRef.set(bookingData);
    
        // Cập nhật bookingSlots cho sân nhỏ (nếu có)
        if (smallField) {
            smallField.bookingSlots[date][`${startTime}-${endTime}`] = true;
    
            // Cập nhật vào Firebase cho smallField
            await admin.database().ref(`largeFields/${largeFieldId}/smallFields/${smallFieldId}`).update({ bookingSlots: smallField.bookingSlots });
        }
    
        // Thông báo cho chủ sân
        await Notification.notifyFieldOwner(largeField.ownerId, {
            message: `Sân của bạn đã được người chơi yêu cầu đặt vào ${date} lúc ${startTime}-${endTime} bởi ${playerName}`,
            bookingId: newBookingRef.key, // Sử dụng `key` làm ID duy nhất
        });
    
        // Trả về dữ liệu booking sau khi tạo
        return bookingData;
    }
    
    
    
    // Xác nhận booking
    static async confirmBooking(bookingId) {
        const bookingRef = admin.database().ref(`bookings/${bookingId}`);
        const snapshot = await bookingRef.once('value');
        const booking = snapshot.val();

        if (!booking) {
            throw new Error('Booking not found');
        }

        if (booking.status !== '0') {
            throw new Error('Booking already confirmed or rejected');
        }

        // Cập nhật trạng thái booking thành 'confirmed'
        await bookingRef.update({
            status: '1',//xác nhận
            confirmedAt: new Date().toISOString(), // Thời gian xác nhận
        });

    

        return { ...booking, status: 'confirmed' };
    }

    // Từ chối booking (Chỉ được từ chối khi trạng thái là 'pending')
    static async rejectBooking(bookingId) {
        const bookingRef = admin.database().ref(`bookings/${bookingId}`);
        const snapshot = await bookingRef.once('value');
        const booking = snapshot.val();

        if (!booking) {
            throw new Error('Booking not found');
        }

        if (booking.status !== '0') {
            throw new Error('Booking already confirmed or rejected');
        }

        // Cập nhật trạng thái booking thành 'rejected'
        await bookingRef.update({
            status: '2',//từ chối
            rejectedAt: new Date().toISOString(), // Thời gian từ chối
        });


        return { ...booking, status: 'rejected' };
    }

    // Xóa booking (Chỉ có thể xóa nếu booking đã được xác nhận)
    static async deleteBooking(bookingId) {
        const bookingRef = admin.database().ref(`bookings/${bookingId}`);
        const snapshot = await bookingRef.once('value');
        const booking = snapshot.val();

        if (!booking) {
            throw new Error('Booking not found');
        }

        if (booking.status !== '1') {
            throw new Error('Only confirmed bookings can be deleted');
        }

        // Xóa booking
        await bookingRef.remove();

       
       
          console.message("bạn đã hủy đặt sân")
           
       

        return { ...booking, status: 'deleted' };
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
            const data = snapshot.val() || {};
            return Object.keys(data).map(key => ({ id: key, ...data[key] }));
        });

        return bookings;
    }
}



module.exports = Booking;

// Hàm lấy tên người chơi
const getPlayerName = async (userId) => {
    try {
        const user = await User.getUserById(userId);
        if (user && user.name) {
            return user.name;
        }
        return 'Player';  // Trả về 'Player' nếu không tìm thấy tên
    } catch (error) {
        console.error("Error fetching player name:", error);
        return 'Player';  // Trả về 'Player' nếu có lỗi
    }

    
};
