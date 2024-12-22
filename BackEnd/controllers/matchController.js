const admin = require('../firebase'); // Import Firebase Admin SDK
const Match = require('../models/Match'); // Import lớp Match

// Hàm lấy danh sách tất cả các trận đấu công khai
exports.getAllMatchesPublic = async (req, res) => {
    try {
        const snapshot = await admin.database().ref('matches').once('value'); // Lấy dữ liệu tất cả các trận đấu
        const matches = snapshot.val() || {}; // Chuyển đổi dữ liệu thành đối tượng
        const matchList = Object.keys(matches).map(key => ({ id: key, ...matches[key] })); // Chuyển đổi đối tượng thành mảng
        res.status(200).json(matchList); // Trả về danh sách trận đấu
    } catch (error) {
        console.error("Error fetching all matches:", error);
        res.status(500).json({ error: 'Có lỗi xảy ra khi lấy danh sách tất cả các trận đấu!' });
    }
};

// Hàm tạo trận đấu
exports.createMatch = async (req, res) => {
    const { largeFieldAddress, smallFieldAddress, time, ownerName, playerCount, notes, questions, images } = req.body;
    const ownerId = req.user.uid; // Lấy ownerId từ thông tin người dùng đã xác thực

    // Kiểm tra dữ liệu đầu vào
    if (!largeFieldAddress || !smallFieldAddress || !time || !ownerName || !playerCount || !ownerId) {
        return res.status(400).json({ error: 'Tất cả các trường largeFieldAddress, smallFieldAddress, time, ownerName, playerCount và ownerId là bắt buộc!' });
    }

    if (isNaN(playerCount) || playerCount <= 0) {
        return res.status(400).json({ error: 'playerCount phải là một số dương!' });
    }

    const matchData = {
        largeFieldAddress,
        smallFieldAddress,
        time,
        ownerName,
        playerCount,
        remainingPlayerCount: playerCount, // Số lượng còn lại player có thể join vào open match
        notes,
        questions,
        ownerId, // Lưu ownerId cùng với dữ liệu trận đấu
        images, // Danh sách hình ảnh
        createdAt: new Date().toISOString()
    };

    try {
        const matchRef = admin.database().ref('matches').push(); // Tạo ID mới cho trận đấu
        await matchRef.set(matchData); // Lưu trận đấu vào DB
        res.status(201).json({ id: matchRef.key, ...matchData }); // Trả về thông tin trận đấu
    } catch (error) {
        console.error('Error creating match:', error);
        res.status(500).json({ error: 'Có lỗi xảy ra khi tạo trận đấu!' });
    }
};

// Hàm để player join vào trận đấu
exports.joinMatch = async (req, res) => {
    const { matchId, playerId } = req.body;

    try {
        const matchRef = admin.database().ref(`matches/${matchId}`);
        const snapshot = await matchRef.once('value');

        if (!snapshot.exists()) {
            return res.status(404).json({ error: 'Match not found' });
        }

        const matchData = snapshot.val();
        if (matchData.remainingPlayerCount <= 0) {
            return res.status(400).json({ error: 'No remaining slots for players' });
        }

        // Cập nhật số lượng player còn lại
        matchData.remainingPlayerCount -= 1;
        await matchRef.update(matchData);

        // Gửi thông báo cho field owner
        const ownerNotificationRef = admin.database().ref(`notifications/${matchData.ownerId}`).push();
        await ownerNotificationRef.set({
            message: `Player ${playerId} has joined your match.`,
            matchId,
            timestamp: new Date().toISOString()
        });

        res.status(200).json({ message: 'Joined match successfully', match: matchData });
    } catch (error) {
        console.error('Error joining match:', error);
        res.status(500).json({ error: 'Could not join match' });
    }
};

