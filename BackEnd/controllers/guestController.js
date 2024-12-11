// guestController.js
const User = require('../models/User');
const Booking = require('../models/Booking');
const Field = require('../models/Field');


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


// // Đặt sân
// exports.bookField = async (req, res) => {
//     const { token, fieldId, date, time, numberOfPeople } = req.body;


//     try {
//         // Xác thực token người dùng
//         const user = await User.verifyGoogleToken(token);
       
//         if (!user) {
//             return res.status(401).json({ message: 'Bạn cần đăng nhập để đặt sân.' });
//         }


//         // Chuyển đổi vai trò sang player
//         await User.setUserRole(user.uid, 'player');


//         // Tạo đặt sân
//         const booking = await Booking.createBooking(fieldId, user.uid, date, time, numberOfPeople);
       
//         res.status(201).json({ message: 'Đặt sân thành công', booking });
//     } catch (error) {
//         res.status(500).json({ message: 'Lỗi khi đặt sân', error: error.message });
//     }
// };
