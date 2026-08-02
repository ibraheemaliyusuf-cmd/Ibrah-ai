// ============================================================
// IBRAH AI — CHAT CONTROLLER
// ============================================================

import { auth, db } from "./firebase.js";

import {
  doc,
  getDoc,
  updateDoc,
  increment,
  arrayUnion,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";


// ============================================================
// WORKER
// ============================================================

const WORKER_URL =
  "https://ibrah-ai-api.ibraheemaliyusuf.workers.dev";

const CHAT_ENDPOINT =
  `${WORKER_URL}/api/chat`;


// ============================================================
// DEFAULT USER IMAGE
// مدمجة داخل JavaScript ولا تحتاج ملفًا خارجيًا
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
// عناصر الواجهة الأساسية
// ============================================================

const messageInput =
  document.getElementById(
    "message"
  );

const sendButton =
  document.getElementById(
    "send"
  );

const messagesBox =
  document.getElementById(
    "messages"
  );


// ============================================================
// عناصر الحساب
// ============================================================

const userPhoto =
  document.getElementById(
    "userPhoto"
  );

const userName =
  document.getElementById(
    "userName"
  );

const userPlan =
  document.getElementById(
    "userPlan"
  );


// ============================================================
// عناصر Auto Router
// ============================================================

const modelMode =
  document.getElementById(
    "modelMode"
  );

const modelSelect =
  document.getElementById(
    "modelSelect"
  );

const modelSelectorGroup =
  document.getElementById(
    "modelSelectorGroup"
  );

const activeModel =
  document.getElementById(
    "activeModel"
  );

const routerStatus =
  document.getElementById(
    "routerStatus"
  );


// ============================================================
// عناصر الملفات
// ============================================================

const fileInput =
  document.getElementById(
    "fileInput"
  );

const attachmentPreview =
  document.getElementById(
    "attachmentPreview"
  );

const attachmentName =
  document.getElementById(
    "attachmentName"
  );

const attachmentSize =
  document.getElementById(
    "attachmentSize"
  );

const removeAttachment =
  document.getElementById(
    "removeAttachment"
  );


// ============================================================
// عناصر التحكم
// ============================================================

const newChatButton =
  document.getElementById(
    "newChat"
  );

const logoutButton =
  document.getElementById(
    "logout"
  );

const menuToggle =
  document.getElementById(
    "menuToggle"
  );

const chatSidebar =
  document.getElementById(
    "chatSidebar"
  );

const sidebarOverlay =
  document.getElementById(
    "sidebarOverlay"
  );


// ============================================================
// الاقتراحات
// ============================================================

const suggestionCards =
  document.querySelectorAll(
    ".suggestion-card"
  );


// ============================================================
// حالة التطبيق
// ============================================================

let selectedFile =
  null;

let currentUser =
  null;

let currentUserRef =
  null;

let currentUserData =
  null;

let isSending =
  false;


// ============================================================
// التحقق من عناصر أساسية
// ============================================================

if (
  !messageInput ||
  !sendButton ||
  !messagesBox
) {

  console.error(
    "CHAT UI ERROR: Required chat elements are missing."
  );

}


// ============================================================
// أدوات مساعدة
// ============================================================


// ------------------------------------------------------------
// إضافة رسالة
// ------------------------------------------------------------

function addMessage(
  text,
  type,
  options = {}
) {

  if (
    !messagesBox
  ) {

    return null;

  }


  const message =
    document.createElement(
      "div"
    );


  message.className =
    type === "user"
      ? "user-message"
      : "ai-message";


  message.textContent =
    text || "";


  if (
    options.model
  ) {

    const modelInfo =
      document.createElement(
        "small"
      );


    modelInfo.style.display =
      "block";

    modelInfo.style.marginTop =
      "8px";

    modelInfo.style.opacity =
      "0.55";

    modelInfo.style.fontSize =
      "10px";


    modelInfo.textContent =
      `🤖 ${options.model}`;


    message.appendChild(
      modelInfo
    );

  }


  messagesBox.appendChild(
    message
  );


  scrollMessages();


  return message;

}


// ------------------------------------------------------------
// تمرير المحادثة للأسفل
// ------------------------------------------------------------

function scrollMessages() {

  if (
    !messagesBox
  ) {

    return;

  }


  requestAnimationFrame(
    () => {

      messagesBox.scrollTop =
        messagesBox.scrollHeight;

    }
  );

}


// ------------------------------------------------------------
// تنظيف شاشة المحادثة
// ------------------------------------------------------------

function clearMessages() {

  if (
    !messagesBox
  ) {

    return;

  }


  messagesBox.innerHTML =
    "";

}


// ------------------------------------------------------------
// إغلاق Sidebar
// ------------------------------------------------------------

function closeSidebar() {

  if (
    chatSidebar
  ) {

    chatSidebar.classList.remove(
      "open"
    );

  }


  if (
    sidebarOverlay
  ) {

    sidebarOverlay.classList.remove(
      "active"
    );

  }

}


// ------------------------------------------------------------
// فتح Sidebar
// ------------------------------------------------------------

function openSidebar() {

  if (
    chatSidebar
  ) {

    chatSidebar.classList.add(
      "open"
    );

  }


  if (
    sidebarOverlay
  ) {

    sidebarOverlay.classList.add(
      "active"
    );

  }

}


// ------------------------------------------------------------
// تنسيق حجم الملف
// ------------------------------------------------------------

function formatFileSize(
  bytes
) {

  if (
    !bytes
  ) {

    return "0 KB";

  }


  if (
    bytes < 1024
  ) {

    return `${bytes} B`;

  }


  if (
    bytes < 1024 * 1024
  ) {

    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;

  }


  return `${(
    bytes /
    (
      1024 *
      1024
    )
  ).toFixed(2)} MB`;

}


// ------------------------------------------------------------
// تحديث صورة المستخدم
// ------------------------------------------------------------

function updateUserPhoto(
  data,
  user
) {

  if (
    !userPhoto
  ) {

    return;

  }


  const photo =
    data?.photo ||
    user?.photoURL ||
    DEFAULT_PROFILE_IMAGE;


  userPhoto.src =
    photo;


  userPhoto.onerror =
    () => {

      userPhoto.onerror =
        null;

      userPhoto.src =
        DEFAULT_PROFILE_IMAGE;

    };

}


// ------------------------------------------------------------
// تحديث بيانات المستخدم في Sidebar
// ------------------------------------------------------------

function updateUserUI(
  data,
  user
) {

  if (
    userName
  ) {

    userName.textContent =
      data?.name ||
      user?.displayName ||
      "مستخدم";

  }


  if (
    userPlan
  ) {

    if (
      data?.plan ===
      "lifetime"
    ) {

      userPlan.textContent =
        "Lifetime ♾️";

    } else {

      userPlan.textContent =
        "Trial";

    }

  }


  updateUserPhoto(
    data,
    user
  );

}


// ------------------------------------------------------------
// تحديث نموذج Auto Router
// ------------------------------------------------------------

function updateActiveModel(
  modelName
) {

  if (
    !activeModel
  ) {

    return;

  }


  const strong =
    activeModel.querySelector(
      "strong"
    );


  if (
    strong
  ) {

    strong.textContent =
      modelName ||
      "Auto Router";

  }

}


// ------------------------------------------------------------
// حالة Auto Router
// ------------------------------------------------------------

function setRouterState(
  state
) {

  if (
    !routerStatus
  ) {

    return;

  }


  const text =
    routerStatus.querySelector(
      "span:last-child"
    );


  const dot =
    routerStatus.querySelector(
      ".router-status-dot"
    );


  if (
    state ===
    "thinking"
  ) {

    if (
      text
    ) {

      text.textContent =
        "جاري تحليل الطلب";

    }


    if (
      dot
    ) {

      dot.style.background =
        "#f59e0b";

      dot.style.boxShadow =
        "0 0 10px rgba(245,158,11,.65)";

    }

    return;

  }


  if (
    state ===
    "error"
  ) {

    if (
      text
    ) {

      text.textContent =
        "Router غير متاح";

    }


    if (
      dot
    ) {

      dot.style.background =
        "#ef4444";

      dot.style.boxShadow =
        "0 0 10px rgba(239,68,68,.65)";

    }

    return;

  }


  if (
    text
  ) {

    text.textContent =
      "Auto Router";

  }


  if (
    dot
  ) {

    dot.style.background =
      "#22c55e";

    dot.style.boxShadow =
      "0 0 10px rgba(34,197,94,.65)";

  }

}


// ============================================================
// التحقق من الوصول محليًا
// ملاحظة: هذا ليس نظام الحماية النهائي.
// Worker يجب أن يتحقق من الاشتراك أيضًا.
// ============================================================

function checkUserAccess(
  data
) {

  if (
    !data
  ) {

    return {

      allowed:
        false,

      message:
        "تعذر قراءة بيانات حسابك."

    };

  }


  if (
    data.status &&
    data.status !==
      "active"
  ) {

    return {

      allowed:
        false,

      message:
        "حسابك غير نشط حاليًا."

    };

  }


  // Lifetime
  if (
    data.plan ===
    "lifetime"
  ) {

    return {

      allowed:
        true

    };

  }


  // Trial
  if (
    data.plan ===
      "trial" &&
    data.trialEndsAt
  ) {

    let trialEnd;


    if (
      typeof data.trialEndsAt.toDate ===
      "function"
    ) {

      trialEnd =
        data.trialEndsAt.toDate();

    } else {

      trialEnd =
        new Date(
          data.trialEndsAt
        );

    }


    if (
      !isNaN(
        trialEnd.getTime()
      )
    ) {

      if (
        new Date() >
        trialEnd
      ) {

        return {

          allowed:
            false,

          message:
            "انتهت الفترة التجريبية المجانية."

        };

      }

    }

  }


  return {

    allowed:
      true

  };

}


// ============================================================
// Firebase Token
// ============================================================

async function getAuthToken(
  user
) {

  if (
    !user
  ) {

    throw new Error(
      "المستخدم غير مسجل الدخول."
    );

  }


  const token =
    await user.getIdToken(
      true
    );


  if (
    !token
  ) {

    throw new Error(
      "تعذر الحصول على رمز المصادقة."
    );

  }


  return token;

}


// ============================================================
// إرسال الطلب إلى Worker
// ============================================================

async function sendToWorker(
  payload,
  token
) {

  const controller =
    new AbortController();


  const timeout =
    setTimeout(
      () => {

        controller.abort();

      },
      120000
    );


  try {

    const response =
      await fetch(
        CHAT_ENDPOINT,
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
            JSON.stringify(
              payload
            ),

          signal:
            controller.signal

        }
      );


    const rawText =
      await response.text();


    let data;


    try {

      data =
        JSON.parse(
          rawText
        );

    } catch {

      throw new Error(
        "الخادم أعاد استجابة غير صالحة."
      );

    }


    if (
      !response.ok
    ) {

      throw new Error(

        data?.error ||
        data?.message ||
        "حدث خطأ أثناء الاتصال بالخادم."

      );

    }


    if (
      !data
    ) {

      throw new Error(
        "لم يتم استلام استجابة من الخادم."
      );

    }


    if (
      typeof data.answer !==
      "string" ||
      !data.answer.trim()
    ) {

      throw new Error(
        "لم يتم استلام رد صالح من الذكاء الاصطناعي."
      );

    }


    return data;

  } finally {

    clearTimeout(
      timeout
    );

  }

}


