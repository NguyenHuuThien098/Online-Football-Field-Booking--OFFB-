const admin = require('../firebase'); // Import Firebase Admin SDK
const Match = require('../models/Match'); // Import lớp Match

// Kiểm tra nếu player đã tham gia trận đấu
const isPlayerAlreadyJoined = (matchData, playerId) => {
    // Kiểm tra trong danh sách players
    if (matchData.players && matchData.players.includes(playerId)) {
        return true;
    }
    // Kiểm tra trong danh sách waitingList (có thể chờ phê duyệt)
    if (matchData.waitingList && matchData.waitingList.some(player => player.playerId === playerId && player.status === 0)) {
        return true;
    }
    return false;
};

// Thêm player vào matchSlot với trạng thái 0 (chờ phê duyệt)
const addToMatchSlot = async (matchId, playerId, status) => {
    const matchSlotRef = admin.database().ref(`matchSlots/${matchId}`);
    const matchSlotSnapshot = await matchSlotRef.once('value');
    const matchSlotData = matchSlotSnapshot.val() || [];

    matchSlotData.push({ playerId, status });
    await matchSlotRef.set(matchSlotData);
};

// Thêm player vào danh sách players của trận đấu
const addPlayerToMatch = async (matchRef, matchData, playerId) => {
    if (!matchData.players) matchData.players = [];
    matchData.players.push(playerId);
    matchData.remainingPlayerCount -= 1;
    await matchRef.update(matchData);
};

// Gửi thông báo cho chủ sân
const sendNotificationToOwner = async (ownerId, playerId, matchId) => {
    const ownerNotificationRef = admin.database().ref(`notifications/${ownerId}`).push();
    await ownerNotificationRef.set({
        message: `Player ${playerId} đã tham gia trận đấu của bạn.`,
        matchId,
        timestamp: new Date().toISOString()
    });
};

// Gửi thông báo cho player
const sendNotificationToPlayer = async (playerId, matchId, message) => {
    const playerNotificationRef = admin.database().ref(`notifications/${playerId}`).push();
    await playerNotificationRef.set({
        message,
        matchId,
        timestamp: new Date().toISOString()
    });
};

// Hàm để player tham gia trận đấu
exports.joinMatch = async (req, res) => {
    const { matchId, playerId } = req.body;

    try {
        const matchRef = admin.database().ref(`matches/${matchId}`);
        const matchSnapshot = await matchRef.once('value');
        if (!matchSnapshot.exists()) return res.status(404).json({ error: 'Không tìm thấy trận đấu' });

        const matchData = matchSnapshot.val();

        // Kiểm tra nếu player đã tham gia trận đấu
        if (isPlayerAlreadyJoined(matchData, playerId)) {
            return res.status(400).json({ error: 'Bạn đã tham gia trận đấu này rồi' });
        }

        // Kiểm tra số lượng người chơi còn lại
        if (matchData.remainingPlayerCount <= 0) {
            return res.status(400).json({ error: 'Không còn chỗ trống để tham gia trận đấu' });
        }

        // Thêm vào matchSlot với trạng thái 0 (chờ phê duyệt)
        await addToMatchSlot(matchId, playerId, 0);

        // Nếu cần phê duyệt, thêm vào danh sách chờ
        if (matchData.requiresApproval) {
            await addToWaitingList(matchRef, matchData, playerId, 0);
            return res.status(200).json({ message: 'Đã thêm vào danh sách chờ phê duyệt', match: matchData });
        }

        // Nếu không cần phê duyệt, thêm trực tiếp vào danh sách players
        // await addPlayerToMatch(matchRef, matchData, playerId);

        // Gửi thông báo cho chủ sân
        await sendNotificationToOwner(matchData.ownerId, playerId, matchId);

        return res.status(200).json({ message: 'Đã yêu cầu tham gia trận đấu thành công', match: matchData });
    } catch (error) {
        console.error('Lỗi khi tham gia trận đấu:', error);
        return res.status(500).json({ error: 'Không thể tham gia trận đấu', details: error.message });
    }
};

// Hàm để chủ sân chấp nhận player tham gia
exports.acceptPlayer = async (req, res) => {
    const { matchId, playerId } = req.body;

    try {
        const matchRef = admin.database().ref(`matches/${matchId}`);
        const matchSnapshot = await matchRef.once('value');
        if (!matchSnapshot.exists()) return res.status(404).json({ error: 'Không tìm thấy trận đấu' });

        const matchData = matchSnapshot.val();
        const matchSlotRef = admin.database().ref(`matchSlots/${matchId}`);
        const matchSlotSnapshot = await matchSlotRef.once('value');
        const matchSlotData = matchSlotSnapshot.val() || [];

        // Tìm player trong matchSlots với trạng thái 0 (chờ phê duyệt)
        const playerIndex = matchSlotData.findIndex(slot => slot.playerId === playerId && slot.status === 0);
        if (playerIndex === -1) {
            return res.status(400).json({ error: 'Player không có trong matchSlots hoặc không cần phê duyệt' });
        }

        // Cập nhật trạng thái player thành 1 (đã chấp nhận) trong matchSlots
        matchSlotData[playerIndex].status = 1;
        await matchSlotRef.set(matchSlotData);

        // Thêm player vào danh sách players và cập nhật remainingPlayerCount
        await addPlayerToMatch(matchRef, matchData, playerId);

        // Gửi thông báo cho player
        await sendNotificationToPlayer(playerId, matchId, 'Bạn đã được chấp nhận tham gia trận đấu');

        return res.status(200).json({ message: 'Player đã được chấp nhận tham gia', matchId });
    } catch (error) {
        console.error('Lỗi khi chấp nhận player:', error);
        return res.status(500).json({ error: 'Không thể chấp nhận player' });
    }
};

