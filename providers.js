import { registerProvider } from "./ai-router.js";

/*
========================================
IBRAH AI
AI Provider Registry
========================================

هذا الملف لا يحتوي على أي API KEY.

المتصفح لا يتصل مباشرة بـ OpenRouter.

جميع الطلبات تمر عبر:
Frontend
    ↓
/api/chat
    ↓
Cloudflare Worker / Backend
    ↓
AI Provider
*/

async function workerProvider(prompt, context = {}) {
  const response = await fetch("/api/chat", {
    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      prompt,
      context
    })
  });

  if (!response.ok) {
    let errorMessage = "حدث خطأ أثناء الاتصال بخدمة الذكاء الاصطناعي.";

    try {
      const errorData = await response.json();

      if (errorData?.message) {
        errorMessage = errorData.message;
      }
    } catch (error) {
      console.error(
        "WORKER ERROR RESPONSE PARSE ERROR:",
        error
      );
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();

  if (
    !data ||
    typeof data.answer !== "string" ||
    data.answer.trim().length === 0
  ) {
    throw new Error(
      "استجابة غير صالحة من خادم الذكاء الاصطناعي."
    );
  }

  return {
    provider: data.provider || "IBRAH AI",
    answer: data.answer
  };
}

registerProvider(workerProvider);