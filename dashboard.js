// ============================================================
// IBRAH AI — DASHBOARD CONTROLLER
// ============================================================

import { auth, db } from "./firebase.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";


// ============================================================
// عناصر الصفحة
// ============================================================

const nameEl =
  document.getElementById("name");

const emailEl =
  document.getElementById("email");

const photoEl =
  document.getElementById("photo");

const planEl =
  document.getElementById("plan");

const statusEl =
  document.getElementById("status");

const requestsEl =
  document.getElementById("requests");

const trialEl =
  document.getElementById("trial");


// أزرار الترقية
const upgradeBtn =
  document.getElementById("upgrade");

const upgradeBottomBtn =
  document.getElementById("upgradeBottom");


// زر تسجيل الخروج
const logoutBtn =
  document.getElementById("logout");


// زر المحادثة الجديدة
const newChatBtn =
  document.getElementById("newChat");


// نص الخطة في Sidebar
const sidebarPlanText =
  document.getElementById(
    "sidebarPlanText"
  );


// ============================================================
// إعدادات عامة
// ============================================================

const DEFAULT_PROFILE_IMAGE =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="128"
      height="128"
      viewBox="0 0 128 128"
    >
      <defs>
        <linearGradient
          id="avatarGradient"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop
            offset="0%"
            stop-color="#6366f1"
          />
          <stop
            offset="100%"
            stop-color="#8b5cf6"
          />
        </linearGradient>
      </defs>

      <rect
        width="128"
        height="128"
        rx="64"
        fill="url(#avatarGradient)"
      />

      <circle
        cx="64"
        cy="48"
        r="23"
        fill="#ffffff"
        fill-opacity="0.95"
      />

      <path
        d="
          M25 112
          C28 87 43 76 64 76
          C85 76 100 87 103 112
          Z
        "
        fill="#ffffff"
        fill-opacity="0.95"
      />

    </svg>
  `);

// ============================================================
// دوال مساعدة
// ============================================================


// ------------------------------------------------------------
// تحويل الخطة إلى اسم قابل للعرض
// ------------------------------------------------------------

function getPlanLabel(
  plan
) {

  if (
    plan ===
    "lifetime"
  ) {

    return "Lifetime ♾️";

  }


  return "Trial";

}


// ------------------------------------------------------------
// تحويل الحالة إلى اسم قابل للعرض
// ------------------------------------------------------------

function getStatusLabel(
  status
) {

  switch (
    status
  ) {

    case "active":

      return "نشط";

    case "inactive":

      return "غير نشط";

    case "expired":

      return "منتهية";

    case "pending":

      return "قيد المراجعة";

    default:

      return "غير معروف";

  }

}


// ------------------------------------------------------------
// الحصول على تاريخ نهاية التجربة
// يدعم Firestore Timestamp و Date و String
// ------------------------------------------------------------

function parseDate(
  value
) {

  if (!value) {

    return null;

  }


  // Firestore Timestamp

  if (
    typeof value.toDate ===
    "function"
  ) {

    const date =
      value.toDate();


    if (
      !isNaN(
        date.getTime()
      )
    ) {

      return date;

    }

  }


  // JavaScript Date

  if (
    value instanceof Date
  ) {

    if (
      !isNaN(
        value.getTime()
      )
    ) {

      return value;

    }

  }


  // String / Number

  const parsed =
    new Date(
      value
    );


  if (
    !isNaN(
      parsed.getTime()
    )
  ) {

    return parsed;

  }


  return null;

}


// ------------------------------------------------------------
// حساب الأيام المتبقية
// ------------------------------------------------------------

function getRemainingDays(
  endDate
) {

  if (!endDate) {

    return null;

  }


  const now =
    new Date();


  const difference =
    endDate.getTime() -
    now.getTime();


  if (
    difference <= 0
  ) {

    return 0;

  }


  return Math.ceil(
    difference /
    (
      1000 *
      60 *
      60 *
      24
    )
  );

}


// ------------------------------------------------------------
// عرض رسالة مؤقتة للمستخدم
// بدون استخدام alert
// ------------------------------------------------------------

function showDashboardMessage(
  message
) {

  let messageEl =
    document.getElementById(
      "dashboardMessage"
    );


  if (
    !messageEl
  ) {

    messageEl =
      document.createElement(
        "div"
      );

    messageEl.id =
      "dashboardMessage";


    messageEl.style.position =
      "fixed";

    messageEl.style.top =
      "20px";

    messageEl.style.left =
      "20px";

    messageEl.style.zIndex =
      "9999";

    messageEl.style.maxWidth =
      "calc(100vw - 40px)";

    messageEl.style.padding =
      "12px 18px";

    messageEl.style.borderRadius =
      "12px";

    messageEl.style.background =
      "rgba(15, 23, 42, 0.95)";

    messageEl.style.border =
      "1px solid rgba(255,255,255,0.10)";

    messageEl.style.color =
      "#ffffff";

    messageEl.style.fontSize =
      "13px";

    messageEl.style.boxShadow =
      "0 15px 40px rgba(0,0,0,0.25)";


    document.body.appendChild(
      messageEl
    );

  }


  messageEl.textContent =
    message;


  clearTimeout(
    messageEl._hideTimer
  );


  messageEl._hideTimer =
    setTimeout(
      () => {

        messageEl.remove();

      },
      4000
    );

}


// ------------------------------------------------------------
// تحديث زر الترقية
// ------------------------------------------------------------

function updateUpgradeButtons(
  plan
) {

  const isLifetime =
    plan ===
    "lifetime";


  // الزر العلوي
  if (
    upgradeBtn
  ) {

    if (
      isLifetime
    ) {

      upgradeBtn.textContent =
        "اشتراكك Lifetime مفعل ♾️";

      upgradeBtn.disabled =
        true;

      upgradeBtn.style.opacity =
        "0.55";

      upgradeBtn.style.cursor =
        "default";

    } else {

      upgradeBtn.textContent =
        "Upgrade Lifetime $9";

      upgradeBtn.disabled =
        false;

      upgradeBtn.style.opacity =
        "";

      upgradeBtn.style.cursor =
        "";

    }

  }


  // الزر السفلي
  if (
    upgradeBottomBtn
  ) {

    if (
      isLifetime
    ) {

      upgradeBottomBtn.textContent =
        "اشتراك Lifetime مفعل ♾️";

      upgradeBottomBtn.disabled =
        true;

      upgradeBottomBtn.style.opacity =
        "0.55";

      upgradeBottomBtn.style.cursor =
        "default";

    } else {

      upgradeBottomBtn.innerHTML =
        'Upgrade Lifetime <span>$9</span>';

      upgradeBottomBtn.disabled =
        false;

      upgradeBottomBtn.style.opacity =
        "";

      upgradeBottomBtn.style.cursor =
        "";

    }

  }

}


// ------------------------------------------------------------
// تحديث حالة الخطة في Sidebar
// ------------------------------------------------------------

function updateSidebarPlan(
  plan,
  status,
  trialDays
) {

  if (
    !sidebarPlanText
  ) {

    return;

  }


  if (
    plan ===
    "lifetime"
  ) {

    sidebarPlanText.textContent =
      "Lifetime ♾️";

    return;

  }


  if (
    status ===
    "expired"
  ) {

    sidebarPlanText.textContent =
      "انتهت التجربة";

    return;

  }


  if (
    trialDays !== null &&
    trialDays > 0
  ) {

    sidebarPlanText.textContent =
      `Trial • ${trialDays} يوم متبقي`;

    return;

  }


  sidebarPlanText.textContent =
    "Trial";

}


// ------------------------------------------------------------
// تحديث صورة المستخدم
// ------------------------------------------------------------

function updateUserPhoto(
  userData,
  firebaseUser
) {

  if (
    !photoEl
  ) {

    return;

  }


  const photo =
    userData.photo ||
    firebaseUser.photoURL ||
    DEFAULT_PROFILE_IMAGE;


  photoEl.src =
    photo;


  photoEl.onerror =
    () => {

      photoEl.onerror =
        null;

      photoEl.src =
        DEFAULT_PROFILE_IMAGE;

    };

}


// ============================================================
// تسجيل الخروج
// ============================================================

if (
  logoutBtn
) {

  logoutBtn.addEventListener(
    "click",
    async () => {

      logoutBtn.disabled =
        true;


      try {

        await signOut(
          auth
        );


        window.location.href =
          "login.html";


      } catch (
        error
      ) {

        console.error(
          "LOGOUT ERROR:",
          error
        );


        logoutBtn.disabled =
          false;


        showDashboardMessage(
          "تعذر تسجيل الخروج. حاول مرة أخرى."
        );

      }

    }
  );

}


// ============================================================
// الانتقال إلى الدفع
// ============================================================

function openPaymentPage() {

  window.location.href =
    "payment.html";

}


// الزر الأساسي
if (
  upgradeBtn
) {

  upgradeBtn.addEventListener(
    "click",
    () => {

      if (
        upgradeBtn.disabled
      ) {

        return;

      }


      openPaymentPage();

    }
  );

}


// الزر السفلي
if (
  upgradeBottomBtn
) {

  upgradeBottomBtn.addEventListener(
    "click",
    () => {

      if (
        upgradeBottomBtn.disabled
      ) {

        return;

      }


      openPaymentPage();

    }
  );

}


// ============================================================
// محادثة جديدة
// ============================================================

if (
  newChatBtn
) {

  newChatBtn.addEventListener(
    "click",
    () => {

      window.location.href =
        "chat.html";

    }
  );

}


// ============================================================
// مراقبة حالة المصادقة
// ============================================================

onAuthStateChanged(
  auth,
  async (
    user
  ) => {


    // --------------------------------------------------------
    // لا يوجد مستخدم
    // --------------------------------------------------------

    if (
      !user
    ) {

      window.location.href =
        "login.html";

      return;

    }


    // --------------------------------------------------------
    // تحميل الحساب
    // --------------------------------------------------------

    try {

      const userRef =
        doc(
          db,
          "users",
          user.uid
        );


      const snap =
        await getDoc(
          userRef
        );


      // ------------------------------------------------------
      // لا توجد وثيقة
      // ------------------------------------------------------

      if (
        !snap.exists()
      ) {

        console.error(
          "USER DOCUMENT NOT FOUND:",
          user.uid
        );


        showDashboardMessage(
          "لم يتم العثور على بيانات حسابك. يرجى تسجيل الدخول مرة أخرى."
        );


        return;

      }


      // ------------------------------------------------------
      // بيانات المستخدم
      // ------------------------------------------------------

      const data =
        snap.data();


      console.log(
        "DASHBOARD USER DATA:",
        data
      );


      // ------------------------------------------------------
      // البيانات الأساسية
      // ------------------------------------------------------

      if (
        nameEl
      ) {

        nameEl.textContent =
          data.name ||
          user.displayName ||
          "مستخدم";

      }


      if (
        emailEl
      ) {

        emailEl.textContent =
          data.email ||
          user.email ||
          "";

      }


      updateUserPhoto(
        data,
        user
      );


      // ------------------------------------------------------
      // الخطة
      // ------------------------------------------------------

      const currentPlan =
        data.plan ||
        "trial";


      const planLabel =
        getPlanLabel(
          currentPlan
        );


      if (
        planEl
      ) {

        planEl.textContent =
          planLabel;

      }


      // ------------------------------------------------------
      // الحالة
      // ------------------------------------------------------

      let currentStatus =
        data.status ||
        "active";


      // ------------------------------------------------------
      // حساب حالة Trial
      // ------------------------------------------------------

      let trialDays =
        null;


      if (
        currentPlan !==
        "lifetime"
      ) {

        const trialEndDate =
          parseDate(
            data.trialEndsAt
          );


        if (
          trialEndDate
        ) {

          trialDays =
            getRemainingDays(
              trialEndDate
            );


          // التجربة انتهت
          if (
            trialDays ===
            0
          ) {

            currentStatus =
              "expired";

          }

        }

      }


      // ------------------------------------------------------
      // عرض الحالة
      // ------------------------------------------------------

      if (
        statusEl
      ) {

        statusEl.textContent =
          getStatusLabel(
            currentStatus
          );

      }


      // ------------------------------------------------------
      // عدد الطلبات
      // ------------------------------------------------------

      if (
        requestsEl
      ) {

        requestsEl.textContent =
          Number(
            data.requests || 0
          );

      }


      // ------------------------------------------------------
      // عرض حالة التجربة
      // ------------------------------------------------------

      if (
        trialEl
      ) {


        // Lifetime

        if (
          currentPlan ===
          "lifetime"
        ) {

          trialEl.textContent =
            "اشتراك مدى الحياة ♾️";

        }


        // Trial فعال

        else if (
          trialDays !== null &&
          trialDays > 0
        ) {

          trialEl.textContent =
            `${trialDays} يوم متبقي`;

        }


        // Trial منتهي

        else if (
          currentStatus ===
          "expired"
        ) {

          trialEl.textContent =
            "انتهت التجربة";

        }


        // لا يوجد تاريخ

        else {

          trialEl.textContent =
            "غير متاح";

        }

      }


      // ------------------------------------------------------
      // Sidebar
      // ------------------------------------------------------

      updateSidebarPlan(
        currentPlan,
        currentStatus,
        trialDays
      );


      // ------------------------------------------------------
      // أزرار Lifetime
      // ------------------------------------------------------

      updateUpgradeButtons(
        currentPlan
      );


      // ------------------------------------------------------
      // الحالة النهائية
      // ------------------------------------------------------

      console.log(
        "DASHBOARD LOADED SUCCESSFULLY"
      );


    } catch (
      error
    ) {

      console.error(
        "DASHBOARD FIRESTORE ERROR:",
        error
      );


      console.error(
        "ERROR CODE:",
        error.code
      );


      console.error(
        "ERROR MESSAGE:",
        error.message
      );


      showDashboardMessage(
        "تعذر تحميل بيانات حسابك. حاول تحديث الصفحة."
      );

    }

  }
);