// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC7AfOLir6sczd58xv5RizBHwy-WM20qDg",
  authDomain: "shapa-e2622.firebaseapp.com",
  projectId: "shapa-e2622",
  storageBucket: "shapa-e2622.firebasestorage.app",
  messagingSenderId: "185139372742",
  appId: "1:185139372742:web:edcf55cc7e97c20079adc7",
  measurementId: "G-SE9M0QQ429"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
