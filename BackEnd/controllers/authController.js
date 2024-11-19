const User = require('../models/User'); // Nhập model User để tương tác với cơ sở dữ liệu người dùng
const admin = require('../firebase'); // Nhập Firebase Admin SDK để sử dụng các chức năng của Firebase

// Hàm xử lý đăng ký người dùng bằng Google
exports.registerWithGoogle = async (req, res) => {
    const { idToken, role } = req.body; // Nhận idToken và vai trò từ yêu cầu của client

    try {
        // Xác thực idToken và lấy thông tin người dùng
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const email = decodedToken.email;

        // Kiểm tra xem người dùng đã tồn tại chưa
        const existingUser = await User.getUserByEmail(email);
        if (existingUser) {
            // Nếu người dùng đã tồn tại, trả về lỗi
            return res.status(400).send({ error: 'User already exists' });
        }

        // Nếu người dùng chưa tồn tại, tạo người dùng mới
        const newUser = await User.createUser(email, role);
        // Lưu thông tin người dùng vào Realtime Database
        await admin.database().ref(`users/${uid}`).set({ 
            email, 
            role, 
            token: idToken // Lưu token vào Firebase
        });

        // Tạo token tùy chỉnh cho người dùng mới
        const token = await admin.auth().createCustomToken(uid);

        // Trả về thông tin người dùng và token đã tạo
        res.status(201).send({ message: 'Registration successful', uid, email, role, token });
    } catch (error) {
        console.error('Error during Google registration:', error);
        res.status(400).send({ error: error.message });
    }
};

// Hàm xử lý đăng nhập bằng Google
exports.loginWithGoogle = async (req, res) => {
    const { idToken } = req.body; // Nhận idToken từ yêu cầu của client

    try {
        // Xác thực idToken và lấy thông tin người dùng
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const email = decodedToken.email;

        // Kiểm tra xem người dùng đã tồn tại chưa
        let user = await User.getUserByEmail(email);
        if (!user) {
            // Nếu người dùng chưa tồn tại, trả về lỗi
            return res.status(400).send({ error: 'User does not exist. Please register first.' });
        }

        // Tạo custom token để gửi về frontend
        const customToken = await admin.auth().createCustomToken(uid);

        // In ra thông tin người dùng và vai trò của họ
        console.log(`User logged in: ${email}, Role: ${user.role}`);

        res.status(200).json({ message: 'Login successful', token: customToken, role: user.role });
    } catch (error) {
        console.error('Error logging in with Google:', error);
        res.status(500).json({ message: 'Error logging in with Google', error: error.message });
    }
};

// Hàm lấy danh sách người chơi do chủ sân làm chủ
exports.getPlayersByFieldOwner = async (req, res) => {
    const { uid } = req.params; // Lấy uid của chủ sân từ params

    try {
        // Lấy danh sách người chơi từ Realtime Database
        const playersSnapshot = await admin.database().ref(`players`).orderByChild('fieldOwnerId').equalTo(uid).once('value');
        const players = playersSnapshot.val() || {}; // Trả về đối tượng rỗng nếu không có player

        // Chuyển đổi dữ liệu thành mảng
        const playerList = Object.keys(players).map(playerId => ({
            playerId: playerId,
            ...players[playerId]
        }));

        // Trả về danh sách người chơi
        res.status(200).json(playerList);
    } catch (error) {
        console.error('Error fetching players:', error);
        res.status(500).json({ error: 'Có lỗi xảy ra khi lấy danh sách người chơi!' });
    }
};