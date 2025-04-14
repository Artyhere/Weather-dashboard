// Import Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getDatabase, ref, onValue, set, get } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDpxzKCvYG_PvPLFoQUVHVoVXYI-MLcLXE",
    authDomain: "weather-dashboard-counter.firebaseapp.com",
    projectId: "weather-dashboard-counter",
    storageBucket: "weather-dashboard-counter.appspot.com",
    messagingSenderId: "346170517750",
    appId: "1:346170517750:web:8b9b9b9b9b9b9b9b9b9b9b",
    databaseURL: "https://weather-dashboard-counter-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, onValue, set, get }; 