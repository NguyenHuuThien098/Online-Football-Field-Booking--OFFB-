const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification'); // Module Notification

// Lấy thông báo cho chủ sân
router.get('/owner/:ownerId', async (req, res) => {
    const { ownerId } = req.params;

    try {
        const notifications = await Notification.getNotificationsForOwner(ownerId);
        res.status(200).json({ success: true, notifications });
    } catch (error) {
        console.error('Error fetching owner notifications:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch notifications for owner.' });
    }
});

// Lấy thông báo cho người chơi
router.get('/player/:playerId', async (req, res) => {
    const { playerId } = req.params;

    try {
        const notifications = await Notification.getNotificationsForPlayer(playerId);
        res.status(200).json({ success: true, notifications });
    } catch (error) {
        console.error('Error fetching player notifications:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch notifications for player.' });
    }
});

module.exports = router;
