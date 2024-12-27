const admin = require('../firebase');

class Notification {
    static async notifyFieldOwner(ownerId, notificationData) {
        const notificationRef = await admin.database().ref(`notifications/${ownerId}`).push(notificationData);
        return { id: notificationRef.key, ...notificationData };
    }

    static async notifyPlayer(playerId, notificationData) {
        const notificationRef = await admin.database().ref(`notifications/${playerId}`).push(notificationData);
        return { id: notificationRef.key, ...notificationData };
    }

    // Lấy thông báo cho chủ sân
    static async getNotificationsForOwner(ownerId) {
        const snapshot = await admin.database().ref(`notifications/${ownerId}`).once('value');
        const notifications = snapshot.val() || {};
        return Object.keys(notifications).map(key => ({ id: key, ...notifications[key] }));
    }

    // Lấy thông báo cho người chơi
    static async getNotificationsForPlayer(playerId) {
        const snapshot = await admin.database().ref(`notifications/${playerId}`).once('value');
        const notifications = snapshot.val() || {};
        return Object.keys(notifications).map(key => ({ id: key, ...notifications[key] }));
    }
}

module.exports = Notification;
