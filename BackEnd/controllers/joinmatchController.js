const admin = require('../firebase'); // Import Firebase Admin SDK
const Match = require('../models/Match'); // Import Match class

// Check if the player has already joined the match
const isPlayerAlreadyJoined = (matchData, playerId) => {
    // Check in the players list
    if (matchData.players && matchData.players.includes(playerId)) {
        return true;
    }
    // Check in the waitingList (may be pending approval)
    if (matchData.waitingList && matchData.waitingList.some(player => player.playerId === playerId && player.status === 0)) {
        return true;
    }
    return false;
};

// Add player to matchSlot with status 0 (pending approval)
const addToMatchSlot = async (matchId, playerId, status) => {
    const matchSlotRef = admin.database().ref(`matchSlots/${matchId}`);
    const matchSlotSnapshot = await matchSlotRef.once('value');
    const matchSlotData = matchSlotSnapshot.val() || [];

    matchSlotData.push({ playerId, status });
    await matchSlotRef.set(matchSlotData);
};

// Add player to the players list of the match
const addPlayerToMatch = async (matchRef, matchData, playerId) => {
    if (!matchData.players) matchData.players = [];
    matchData.players.push(playerId);
    matchData.remainingPlayerCount -= 1;
    await matchRef.update(matchData);
};

// Send notification to the owner
const sendNotificationToOwner = async (ownerId, playerId, matchId) => {
    const fullName = await getPlayerName(playerId);
    const ownerNotificationRef = admin.database().ref(`notifications/${ownerId}`).push();
    await ownerNotificationRef.set({
        message: ` ${fullName} has requested to join your match.`,
        matchId,
        timestamp: new Date().toISOString()
    });
};

// Send notification to player
const sendNotificationToPlayer = async (playerId, matchId, message) => {
    const playerNotificationRef = admin.database().ref(`notifications/${playerId}`).push();
    await playerNotificationRef.set({
        message,
        matchId,
        timestamp: new Date().toISOString()
    });
};

// Function for player to join a match
exports.joinMatch = async (req, res) => {
    const { matchId, playerId } = req.body;

    try {
        const matchRef = admin.database().ref(`matches/${matchId}`);
        const matchSnapshot = await matchRef.once('value');
        if (!matchSnapshot.exists()) return res.status(404).json({ error: 'Match not found' });

        const matchData = matchSnapshot.val();

        // Check if player has already joined the match
        if (isPlayerAlreadyJoined(matchData, playerId)) {
            return res.status(400).json({ error: 'You have already joined this match' });
        }

        // Check if there are remaining slots for players
        if (matchData.remainingPlayerCount <= 0) {
            return res.status(400).json({ error: 'No available spots to join the match' });
        }

        // Add to matchSlot with status 0 (pending approval)
        await addToMatchSlot(matchId, playerId, 0);

        // If approval is required, add to the waiting list
        if (matchData.requiresApproval) {
            await addToWaitingList(matchRef, matchData, playerId, 0);
            return res.status(200).json({ message: 'Added to the approval waiting list', match: matchData });
        }

        // If no approval is required, add directly to the players list
        // await addPlayerToMatch(matchRef, matchData, playerId);

        // Send notification to the owner
        await sendNotificationToOwner(matchData.ownerId, playerId, matchId);

        return res.status(200).json({ message: 'Successfully requested to join the match', match: matchData });
    } catch (error) {
        console.error('Error joining the match:', error);
        return res.status(500).json({ error: 'Unable to join the match', details: error.message });
    }
};

