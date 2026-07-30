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

const provider = new GoogleAuthProvider();


// ========================================
// تسجيل الدخول بواسطة Google
// ========================================

export async function loginGoogle() {

  try {

    // ------------------------------------
    // 1. تسجيل الدخول بواسطة Google
    // ------------------------------------

    const result = await signInWithPopup(auth, provider);

    const user = result.user;

    console.log("================================");
    console.log("LOGIN SUCCESS");
    console.log("UID:", user.uid);
    console.log("NAME:", user.displayName);
    console.log("EMAIL:", user.email);
    console.log("================================");


    // ------------------------------------
    // 2. عرض معلومات تسجيل الدخول
    // ------------------------------------

    alert(
      "✅ تم تسجيل الدخول بنجاح\n\n" +
      "الاسم: " +
      (user.displayName || "") +
      "\n\n" +
      "الإيميل: " +
      (user.email || "") +
      "\n\n" +
      "UID:\n" +
      user.uid
    );


    // ------------------------------------
    // 3. إنشاء مرجع المستخدم في Firestore
    // Collection: users
    // Document ID: user.uid
    // ------------------------------------

    const ref = doc(db, "users", user.uid);


    console.log("Checking Firestore user document...");


    // ------------------------------------
    // 4. البحث عن المستخدم
    // ------------------------------------

    const snap = await getDoc(ref);


    // ------------------------------------
    // 5. إذا كان المستخدم جديدًا
    // ------------------------------------

    if (!snap.exists()) {

      console.log("USER DOCUMENT DOES NOT EXIST");

      // تاريخ انتهاء التجربة
      // 3 أيام من تاريخ التسجيل

      const end = new Date();

      end.setDate(end.getDate() + 3);


      // ----------------------------------
      // إنشاء حساب المستخدم في Firestore
      // ----------------------------------

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


      console.log(
        "USER DOCUMENT CREATED SUCCESSFULLY"
      );


      // ----------------------------------
      // رسالة نجاح
      // ----------------------------------

      alert(
        "✅ ممتاز!\n\n" +
        "تم تسجيل الدخول بنجاح.\n\n" +
        "وتم إنشاء المستخدم في Firestore بنجاح.\n\n" +
        "Collection: users\n\n" +
        "UID:\n" +
        user.uid +
        "\n\n" +
        "سيتم الانتقال إلى لوحة التحكم بعد 5 ثوانٍ."
      );


    } else {


      // ----------------------------------
      // المستخدم موجود مسبقًا
      // ----------------------------------

      console.log(
        "USER DOCUMENT ALREADY EXISTS"
      );


      console.log(
        "Existing user data:",
        snap.data()
      );


      alert(
        "ℹ️ تسجيل الدخول ناجح.\n\n" +
        "هذا المستخدم موجود مسبقًا في Firestore.\n\n" +
        "Collection: users\n\n" +
        "UID:\n" +
        user.uid +
        "\n\n" +
        "سيتم الانتقال إلى لوحة التحكم بعد 5 ثوانٍ."
      );

    }


    // ------------------------------------
    // 6. انتظار 5 ثوانٍ
    // ------------------------------------

    await new Promise(
      resolve => setTimeout(resolve, 5000)
    );


    // ------------------------------------
    // 7. الانتقال إلى Dashboard
    // ------------------------------------

    console.log(
      "Redirecting to dashboard.html..."
    );

    location.href = "dashboard.html";


  } catch (error) {


    // ====================================
    // خطأ في تسجيل الدخول أو Firestore
    // ====================================

    console.error(
      "================================"
    );

    console.error(
      "AUTH / FIRESTORE ERROR"
    );

    console.error(
      "Error code:",
      error.code
    );

    console.error(
      "Error message:",
      error.message
    );

    console.error(
      "Full error:",
      error
    );

    console.error(
      "================================"
    );


    // ------------------------------------
    // عرض الخطأ للمستخدم
    // ------------------------------------

    alert(

      "❌ حدث خطأ\n\n" +

      "رمز الخطأ:\n" +

      (error.code || "غير معروف") +

      "\n\n" +

      "رسالة الخطأ:\n" +

      (error.message || "حدث خطأ غير معروف") +

      "\n\n" +

      "افتح Console لمعرفة التفاصيل."

    );

  }

}


// ========================================
// تسجيل الخروج
// ========================================

export async function logout() {

  try {

    await signOut(auth);

    console.log(
      "LOGOUT SUCCESS"
    );

    // بعد تسجيل الخروج
    // العودة إلى صفحة تسجيل الدخول

    location.href = "index.html";


  } catch (error) {

    console.error(
      "LOGOUT ERROR:",
      error
    );

    alert(
      "❌ حدث خطأ أثناء تسجيل الخروج\n\n" +
      error.message
    );

  }

}


// ========================================
// مراقبة حالة تسجيل الدخول
// ========================================

export function authState(callback) {

  return onAuthStateChanged(

    auth,

    (user) => {

      if (user) {

        console.log(
          "AUTH STATE: USER LOGGED IN"
        );

        console.log(
          "UID:",
          user.uid
        );

        console.log(
          "EMAIL:",
          user.email
        );

      } else {

        console.log(
          "AUTH STATE: NO USER"
        );

      }


      // إرسال حالة المستخدم
      // إلى الصفحة التي استدعت authState

      callback(user);

    }

  );

}
