const admin = require('../firebase');

class Match {
    // Tạo trận đấu
    static async createMatch(data) {
        try {
            const matchRef = admin.database().ref('matches');
            const newMatchRef = matchRef.push(); // Tạo một ID mới cho trận đấu
            await newMatchRef.set(data);
            return { id: newMatchRef.key, ...data }; // Trả về thông tin trận đấu
        } catch (error) {
            console.error('Error creating match:', error);
            throw new Error('Could not create match');
        }
    }

    // Lấy danh sách tất cả các trận đấu
    static async getAllMatches() {
        try {
            const snapshot = await admin.database().ref('matches').once('value');
            const matches = snapshot.val() || {}; // Trả về đối tượng rỗng nếu không có trận đấu
            return matches;
        } catch (error) {
            console.error('Error fetching matches:', error);
            throw new Error('Could not fetch matches');
        }
    }

    // Lấy thông tin một trận đấu theo ID
    static async getMatchById(matchId) {
        try {
            const snapshot = await admin.database().ref(`matches/${matchId}`).once('value');
            const match = snapshot.val(); // Trả về trận đấu nếu tồn tại
            if (!match) {
                throw new Error('Match not found');
            }
            return { id: matchId, ...match };
        } catch (error) {
            console.error('Error fetching match:', error);
            throw new Error('Could not fetch match');
        }
    }

    static joinMatch = async (req, res) => {
        const { matchId, playerId } = req.body;
    
        try {
            const matchRef = admin.database().ref(`matches/${matchId}`);
            const snapshot = await matchRef.once('value');
    
            if (!snapshot.exists()) {
                return res.status(404).json({ error: 'Match not found' });
            }
    
            const matchData = snapshot.val();
    
            // Kiểm tra nếu player đã trong danh sách chờ hoặc danh sách chính
            if ((matchData.players && matchData.players.includes(playerId)) ||
                (matchData.waitingList && matchData.waitingList.includes(playerId))) {
                return res.status(400).json({ error: 'Player is already part of this match' });
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
    
            // Nếu không cần phê duyệt, thêm trực tiếp vào danh sách
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
    
    // Hàm để chủ sân chấp nhận player tham gia
    static acceptPlayer = async (req, res) => {
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
static rejectPlayer = async (req, res) => {
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

}

module.exports = Match;