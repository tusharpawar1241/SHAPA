// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// Allows overriding config via environment variables, falling back to defaults
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC7AfOLir6sczd58xv5RizBHwy-WM20qDg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "shapa-e2622.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "shapa-e2622",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "shapa-e2622.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "185139372742",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:185139372742:web:edcf55cc7e97c20079adc7",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-SE9M0QQ429"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Safe-guard analytics initialization to avoid crashes in restricted environments/headless browsers
export let analytics;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
}).catch((err) => {
  console.warn("Firebase Analytics is not supported in this environment:", err);
});