// Hàm để chủ sân từ chối player tham gia
exports.rejectPlayer = async (req, res) => {
    const { matchId, playerId } = req.body;

    try {
        const matchRef = admin.database().ref(`matches/${matchId}`);
        const matchSnapshot = await matchRef.once('value');
        if (!matchSnapshot.exists()) return res.status(404).json({ error: 'Không tìm thấy trận đấu' });

        const matchData = matchSnapshot.val();
        const matchSlotRef = admin.database().ref(`matchSlots/${matchId}`);
        const matchSlotSnapshot = await matchSlotRef.once('value');
        const matchSlotData = matchSlotSnapshot.val() || [];

        // Tìm player trong matchSlots với trạng thái 0 (chờ phê duyệt)
        const playerIndex = matchSlotData.findIndex(slot => slot.playerId === playerId && slot.status === 0);
        if (playerIndex === -1) {
            return res.status(400).json({ error: 'Player không có trong matchSlots hoặc không cần phê duyệt' });
        }

        // Cập nhật trạng thái player thành 2 (bị từ chối) trong matchSlots
        matchSlotData[playerIndex].status = 2;
        await matchSlotRef.set(matchSlotData);

        // Cập nhật trạng thái player trong waitingList thành 2 (bị từ chối)
        const waitingIndex = matchData.waitingList.findIndex(player => player.playerId === playerId);
        if (waitingIndex !== -1) {
            matchData.waitingList[waitingIndex].status = 2;
        }
        await matchRef.update({ waitingList: matchData.waitingList });

        // Gửi thông báo cho player
        await sendNotificationToPlayer(playerId, matchId, 'Bạn đã bị từ chối tham gia trận đấu');

        return res.status(200).json({ message: 'Player đã bị từ chối tham gia', matchId });
    } catch (error) {
        console.error('Lỗi khi từ chối player:', error);
        return res.status(500).json({ error: 'Không thể từ chối player' });
    }
};

// Hàm để player hủy tham gia trận đấu
exports.cancelJoinMatch = async (req, res) => {
    const { matchId, playerId } = req.body;

    try {
        const matchRef = admin.database().ref(`matches/${matchId}`);
        const matchSnapshot = await matchRef.once('value');
        if (!matchSnapshot.exists()) return res.status(404).json({ error: 'Không tìm thấy trận đấu' });

        const matchData = matchSnapshot.val();

        // Kiểm tra player có trong danh sách players (và trạng thái là 1)
        if (matchData.players && matchData.players.includes(playerId)) {
            // Player đã được xác nhận (trạng thái 1)
            const playerIndex = matchData.players.indexOf(playerId);
            if (playerIndex === -1) {
                return res.status(400).json({ error: 'Player không phải là thành viên của trận đấu' });
            }

            // Xóa player khỏi danh sách players và điều chỉnh số lượng người chơi còn lại
            matchData.players.splice(playerIndex, 1);
            matchData.remainingPlayerCount += 1;

            await matchRef.update(matchData);  // Cập nhật lại danh sách players và remainingPlayerCount

        } else if (matchData.waitingList && matchData.waitingList.some(player => player.playerId === playerId && player.status === 1)) {
            // Player có trong danh sách chờ và đã được chấp nhận (trạng thái 1)
            matchData.waitingList = matchData.waitingList.filter(player => player.playerId !== playerId);

            await matchRef.update(matchData);  // Cập nhật lại danh sách chờ
        } else {
            return res.status(400).json({ error: 'Bạn không thể hủy tham gia nếu chưa được chấp nhận hoặc không có trong danh sách' });
        }

        // Gửi thông báo cho chủ sân nếu player hủy tham gia
        const ownerNotificationRef = admin.database().ref(`notifications/${matchData.ownerId}`).push();
        await ownerNotificationRef.set({
            message: `Player ${playerId} đã hủy tham gia trận đấu của bạn.`,
            matchId,
            timestamp: new Date().toISOString()
        });

        res.status(200).json({ message: 'Đã hủy tham gia trận đấu thành công', match: matchData });
    } catch (error) {
        console.error('Lỗi khi hủy tham gia trận đấu:', error);
        res.status(500).json({ error: 'Không thể hủy tham gia trận đấu', details: error.message });
    }
    
};
exports.getJoinRequests = async (req, res) => {
    const { matchId } = req.params; // matchId được truyền trong URL

    try {
        const matchSlotRef = admin.database().ref(`matchSlots/${matchId}`);
        const matchSlotSnapshot = await matchSlotRef.once('value');
        if (!matchSlotSnapshot.exists()) return res.status(404).json({ error: 'Không tìm thấy trận đấu' });

        const matchSlotData = matchSlotSnapshot.val();

        // Lọc danh sách matchSlots để lấy các player có trạng thái "chờ phê duyệt" (status = 0)
        const pendingRequests = matchSlotData.filter(slot => slot.status === 0);

        // Nếu không có yêu cầu tham gia nào
        if (pendingRequests.length === 0) {
            return res.status(200).json({ message: 'Không có yêu cầu tham gia nào', pendingRequests });
        }

        return res.status(200).json({ pendingRequests });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách yêu cầu tham gia:', error);
        return res.status(500).json({ error: 'Không thể lấy danh sách yêu cầu tham gia', details: error.message });
    }
};
