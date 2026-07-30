import { auth, db } from "./firebase.js";

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";


const provider = new GoogleAuthProvider();


export async function loginGoogle() {

  try {

    console.log("1. Starting Google login...");

    const result = await signInWithPopup(auth, provider);

    const user = result.user;

    console.log("2. Google login successful");
    console.log("UID:", user.uid);
    console.log("Email:", user.email);


    const ref = doc(db, "users", user.uid);

    console.log("3. Checking Firestore user document...");

    const snap = await getDoc(ref);

    console.log("4. Firestore check completed");
    console.log("Document exists:", snap.exists());


    if (!snap.exists()) {

      console.log("5. User does not exist. Creating document...");

      const end = new Date();

      end.setDate(end.getDate() + 3);


      await setDoc(ref, {

        uid: user.uid,

        name: user.displayName || "",

        email: user.email || "",

        photo: user.photoURL || "",

        plan: "trial",

        status: "active",

        createdAt: serverTimestamp(),

        trialEndsAt: end,

        requests: 0,

        history: []

      });


      console.log("6. SUCCESS: User document created!");

    } else {

      console.log("6. User document already exists.");

    }


    console.log("7. Redirecting to dashboard...");

    window.location.href = "dashboard.html";


  } catch (error) {

    console.error("================================");

    console.error("AUTH / FIRESTORE ERROR");

    console.error("Error code:", error.code);

    console.error("Error message:", error.message);

    console.error("Full error:", error);

    console.error("================================");


    alert(
      "حدث خطأ:\n\n" +
      error.code +
      "\n\n" +
      error.message
    );

  }

}


export function logout() {

  return signOut(auth);

}


export function authState(callback) {

  return onAuthStateChanged(auth, callback);

}