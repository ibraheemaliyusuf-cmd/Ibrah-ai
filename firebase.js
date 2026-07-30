import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const firebaseConfig={

apiKey:"AIzaSyBJKLVKrj-4QG__eobMZBNzygiYlDzkv9Y",

authDomain:"ibrah-ai.firebaseapp.com",

projectId:"ibrah-ai",

storageBucket:"ibrah-ai.firebasestorage.app",

messagingSenderId:"8866295227",

appId:"1:8866295227:web:3c7f78864da6ecdfad689e"

};

const app=initializeApp(firebaseConfig);

export const auth=getAuth(app);

export const db=getFirestore(app);