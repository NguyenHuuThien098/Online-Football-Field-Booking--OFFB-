const User = require('../models/User');
const Booking = require('../models/Booking');
const Field = require('../models/Field');
const Notification = require('../models/Notification');
const nodemailer = require('nodemailer');

// Đăng nhập bằng Google cho Player
exports.googleLogin = async (req, res) => {
    const { token } = req.body;
    try {
        const user = await User.verifyGoogleToken(token);
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
        const fields = await Field.getAllFields();
        const filteredFields = fields.filter(field => {
            const matchName = name ? field.name && field.name.toLowerCase().includes(name.toLowerCase()) : true;
            const matchLocation = location ? field.location && field.location.toLowerCase().includes(location.toLowerCase()) : true;
            const matchType = type ? field.type === type : true;
            const isAvailable = date && time
                ? field.bookingSlots && field.bookingSlots[date] && field.bookingSlots[date][time] === false
                : true;

            return matchName && matchLocation && matchType && isAvailable;
        });

        if (filteredFields.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy sân phù hợp.' });
        }

        res.status(200).json(filteredFields);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi tìm kiếm sân', error: error.message });
    }
};

exports.bookField = async (req, res) => {
    const { fieldId, userId, date, startTime, endTime, numberOfPeople } = req.body;

    try {
        console.log("bookField request received with body:", req.body); // Log request body

        // Lấy thông tin sân
        const field = await Field.getFieldById(fieldId);
        if (!field) {
            console.error("Field not found:", fieldId); // Log lỗi không tìm thấy sân
            return res.status(404).json({ message: 'Sân không tồn tại.' });
        }

        console.log("Field found:", field);

        if (field.isAvailable === false) {
            console.log("Field is not available"); // Log khi sân không khả dụng
            return res.status(400).json({ message: 'Sân hiện không khả dụng.' });
        }

        const today = new Date();
        const selectedDate = new Date(date);
        if (selectedDate < today.setHours(0, 0, 0, 0)) { // So sánh ngày mà không xét giờ
            console.log("Selected date is in the past"); // Log nếu ngày trong quá khứ
            return res.status(400).json({ message: 'Không thể đặt sân trong ngày quá khứ.' });
        }

        // Kiểm tra xung đột thời gian
        const conflictResult = Booking.isTimeConflicting(field.bookingSlots, date, startTime, endTime);
        if (conflictResult === true) {
            console.log("Time conflict detected for field:", fieldId);

            // Lấy danh sách khung giờ còn trống
            const availableSlots = Booking.getAvailableTimeSlots(field.bookingSlots, date, parseInt(startTime), parseInt(endTime));
            console.log("Available slots:", availableSlots);

            return res.status(400).json({
                message: 'Khoảng thời gian đã được đặt.',
                availableSlots: availableSlots.length ? availableSlots : 'Không có khung giờ nào khả dụng trong ngày này.'
            });
        }

        // Tạo booking
        const booking = await Booking.createBooking(fieldId, userId, date, startTime, endTime, numberOfPeople);
        console.log("Booking created:", booking);

        // Cập nhật bookingSlots của sân
        if (!field.bookingSlots) {
            field.bookingSlots = {};
        }
        if (!field.bookingSlots[date]) {
            field.bookingSlots[date] = {};
        }
        field.bookingSlots[date][`${startTime}-${endTime}`] = true;
        await Field.updateField(fieldId, { bookingSlots: field.bookingSlots });

        // Thông báo cho chủ sân
        const notificationData = {
            message: `Player đã đặt sân cho ngày ${date} từ ${startTime} đến ${endTime}.`,
            date: new Date().toISOString(),
            fieldId,
            bookingId: booking.id,
        };
        await Notification.notifyFieldOwner(field.ownerId, notificationData);

        // Gửi email thông báo
        const ownerEmail = await getFieldOwnerEmail(field.ownerId);
        await sendEmailNotification(ownerEmail, notificationData);

        res.status(201).json({ message: 'Đặt sân thành công', booking });
    } catch (error) {
        console.error("Error in bookField:", error); // Log lỗi chi tiết
        res.status(500).json({ message: 'Lỗi khi đặt sân', error: error.message });
    }
};
// Hủy đặt sân
exports.cancelBooking = async (req, res) => {
    const { bookingId } = req.params;

    try {
        // Lấy thông tin đặt sân theo bookingId
        const booking = await Booking.getBookingById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Không tìm thấy đặt sân.' });
        }

        const { fieldId, userId, date, startTime, endTime } = booking;

        // Lấy tên người chơi
        const playerName = await getPlayerName(userId);

        // Cập nhật lại trạng thái bookingSlots của sân
        const field = await Field.getFieldById(fieldId);
        if (!field) {
            return res.status(404).json({ message: 'Không tìm thấy sân.' });
        }

        // Kiểm tra xem sân có bookingSlots không, nếu không thì tạo mới
        if (!field.bookingSlots) {
            field.bookingSlots = {};
        }

        // Nếu có ngày và thời gian đã đặt, đặt lại bookingSlots thành false
        if (field.bookingSlots[date] && field.bookingSlots[date][`${startTime}-${endTime}`]) {
            field.bookingSlots[date][`${startTime}-${endTime}`] = false;
            await Field.updateField(fieldId, { bookingSlots: field.bookingSlots });
        }

        // Xóa booking
        await Booking.deleteBooking(bookingId);

        // Thông báo cho chủ sân khi hủy đặt sân
        const notificationData = {
            message: `${playerName} đã hủy đặt sân cho ngày ${date} từ ${startTime} đến ${endTime}.`,  // Thông báo với tên người chơi
            date: new Date().toISOString(),
            fieldId,
            bookingId,
        };
        
        const ownerId = field.ownerId;  // Lấy ownerId của sân
        await Notification.notifyFieldOwner(ownerId, notificationData);

        const ownerEmail = await getFieldOwnerEmail(ownerId);
        await sendEmailNotification(ownerEmail, notificationData);

        res.status(200).json({ message: 'Hủy đặt sân thành công.' });
    } catch (error) {
        console.error("Error during booking cancellation:", error);
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