// ============================================================
// حفظ المحادثة
// ============================================================

async function saveConversation(
  userRef,
  userMessage,
  aiAnswer,
  modelUsed
) {

  if (
    !userRef
  ) {

    return;

  }


  const userEntry = {

    role:
      "user",

    message:
      userMessage,

    createdAt:
      new Date().toISOString()

  };


  const assistantEntry = {

    role:
      "assistant",

    message:
      aiAnswer,

    model:
      modelUsed ||
      null,

    createdAt:
      new Date().toISOString()

  };


  await updateDoc(
    userRef,
    {

      requests:
        increment(1),

      history:
        arrayUnion(
          userEntry,
          assistantEntry
        ),

      lastRequestAt:
        serverTimestamp()

    }
  );

}


// ============================================================
// اختيار الملف
// ============================================================

function handleFileSelection(
  file
) {

  if (
    !file
  ) {

    return;

  }


  // حد مؤقت 10MB
  // سيتم تطبيق التحقق النهائي أيضًا في Worker

  const MAX_FILE_SIZE =
    10 *
    1024 *
    1024;


  if (
    file.size >
    MAX_FILE_SIZE
  ) {

    addMessage(
      "❌ حجم الملف كبير جدًا. الحد الأقصى حاليًا 10MB.",
      "ai"
    );


    if (
      fileInput
    ) {

      fileInput.value =
        "";

    }


    return;

  }


  selectedFile =
    file;


  if (
    attachmentName
  ) {

    attachmentName.textContent =
      file.name;

  }


  if (
    attachmentSize
  ) {

    attachmentSize.textContent =
      formatFileSize(
        file.size
      );

  }


  if (
    attachmentPreview
  ) {

    attachmentPreview.hidden =
      false;

  }

}


