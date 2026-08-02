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


// ========================================
// Google Provider
// ========================================

const provider =
  new GoogleAuthProvider();


// ========================================
// مدة التجربة المجانية
// ========================================

const TRIAL_DAYS = 3;


// ========================================
// تسجيل الدخول بواسطة Google
// ========================================

export async function loginGoogle() {

  try {

    // ------------------------------------
    // تسجيل الدخول عبر Google
    // ------------------------------------

    const result =
      await signInWithPopup(
        auth,
        provider
      );


    const user =
      result.user;


    console.log(
      "Google Login Success:",
      user.uid
    );


    // ------------------------------------
    // مرجع المستخدم في Firestore
    // ------------------------------------

    const userRef =
      doc(
        db,
        "users",
        user.uid
      );


    // ------------------------------------
    // البحث عن المستخدم
    // ------------------------------------

    const userSnap =
      await getDoc(
        userRef
      );


    // ------------------------------------
    // إنشاء المستخدم لأول مرة
    // ------------------------------------

    if (
      !userSnap.exists()
    ) {

      const trialEnd =
        new Date();


      trialEnd.setDate(
        trialEnd.getDate() +
        TRIAL_DAYS
      );


      await setDoc(
        userRef,
        {

          uid:
            user.uid,

          name:
            user.displayName ||
            "",

          email:
            user.email ||
            "",

          photo:
            user.photoURL ||
            "",

          plan:
            "trial",

          status:
            "active",

          createdAt:
            serverTimestamp(),

          trialEndsAt:
            trialEnd,

          requests:
            0,

          history:
            []

        }
      );


      console.log(
        "New user created:",
        user.uid
      );

    } else {

      console.log(
        "Existing user:",
        user.uid
      );

    }


    // ------------------------------------
    // الانتقال مباشرة إلى Dashboard
    // ------------------------------------

    window.location.href =
      "dashboard.html";


  } catch (
    error
  ) {

    console.error(
      "AUTH / FIRESTORE ERROR:",
      error
    );


    // ------------------------------------
    // أخطاء تسجيل الدخول
    // ------------------------------------

    let message =
      "حدث خطأ أثناء تسجيل الدخول.";


    if (
      error.code ===
      "auth/popup-closed-by-user"
    ) {

      message =
        "تم إغلاق نافذة تسجيل الدخول.";

    }


    if (
      error.code ===
      "auth/popup-blocked"
    ) {

      message =
        "تم حظر نافذة تسجيل الدخول. اسمح بالنوافذ المنبثقة ثم حاول مرة أخرى.";

    }


    if (
      error.code ===
      "auth/cancelled-popup-request"
    ) {

      message =
        "تم إلغاء عملية تسجيل الدخول.";

    }


    if (
      error.code ===
      "permission-denied"
    ) {

      message =
        "ليس لديك صلاحية الوصول إلى بيانات الحساب.";

    }


    alert(
      "❌ " +
      message
    );

  }

}


// ========================================
// تسجيل الخروج
// ========================================

export async function logout() {

  try {

    await signOut(
      auth
    );


    console.log(
      "Logout Success"
    );


    // العودة إلى صفحة تسجيل الدخول

    window.location.href =
      "login.html";


  } catch (
    error
  ) {

    console.error(
      "LOGOUT ERROR:",
      error
    );


    alert(
      "❌ حدث خطأ أثناء تسجيل الخروج."
    );

  }

}


// ========================================
// مراقبة حالة تسجيل الدخول
// ========================================

export function authState(
  callback
) {

  return onAuthStateChanged(

    auth,

    (
      user
    ) => {

      if (
        user
      ) {

        console.log(
          "AUTH STATE: USER LOGGED IN",
          user.uid
        );

      } else {

        console.log(
          "AUTH STATE: NO USER"
        );

      }


      if (
        typeof callback ===
        "function"
      ) {

        callback(
          user
        );

      }

    }

  );

}