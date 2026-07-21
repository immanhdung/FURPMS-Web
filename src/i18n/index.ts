import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { vi } from "@/i18n/locales/vi";
import { en } from "@/i18n/locales/en";

export const SUPPORTED_LANGUAGES = [
  { code: "vi", label: "Tiếng Việt" },
  { code: "en", label: "English" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

/**
 * Mặc định tiếng Việt (người dùng chính là giảng viên VN). Lựa chọn lưu ở localStorage
 * qua LanguageDetector nên nhớ giữa các lần vào.
 */
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      vi: { translation: vi },
      en: { translation: en },
    },
    fallbackLng: "vi",
    supportedLngs: ["vi", "en"],
    interpolation: { escapeValue: false },
    detection: {
      // CHỈ đọc lựa chọn đã lưu — không dò ngôn ngữ trình duyệt, vì trình duyệt của
      // giảng viên VN có thể là en-US mà mặc định app phải là tiếng Việt.
      order: ["localStorage"],
      lookupLocalStorage: "furpms-lang",
      caches: ["localStorage"],
    },
  });

export default i18n;
