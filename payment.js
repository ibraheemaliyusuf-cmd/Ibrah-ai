import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";


// =====================================
// إعدادات Cloudflare Worker
// =====================================

const WORKER_URL =
  "https://ibrah-ai-api.ibraheemaliyusuf.workers.dev";


// =====================================
// مسار طلب الدفع
// يجب أن يطابق Worker النهائي
// =====================================

const PAYMENT_ENDPOINT =
  `${WORKER_URL}/api/payment/request`;


// =====================================
// بيانات الدفع
// =====================================

const PAYMENT_AMOUNT =
  9;

const PAYMENT_CURRENCY =
  "USD";

const PAYMENT_METHOD =
  "wish_money";


// =====================================
// رقم Wish Money
// ضع الرقم الحقيقي هنا قبل الإطلاق
// =====================================

const WISH_MONEY_NUMBER =
  "سيتم إضافة رقم الحساب هنا";


// =====================================
// عناصر الصفحة
// =====================================

const userNameEl =
  document.getElementById(
    "userName"
  );

const userEmailEl =
  document.getElementById(
    "userEmail"
  );

const wishMoneyNumberEl =
  document.getElementById(
    "wishMoneyNumber"
  );

const paymentForm =
  document.getElementById(
    "paymentForm"
  );

const senderNameEl =
  document.getElementById(
    "senderName"
  );

const transactionIdEl =
  document.getElementById(
    "transactionId"
  );

const paymentNoteEl =
  document.getElementById(
    "paymentNote"
  );

const submitPaymentBtn =
  document.getElementById(
    "submitPayment"
  );

const paymentStatusEl =
  document.getElementById(
    "paymentStatus"
  );

const backDashboardBtn =
  document.getElementById(
    "backDashboard"
  );


// =====================================
// عرض رقم Wish Money
// =====================================

if (
  wishMoneyNumberEl
) {

  wishMoneyNumberEl.textContent =
    WISH_MONEY_NUMBER;

}


// =====================================
// العودة إلى Dashboard
// =====================================

if (
  backDashboardBtn
) {

  backDashboardBtn.addEventListener(
    "click",
    () => {

      window.location.href =
        "dashboard.html";

    }
  );

}


// =====================================
// عرض حالة الدفع
// =====================================

function showStatus(
  message,
  type
) {

  if (
    !paymentStatusEl
  ) {

    return;

  }


  paymentStatusEl.textContent =
    message;


  paymentStatusEl.className =
    "payment-status " +
    type;

}


// =====================================
// الحصول على Firebase ID Token
// =====================================

async function getAuthToken(
  user
) {

  if (!user) {

    throw new Error(
      "يجب تسجيل الدخول أولًا."
    );

  }


  const token =
    await user.getIdToken(
      true
    );


  if (!token) {

    throw new Error(
      "تعذر الحصول على رمز المصادقة."
    );

  }


  return token;

}


// =====================================
// تحميل بيانات المستخدم من Firestore
// =====================================

async function loadUserData(
  user
) {

  const userRef =
    doc(
      db,
      "users",
      user.uid
    );


  const userSnap =
    await getDoc(
      userRef
    );


  if (
    !userSnap.exists()
  ) {

    throw new Error(
      "لم يتم العثور على بيانات حسابك."
    );

  }


  return userSnap.data();

}


// =====================================
// مراقبة حالة تسجيل الدخول
// =====================================

onAuthStateChanged(
  auth,
  async (user) => {

    // ---------------------------------
    // المستخدم غير مسجل
    // ---------------------------------

    if (!user) {

      window.location.href =
        "login.html";

      return;

    }


    try {

      // ---------------------------------
      // تحميل بيانات المستخدم
      // ---------------------------------

      const data =
        await loadUserData(
          user
        );


      // ---------------------------------
      // عرض اسم المستخدم
      // ---------------------------------

      if (
        userNameEl
      ) {

        userNameEl.textContent =
          data.name ||
          user.displayName ||
          "مستخدم";

      }


      // ---------------------------------
      // عرض البريد الإلكتروني
      // ---------------------------------

      if (
        userEmailEl
      ) {

        userEmailEl.textContent =
          data.email ||
          user.email ||
          "";

      }


      // ---------------------------------
      // إذا كان Lifetime بالفعل
      // ---------------------------------

      if (
        data.plan ===
        "lifetime"
      ) {

        showStatus(
          "حسابك مفعل بالفعل باشتراك Lifetime ♾️",
          "success"
        );


        if (
          submitPaymentBtn
        ) {

          submitPaymentBtn.disabled =
            true;

          submitPaymentBtn.textContent =
            "الاشتراك مفعل بالفعل";

        }

        return;

      }


      // ---------------------------------
      // إذا كان هناك طلب دفع قيد المراجعة
      // ---------------------------------

      if (
        data.paymentStatus ===
        "pending"
      ) {

        showStatus(
          "لديك طلب دفع قيد المراجعة حاليًا. سيتم إعلامك بعد مراجعة التحويل.",
          "loading"
        );

      }

    } catch (
      error
    ) {

      console.error(
        "PAYMENT USER ERROR:",
        error
      );


      showStatus(
        "تعذر تحميل بيانات الحساب.",
        "error"
      );

    }

  }
);


