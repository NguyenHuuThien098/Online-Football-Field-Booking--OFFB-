const admin = require('../firebase');
const Notification = require('./Notification');
const User = require('./User');
const Field = require('./Field');
const moment = require('moment');
class Booking {
    static async updateExpiredSlots() {
        try {
            const now = moment(); // Lấy thời gian hiện tại

            // Lấy tất cả các sân lớn từ Firebase
            const largeFieldsSnapshot = await admin.database().ref('largeFields').once('value');
            const largeFields = largeFieldsSnapshot.val();

            if (!largeFields) {
                console.log('No large fields found.');
                return;
            }

            for (const largeFieldId in largeFields) {
                const largeField = largeFields[largeFieldId];

                if (largeField.smallFields) {
                    for (const smallFieldId in largeField.smallFields) {
                        const smallField = largeField.smallFields[smallFieldId];

                        if (smallField.bookingSlots) {
                            let slotsUpdated = false; // Theo dõi nếu có thay đổi

                            for (const date in smallField.bookingSlots) {
                                for (const slot in smallField.bookingSlots[date]) {
                                    const [startTime, endTime] = slot.split('-');
                                    const slotEnd = moment(`${date} ${endTime}`, 'YYYY-MM-DD HH:mm:ss'); // Thêm dòng này để tính slotEnd

                                    // Kiểm tra nếu slot đã hết hạn và đang được đặt
                                    if (now.isAfter(slotEnd) && smallField.bookingSlots[date][slot] === true) {
                                        // Update slot thành false
                                        smallField.bookingSlots[date][slot] = false;
                                        slotsUpdated = true;

                                        // Cập nhật trạng thái booking thành '3' (Hoàn thành) nếu bookingSlot là false
                                        const bookingSnapshot = await admin.database().ref('bookings')
                                            .orderByChild('date')
                                            .equalTo(date)
                                            .once('value');

                                        bookingSnapshot.forEach(async (bookingSnap) => {
                                            const booking = bookingSnap.val();
                                            if (booking && booking.status !== '3' && booking.bookingSlot === false) {
                                                const slotEndMoment = moment(`${date} ${endTime}`, 'YYYY-MM-DD HH:mm:ss');
                                                const extendedEndTime = slotEndMoment.add(1, 'minute');

                                                if (now.isAfter(extendedEndTime)) {
                                                    console.log(`Booking ${bookingSnap.key} has expired and is being updated to '3'`);
                                                    await admin.database().ref(`bookings/${bookingSnap.key}`).update({
                                                        status: '3', // Cập nhật trạng thái booking thành 'Hoàn thành'
                                                        completedAt: new Date().toISOString(), // Thời gian hoàn thành
                                                    });
                                                }
                                            }
                                        });
                                    }
                                }
                            }

                            // Nếu có thay đổi, cập nhật Firebase
                            if (slotsUpdated) {
                                await admin.database()
                                    .ref(`largeFields/${largeFieldId}/smallFields/${smallFieldId}`)
                                    .update({ bookingSlots: smallField.bookingSlots });
                            }
                        }
                    }
                }
            }

            console.log('Expired slots updated successfully.');
        } catch (error) {
            console.error('Error updating expired slots:', error.message);
            throw error; // Bắn lỗi để kiểm tra rõ hơn trong log
        }
    }
    // Hàm kiểm tra và cập nhật trạng thái booking từ '1' sang '3' nếu đã qua endTime
static async updateCompletedBookings() {
    try {
        const now = moment(); // Lấy thời gian hiện tại

        // Truy vấn tất cả các booking có trạng thái '1' (đã xác nhận)
        const snapshot = await admin.database().ref('bookings').orderByChild('status').equalTo('1').once('value');
        const bookings = snapshot.val();

        if (!bookings) {
            console.log('No confirmed bookings found.');
            return;
        }

        // Duyệt qua từng booking
        for (const bookingId in bookings) {
            const booking = bookings[bookingId];

            // Kiểm tra thời gian kết thúc của booking
            const endTime = moment(`${booking.date} ${booking.endTime}`, 'YYYY-MM-DD HH:mm:ss');
            if (now.isAfter(endTime)) {
                // Nếu đã qua endTime, cập nhật trạng thái thành '3' (hoàn thành)
                await admin.database().ref(`bookings/${bookingId}`).update({
                    status: '3',
                    completedAt: new Date().toISOString(), // Thời gian hoàn thành
                });

                console.log(`Booking ${bookingId} updated to completed (status = 3).`);
            }
        }

        console.log('Completed booking status updated successfully.');
    } catch (error) {
        console.error('Error updating completed bookings:', error.message);
    }
}

//Kiểm tra xung đột thời gian (ngày và giờ)
     static isTimeConflicting(bookingSlots, date, startTime, endTime) {
        const newStart = parseInt(startTime, 10);
        const newEnd = parseInt(endTime, 10);
    
        // Kiểm tra nếu ngày chưa có booking
        if (!bookingSlots || !bookingSlots[date]) return false; // Không có booking nào cho ngày này
    
        for (const slot of Object.keys(bookingSlots[date])) {
            const [slotStart, slotEnd] = slot.split('-').map(t => parseInt(t, 10));
            const isBooked = bookingSlots[date][slot]; // Trạng thái của slot (true hoặc false)
    
            // Nếu slot đang được đặt (true), kiểm tra xung đột
            if (isBooked && 
                ((newStart < slotEnd && newStart >= slotStart) || 
                 (newEnd > slotStart && newEnd <= slotEnd) || 
                 (newStart <= slotStart && newEnd >= slotEnd))) {
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
            return allPossibleTimes; // Trả về tất cả các khung giờ nếu ngày chưa có booking
        }

        // Kiểm tra từng khung giờ xem có trùng với thời gian mới không
        for (const slot of allPossibleTimes) {
            const [slotStart, slotEnd] = slot.split('-').map(t => parseInt(t.split(':')[0], 10));

            // Nếu không có xung đột, thêm vào danh sách khả dụng
            if (!this.isTimeConflicting(bookingSlots, date, slotStart, slotEnd)) {
                availableSlots.push(slot);
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
        // await Notification.notifyFieldOwner(largeField.ownerId, {
        //     message: `Sân ${bookingData.smallFieldId} của bạn đã được người chơi yêu cầu đặt vào ${date} lúc ${startTime}-${endTime} bởi ${playerName}`,
        //     date: new Date().toISOString(),
        //     bookingId: newBookingRef.key, // Sử dụng `key` làm ID duy nhất
        // });
    
        // Trả về dữ liệu booking sau khi tạo
        return bookingData;
    }
    
    
    
   // Xác nhận booking
static async confirmBooking(bookingId) {
    try {
        // Kiểm tra xem bookingId có hợp lệ không
        if (!bookingId) {
            throw new Error('Booking ID is missing');
        }

        // Truy vấn Firebase để lấy thông tin booking
        const bookingRef = admin.database().ref(`bookings/${bookingId}`);
        const snapshot = await bookingRef.once('value');
        const booking = snapshot.val();

        if (!booking) {
            throw new Error('Booking not found');
        }

        // Kiểm tra trạng thái booking trước khi xác nhận
        if (booking.status !== '0' && booking.status !== '1' && booking.status !== '2') {
            throw new Error('Booking cannot be confirmed or updated');
        }

        // Kiểm tra nếu bookingSlot là false, chuyển trạng thái sang 3 (Hoàn thành)
        if (booking.bookingSlot === false) {
            await bookingRef.update({
                status: '3', // Trạng thái 3: Đã hoàn thành
                completedAt: new Date().toISOString(), // Thời gian hoàn thành
            });

            // Trả về thông tin booking đã cập nhật với trạng thái 3
            return { ...booking, status: '3' };
        }

        // Cập nhật trạng thái booking thành 'confirmed' nếu bookingSlot là true
        if (booking.status === '0') {
            await bookingRef.update({
                status: '1', // Trạng thái 1: Xác nhận
                confirmedAt: new Date().toISOString(), // Thời gian xác nhận
            });

            // Trả về thông tin booking đã cập nhật
            return { ...booking, status: '1' };
        }

        // Nếu booking đã bị từ chối, trả về trạng thái đã từ chối
        if (booking.status === '2') {
            return { ...booking, status: '2' };
        }

    } catch (error) {
        console.error('Error confirming booking:', error);
        throw new Error(error.message);
    }
}


// Từ chối booking (Chỉ được từ chối khi trạng thái là 'pending')
static async rejectBooking(bookingId) {
    try {
        // Kiểm tra xem bookingId có hợp lệ không
        if (!bookingId) {
            throw new Error('Booking ID is missing');
        }

        // Truy vấn Firebase để lấy thông tin booking
        const bookingRef = admin.database().ref(`bookings/${bookingId}`);
        const snapshot = await bookingRef.once('value');
        const booking = snapshot.val();

        if (!booking) {
            throw new Error('Booking not found');
        }

        // Kiểm tra trạng thái booking trước khi từ chối
        if (booking.status !== '0') {
            throw new Error('Booking already confirmed or rejected');
        }

        // Cập nhật trạng thái booking thành 'rejected'
        await bookingRef.update({
            status: '2', // từ chối
            rejectedAt: new Date().toISOString(), // Thời gian từ chối
        });

        // Trả về thông tin booking đã cập nhật
        return { ...booking, status: 'rejected' };
    } catch (error) {
        console.error('Error rejecting booking:', error);
        throw new Error(error.message);
    }
}
// Lấy thông tin booking theo bookingId
static async getBookingById(bookingId) {
    const bookingSnapshot = await admin.database().ref('bookings').child(bookingId).once('value');
    const booking = bookingSnapshot.val();
    return booking;
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


setInterval(async () => {
    try {
        await Booking.updateExpiredSlots();
    } catch (error) {
        console.error('Error running updateExpiredSlots:', error.message);
    }
}, 60000); // Chạy mỗi phút (60 giây)

// Chạy hàm updateCompletedBookings mỗi 30 giây
setInterval(async () => {
    try {
        await Booking.updateCompletedBookings();
    } catch (error) {
        console.error('Error running updateCompletedBookings:', error.message);
    }
}, 30000); // Chạy mỗi 30 giây

module.exports = Booking;


// Hàm lấy tên người chơi từ Firebase
const getPlayerName = async (userId) => {
    try {
        const userSnapshot = await admin.database().ref(`users/${userId}`).once('value');
        const userData = userSnapshot.val();
        if (userData && userData.fullName) {
            return userData.fullName;
        }
        return 'Player';  // Trả về 'Player' nếu không tìm thấy tên
    } catch (error) {
        console.error("Error fetching player name:", error);
        return 'Player';  // Trả về 'Player' nếu có lỗi xảy ra
    }
};

