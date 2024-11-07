import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBDBAYuI9QZNE8K4ELhRFbYfaaS5AWXnDk",
    authDomain: "online-football-field-booking.firebaseapp.com",
    databaseURL: "https://online-football-field-booking-default-rtdb.firebaseio.com",
    projectId: "online-football-field-booking",
    storageBucket: "online-football-field-booking.appspot.com",
    messagingSenderId: "496850995857",
    appId: "1:496850995857:web:2ca5e46b884aa1b2928d30",
    measurementId: "G-084ZZXV9T8"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app); // Khởi tạo Realtime Database
const auth = getAuth(app); // Khởi tạo Authentication
auth.languageCode = 'en';
const provider = new GoogleAuthProvider(); // Khởi tạo Google Authentication

const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        // Lưu thông tin người dùng vào localStorage
        localStorage.setItem('userId', user.uid);
        localStorage.setItem('token', await user.getIdToken());
        return user; // Trả về thông tin người dùng
    } catch (error) {
        console.error("Lỗi khi đăng nhập bằng Google:", error);
        throw error;
    }
};

export { database, auth, provider, signInWithGoogle };
