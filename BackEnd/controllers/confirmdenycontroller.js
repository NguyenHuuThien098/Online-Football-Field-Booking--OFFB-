const Booking = require('../models/Booking');
const Field = require('../models/Field');
const Notification = require('../models/Notification');
const admin = require('../firebase');
class FieldController {

  // Lấy danh sách các sân của chủ sở hữu và các yêu cầu đặt sân của họ
static async getBookingsForOwner(req, res) {
    try {
        const ownerId = req.params.ownerId; // Lấy ownerId từ params

        // Lấy danh sách các sân lớn (largeFields) của chủ sở hữu
        const largeFieldsSnapshot = await admin.database().ref('largeFields').orderByChild('ownerId').equalTo(ownerId).once('value');
        const largeFields = largeFieldsSnapshot.val() || {};

        const bookingsPromises = Object.keys(largeFields).map(async (largeFieldId) => {
            const largeField = largeFields[largeFieldId];

            // Lấy danh sách các smallFields của sân lớn
            const smallFieldsSnapshot = await admin.database().ref('smallFields').orderByChild('largeFieldId').equalTo(largeFieldId).once('value');
            const smallFields = smallFieldsSnapshot.val() || {};

            // Truy vấn tất cả bookings từ Firebase và lọc những booking có trạng thái '0'
            const bookingsSnapshot = await admin.database().ref('bookings')
                .orderByChild('largeFieldId')
                .equalTo(largeFieldId) // Lọc theo largeFieldId
                .once('value');
            
            const allBookings = bookingsSnapshot.val() || {};

            // Lọc các booking có trạng thái là '0' (đang chờ xác nhận)
            const pendingBookings = Object.keys(allBookings).map(key => {
                const booking = allBookings[key];
                if (booking.status === '0') {
                    return {
                        bookingId: key,
                        bookingTime: booking.bookingTime,
                        createdAt: booking.createdAt,
                        date: booking.date,
                        startTime: booking.startTime,
                        endTime: booking.endTime,
                        numberOfPeople: booking.numberOfPeople,
                        playerName: booking.playerName,
                        largeFieldId: booking.largeFieldId,
                        smallFieldId: booking.smallFieldId,
                        userId: booking.userId,
                        status: booking.status
                    };
                }
                return null;
            }).filter(booking => booking !== null); // Lọc bỏ các booking không phải trạng thái '0'

            return {
                largeFieldId,
                largeFieldName: largeField.name,
                bookings: pendingBookings // Chỉ trả về các booking đang chờ xác nhận
            };
        });

        // Chờ tất cả các Promise để lấy danh sách booking cho các largeField
        const result = await Promise.all(bookingsPromises);

        return res.status(200).json({
            success: true,
            message: 'Fetched bookings for owner successfully',
            data: result
        });

    } catch (error) {
        console.error('Error fetching bookings for owner:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings for owner',
            error: error.message
        });
    }
}



    // Xác nhận yêu cầu đặt sân
    static async confirmBooking(req, res) {
        try {
            const { bookingId } = req.params; // Lấy bookingId từ params

            // Xác nhận booking
            const updatedBooking = await Booking.confirmBooking(bookingId);

            // // Gửi thông báo cho người chơi về việc xác nhận
            // const userId = updatedBooking.userId;
            // const message = `Đặt sân của bạn vào ngày ${updatedBooking.date} lúc ${updatedBooking.startTime}-${updatedBooking.endTime} đã được xác nhận.`;
            // await Notification.notifyUser(userId, { message, bookingId });

            return res.status(200).json({
                success: true,
                message: 'Booking confirmed successfully',
                data: updatedBooking
            });
        } catch (error) {
            console.error('Error confirming booking:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Failed to confirm booking',
                error: error.message
            });
        }
    }

    // Từ chối yêu cầu đặt sân
    static async rejectBooking(req, res) {
        try {
            const { bookingId } = req.params; // Lấy bookingId từ params

            // Từ chối booking
            const updatedBooking = await Booking.rejectBooking(bookingId);

            // Gửi thông báo cho người chơi về việc từ chối
            // const userId = updatedBooking.userId;
            // const message = `Đặt sân của bạn vào ngày ${updatedBooking.date} lúc ${updatedBooking.startTime}-${updatedBooking.endTime} đã bị từ chối.`;
            // await Notification.notifyUser(userId, { message, bookingId });

            return res.status(200).json({
                success: true,
                message: 'Booking rejected successfully',
                data: updatedBooking
            });
        } catch (error) {
            console.error('Error rejecting booking:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Failed to reject booking',
                error: error.message
            });
        }
    }
}

module.exports = FieldController;