// ============================================================
// إزالة الملف
// ============================================================

function clearSelectedFile() {

  selectedFile =
    null;


  if (
    fileInput
  ) {

    fileInput.value =
      "";

  }


  if (
    attachmentPreview
  ) {

    attachmentPreview.hidden =
      true;

  }

}


// ============================================================
// بناء Payload
// ============================================================

function buildPayload(
  text
) {

  const selectedMode =
    modelMode?.value ||
    "auto";


  const selectedModel =
    modelSelect?.value ||
    "auto";


  const payload = {

    prompt:
      text,

    context: {

      plan:
        currentUserData?.plan ||
        null,

      status:
        currentUserData?.status ||
        null

    },

    mode:
      selectedMode

  };


  // في الوضع اليدوي فقط
  if (
    selectedMode ===
    "manual" &&
    selectedModel &&
    selectedModel !==
      "auto"
  ) {

    payload.model =
      selectedModel;

  }


  // ----------------------------------------------------------
  // ملاحظة:
  // نرسل معلومات الملف فقط حاليًا.
  // Worker سيحتاج لاحقًا إلى دعم file payload الحقيقي.
  // ----------------------------------------------------------

  if (
    selectedFile
  ) {

    payload.file = {

      name:
        selectedFile.name,

      type:
        selectedFile.type,

      size:
        selectedFile.size

    };

  }


  return payload;

}


