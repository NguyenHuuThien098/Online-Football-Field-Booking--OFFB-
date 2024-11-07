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

// Đặt sân
exports.bookField = async (req, res) => {
    const { fieldId, userId, date, time, numberOfPeople } = req.body;

    try {
        // Lấy thông tin sân
        const field = await Field.getFieldById(fieldId);
        if (!field) {
            return res.status(404).json({ message: 'Sân không tồn tại.' });
        }

        if (!field.bookingSlots) {
            field.bookingSlots = {};
        }

        if (!field.bookingSlots[date]) {
            field.bookingSlots[date] = {};
        }

        if (field.bookingSlots[date][time]) {
            return res.status(400).json({ message: 'Thời gian đã được đặt. Vui lòng chọn thời gian khác.' });
        }

        // Tạo đặt sân
        const booking = await Booking.createBooking(fieldId, userId, date, time, numberOfPeople);

        field.bookingSlots[date][time] = true;
        await Field.updateField(fieldId, { bookingSlots: field.bookingSlots });

        // Thông báo cho chủ sân
        const ownerId = field.ownerId;
        const notificationData = {
            message: `Player đã đặt sân cho ngày ${date} lúc ${time}.`,
            date: new Date().toISOString(),
            fieldId,
            bookingId: booking.id,
        };

        await Notification.notifyFieldOwner(ownerId, notificationData);

        const ownerEmail = await getFieldOwnerEmail(ownerId);
        await sendEmailNotification(ownerEmail, notificationData);

        res.status(201).json({ message: 'Đặt sân thành công', booking });
    } catch (error) {
        console.error("Error during booking:", error);
        res.status(500).json({ message: 'Lỗi khi đặt sân', error: error.message });
    }
};

// Hủy đặt sân
exports.cancelBooking = async (req, res) => {
    const { bookingId } = req.params;

    try {
        const booking = await Booking.getBookingById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Không tìm thấy đặt sân.' });
        }

        const fieldId = booking.fieldId;
        const date = booking.date;
        const time = booking.time;

        await Booking.deleteBooking(bookingId);

        await Field.updateField(fieldId, {
            [`bookingSlots/${date}/${time}`]: false
        });

        // Thông báo cho chủ sân khi hủy đặt sân
        const field = await Field.getFieldById(fieldId);
        const ownerId = field.ownerId;

        const notificationData = {
            message: `Player đã hủy đặt sân cho ngày ${date} lúc ${time}.`,
            date: new Date().toISOString(),
            fieldId,
            bookingId,
        };
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

    await transporter.sendMail(mailOptions);
};
