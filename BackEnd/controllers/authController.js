const User = require('../models/User'); // Nhập model User để tương tác với cơ sở dữ liệu người dùng
const admin = require('../firebase'); // Nhập Firebase Admin SDK để sử dụng các chức năng của Firebase

// Hàm xử lý đăng ký người dùng
exports.register = async (req, res) => {
    const { email, role } = req.body; // Nhận email và vai trò từ yêu cầu của client
    try {
        // Kiểm tra xem người dùng đã tồn tại chưa
        const existingUser = await User.getUserByEmail(email);
        if (existingUser) {
            // Nếu người dùng đã tồn tại, trả về lỗi
            return res.status(400).send({ error: 'User already exists' });
        }

        // Nếu người dùng chưa tồn tại, tạo người dùng mới
        const newUser = await User.createUser(email, role);
        // Lưu thông tin người dùng vào Realtime Database
        await admin.database().ref(`users/${newUser.uid}`).set({ email, role });

        // Tạo token tùy chỉnh cho người dùng mới
        const token = await admin.auth().createCustomToken(newUser.uid);
        // Lưu token vào Realtime Database để có thể truy cập sau này
        await admin.database().ref(`tokens/${newUser.uid}`).set({ token });

        // Trả về thông tin người dùng và token đã tạo
        res.status(201).send({ uid: newUser.uid, email, role, token });
    } catch (error) {
        // Nếu có lỗi trong quá trình đăng ký, ghi log và trả về lỗi
        console.error('Error during registration:', error);
        res.status(400).send({ error: error.message });
    }
};

// Hàm xử lý đăng nhập bằng Google
exports.loginWithGoogle = async (req, res) => {
    const { googleId, email, role } = req.body; // Nhận googleId, email và vai trò từ yêu cầu của client

    try {
        // Kiểm tra xem người dùng đã tồn tại chưa
        const existingUser = await User.getUserByEmail(email);
        if (!existingUser) {
            // Nếu người dùng chưa tồn tại, tạo mới người dùng
            const newUser = await User.createUser(email, role);
            // Lưu thông tin người dùng vào Realtime Database
            await admin.database().ref(`users/${newUser.uid}`).set({ email, role });

            // Tạo token cho người dùng mới
            const token = await admin.auth().createCustomToken(newUser.uid);
            // Lưu token vào Realtime Database
            await admin.database().ref(`tokens/${newUser.uid}`).set({ token });

            // Trả về thông tin người dùng mới và token
            return res.status(201).send({ uid: newUser.uid, email, role, token });
            
            // Nếu người dùng chưa tồn tại, trả về thông báo yêu cầu đăng ký
            return res.status(404).send({ error: 'Hãy đăng ký trước khi đăng nhập.' })
        }

        // Nếu người dùng đã tồn tại, tạo token cho người dùng cũ
        const token = await admin.auth().createCustomToken(existingUser.uid);
        // Cập nhật token vào Realtime Database
        await admin.database().ref(`tokens/${existingUser.uid}`).set({ token });

        // Trả về thông tin người dùng và token đã tạo
        res.send({ uid: existingUser.uid, email: existingUser.email, role: existingUser.role, token });
    } catch (error) {
        // Nếu có lỗi trong quá trình đăng nhập, ghi log và trả về lỗi
        console.error('Error during Google login:', error);
        res.status(400).send({ error: error.message });
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