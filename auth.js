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

    const result = await signInWithPopup(auth, provider);

    const user = result.user;

    console.log("LOGIN SUCCESS:", user.uid);

    const ref = doc(db, "users", user.uid);

    const snap = await getDoc(ref);

    if (!snap.exists()) {

      console.log("USER DOCUMENT DOES NOT EXIST");

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

      console.log("USER DOCUMENT CREATED SUCCESSFULLY");

    } else {

      console.log("USER DOCUMENT ALREADY EXISTS");

    }

    location.href = "dashboard.html";

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
