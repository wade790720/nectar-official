import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

const LANG_KEY = "nectar_locale";

/** 後台與資料以新台幣儲存；英文介面顯示美金（約當匯率，僅供參考） */
const TWD_PER_USD = 32;

const CAT_EN = {
  永生花: "Preserved",
  乾燥花: "Dried",
  鮮花: "Fresh",
  多肉: "Succulents",
  花圈: "Wreath",
  捧花: "Bridal",
  水晶花: "Crystal Flower",
};

const messages = {
  en: {
    navBrand: "Nectar",
    navCollection: "Collection",
    navVote: "Vote",
    navAdmin: "Admin",
    navExitAdmin: "Sign out",
    langEn: "EN",
    langZh: "CN",
    workViewDetails: "View details →",
    verticalArt: "Nectar",
    portfolioEnd: "End of Collection",
    voteKicker: "Classroom Vote",
    voteTitle: "Flower poll",
    voteSub: "Vote for the flower you want to learn next",
    voteLeading: "Currently leading",
    voteVotes: "votes",
    voteVoted: "Voted",
    wishKicker: "✦ Wishing Pool ✦",
    wishTitle: "Wish pool",
    wishSub: "Whisper your wish into the stream",
    wishPlaceholder: "Name a flower you'd like to learn…",
    wishSend: "Send",
    wishEmpty: "Be the first to make a wish ✦",
    wishReset: "Reset all votes",
    detailAddAngles: "Add more angles",
    detailRemovePhotoConfirm:
      "Remove this photo from the gallery? This cannot be undone.",
    detailRemoveCover: "Remove cover image",
    photoTipTitle: "Photo tips",
    photoTipBody:
      "Full-bleed backgrounds use cover crop. Prefer 16:9 or 3:2 landscape, min width 2400px; keep the subject near the vertical center (slightly above middle). Tall 9:16 portraits crop heavily on ultrawide—crop to 16:9 before upload for the steadiest framing.",
    modalEdit: "Edit work",
    modalNew: "New work",
    modalName: "Chinese title",
    modalNameEn: "English title",
    modalPrice: "List price (NT$)",
    modalCat: "Category",
    modalDesc: "Chinese description",
    modalDescEn: "English description",
    modalCover: "Cover image",
    modalUploadHint: "Click to upload",
    modalUploaded: "Uploaded — click to replace",
    modalCancel: "Cancel",
    modalSave: "Save",
    adminLoginTitle: "Admin sign-in",
    adminPassword: "Admin password",
    adminSubmit: "Sign in",
    adminCancel: "Cancel",
    adminInvalid: "Invalid password.",
    adminSessionExpired: "Session expired or unauthorized. Please sign in again.",
    footer: "Nectar © 2026",
  },
  "zh-TW": {
    navBrand: "花蜜水晶花工藝",
    navCollection: "作品集",
    navVote: "投票",
    navAdmin: "管理",
    navExitAdmin: "登出",
    langEn: "英文",
    langZh: "繁中",
    workViewDetails: "查看詳情 →",
    verticalArt: "花蜜水晶花工藝",
    portfolioEnd: "— 全系列瀏覽完畢 —",
    voteKicker: "課堂投票",
    voteTitle: "花種投票",
    voteSub: "投下你想學的那朵花",
    voteLeading: "目前領先",
    voteVotes: "票",
    voteVoted: "已投票",
    wishKicker: "✦ 許願池 ✦",
    wishTitle: "許願池",
    wishSub: "把願望悄悄寫進水流裡",
    wishPlaceholder: "輸入你想學的花種名稱…",
    wishSend: "許願",
    wishEmpty: "成為第一個許願的人 ✦",
    wishReset: "重設所有票數",
    detailAddAngles: "新增更多角度",
    detailRemovePhotoConfirm: "要從圖庫移除此照片嗎？此操作無法復原。",
    detailRemoveCover: "移除主圖",
    photoTipTitle: "相片建議",
    photoTipBody:
      "全螢幕背景會用 cover 裁切。建議 16:9 或 3:2 橫式、寬度至少約 2400px，主體放在畫面垂直中央略偏上。直式 9:16 在超寬螢幕上下會被裁掉很多；若希望主體穩定，可先裁成 16:9 再上傳。",
    modalEdit: "編輯作品",
    modalNew: "新增作品",
    modalName: "作品名稱",
    modalNameEn: "英文標題",
    modalPrice: "售價 NT$",
    modalCat: "分類",
    modalDesc: "作品說明",
    modalDescEn: "英文說明",
    modalCover: "主圖上傳",
    modalUploadHint: "點此上傳圖片",
    modalUploaded: "已上傳 — 點此更換",
    modalCancel: "取消",
    modalSave: "儲存",
    adminLoginTitle: "管理員登入",
    adminPassword: "管理密碼",
    adminSubmit: "登入",
    adminCancel: "取消",
    adminInvalid: "密碼錯誤。",
    adminSessionExpired: "登入已失效或未授權，請重新登入。",
    footer: "花蜜水晶花工藝 © 2026",
  },
};

const I18nCtx = createContext(null);

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(() => {
    try {
      const s = localStorage.getItem(LANG_KEY);
      if (s === "zh-TW" || s === "en") return s;
    } catch {
      /* ignore */
    }
    return "en";
  });

  const setLocale = useCallback((l) => {
    setLocaleState(l);
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (key) => messages[locale]?.[key] ?? messages.en[key] ?? key,
    [locale]
  );

  /** 主標優先中文 title，再 fallback en；副標為另一語系且與主標不同才顯示 */
  const workTitle = useCallback((work) => {
    const zh = (work.title || "").trim();
    const en = (work.en || "").trim();
    return zh || en || "";
  }, []);

  const workSubtitle = useCallback((work) => {
    const zh = (work.title || "").trim();
    const en = (work.en || "").trim();
    const main = zh || en;
    if (!main) return "";
    if (main === zh) return en && en !== zh ? en : "";
    return zh && zh !== en ? zh : "";
  }, []);

  const workDesc = useCallback(
    (work) =>
      locale === "en" ? work.descEn || work.desc : work.desc,
    [locale]
  );

  const workCat = useCallback(
    (work) => (locale === "en" ? CAT_EN[work.cat] || work.cat : work.cat),
    [locale]
  );

  const flowerName = useCallback(
    (f) => (locale === "en" ? f.en : f.name),
    [locale]
  );

  const formatPrice = useCallback(
    (ntd) => {
      const n = Number(ntd) || 0;
      if (locale === "en") {
        const usd = n / TWD_PER_USD;
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(usd);
      }
      return `NT$ ${n.toLocaleString("zh-TW")}`;
    },
    [locale]
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      workTitle,
      workSubtitle,
      workDesc,
      workCat,
      flowerName,
      formatPrice,
    }),
    [
      locale,
      setLocale,
      t,
      workTitle,
      workSubtitle,
      workDesc,
      workCat,
      flowerName,
      formatPrice,
    ]
  );

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
