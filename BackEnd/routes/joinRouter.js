const express = require('express');
const router = express.Router();
const joinmatchController = require('../controllers/joinmatchController');
const { authenticateUser, authorizeRole } = require('../middleware/auth');




// Định tuyến cho player tham gia trận đấu
router.post('/joinm', authenticateUser, authorizeRole(['player', 'field_owner']), joinmatchController.joinMatch);

// Định tuyến cho player hủy tham gia trận đấu

router.delete('/cancel', authenticateUser, authorizeRole(['player']), joinmatchController.cancelJoinMatch);


// Định tuyến cho chủ sân chấp nhận player tham gia
router.post('/accept', authenticateUser, authorizeRole(['field_owner']), joinmatchController.acceptPlayer);

// Định tuyến cho chủ sân từ chối player tham gia
router.post('/reject', authenticateUser, authorizeRole(['field_owner']), joinmatchController.rejectPlayer);

router.get('/:matchId/join-requests', authenticateUser, authorizeRole(['field_owner']), joinmatchController.getJoinRequests);

router.get('/history/:playerId', joinmatchController.getPlayerMatchHistory);
module.exports = router;
