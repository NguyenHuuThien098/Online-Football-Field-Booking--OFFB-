const admin = require('firebase-admin');
const serviceAccount = require('./online-football-field-booking-firebase-adminsdk-1vrpo-056c11aef7.json'); 

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://online-football-field-booking-default-rtdb.firebaseio.com/" // Thay thế bằng URL của bạn
});

module.exports = admin;

