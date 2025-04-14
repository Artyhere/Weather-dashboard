// Import Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getDatabase, ref, onValue, set, get } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDpxzKCvYG_PvPLFoQUVHVoVXYI-MLcLXE",
    authDomain: "weather-dashboard-counter.firebaseapp.com",
    databaseURL: "https://weather-dashboard-counter-default-rtdb.firebaseio.com",
    projectId: "weather-dashboard-counter",
    storageBucket: "weather-dashboard-counter.appspot.com",
    messagingSenderId: "346170517750",
    appId: "1:346170517750:web:d4f5f67c93c3b62c9a8d0c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, onValue, set, get }; 