// =====================================
// إرسال طلب الدفع
// =====================================

if (
  paymentForm
) {

  paymentForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      // ---------------------------------
      // الحصول على المستخدم الحالي
      // ---------------------------------

      const user =
        auth.currentUser;


      if (!user) {

        showStatus(
          "يجب تسجيل الدخول أولًا.",
          "error"
        );

        return;

      }


      // ---------------------------------
      // قراءة بيانات النموذج
      // ---------------------------------

      const senderName =
        senderNameEl
          ?.value
          ?.trim() ||
        "";


      const transactionId =
        transactionIdEl
          ?.value
          ?.trim() ||
        "";


      const paymentNote =
        paymentNoteEl
          ?.value
          ?.trim() ||
        "";


      // ---------------------------------
      // التحقق من اسم صاحب التحويل
      // ---------------------------------

      if (
        !senderName
      ) {

        showStatus(
          "يرجى إدخال اسم صاحب التحويل.",
          "error"
        );

        senderNameEl?.focus();

        return;

      }


      // ---------------------------------
      // التحقق من رقم العملية
      // ---------------------------------

      if (
        !transactionId
      ) {

        showStatus(
          "يرجى إدخال رقم العملية.",
          "error"
        );

        transactionIdEl?.focus();

        return;

      }


      // ---------------------------------
      // منع الإرسال المتكرر
      // ---------------------------------

      if (
        submitPaymentBtn?.disabled
      ) {

        return;

      }


      // ---------------------------------
      // تعطيل الزر
      // ---------------------------------

      if (
        submitPaymentBtn
      ) {

        submitPaymentBtn.disabled =
          true;

        submitPaymentBtn.textContent =
          "جاري إرسال الطلب...";

      }


      showStatus(
        "جاري إرسال طلب الدفع...",
        "loading"
      );


      try {

        // ---------------------------------
        // Firebase ID Token
        // ---------------------------------

        const token =
          await getAuthToken(
            user
          );


        // ---------------------------------
        // إرسال الطلب إلى Worker
        // ---------------------------------

        const response =
          await fetch(
            PAYMENT_ENDPOINT,
            {

              method:
                "POST",

              headers: {

                "Content-Type":
                  "application/json",

                "Authorization":
                  `Bearer ${token}`

              },

              body:
                JSON.stringify({

                  senderName,

                  transactionId,

                  paymentNote,

                  amount:
                    PAYMENT_AMOUNT,

                  currency:
                    PAYMENT_CURRENCY,

                  method:
                    PAYMENT_METHOD

                })

            }
          );


        // ---------------------------------
        // قراءة رد Worker
        // ---------------------------------

        const rawText =
          await response.text();


        let result;


        try {

          result =
            JSON.parse(
              rawText
            );

        } catch {

          throw new Error(
            "الخادم أعاد استجابة غير صالحة."
          );

        }


        // ---------------------------------
        // معالجة الأخطاء
        // ---------------------------------

        if (
          !response.ok
        ) {

          throw new Error(

            result?.error ||

            result?.message ||

            "حدث خطأ أثناء إرسال طلب الدفع."

          );

        }


        // ---------------------------------
        // نجاح الطلب
        // ---------------------------------

        showStatus(

          result?.message ||

          "تم إرسال طلب الدفع بنجاح. سيتم مراجعة التحويل عبر Telegram وتفعيل الاشتراك بعد الموافقة.",

          "success"

        );


        // ---------------------------------
        // تحديث الزر
        // ---------------------------------

        if (
          submitPaymentBtn
        ) {

          submitPaymentBtn.disabled =
            true;

          submitPaymentBtn.textContent =
            "تم إرسال طلب الدفع";

        }


        // ---------------------------------
        // تعطيل الحقول
        // ---------------------------------

        if (
          senderNameEl
        ) {

          senderNameEl.disabled =
            true;

        }


        if (
          transactionIdEl
        ) {

          transactionIdEl.disabled =
            true;

        }


        if (
          paymentNoteEl
        ) {

          paymentNoteEl.disabled =
            true;

        }


      } catch (
        error
      ) {

        console.error(
          "PAYMENT ERROR:",
          error
        );


        showStatus(

          error.message ||

          "حدث خطأ أثناء إرسال طلب الدفع.",

          "error"

        );


        // ---------------------------------
        // إعادة تفعيل زر الإرسال
        // ---------------------------------

        if (
          submitPaymentBtn
        ) {

          submitPaymentBtn.disabled =
            false;

          submitPaymentBtn.textContent =
            "إرسال طلب الدفع";

        }

      }

    }
  );

}