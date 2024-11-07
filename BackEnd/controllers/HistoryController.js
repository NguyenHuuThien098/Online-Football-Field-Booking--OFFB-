const Booking = require('../models/Booking');


// Lấy lịch sử đặt sân của người dùng (Player)
exports.getUserBookingHistory = async (req, res) => {
    const { userId } = req.params; 


    try {
        const bookings = await Booking.getBookingsByUser(userId);
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy lịch sử đặt sân', error: error.message });
    }
};


// Lấy lịch sử đặt sân của các sân thuộc sở hữu của chủ sân (Field Owner)
exports.getFieldOwnerBookings = async (req, res) => {
    const { ownerId } = req.params;


    try {
        const bookings = await Booking.getBookingsByFieldOwner(ownerId); 
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy lịch sử đặt sân', error: error.message });
    }
};
