const admin = require('../firebase'); // Import Firebase Admin SDK
const Match = require('../models/Match'); // Import lớp Match


    // Hàm để player tham gia trận đấu
exports.joinMatch = async (req, res) => {
    const { matchId, playerId } = req.body;

    try {
        const matchRef = admin.database().ref(`matches/${matchId}`);
        const snapshot = await matchRef.once('value');

        if (!snapshot.exists()) {
            return res.status(404).json({ error: 'Match not found' });
        }

        const matchData = snapshot.val();

        // Kiểm tra nếu player đã tham gia trận đấu, có trong danh sách chính hoặc danh sách chờ
        if ((matchData.players && matchData.players.includes(playerId)) ||
            (matchData.waitingList && matchData.waitingList.includes(playerId))) {
            return res.status(400).json({ error: 'Bạn đã tham gia trận đấu này rồi' });
        }

        // Nếu cần phê duyệt, thêm vào danh sách chờ
        if (matchData.requiresApproval) {
            if (!matchData.waitingList) {
                matchData.waitingList = [];
            }

            matchData.waitingList.push(playerId);
            await matchRef.update(matchData);

            return res.status(200).json({ message: 'Added to waiting list', match: matchData });
        }

        // Nếu không cần phê duyệt, thêm trực tiếp vào danh sách players
        if (!matchData.players) {
            matchData.players = [];
        }

        matchData.players.push(playerId);
        matchData.remainingPlayerCount -= 1;
        await matchRef.update(matchData);

        // Gửi thông báo cho chủ sân
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

 // Hàm để player hủy tham gia trận đấu
 exports. cancelJoinMatch = async (req, res) => {
    const { matchId, playerId } = req.body;

    try {
        const matchRef = admin.database().ref(`matches/${matchId}`);
        const snapshot = await matchRef.once('value');

        if (!snapshot.exists()) {
            return res.status(404).json({ error: 'Match not found' });
        }

        const matchData = snapshot.val();

        // Kiểm tra nếu player có trong danh sách chính hoặc danh sách chờ
        if (matchData.players && matchData.players.includes(playerId)) {
            // Nếu player có trong danh sách chính, xóa khỏi danh sách
            matchData.players = matchData.players.filter(player => player !== playerId);
            matchData.remainingPlayerCount += 1; // Tăng số lượng người chơi còn lại
        } else if (matchData.waitingList && matchData.waitingList.includes(playerId)) {
            // Nếu player có trong danh sách chờ, xóa khỏi danh sách chờ
            matchData.waitingList = matchData.waitingList.filter(player => player !== playerId);
        } else {
            // Nếu player không có trong cả 2 danh sách
            return res.status(400).json({ error: 'Player not part of this match' });
        }

        // Điều chỉnh số lượng slot người chơi còn lại (nếu cần)
        if (matchData.remainingPlayerCount === 10) {
            matchData.remainingPlayerCount += 1;  // Tăng slot nếu còn 10 người
        }

        // Cập nhật lại dữ liệu trận đấu
        await matchRef.update(matchData);

        // Gửi thông báo cho chủ sân nếu player hủy tham gia
        const ownerNotificationRef = admin.database().ref(`notifications/${matchData.ownerId}`).push();
        await ownerNotificationRef.set({
            message: `Player ${playerId} has cancelled joining your match.`,
            matchId,
            timestamp: new Date().toISOString()
        });

        res.status(200).json({ message: 'Successfully cancelled joining the match', match: matchData });
    } catch (error) {
        console.error('Error cancelling join match:', error);
        res.status(500).json({ error: 'Could not cancel joining match' });
    }
};



    // Hàm để chủ sân chấp nhận player tham gia
    exports. acceptPlayer = async (req, res) => {
        const { matchId, playerId } = req.body;

        try {
            const matchRef = admin.database().ref(`matches/${matchId}`);
            const snapshot = await matchRef.once('value');

            if (!snapshot.exists()) {
                return res.status(404).json({ error: 'Match not found' });
            }

            const matchData = snapshot.val();

            // Kiểm tra xem player có trong waiting list không
            matchData.waitingList = matchData.waitingList || [];
            if (!matchData.waitingList.includes(playerId)) {
                return res.status(400).json({ error: 'Player not found in waiting list' });
            }

            // Xóa player khỏi waiting list và thêm vào danh sách players
            matchData.waitingList = matchData.waitingList.filter(player => player !== playerId);
            matchData.players = matchData.players || [];
            matchData.players.push(playerId);

            // Cập nhật số lượng slot còn lại
            matchData.remainingPlayerCount -= 1;
            await matchRef.update({
                waitingList: matchData.waitingList,
                players: matchData.players,
                remainingPlayerCount: matchData.remainingPlayerCount,
            });

            // Gửi thông báo cho player
            const playerNotificationRef = admin.database().ref(`notifications/${playerId}`).push();
            await playerNotificationRef.set({
                message: `You have been accepted to join match ${matchId}.`,
                matchId,
                timestamp: new Date().toISOString(),
            });

            res.status(200).json({ message: 'Player accepted successfully', matchId });
        } catch (error) {
            console.error('Error in acceptPlayer:', error);
            res.status(500).json({ error: 'Could not accept player' });
        }
    };

    // Hàm để chủ sân từ chối player tham gia
    exports. rejectPlayer = async (req, res) => {
        const { matchId, playerId } = req.body;

        try {
            const matchRef = admin.database().ref(`matches/${matchId}`);
            const snapshot = await matchRef.once('value');

            if (!snapshot.exists()) {
                return res.status(404).json({ error: 'Match not found' });
            }

            const matchData = snapshot.val();

            // Kiểm tra xem player có trong waiting list không
            matchData.waitingList = matchData.waitingList || [];
            if (!matchData.waitingList.includes(playerId)) {
                return res.status(400).json({ error: 'Player not found in waiting list' });
            }

            // Xóa player khỏi waiting list
            matchData.waitingList = matchData.waitingList.filter(player => player !== playerId);
            await matchRef.update({ waitingList: matchData.waitingList });

            // Gửi thông báo cho player
            const playerNotificationRef = admin.database().ref(`notifications/${playerId}`).push();
            await playerNotificationRef.set({
                message: `You have been rejected from joining match ${matchId}.`,
                matchId,
                timestamp: new Date().toISOString(),
            });

            res.status(200).json({ message: 'Player rejected successfully', matchId });
        } catch (error) {
            console.error('Error in rejectPlayer:', error);
            res.status(500).json({ error: 'Could not reject player' });
        }
    };



