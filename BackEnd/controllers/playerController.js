const User = require('../models/User');
const Booking = require('../models/Booking');
const Field = require('../models/Field');
const Notification = require('../models/Notification');
const nodemailer = require('nodemailer');
const admin = require('../firebase');
// Đăng nhập bằng Google cho Player
exports.googleLogin = async (req, res) => {
    const { token } = req.body;
    try {
        const user = await User.verifyGoogleToken(token);
        console.log('User:', user);
        await User.setUserRole(user.uid, 'player');
        res.status(200).send({ message: 'Đăng nhập thành công với tư cách Player', uid: user.uid });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

// Tìm kiếm sân
exports.searchFields = async (req, res) => {
    try {
        const { name, address, bookingSlot } = req.query;

        // Tạo điều kiện tìm kiếm
        let query = {};

        if (name) query.name = name; // Tìm theo tên sân
        if (address) query.address = address; // Tìm theo địa chỉ
        if (bookingSlot === 'true') query.isAvailable = false; // Nếu bookingSlot=true thì lọc ra sân không có sẵn

        // Lấy các sân từ Firebase hoặc cơ sở dữ liệu theo điều kiện
        const fields = await Field.searchFields(query); // Hàm searchFields này sẽ xử lý tìm kiếm

        if (fields.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy sân theo tiêu chí" });
        }

        return res.status(200).json({ fields });
    } catch (error) {
        console.error('Error searching fields:', error);
        return res.status(500).json({ message: 'Lỗi khi tìm kiếm sân', error: error.message });
    }
}
const checkConflict = (newStartTime, newEndTime, existingBookings) => {
    return existingBookings.some((booking) => {
      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);
  
      return (
        (newStartTime >= bookingStart && newStartTime < bookingEnd) ||
        (newEndTime > bookingStart && newEndTime <= bookingEnd) ||
        (newStartTime <= bookingStart && newEndTime >= bookingEnd)
      );
    });
  };
  

exports.bookField = async (req, res) => {
    const { largeFieldId, smallFieldId, userId, date, startTime, endTime, numberOfPeople } = req.body;

    try {
        console.log("bookField request received with body:", req.body);

        // Lấy thông tin sân lớn và sân nhỏ (nếu có)
        const largeField = await Field.getLargeFieldById(largeFieldId);
        let smallField = null;
        if (smallFieldId) {
            smallField = await Field.getSmallFieldById(largeFieldId, smallFieldId);
        }

        const today = new Date();
        const selectedDate = new Date(date);
        
        // Kiểm tra ngày đã chọn có phải là quá khứ hay không
        if (selectedDate < new Date(today.setHours(0, 0, 0, 0))) {
            return res.status(400).json({ message: 'Không thể đặt sân trong ngày quá khứ.' });
        }

        // Kiểm tra sự trùng lịch cho sân nhỏ nếu có
        if (smallField) {
            // Kiểm tra và khởi tạo bookingSlots cho smallField nếu chưa có
            if (!smallField.bookingSlots) {
                smallField.bookingSlots = {}; // Đảm bảo bookingSlots tồn tại cho smallField
            }
            if (!smallField.bookingSlots[date]) {
                smallField.bookingSlots[date] = {}; // Tạo bookingSlots cho ngày nếu chưa có
            }

            // Kiểm tra sự trùng lịch cho sân nhỏ
            const conflictResult = Booking.isTimeConflicting(smallField.bookingSlots, date, startTime, endTime);
            if (conflictResult === true) {
                const availableSlots = Booking.getAvailableTimeSlots(smallField.bookingSlots, date, parseInt(startTime), parseInt(endTime));
                return res.status(400).json({
                    message: 'TIME SLOT BOOKED.',
                    availableSlots: availableSlots.length ? availableSlots : 'Không có khung giờ nào khả dụng trong ngày này.'
                });
            }
        }

        // Tạo booking mới
        const booking = await Booking.createBooking(largeFieldId, smallFieldId, userId, date, startTime, endTime, numberOfPeople);

        // Cập nhật bookingSlots cho sân nhỏ nếu có
        if (smallField) {
            smallField.bookingSlots[date][`${startTime}-${endTime}`] = true;

            // Cập nhật Firebase cho smallField
            await admin.database().ref(`largeFields/${largeFieldId}/smallFields/${smallFieldId}`).update({ bookingSlots: smallField.bookingSlots });
        }

        // Thông báo cho chủ sân
        const notificationData = {
            message: `Player đã yêu cầu đặt sân cho ngày ${date} từ ${startTime} đến ${endTime}.`,
            date: new Date().toISOString(),
            smallFieldId,
        };
        await Notification.notifyFieldOwner(largeField.ownerId, notificationData);

        // Gửi email thông báo cho chủ sân
        const ownerEmail = await getFieldOwnerEmail(largeField.ownerId);
        await sendEmailNotification(ownerEmail, notificationData);

        // Trả về kết quả thành công
        res.status(201).json({ message: 'Đặt sân thành công', booking });
    } catch (error) {
        console.error("Error in bookField:", error);
        res.status(500).json({ message: 'Lỗi khi đặt sân', error: error.message });
    }
};


exports.cancelBooking = async (req, res) => {
    const { bookingId } = req.params;

    try {
        console.log("Cancel booking request received for bookingId:", bookingId);

        // Lấy thông tin đặt sân từ Firebase
        const bookingRef = admin.database().ref('bookings').child(bookingId);
        const snapshot = await bookingRef.once('value');
        const booking = snapshot.val();

        if (!booking) {
            return res.status(404).json({ message: 'Không tìm thấy đặt sân.' });
        }

        const { largeFieldId, smallFieldId, userId, date, startTime, endTime } = booking;

        // Lấy thông tin sân lớn
        const largeField = await Field.getLargeFieldById(largeFieldId);
        let smallField = smallFieldId ? await Field.getSmallFieldById(largeFieldId, smallFieldId) : null;

        // Nếu có sân nhỏ, cập nhật bookingSlots cho sân nhỏ
        if (smallField && smallField.bookingSlots && smallField.bookingSlots[date]) {
            // Xóa trạng thái đã đặt cho khung giờ trên sân nhỏ
            delete smallField.bookingSlots[date][`${startTime}-${endTime}`];

            // Nếu không còn khung giờ nào được đặt cho sân nhỏ, xóa bookingSlots cho ngày
            if (Object.keys(smallField.bookingSlots[date]).length === 0) {
                delete smallField.bookingSlots[date];
            }

            // Cập nhật lại vào Firebase cho smallField
            await admin.database().ref(`largeFields/${largeFieldId}/smallFields/${smallFieldId}`).update({ bookingSlots: smallField.bookingSlots });
        }

        // Xóa booking khỏi danh sách đặt sân trong Firebase
        await bookingRef.remove();

        // Lấy tên người chơi (player)
        const playerName = await getPlayerName(userId);

        // Thông báo cho chủ sân về việc hủy đặt sân
        const notificationData = {
            message: `${playerName} đã hủy đặt sân cho ngày ${date} từ ${startTime} đến ${endTime}.`,
            date: new Date().toISOString(),
            smallFieldId,
        };

        await Notification.notifyFieldOwner(largeField.ownerId, notificationData);

        // Gửi email thông báo cho chủ sân
        const ownerEmail = await getFieldOwnerEmail(largeField.ownerId);
        await sendEmailNotification(ownerEmail, notificationData);

        // Trả về kết quả thành công
        res.status(200).json({ message: 'Hủy đặt sân thành công.' });
    } catch (error) {
        console.error("Error in cancelBooking:", error);
        res.status(500).json({ message: 'Lỗi khi hủy đặt sân', error: error.message });
    }
};






// Lấy lịch sử đặt sân của Player
exports.getUserBookings = async (req, res) => {
    const { userId } = req.params;
    try {
        const bookings = await Booking.getBookingsByUser(userId);
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy lịch sử đặt sân', error: error.message });
    }
};

// Trang chủ của Player
exports.playerHome = (req, res) => {
    res.status(200).send('Đây là trang chủ của Player');
};

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

// Hàm lấy email của chủ sân dựa trên ownerId
const getFieldOwnerEmail = async (ownerId) => {
    const owner = await User.getUserById(ownerId);
    return owner.email; // Giả sử owner có trường email
};

// Hàm gửi email thông báo
const sendEmailNotification = async (email, notificationData) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'huut789@gmail.com',
            pass: 'urvjqxxggqbkmgst',
        },
    });

    const mailOptions = {
        from: 'huut789@gmail.com',
        to: email,
        subject: 'Thông báo đặt sân / hủy đặt sân',
        text: notificationData.message,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};