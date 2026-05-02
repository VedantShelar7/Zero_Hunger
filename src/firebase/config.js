import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * FIREBASE CONFIGURATION GUIDE
 * 1. Go to https://console.firebase.google.com/
 * 2. Create a project named "Zero Hunger"
 * 3. Add a "Web App" to get your config object
 * 4. Replace the values below with your actual keys
 */
const firebaseConfig = {
  apiKey: "AIzaSyDvJjkqY0TQTtMjG9zmv0T2VsUHywR_iSs",
  authDomain: "zerohunger-91139.firebaseapp.com",
  projectId: "zerohunger-91139",
  storageBucket: "zerohunger-91139.firebasestorage.app",
  messagingSenderId: "405297699443",
  appId: "1:405297699443:web:c44b9988ed02a3e09b2806",
  measurementId: "G-VRPMKLGBGX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