// Function for the owner to accept a player into the match
exports.acceptPlayer = async (req, res) => {
    const { matchId, playerId } = req.body;

    try {
        const matchRef = admin.database().ref(`matches/${matchId}`);
        const matchSnapshot = await matchRef.once('value');
        if (!matchSnapshot.exists()) return res.status(404).json({ error: 'Match not found' });

        const matchData = matchSnapshot.val();
        const matchSlotRef = admin.database().ref(`matchSlots/${matchId}`);
        const matchSlotSnapshot = await matchSlotRef.once('value');
        const matchSlotData = matchSlotSnapshot.val() || [];

        // Find player in matchSlots with status 0 (pending approval)
        const playerIndex = matchSlotData.findIndex(slot => slot.playerId === playerId && slot.status === 0);
        if (playerIndex === -1) {
            return res.status(400).json({ error: 'Player not in matchSlots or does not need approval' });
        }

        // Update player status to 1 (accepted) in matchSlots
        matchSlotData[playerIndex].status = 1;
        await matchSlotRef.set(matchSlotData);

        // Add player to the players list and update remainingPlayerCount
        await addPlayerToMatch(matchRef, matchData, playerId);

        // Send notification to player
        await sendNotificationToPlayer(playerId, matchId, 'You have been accepted to join the match');

        return res.status(200).json({ message: 'Player has been accepted to join', matchId });
    } catch (error) {
        console.error('Error accepting player:', error);
        return res.status(500).json({ error: 'Unable to accept player' });
    }
};

// Function for the owner to reject a player from the match
exports.rejectPlayer = async (req, res) => {
    const { matchId, playerId } = req.body;

    try {
        const matchRef = admin.database().ref(`matches/${matchId}`);
        const matchSnapshot = await matchRef.once('value');
        if (!matchSnapshot.exists()) return res.status(404).json({ error: 'Match not found' });

        const matchData = matchSnapshot.val();
        const matchSlotRef = admin.database().ref(`matchSlots/${matchId}`);
        const matchSlotSnapshot = await matchSlotRef.once('value');
        const matchSlotData = matchSlotSnapshot.val() || [];

        // Find player in matchSlots with status 0 (pending approval)
        const playerIndex = matchSlotData.findIndex(slot => slot.playerId === playerId && slot.status === 0);
        if (playerIndex === -1) {
            return res.status(400).json({ error: 'Player not in matchSlots or does not need approval' });
        }

        // Update player status to 2 (rejected) in matchSlots
        matchSlotData[playerIndex].status = 2;
        await matchSlotRef.set(matchSlotData);

        // Update player status in the waitingList to 2 (rejected)
        const waitingIndex = matchData.waitingList.findIndex(player => player.playerId === playerId);
        if (waitingIndex !== -1) {
            matchData.waitingList[waitingIndex].status = 2;
        }
        await matchRef.update({ waitingList: matchData.waitingList });

        // Send notification to player
        await sendNotificationToPlayer(playerId, matchId, 'You have been rejected from joining the match');

        return res.status(200).json({ message: 'Player has been rejected from the match', matchId });
    } catch (error) {
        console.error('Error rejecting player:', error);
        return res.status(500).json({ error: 'Unable to reject player' });
    }
};

exports.cancelJoinMatch = async (req, res) => {
    const { matchId, playerId } = req.body;

    try {
        const matchRef = admin.database().ref(`matches/${matchId}`);
        const matchSnapshot = await matchRef.once('value');
        if (!matchSnapshot.exists()) return res.status(404).json({ error: 'Match not found' });

        const matchData = matchSnapshot.val();
        const matchSlotRef = admin.database().ref(`matchSlots/${matchId}`);
        const matchSlotSnapshot = await matchSlotRef.once('value');
        const matchSlotData = matchSlotSnapshot.val() || [];

        // Check if player is in matchSlots with status 1 (joined)
        const playerIndex = matchSlotData.findIndex(slot => slot.playerId === playerId);
        if (playerIndex !== -1) {
            // If player is in matchSlots, remove them
            matchSlotData.splice(playerIndex, 1);
            await matchSlotRef.set(matchSlotData);  // Update matchSlots
        }

        // Check if player is in the players list (and status is 1)
        const playerIndexInPlayers = matchData.players?.indexOf(playerId);
        if (playerIndexInPlayers !== -1) {
            // Remove player from players list
            matchData.players.splice(playerIndexInPlayers, 1);
            matchData.remainingPlayerCount += 1;  // Adjust remaining player count
        } else if (matchData.waitingList && matchData.waitingList.some(player => player.playerId === playerId && player.status === 1)) {
            // If player is in waitingList and has been accepted (status 1)
            matchData.waitingList = matchData.waitingList.filter(player => player.playerId !== playerId);
        } else {
            return res.status(400).json({ error: 'You cannot cancel participation if not accepted or not in the list' });
        }

        // Update matchRef with updated players and waitingList
        await matchRef.update(matchData);

        const fullName = await getPlayerName(playerId);
        // Send notification to the owner if player cancels
        const ownerNotificationRef = admin.database().ref(`notifications/${matchData.ownerId}`).push();
        await ownerNotificationRef.set({
            message: `${fullName} has canceled their participation in your match.`,
            matchId,
            timestamp: new Date().toISOString()
        });

        res.status(200).json({ message: 'Successfully canceled participation in the match', match: matchData });
    } catch (error) {
        console.error('Error canceling participation in the match:', error);
        res.status(500).json({ error: 'Unable to cancel participation in the match', details: error.message });
    }
};

