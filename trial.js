import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

import { db } from "./firebase.js";


// =====================================
// الحصول على بيانات المستخدم
// =====================================

export async function getUser(uid) {

  if (!uid) {
    return null;
  }

  const userRef =
    doc(
      db,
      "users",
      uid
    );

  const snap =
    await getDoc(
      userRef
    );

  if (
    !snap.exists()
  ) {
    return null;
  }

  return snap.data();

}


// =====================================
// تحويل تاريخ Firestore إلى Date
// =====================================

function toDate(value) {

  if (!value) {
    return null;
  }


  // Firestore Timestamp
  if (
    typeof value.toDate ===
    "function"
  ) {

    return value.toDate();

  }


  // JavaScript Date
  if (
    value instanceof Date
  ) {

    return value;

  }


  // رقم timestamp
  if (
    typeof value ===
    "number"
  ) {

    const date =
      new Date(value);

    return isNaN(
      date.getTime()
    )
      ? null
      : date;

  }


  // نص تاريخ
  if (
    typeof value ===
    "string"
  ) {

    const date =
      new Date(value);

    return isNaN(
      date.getTime()
    )
      ? null
      : date;

  }


  return null;

}


// =====================================
// التحقق من صلاحية التجربة أو Lifetime
// =====================================

export async function checkTrial(
  uid
) {

  const data =
    await getUser(
      uid
    );


  // -----------------------------------
  // المستخدم غير موجود
  // -----------------------------------

  if (!data) {

    return false;

  }


  // -----------------------------------
  // الحساب غير نشط
  // -----------------------------------

  if (
    data.status &&
    data.status !== "active"
  ) {

    return false;

  }


  // -----------------------------------
  // Lifetime
  // -----------------------------------

  if (
    data.plan ===
    "lifetime"
  ) {

    return true;

  }


  // -----------------------------------
  // يجب أن يكون Trial
  // -----------------------------------

  if (
    data.plan !==
    "trial"
  ) {

    return false;

  }


  // -----------------------------------
  // تاريخ انتهاء التجربة
  // -----------------------------------

  const end =
    toDate(
      data.trialEndsAt
    );


  if (!end) {

    return false;

  }


  // -----------------------------------
  // التحقق من انتهاء التجربة
  // -----------------------------------

  return (
    Date.now() <
    end.getTime()
  );

}


// =====================================
// الحصول على حالة الاشتراك
// =====================================

export async function getSubscriptionStatus(
  uid
) {

  const data =
    await getUser(
      uid
    );


  if (!data) {

    return {

      exists:
        false,

      active:
        false,

      plan:
        null,

      status:
        null,

      trialEndsAt:
        null

    };

  }


  // Lifetime
  if (
    data.plan ===
    "lifetime"
  ) {

    return {

      exists:
        true,

      active:
        data.status ===
          "active",

      plan:
        "lifetime",

      status:
        data.status ||
        null,

      trialEndsAt:
        null

    };

  }


  // Trial
  const end =
    toDate(
      data.trialEndsAt
    );


  const trialActive =
    data.status ===
      "active" &&
    data.plan ===
      "trial" &&
    end &&
    Date.now() <
      end.getTime();


  return {

    exists:
      true,

    active:
      Boolean(
        trialActive
      ),

    plan:
      data.plan ||
      null,

    status:
      data.status ||
      null,

    trialEndsAt:
      end

  };

}