// Hàm để field owner chấp nhận player tham gia trận đấu
exports.acceptPlayer = async (req, res) => {
    const { matchId, playerId } = req.body;

    try {
        const matchRef = admin.database().ref(`matches/${matchId}`);
        const snapshot = await matchRef.once('value');

        if (!snapshot.exists()) {
            return res.status(404).json({ error: 'Match not found' });
        }

        // Gửi thông báo cho player
        const playerNotificationRef = admin.database().ref(`notifications/${playerId}`).push();
        await playerNotificationRef.set({
            message: `You have been accepted to join the match ${matchId}.`,
            matchId,
            timestamp: new Date().toISOString()
        });

        res.status(200).json({ message: 'Player accepted successfully' });
    } catch (error) {
        console.error('Error accepting player:', error);
        res.status(500).json({ error: 'Could not accept player' });
    }
};

// Hàm lấy danh sách trận đấu mở do chủ sân tạo
exports.getMatchesByOwner = async (req, res) => {
    const { ownerId } = req.params;

    try {
        const snapshot = await admin.database().ref('matches').orderByChild('ownerId').equalTo(ownerId).once('value'); // Lấy dữ liệu trận đấu
        const matches = snapshot.val() || {}; // Chuyển đổi dữ liệu thành đối tượng
        const matchList = Object.keys(matches).map(key => ({ id: key, ...matches[key] })); // Chuyển đổi đối tượng thành mảng
        res.status(200).json(matchList); // Trả về danh sách trận đấu
    } catch (error) {
        console.error("Error fetching matches by owner:", error);
        res.status(500).json({ error: 'Có lỗi xảy ra khi lấy danh sách trận đấu!' });
    }
};

// Lấy thông tin trận đấu theo ID
exports.getMatchById = async (req, res) => {
    const matchId = req.params.id;

    try {
        const matchRef = admin.database().ref(`matches/${matchId}`);
        const snapshot = await matchRef.once('value'); // Lấy dữ liệu trận đấu

        if (!snapshot.exists()) {
            return res.status(404).json({ error: 'Match not found' }); // Nếu không tìm thấy trận đấu
        }

        const matchData = snapshot.val();
        res.status(200).json(matchData); // Trả về dữ liệu trận đấu
    } catch (error) {
        console.error('Error fetching match:', error);
        res.status(500).json({ error: 'Could not fetch match' }); // Xử lý lỗi
    }
};

// Hàm cập nhật trận đấu
exports.editMatch = async (req, res) => {
    const matchId = req.params.id;
    const updatedData = req.body; // Dữ liệu mới từ yêu cầu
    const ownerId = req.user.uid; // Lấy ownerId từ thông tin người dùng đã xác thực

    try {
        const matchRef = admin.database().ref(`matches/${matchId}`);
        const snapshot = await matchRef.once('value');

        if (!snapshot.exists()) {
            return res.status(404).json({ error: 'Match not found' });
        }

        const matchData = snapshot.val();
        if (matchData.ownerId !== ownerId) {
            return res.status(403).json({ error: 'You are not authorized to edit this match' });
        }

        await matchRef.update(updatedData); // Cập nhật dữ liệu trận đấu

        res.status(200).json({ message: 'Match updated successfully', match: { id: matchId, ...updatedData } });
    } catch (error) {
        console.error('Error updating match:', error);
        res.status(500).json({ error: 'Could not update match' });
    }
};

// Hàm xóa trận đấu
exports.removeMatch = async (req, res) => {
    const matchId = req.params.id;
    const ownerId = req.user.uid; // Lấy ownerId từ thông tin người dùng đã xác thực

    try {
        const matchRef = admin.database().ref(`matches/${matchId}`);
        const snapshot = await matchRef.once('value');

        if (!snapshot.exists()) {
            return res.status(404).json({ error: 'Match not found' });
        }

        const matchData = snapshot.val();
        if (matchData.ownerId !== ownerId) {
            return res.status(403).json({ error: 'You are not authorized to remove this match' });
        }

        await matchRef.remove(); // Xóa trận đấu

        res.status(200).json({ message: 'Match removed successfully' });
    } catch (error) {
        console.error('Error removing match:', error);
        res.status(500).json({ error: 'Could not remove match' });
    }
};