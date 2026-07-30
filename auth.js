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


// ==========================================
// شاشة التشخيص
// ==========================================

function showDebug(message, type = "info") {

  let box = document.getElementById("firebase-debug-box");

  if (!box) {

    box = document.createElement("div");

    box.id = "firebase-debug-box";

    box.style.position = "fixed";
    box.style.top = "10px";
    box.style.left = "10px";
    box.style.right = "10px";
    box.style.zIndex = "999999";

    box.style.background = "#111";
    box.style.color = "#fff";

    box.style.padding = "20px";

    box.style.borderRadius = "12px";

    box.style.fontFamily = "Arial, sans-serif";

    box.style.fontSize = "16px";

    box.style.lineHeight = "1.7";

    box.style.direction = "rtl";

    box.style.boxShadow = "0 5px 30px rgba(0,0,0,0.5)";

    document.body.appendChild(box);

  }

  const line = document.createElement("div");

  if (type === "success") {

    line.style.color = "#00ff88";

  } else if (type === "error") {

    line.style.color = "#ff5555";

  } else {

    line.style.color = "#ffffff";

  }

  line.style.marginBottom = "8px";

  line.textContent = message;

  box.appendChild(line);

}


// ==========================================
// تسجيل الدخول بواسطة Google
// ==========================================

export async function loginGoogle() {

  showDebug("🚀 بدء عملية تسجيل الدخول...");


  try {

    // ======================================
    // الخطوة 1: تسجيل الدخول إلى Google
    // ======================================

    showDebug("1️⃣ جاري فتح تسجيل الدخول بواسطة Google...");

    const result = await signInWithPopup(
      auth,
      provider
    );


    const user = result.user;


    showDebug(
      "✅ تم تسجيل الدخول إلى Google بنجاح",
      "success"
    );


    showDebug(
      "UID: " + user.uid
    );


    showDebug(
      "البريد: " + (user.email || "غير موجود")
    );


    // ======================================
    // الخطوة 2: الوصول إلى Firestore
    // ======================================

    showDebug(
      "2️⃣ جاري الاتصال بـ Firestore..."
    );


    const ref = doc(
      db,
      "users",
      user.uid
    );


    showDebug(
      "مسار المستخدم: users/" + user.uid
    );


    // ======================================
    // الخطوة 3: البحث عن المستخدم
    // ======================================

    showDebug(
      "3️⃣ جاري البحث عن وثيقة المستخدم..."
    );


    const snap = await getDoc(ref);


    showDebug(
      "✅ تم الاتصال بـ Firestore بنجاح",
      "success"
    );


    // ======================================
    // المستخدم غير موجود
    // ======================================

    if (!snap.exists()) {

      showDebug(
        "⚠️ المستخدم غير موجود في Firestore"
      );


      showDebug(
        "4️⃣ جاري إنشاء وثيقة جديدة في users..."
      );


      const end = new Date();


      end.setDate(
        end.getDate() + 3
      );


      const userData = {

        uid: user.uid,

        name:
          user.displayName || "",

        email:
          user.email || "",

        photo:
          user.photoURL || "",

        plan:
          "trial",

        status:
          "active",

        createdAt:
          serverTimestamp(),

        trialEndsAt:
          end,

        requests:
          0,

        history:
          []

      };


      await setDoc(
        ref,
        userData
      );


      showDebug(
        "✅ تم إنشاء المستخدم في Firestore بنجاح",
        "success"
      );


      showDebug(
        "المسار: users/" + user.uid,
        "success"
      );


    } else {


      // ====================================
      // المستخدم موجود مسبقًا
      // ====================================

      showDebug(
        "ℹ️ وثيقة المستخدم موجودة مسبقًا",
        "success"
      );


      showDebug(
        "تم العثور على users/" + user.uid,
        "success"
      );

    }


    // ======================================
    // الخطوة 5: الانتقال إلى Dashboard
    // ======================================

    showDebug(
      "5️⃣ اكتملت عملية تسجيل الدخول بنجاح",
      "success"
    );


    showDebug(
      "⏳ جاري الانتقال إلى لوحة التحكم..."
    );


    setTimeout(
      () => {

        location.href =
          "dashboard.html";

      },
      1500
    );


  } catch (error) {


    // ======================================
    // في حالة حدوث خطأ
    // ======================================

    console.error(
      "AUTH / FIRESTORE ERROR:",
      error
    );


    showDebug(
      "❌ حدث خطأ أثناء تسجيل الدخول",
      "error"
    );


    showDebug(
      "رمز الخطأ: " +
      (error.code || "غير معروف"),
      "error"
    );


    showDebug(
      "رسالة الخطأ: " +
      (error.message || "لا توجد رسالة"),
      "error"
    );


    // ======================================
    // رسائل خاصة بالأخطاء الشائعة
    // ======================================

    if (
      error.code ===
      "permission-denied"
    ) {

      showDebug(
        "🚨 المشكلة في Firestore Security Rules",
        "error"
      );

    }


    if (
      error.code ===
      "auth/popup-closed-by-user"
    ) {

      showDebug(
        "⚠️ تم إغلاق نافذة Google قبل إكمال تسجيل الدخول",
        "error"
      );

    }


    if (
      error.code ===
      "auth/popup-blocked"
    ) {

      showDebug(
        "⚠️ المتصفح منع نافذة تسجيل الدخول المنبثقة",
        "error"
      );

    }


    if (
      error.code ===
      "failed-precondition"
    ) {

      showDebug(
        "🚨 هناك مشكلة في إعداد Firestore أو المشروع",
        "error"
      );

    }


    alert(
      "حدث خطأ أثناء تسجيل الدخول.\n\n" +
      (error.code || "") +
      "\n\n" +
      (error.message || "")
    );

  }

}


// ==========================================
// تسجيل الخروج
// ==========================================

export async function logout() {

  try {

    showDebug(
      "🚪 جاري تسجيل الخروج..."
    );


    await signOut(auth);


    showDebug(
      "✅ تم تسجيل الخروج بنجاح",
      "success"
    );


  } catch (error) {


    console.error(
      "LOGOUT ERROR:",
      error
    );


    showDebug(
      "❌ فشل تسجيل الخروج",
      "error"
    );


    showDebug(
      "رمز الخطأ: " +
      (error.code || "غير معروف"),
      "error"
    );


    showDebug(
      "رسالة الخطأ: " +
      (error.message || "لا توجد رسالة"),
      "error"
    );

  }

}


// ==========================================
// مراقبة حالة تسجيل الدخول
// ==========================================

export function authState(callback) {

  return onAuthStateChanged(
    auth,
    callback
  );

        }
