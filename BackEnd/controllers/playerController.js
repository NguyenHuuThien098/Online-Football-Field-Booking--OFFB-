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
exports.searchFields = async (req, res) => {
    const { name, location, type, date, time } = req.query;

    try {
        // Lấy tất cả sân lớn
        const largeFields = await Field.getAllLargeFields();

        // Mảng chứa các sân (bao gồm cả sân lớn và nhỏ)
        let allFields = [];

        // Lọc các sân lớn
        largeFields.forEach(largeField => {
            // Lọc sân lớn dựa trên tên và địa chỉ
            const matchName = name ? largeField.name.toLowerCase().includes(name.toLowerCase()) : true;
            const matchLocation = location ? largeField.address.toLowerCase().includes(location.toLowerCase()) : true;

            if (matchName && matchLocation) {
                // Thêm sân lớn vào danh sách
                allFields.push(largeField);

                // Lọc các sân nhỏ (nếu có) của sân lớn này
                if (largeField.smallFields && largeField.smallFields.length > 0) {
                    largeField.smallFields.forEach(smallField => {
                        const matchSmallFieldName = name ? smallField.name.toLowerCase().includes(name.toLowerCase()) : true;
                        const matchSmallFieldType = type ? smallField.type.toLowerCase() === type.toLowerCase() : true;
                        const matchSmallFieldLocation = location ? largeField.address.toLowerCase().includes(location.toLowerCase()) : true;
                        
                        // Kiểm tra tính khả dụng của sân nhỏ (nếu có tham số `date` và `time`)
                        const isAvailable = date && time
                            ? !(smallField.bookingSlots && smallField.bookingSlots[date] && smallField.bookingSlots[date][time])
                            : smallField.isAvailable; // Kiểm tra availability nếu không có `date` và `time`

                        // Nếu các điều kiện khớp, thêm sân nhỏ vào danh sách
                        if (matchSmallFieldName && matchSmallFieldLocation && matchSmallFieldType && isAvailable) {
                            allFields.push({
                                ...smallField,
                                largeFieldId: largeField.id, // Thêm thông tin sân lớn liên kết
                            });
                        }
                    });
                }
            }
        });

        // Kiểm tra nếu không tìm thấy sân phù hợp
        if (allFields.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy sân phù hợp.' });
        }

        // Trả về kết quả các sân
        res.status(200).json({
            fields: allFields,
            totalFields: allFields.length,
        });
    } catch (error) {
        console.error('Error when searching fields:', error);
        res.status(500).json({ message: 'Lỗi khi tìm kiếm sân', error: error.message });
    }
};



exports.bookField = async (req, res) => {
    const { largeFieldId, smallFieldId, userId, date, startTime, endTime, numberOfPeople } = req.body;

    try {
        console.log("bookField request received with body:", req.body);

        const largeField = await Field.getLargeFieldById(largeFieldId);
        let smallField = null;

        if (smallFieldId) {
            smallField = await Field.getSmallFieldsByLargeField(largeFieldId, smallFieldId);
        }

       
        const today = new Date();
        const selectedDate = new Date(date);
        if (selectedDate < new Date(today.setHours(0, 0, 0, 0))) {
            return res.status(400).json({ message: 'Không thể đặt sân trong ngày quá khứ.' });
        }

        if (!largeField.bookingSlots) {
            largeField.bookingSlots = {};
        }
        if (smallField && !smallField.bookingSlots) {
            smallField.bookingSlots = {};
        }

        if (!largeField.bookingSlots[date]) {
            largeField.bookingSlots[date] = {};
        }
        if (smallField && !smallField.bookingSlots[date]) {
            smallField.bookingSlots[date] = {};
        }

        // Check for time conflicts for the selected field
        const conflictResult = Booking.isTimeConflicting(smallField ? smallField.bookingSlots : largeField.bookingSlots, date, startTime, endTime);
        if (conflictResult === true) {
            // Get available time slots in case of conflict
            const availableSlots = Booking.getAvailableTimeSlots(smallField ? smallField.bookingSlots : largeField.bookingSlots, date, parseInt(startTime), parseInt(endTime));
            return res.status(400).json({
                message: 'Khoảng thời gian đã được đặt.',
                availableSlots: availableSlots.length ? availableSlots : 'Không có khung giờ nào khả dụng trong ngày này.'
            });
        }

        // Create the booking
        const booking = await Booking.createBooking(largeFieldId, smallFieldId, userId, date, startTime, endTime, numberOfPeople);

        // Update the booking slots
        if (smallField) {
            smallField.bookingSlots[date][`${startTime}-${endTime}`] = true;
        }
        largeField.bookingSlots[date][`${startTime}-${endTime}`] = true;

        const notificationData = {
            message: `Player đã yêu cầu đặt sân cho ngày ${date} từ ${startTime} đến ${endTime}.`,
            date: new Date().toISOString(),
            smallFieldId,
        };
        await Notification.notifyFieldOwner(largeField.ownerId, notificationData);

        const ownerEmail = await getFieldOwnerEmail(largeField.ownerId);
        await sendEmailNotification(ownerEmail, notificationData);

        res.status(201).json({ message: 'Đặt sân thành công', booking });
    } catch (error) {
        console.error("Error in bookField:", error);
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