// ============================================================
// إرسال الرسالة
// ============================================================

async function sendMessage() {

  if (
    isSending
  ) {

    return;

  }


  const text =
    messageInput?.value.trim();


  if (
    !text &&
    !selectedFile
  ) {

    return;

  }


  let loadingMessage =
    null;


  try {

    isSending =
      true;


    // --------------------------------------------------------
    // قراءة المستخدم
    // --------------------------------------------------------

    if (
      !currentUser ||
      !currentUserRef ||
      !currentUserData
    ) {

      const user =
        auth.currentUser;


      if (
        !user
      ) {

        throw new Error(
          "يجب تسجيل الدخول أولًا."
        );

      }


      currentUser =
        user;


      currentUserRef =
        doc(
          db,
          "users",
          user.uid
        );


      const snap =
        await getDoc(
          currentUserRef
        );


      if (
        !snap.exists()
      ) {

        throw new Error(
          "لم يتم العثور على حساب المستخدم."
        );

      }


      currentUserData =
        snap.data();

    }


    // --------------------------------------------------------
    // تحقق محلي سريع
    // --------------------------------------------------------

    const access =
      checkUserAccess(
        currentUserData
      );


    if (
      !access.allowed
    ) {

      addMessage(
        `⚠️ ${access.message}\n\nيمكنك ترقية حسابك من صفحة Lifetime.`,
        "ai"
      );


      return;

    }


    // --------------------------------------------------------
    // Token
    // --------------------------------------------------------

    const token =
      await getAuthToken(
        currentUser
      );


    // --------------------------------------------------------
    // حفظ الملف قبل تنظيف الواجهة
    // --------------------------------------------------------

    const fileForRequest =
      selectedFile;


    const payload =
      buildPayload(
        text
      );


    // --------------------------------------------------------
    // عرض رسالة المستخدم
    // --------------------------------------------------------

    let userDisplayText =
      text;


    if (
      fileForRequest
    ) {

      userDisplayText =
        text
          ? `${text}\n\n📎 ${fileForRequest.name}`
          : `📎 ${fileForRequest.name}`;

    }


    addMessage(
      userDisplayText,
      "user"
    );


    // --------------------------------------------------------
    // تنظيف الإدخال
    // --------------------------------------------------------

    messageInput.value =
      "";


    if (
      fileForRequest
    ) {

      clearSelectedFile();

    }


    // --------------------------------------------------------
    // تعطيل الواجهة
    // --------------------------------------------------------

    messageInput.disabled =
      true;

    sendButton.disabled =
      true;


    if (
      fileInput
    ) {

      fileInput.disabled =
        true;

    }


    setRouterState(
      "thinking"
    );


    // --------------------------------------------------------
    // Loading
    // --------------------------------------------------------

    loadingMessage =
      addMessage(
        "⏳ جاري تحليل طلبك واختيار النموذج الأنسب...",
        "ai"
      );


    // --------------------------------------------------------
    // Worker
    // --------------------------------------------------------

    const result =
      await sendToWorker(
        payload,
        token
      );


    // --------------------------------------------------------
    // النموذج المستخدم
    // --------------------------------------------------------

    const usedModel =
      result.model ||
      result.modelUsed ||
      (
        payload.model ||
        "Auto Router"
      );


    updateActiveModel(
      usedModel
    );


    // --------------------------------------------------------
    // تحديث الرد
    // --------------------------------------------------------

    if (
      loadingMessage
    ) {

      loadingMessage.textContent =
        result.answer;


      if (
        result.model ||
        result.modelUsed
      ) {

        const modelInfo =
          document.createElement(
            "small"
          );


        modelInfo.style.display =
          "block";

        modelInfo.style.marginTop =
          "8px";

        modelInfo.style.opacity =
          "0.55";

        modelInfo.style.fontSize =
          "10px";


        modelInfo.textContent =
          `🤖 ${usedModel}`;


        loadingMessage.appendChild(
          modelInfo
        );

      }

    }


    setRouterState(
      "ready"
    );


    // --------------------------------------------------------
    // حفظ المحادثة
    // --------------------------------------------------------

    try {

      await saveConversation(

        currentUserRef,

        userDisplayText,

        result.answer,

        usedModel

      );

    } catch (
      historyError
    ) {

      console.error(
        "FIRESTORE HISTORY ERROR:",
        historyError
      );

    }


  } catch (
    error
  ) {

    console.error(
      "CHAT ERROR:",
      error
    );


    setRouterState(
      "error"
    );


    let errorMessage =
      "حدث خطأ أثناء إرسال الرسالة.";


    if (
      error.name ===
      "AbortError"
    ) {

      errorMessage =
        "⏱️ انتهت مهلة الاتصال بالخادم. حاول مرة أخرى.";

    } else if (
      error.message
    ) {

      errorMessage =
        `❌ ${error.message}`;

    }


    if (
      loadingMessage
    ) {

      loadingMessage.textContent =
        errorMessage;

    } else {

      addMessage(
        errorMessage,
        "ai"
      );

    }


  } finally {

    isSending =
      false;


    if (
      messageInput
    ) {

      messageInput.disabled =
        false;

      messageInput.focus();

    }


    if (
      sendButton
    ) {

      sendButton.disabled =
        false;

    }


    if (
      fileInput
    ) {

      fileInput.disabled =
        false;

    }

  }

}


