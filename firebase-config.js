// Firebase Web Configuration
// This file initializes Firebase Services for the static HTML/JS website.

const firebaseConfig = {
  apiKey: "AIzaSyCkakDUvO9xSzZij1cPokAdf824kdo2MvM",
  authDomain: "gen-lang-client-0152918902.firebaseapp.com",
  projectId: "gen-lang-client-0152918902",
  storageBucket: "gen-lang-client-0152918902.firebasestorage.app",
  messagingSenderId: "326485004036",
  appId: "1:326485004036:web:05342164be1a9210bbca51",
  measurementId: ""
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Services
const db = firebase.firestore();
const auth = firebase.auth();
