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
}

module.exports = Match;