// ============================================================
// Auto Router / Manual Model
// ============================================================

if (
  modelMode
) {

  modelMode.addEventListener(
    "change",
    () => {

      const isManual =
        modelMode.value ===
        "manual";


      if (
        modelSelect
      ) {

        modelSelect.disabled =
          !isManual;

      }


      if (
        modelSelectorGroup
      ) {

        modelSelectorGroup.style.opacity =
          isManual
            ? "1"
            : "0.65";

      }


      if (
        isManual
      ) {

        updateActiveModel(
          modelSelect?.value ||
          "اختيار نموذج"
        );

      } else {

        updateActiveModel(
          "Auto Router"
        );

      }

    }
  );

}


// ============================================================
// تغيير النموذج اليدوي
// ============================================================

if (
  modelSelect
) {

  modelSelect.addEventListener(
    "change",
    () => {

      if (
        modelMode?.value !==
        "manual"
      ) {

        return;

      }


      updateActiveModel(
        modelSelect.value
      );

    }
  );

}


// ============================================================
// رفع ملف
// ============================================================

if (
  fileInput
) {

  fileInput.addEventListener(
    "change",
    () => {

      const file =
        fileInput.files?.[0];


      if (
        file
      ) {

        handleFileSelection(
          file
        );

      }

    }
  );

}


