import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

const LANG_KEY = "nectar_locale";

/** 後台與資料以 NTD 儲存；英文介面顯示 USD（約當匯率，僅供參考） */
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
    heroEyebrow: "Atelier — Est. 2026",
    heroDisplay: "A quiet study of preserved bloom.",
    heroTagline:
      "Each piece is composed in studio — measured, cut, and sealed by hand.",
    heroScroll: "Scroll",
    navCollection: "Collection",
    navVote: "Vote",
    navAdmin: "Admin",
    navExitAdmin: "Sign out",
    langEn: "EN",
    langZh: "CN",
    workViewDetails: "View details →",
    workSoldOut: "Sold out",
    workSpecKicker: "Specifications",
    workSpecDim: "Size",
    workSpecMaterial: "Materials",
    workSpecWeight: "Weight",
    socialKicker: "Social",
    socialInstagram: "Instagram",
    socialFacebook: "Facebook",
    socialPendingHint:
      "Set VITE_SOCIAL_INSTAGRAM and VITE_SOCIAL_FACEBOOK in your deploy env, then redeploy.",
    footerContact: "Contact",
    contactPendingHint:
      "Set VITE_CONTACT_EMAIL in your deploy env (address only), then redeploy.",
    verticalArt: "Nectar",
    portfolioEnd: "End of Collection",
    voteKicker: "Classroom Vote",
    voteTitle: "Course Wishlist",
    voteSub: "Vote for the flower you want to learn next",
    voteLeading: "Currently leading",
    voteVotes: "votes",
    voteVoted: "Voted",
    voteCoursePhotos: "Course photos (for poll)",
    voteCoursePhotosSub:
      "Upload an image per option so voters see your class visuals.",
    voteEditOption: "Edit options",
    voteNameZh: "Chinese name",
    voteNameEn: "English name",
    voteSaveNames: "Save names",
    voteHideFromPoll: "Hide from visitors",
    voteShowInPoll: "Show in poll",
    voteRemoveOption: "Remove option",
    voteRemoveOptionConfirm:
      "Remove this option from the poll? Votes for it will be lost. This cannot be undone.",
    voteHiddenBadge: "Hidden",
    wishKicker: "Wishing Pool",
    wishTitle: "Whisper a wish",
    wishSub: "Name a flower you'd like to learn next.",
    wishPlaceholder: "A flower's name…",
    wishSend: "Send",
    wishEmpty: "Be the first to whisper.",
    wishReset: "Reset all votes",
    voteIndexKicker: "The Index",
    voteRowViewers: "votes",
    detailAddAngles: "Add more angles",
    detailRemovePhotoConfirm:
      "Remove this photo from the gallery? This cannot be undone.",
    detailRemoveCover: "Remove cover image",
    detailCtaInquire: "Inquire to purchase",
    detailInquirySubjectPrefix: "Nectar inquiry:",
    detailClose: "Close",
    detailPriceLabel: "Price",
    photoTipTitle: "Photo tips",
    photoTipBody:
      "Full-bleed backgrounds use cover crop. Prefer 16:9 or 3:2 landscape, min width 2400px; keep the subject near the vertical center (slightly above middle). Tall 9:16 portraits crop heavily on ultrawide—crop to 16:9 before upload for the steadiest framing.",
    modalEdit: "Edit work",
    modalNew: "New work",
    modalName: "Chinese title",
    modalNameEn: "English title",
    modalPrice: "List price (NTD)",
    modalSoldOut: "Mark as sold out",
    modalSoldOutHint:
      "When on, price is hidden. You can also set price to 0 for the same display.",
    modalCat: "Category",
    modalDesc: "Chinese description",
    modalDescEn: "English description",
    modalCover: "Cover image",
    modalUploadHint: "Click to upload",
    modalUploaded: "Uploaded — click to replace",
    modalCancel: "Cancel",
    modalSave: "Save",
    modalSpecDim: "Dimensions (ZH)",
    modalSpecDimEn: "Dimensions (EN)",
    modalSpecMaterial: "Materials (ZH)",
    modalSpecMaterialEn: "Materials (EN)",
    modalSpecWeight: "Weight (ZH)",
    modalSpecWeightEn: "Weight (EN)",
    adminLoginTitle: "Admin sign-in",
    adminPassword: "Admin password",
    adminSubmit: "Sign in",
    adminCancel: "Cancel",
    adminInvalid: "Invalid password.",
    adminSessionExpired:
      "Session expired or unauthorized. Please sign in again.",
    footer: "Nectar © 2026",
  },
  "zh-TW": {
    navBrand: "花蜜水晶花工藝",
    heroEyebrow: "匠心工房 · Est. 2026",
    heroDisplay: "在寂靜中，留住一次盛放。",
    heroTagline: "每一件作品皆於工房完成：量測、裁切、封存，由手而成。",
    heroScroll: "向下",
    navCollection: "作品集",
    navVote: "投票",
    navAdmin: "管理",
    navExitAdmin: "登出",
    langEn: "英文",
    langZh: "繁中",
    workViewDetails: "查看詳情 →",
    workSoldOut: "已售罄",
    workSpecKicker: "規格",
    workSpecDim: "尺寸",
    workSpecMaterial: "材質",
    workSpecWeight: "重量",
    socialKicker: "社群",
    socialInstagram: "IG",
    socialFacebook: "FB",
    socialPendingHint:
      "請在 Cloudflare Pages 環境變數設定 VITE_SOCIAL_INSTAGRAM、VITE_SOCIAL_FACEBOOK（完整網址）後重新部署。",
    footerContact: "聯絡",
    contactPendingHint:
      "請在環境變數設定 VITE_CONTACT_EMAIL（僅信箱）後重新部署。",
    verticalArt: "花蜜水晶花工藝",
    portfolioEnd: "— 全系列瀏覽完畢 —",
    voteKicker: "課堂投票",
    voteTitle: "課程願望清單",
    voteSub: "投下你想學的那朵花",
    voteLeading: "目前領先",
    voteVotes: "票",
    voteVoted: "已投票",
    voteCoursePhotos: "課程圖片（投票用）",
    voteCoursePhotosSub: "每個選項可上傳一張圖，讓大家依圖投票。",
    voteEditOption: "編輯選項",
    voteNameZh: "中文名稱",
    voteNameEn: "英文名稱",
    voteSaveNames: "儲存名稱",
    voteHideFromPoll: "對訪客隱藏",
    voteShowInPoll: "顯示於投票",
    voteRemoveOption: "移除選項",
    voteRemoveOptionConfirm:
      "確定要從投票移除此選項嗎？該選項票數將一併刪除且無法復原。",
    voteHiddenBadge: "已隱藏",
    wishKicker: "心之所願",
    wishTitle: "低聲許一個願",
    wishSub: "寫下你想學的那朵花。",
    wishPlaceholder: "一個花的名字…",
    wishSend: "許願",
    wishEmpty: "成為第一個寫下的人。",
    wishReset: "重設所有票數",
    voteIndexKicker: "花種索引",
    voteRowViewers: "票",
    detailAddAngles: "新增更多角度",
    detailRemovePhotoConfirm: "要從圖庫移除此照片嗎？此操作無法復原。",
    detailRemoveCover: "移除主圖",
    detailCtaInquire: "聯絡洽購",
    detailInquirySubjectPrefix: "花蜜水晶花工藝洽詢：",
    detailClose: "關閉",
    detailPriceLabel: "價格",
    photoTipTitle: "相片建議",
    photoTipBody:
      "全螢幕背景會用 cover 裁切。建議 16:9 或 3:2 橫式、寬度至少約 2400px，主體放在畫面垂直中央略偏上。直式 9:16 在超寬螢幕上下會被裁掉很多；若希望主體穩定，可先裁成 16:9 再上傳。",
    modalEdit: "編輯作品",
    modalNew: "新增作品",
    modalName: "作品名稱",
    modalNameEn: "英文標題",
    modalPrice: "售價 NTD",
    modalSoldOut: "標示為已售罄",
    modalSoldOutHint: "開啟後不顯示價格；或將售價設為 0 元亦同。",
    modalCat: "分類",
    modalDesc: "作品說明",
    modalDescEn: "英文說明",
    modalCover: "主圖上傳",
    modalUploadHint: "點此上傳圖片",
    modalUploaded: "已上傳 — 點此更換",
    modalCancel: "取消",
    modalSave: "儲存",
    modalSpecDim: "尺寸（中文）",
    modalSpecDimEn: "尺寸（英文）",
    modalSpecMaterial: "材質（中文）",
    modalSpecMaterialEn: "材質（英文）",
    modalSpecWeight: "重量（中文）",
    modalSpecWeightEn: "重量（英文）",
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
    [locale],
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
    (work) => (locale === "en" ? work.descEn || work.desc : work.desc),
    [locale],
  );

  const workSpecDim = useCallback(
    (work) =>
      String(
        locale === "en"
          ? (work?.dimEn ?? work?.dim ?? "")
          : (work?.dim ?? work?.dimEn ?? ""),
      ).trim(),
    [locale],
  );
  const workSpecMaterial = useCallback(
    (work) =>
      String(
        locale === "en"
          ? (work?.materialEn ?? work?.material ?? "")
          : (work?.material ?? work?.materialEn ?? ""),
      ).trim(),
    [locale],
  );
  const workSpecWeight = useCallback(
    (work) =>
      String(
        locale === "en"
          ? (work?.weightEn ?? work?.weight ?? "")
          : (work?.weight ?? work?.weightEn ?? ""),
      ).trim(),
    [locale],
  );

  const workCat = useCallback(
    (work) => (locale === "en" ? CAT_EN[work.cat] || work.cat : work.cat),
    [locale],
  );

  const flowerName = useCallback(
    (f) => (locale === "en" ? f.en : f.name),
    [locale],
  );

  const formatPrice = useCallback(
    (ntd) => {
      const n = Number(ntd) || 0;
      if (locale === "en") {
        const usd = Math.round(n / TWD_PER_USD);
        return `USD ${usd.toLocaleString("en-US")}`;
      }
      return `NTD ${n.toLocaleString("zh-TW")}`;
    },
    [locale],
  );

  /** 售罄：開關 soldOut 或售價 ≤ 0（皆不顯示金額） */
  const workPriceLabel = useCallback(
    (work) => {
      if (!work) return "";
      const sold = work.soldOut === true || Number(work.price) <= 0;
      if (sold) return t("workSoldOut");
      return formatPrice(work.price);
    },
    [t, formatPrice],
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      workTitle,
      workSubtitle,
      workDesc,
      workSpecDim,
      workSpecMaterial,
      workSpecWeight,
      workCat,
      flowerName,
      formatPrice,
      workPriceLabel,
    }),
    [
      locale,
      setLocale,
      t,
      workTitle,
      workSubtitle,
      workDesc,
      workSpecDim,
      workSpecMaterial,
      workSpecWeight,
      workCat,
      flowerName,
      formatPrice,
      workPriceLabel,
    ],
  );

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
