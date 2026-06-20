import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCkakDUvO9xSzZij1cPokAdf824kdo2MvM",
  authDomain: "gen-lang-client-0152918902.firebaseapp.com",
  projectId: "gen-lang-client-0152918902",
  storageBucket: "gen-lang-client-0152918902.firebasestorage.app",
  messagingSenderId: "326485004036",
  appId: "1:326485004036:web:05342164be1a9210bbca51"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with the specific database if needed, or default
export const db = getFirestore(app, "ai-studio-de1ea18b-e3ae-4848-839e-ef4641a8afc3");
export const auth = getAuth(app);
