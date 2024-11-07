const admin = require('firebase-admin'); // Import Firebase Admin SDK

const db = admin.database(); 

class UserController {
    
    static async updateUser(req, res) {
        const uid = req.user?.uid;  
        const { fullName, phoneNumber, birthYear, address, image } = req.body;

        try {
            const userData = {};

           
            if (fullName) userData.fullName = fullName;
            if (phoneNumber) userData.phoneNumber = phoneNumber;
            if (birthYear) userData.birthYear = birthYear;
            if (address) userData.address = address;
            if (image) userData.image = image;

            
            await db.ref(`users/${uid}`).update(userData);

            res.status(200).send({ message: 'Cập nhật thông tin thành công' });
        } catch (error) {
            console.error('Lỗi khi cập nhật người dùng:', error.message);
            res.status(500).send({ error: error.message });
        }
    }

   
    static async getUser(req, res) {
        const uid = req.user?.uid;  

        try {
            const userSnapshot = await db.ref(`users/${uid}`).once('value');

            if (!userSnapshot.exists()) {
              
                return res.status(200).send({
                    fullName: '',
                    phoneNumber: '',
                    birthYear: '',
                    address: '',
                    image: '',
                    email: req.user?.email || '',  
                    role: req.user?.role || 'player', 
                });
            }

            // Trả về thông tin người dùng từ Realtime Database
            res.status(200).send(userSnapshot.val());
        } catch (error) {
            console.error('Lỗi khi lấy thông tin người dùng:', error.message);
            res.status(500).send({ error: error.message });
        }
    }
}

module.exports = UserController;