exports.getJoinRequests = async (req, res) => {
    const { matchId } = req.params; // matchId passed in URL

    try {
        const matchSlotRef = admin.database().ref(`matchSlots/${matchId}`);
        const matchSlotSnapshot = await matchSlotRef.once('value');
        if (!matchSlotSnapshot.exists()) return res.status(404).json({ error: 'Match not found' });

        const matchSlotData = matchSlotSnapshot.val();

        // Filter matchSlots to get players with status "pending approval" (status = 0)
        const pendingRequests = matchSlotData.filter(slot => slot.status === 0);

        // If no join requests
        if (pendingRequests.length === 0) {
            return res.status(200).json({ message: 'No join requests', pendingRequests });
        }

        return res.status(200).json({ pendingRequests });
    } catch (error) {
        console.error('Error getting join requests:', error);
        return res.status(500).json({ error: 'Unable to get join requests', details: error.message });
    }
};

// Function to get player's name from Firebase
const getPlayerName = async (userId) => {
    try {
        const userSnapshot = await admin.database().ref(`users/${userId}`).once('value');
        const userData = userSnapshot.val();
        if (userData && userData.fullName) {
            return userData.fullName;
        }
        return 'Player';  // Return 'Player' if no name found
    } catch (error) {
        console.error("Error fetching player name:", error);
        return 'Player';  // Return 'Player' if there is an error
    }
};

// Get player's match history
exports.getPlayerMatchHistory = async (req, res) => {
    const { playerId } = req.params; // Get playerId from URL
    
    if (!playerId) {
        return res.status(400).json({ error: 'Missing playerId' });
    }   

    try {
        // Query matchSlots to get a list of matches the player has joined
        const matchSlotsRef = admin.database().ref('matchSlots');
        const matchSlotsSnapshot = await matchSlotsRef.once('value');
        const matchSlotsData = matchSlotsSnapshot.val();

        if (!matchSlotsData) {
            return res.status(200).json({ message: 'No participation history', history: [] });
        }

        // Filter matches where the player participated
        const playerMatches = Object.keys(matchSlotsData).filter(matchId =>
            matchSlotsData[matchId].some(slot => slot.playerId === playerId)
        );

        if (playerMatches.length === 0) {
            return res.status(200).json({ message: 'No participation history', history: [] });
        }

        // Get detailed match information from the matches list
        const matchesRef = admin.database().ref('matches');
        const matchesSnapshot = await matchesRef.once('value');
        const matchesData = matchesSnapshot.val();

        const history = playerMatches.map(matchId => {
            const match = matchesData[matchId];
            const slot = matchSlotsData[matchId].find(slot => slot.playerId === playerId);

            return {
                matchId,
                name: match.name,
                location: match.location,
                time: match.time,
                status: slot.status, // Status: 0 (pending approval), 1 (joined), 2 (rejected)
                ownerId: match.ownerId,
            };
        });

        return res.status(200).json({ history });
    } catch (error) {
        console.error('Error fetching match history:', error);
        return res.status(500).json({ error: 'Unable to fetch match history', details: error.message });
    }
};
