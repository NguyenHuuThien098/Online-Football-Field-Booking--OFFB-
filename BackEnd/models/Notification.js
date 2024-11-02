const admin = require('../firebase');


class Notification {
    static async notifyFieldOwner(ownerId, notificationData) {
        const notificationRef = await admin.database().ref(`notifications/${ownerId}`).push(notificationData);
        return { id: notificationRef.key, ...notificationData };
    }


    static async getNotificationsForOwner(ownerId) {
        const snapshot = await admin.database().ref(`notifications/${ownerId}`).once('value');
        const notifications = snapshot.val() || {};
        return Object.keys(notifications).map(key => ({ id: key, ...notifications[key] }));
    }
}


module.exports = Notification;