// ============================================================
// إزالة الملف
// ============================================================

if (
  removeAttachment
) {

  removeAttachment.addEventListener(
    "click",
    clearSelectedFile
  );

}


// ============================================================
// إرسال زر
// ============================================================

if (
  sendButton
) {

  sendButton.addEventListener(
    "click",
    sendMessage
  );

}


// ============================================================
// Enter للإرسال
// Shift + Enter سطر جديد
// ============================================================

if (
  messageInput
) {

  messageInput.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key ===
          "Enter" &&
        !event.shiftKey
      ) {

        event.preventDefault();

        sendMessage();

      }

    }
  );

}


// ============================================================
// الاقتراحات
// ============================================================

suggestionCards.forEach(
  (card) => {

    card.addEventListener(
      "click",
      () => {

        const prompt =
          card.dataset.prompt ||
          "";


        if (
          messageInput
        ) {

          messageInput.value =
            prompt;

          messageInput.focus();

        }

      }
    );

  }
);


// ============================================================
// New Chat
// ============================================================

if (
  newChatButton
) {

  newChatButton.addEventListener(
    "click",
    () => {

      clearMessages();


      if (
        messageInput
      ) {

        messageInput.value =
          "";

      }


      clearSelectedFile();


      updateActiveModel(
        "Auto Router"
      );


      if (
        modelMode
      ) {

        modelMode.value =
          "auto";

      }


      if (
        modelSelect
      ) {

        modelSelect.disabled =
          true;

      }


      setRouterState(
        "ready"
      );


      closeSidebar();


      messageInput?.focus();

    }
  );

}


// ============================================================
// Mobile Sidebar
// ============================================================

if (
  menuToggle
) {

  menuToggle.addEventListener(
    "click",
    openSidebar
  );

}


if (
  sidebarOverlay
) {

  sidebarOverlay.addEventListener(
    "click",
    closeSidebar
  );

}


// ============================================================
// Logout
// ============================================================

if (
  logoutButton
) {

  logoutButton.addEventListener(
    "click",
    async () => {

      if (
        isSending
      ) {

        return;

      }


      logoutButton.disabled =
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


        logoutButton.disabled =
          false;


        addMessage(
          "❌ تعذر تسجيل الخروج. حاول مرة أخرى.",
          "ai"
        );

      }

    }
  );

}


// ============================================================
// مراقبة تسجيل الدخول
// ============================================================

onAuthStateChanged(
  auth,
  async (
    user
  ) => {

    if (
      !user
    ) {

      window.location.href =
        "login.html";

      return;

    }


    try {

      currentUser =
        user;


      currentUserRef =
        doc(
          db,
          "users",
          user.uid
        );


      const snap =
        await getDoc(
          currentUserRef
        );


      if (
        !snap.exists()
      ) {

        throw new Error(
          "لم يتم العثور على حساب المستخدم."
        );

      }


      currentUserData =
        snap.data();


      updateUserUI(
        currentUserData,
        currentUser
      );


      updateActiveModel(
        "Auto Router"
      );


      setRouterState(
        "ready"
      );


      console.log(
        "CHAT USER LOADED:",
        currentUser.uid
      );


    } catch (
      error
    ) {

      console.error(
        "CHAT AUTH/USER ERROR:",
        error
      );


      addMessage(
        `❌ ${error.message || "تعذر تحميل بيانات الحساب."}`,
        "ai"
      );

    }

  }
);