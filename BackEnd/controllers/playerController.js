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
    const { name, location, type, date, time } = req.query;

    try {
        // Lấy tất cả sân từ Firebase (bao gồm cả sân lớn và sân nhỏ)
        const allFields = await Field.getAllFields();  // Lấy tất cả sân lớn và sân nhỏ

        let filteredFields = allFields.filter(field => {
            // Lọc các sân lớn và sân nhỏ theo tên và địa chỉ
            const matchName = name ? field.name.toLowerCase().includes(name.toLowerCase()) : true;
            const matchLocation = location ? field.address.toLowerCase().includes(location.toLowerCase()) : true;

            if (!matchName || !matchLocation) return false; // Nếu không khớp, bỏ qua

            // Kiểm tra tính khả dụng của sân (cả sân lớn và sân nhỏ)
            const isAvailable = date && time
                ? !(field.bookingSlots && field.bookingSlots[date] && field.bookingSlots[date][time] === false)
                : true;

            return isAvailable;
        });

        // Nếu không có sân nào phù hợp
        if (filteredFields.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy sân phù hợp.' });
        }

        // Trả về danh sách các sân đã lọc
        res.status(200).json(filteredFields);
    } catch (error) {
        // Nếu có lỗi trong quá trình tìm kiếm
        res.status(500).json({ message: 'Lỗi khi tìm kiếm sân', error: error.message });
    }
}


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
                    message: 'Khoảng thời gian đã được đặt.',
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

// Lấy tên người chơi
const getPlayerName = async (userId) => {
    try {
        const user = await User.getUserById(userId);
        if (user && user.name) {
            console.log("Player name:", user.name);  
            return user.name;
        }
        console.log("Player name: Player");  
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