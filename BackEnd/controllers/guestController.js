// guestController.js
const User = require('../models/User');
const Booking = require('../models/Booking');
const Field = require('../models/Field');


// Tìm kiếm sân
exports.searchFields = async (req, res) => {
    const { name, location, type, date, time } = req.query; // Nhận các tham số từ truy vấn
    try {
        const fields = await Field.getAllFields(); // Lấy danh sách tất cả các sân
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


        res.status(200).json(filteredFields); // Trả về danh sách sân phù hợp
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi tìm kiếm sân', error: error.message });
    }
};


// Đặt sân
exports.bookField = async (req, res) => {
    const { token, fieldId, date, time, numberOfPeople } = req.body;


    try {
        // Xác thực token người dùng
        const user = await User.verifyGoogleToken(token);
       
        if (!user) {
            return res.status(401).json({ message: 'Bạn cần đăng nhập để đặt sân.' });
        }


        // Chuyển đổi vai trò sang player
        await User.setUserRole(user.uid, 'player');


        // Tạo đặt sân
        const booking = await Booking.createBooking(fieldId, user.uid, date, time, numberOfPeople);
       
        res.status(201).json({ message: 'Đặt sân thành công', booking });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi đặt sân', error: error.message });
    }
};
