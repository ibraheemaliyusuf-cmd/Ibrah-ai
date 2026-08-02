// ============================================
// IBRAH AI - Firebase Configuration
// ============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
  getAuth
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";


// ============================================
// Firebase Project Configuration
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSyBJKLVKrj-4QG__eobMZBNzygiYlDzky9Y",
  authDomain: "ibrah-ai.firebaseapp.com",
  projectId: "ibrah-ai",
  storageBucket: "ibrah-ai.firebasestorage.app",
  messagingSenderId: "8866295227",
  appId: "1:8866295227:web:3c7f78864da6ecdfad689e"
};


// ============================================
// Initialize Firebase
// ============================================

const app = initializeApp(firebaseConfig);


// ============================================
// Firebase Authentication
// ============================================

export const auth = getAuth(app);


// ============================================
// Cloud Firestore
// ============================================

export const db = getFirestore(app);


// ============================================
// Export Firebase App
// ============================================

export { app };