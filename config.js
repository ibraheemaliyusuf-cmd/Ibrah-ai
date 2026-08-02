// ============================================
// IBRAH AI - FRONTEND CONFIGURATION
// ============================================

// عنوان Cloudflare Worker
export const API_URL =
  "https://ibrah-ai-api.ibraheemaliyusuf.workers.dev";

// اسم المشروع
export const APP_NAME = "Ibrah AI";

// إصدار الواجهة
export const APP_VERSION = "1.0.0";

// اللغة الافتراضية
export const DEFAULT_LANGUAGE = "ar";

// مهلة طلبات API
export const API_TIMEOUT = 60000;

// التحقق من وجود عنوان API
if (!API_URL) {
  console.error("Ibrah AI: API_URL is not configured.");
}