// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyANh_Z9pT082LfMkdT6KK_gLffc-gjVahM",
  authDomain: "todo-app-e7255.firebaseapp.com",
  projectId: "todo-app-e7255",
  storageBucket: "todo-app-e7255.firebasestorage.app",
  messagingSenderId: "308819457605",
  appId: "1:308819457605:web:00386597c003d98116552c",
  measurementId: "G-Z39QEWYWNG",
};


const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
