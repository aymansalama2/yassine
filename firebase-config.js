// Configuration Firebase pour ZAINE PARFUM avec Realtime Database
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

const firebaseConfig = {
    apiKey: "AIzaSyBZdUSRqgoE_5HSBkNdgujP8qh9Mz6JTpk",
    authDomain: "tkouk-bc82a.firebaseapp.com",
    databaseURL: "https://tkouk-bc82a-default-rtdb.firebaseio.com/",
    projectId: "tkouk-bc82a",
    storageBucket: "tkouk-bc82a.firebasestorage.app",
    messagingSenderId: "150915449460",
    appId: "1:150915449460:web:f83a70c98282f16cfe4721",
    measurementId: "G-21XZ5ZCGC0"
};

// Initialiser Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

console.log('Firebase Realtime Database initialisé avec succès');
