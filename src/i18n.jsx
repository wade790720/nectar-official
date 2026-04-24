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
    navBrand: "Nectar Artistry",
    heroEyebrow: "Atelier — Est. 2026",
    heroDisplay: "A quiet study of preserved bloom.",
    heroTagline:
      "Each piece is composed in studio — measured, cut, and sealed by hand.",
    heroScroll: "Scroll",
    navCollection: "Portfolio",
    navVote: "Vote",
    navAbout: "About",
    navCourse: "Course",
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
    verticalArt: "Nectar Artistry",
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
    voteAddOption: "Add option",
    voteAddOptionHint:
      "A new option starts hidden. Pick an emoji or upload an image, name it, then show it in the poll.",
    voteNameZh: "Chinese name",
    voteNameEn: "English name",
    voteSaveNames: "Save",
    voteHideFromPoll: "Hide from visitors",
    voteShowInPoll: "Show in poll",
    voteVisibilityOn: "Visible",
    voteVisibilityOff: "Hidden",
    voteReplaceImage: "Click to replace",
    voteRemoveOption: "Remove",
    workDeleteConfirm:
      "Delete this work? All of its photos will be permanently removed. This cannot be undone.",
    wishResetConfirm:
      "Reset every tally to zero? All existing votes will be lost. This cannot be undone.",
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
    detailInquirySubjectPrefix: "Nectar Artistry inquiry:",
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
    aboutKicker: "The Atelier",
    aboutTitle: "A slow craft,\nfor a quieter hour.",
    aboutLead:
      "Nectar Artistry is a small atelier for preserved and crystal flowers. Each piece is built slowly measured, cut, sealed, and set aside to settle, so that a single arrangement can hold still for years without asking anything of you.",
    aboutPhilosophyKicker: "Philosophy",
    aboutPhilosophyTitle: "Of restraint.",
    aboutPhilosophyBody1:
      "We are not interested in abundance. We are interested in the smallest number of elements that still feels complete, the one stem that finishes a composition, the one shadow that gives it weight.",
    aboutPhilosophyBody2:
      "Every work is made to be lived with. Quiet colours, considered proportions, a surface that ages well. We design around the room, not around the photograph.",
    aboutProcessKicker: "Process",
    aboutProcessTitle: "Four movements.",
    aboutProcess1N: "I.",
    aboutProcess1T: "Source",
    aboutProcess1B:
      "Blooms selected in small lots from growers we trust. Preserved in studio.",
    aboutProcess2N: "II.",
    aboutProcess2T: "Sketch",
    aboutProcess2B:
      "A composition is drawn on paper before a single stem is cut. Proportion first.",
    aboutProcess3N: "III.",
    aboutProcess3T: "Compose",
    aboutProcess3B:
      "Built by hand over several sittings. Rested between. Adjusted until nothing wants changing.",
    aboutProcess4N: "IV.",
    aboutProcess4T: "Seal",
    aboutProcess4B:
      "Sealed under glass or resin, signed and numbered, then set aside to settle for a week.",
    aboutArtistKicker: "Artist",
    aboutArtistName: "Hsu Ting-Ting",
    aboutArtistTitle:
      "Associate Professor · MADOKA Crystal Flower Design Academy, Japan",
    aboutArtistSubtitle:
      "A designer's eye meets crystal-flower craft — devoted to both the making and the teaching of it.",
    aboutArtistFact1: "Founder of Nectar Artistry.",
    aboutArtistFact2:
      "A decade of practice in jewellery and crystal-flower craft.",
    aboutArtistFact3:
      "Seven years of teaching — walking beside each student learning to feel beauty.",
    aboutArtistFact4:
      "200+ stems of morning-dew higanbana helping students bloom, and blooming still.",
    aboutArtistBody1:
      "Crystal-flower craft is a doorway into aesthetics. It teaches you to feel again, to observe closely, and in every small detail, to taste the quiet current of life.",
    aboutArtistBody2:
      "In our time, \u201Cbeauty\u201D has already seeped into every corner of living from bearing and dress, to the texture of home, to visual design. Quietly, it shapes what each person chooses, and how they feel about their days.",
    aboutArtistBody3:
      "Beauty was never a privilege. It is a life skill that belongs to everyone. The moment you begin to feel it, tell it apart, and make it every choice you make starts to change.",
    aboutArtistBody4:
      "In this course, what I hope to give you is not merely one beautiful flower, but a pair of eyes that find beauty everywhere.",
    aboutArtistUploadPortrait: "Upload portrait",
    aboutArtistReplacePortrait: "Replace portrait",
    aboutArtistRemovePortrait: "Remove portrait",
    aboutArtistRemovePortraitConfirm:
      "Remove the portrait photo? This cannot be undone.",
    aboutArtistUploadSignature: "Upload signature",
    aboutArtistReplaceSignature: "Replace signature",
    aboutArtistRemoveSignature: "Remove signature",
    aboutArtistRemoveSignatureConfirm:
      "Remove the signature file? This cannot be undone.",
    aboutArtistPortraitHint:
      "A vertical portrait reads best. Transparent PNG with no background works best for the signature, so it can sit over the photograph.",
    aboutStudioKicker: "Studio",
    aboutStudioTitle: "By appointment.",
    aboutStudioBody:
      "Courses, certifications, material sales, and brand collaborations are available by private appointment only. Please contact us via email first; we will respond within two business days.",
    aboutCtaNote: "For commissions and classes",
    aboutCtaEmail: "Write to the studio",
    aboutCtaInstagram: "On Instagram",
    footer: "Nectar Artistry © 2026",
  },
  "zh-TW": {
    navBrand: "花蜜水晶花工藝",
    heroEyebrow: "匠心工房 · Est. 2026",
    heroDisplay: "在寂靜中\n留住一次盛放",
    heroTagline: "每一件作品皆於工房完成：量測、裁切、封存，由手而成。",
    heroScroll: "向下",
    navCollection: "作品集",
    navVote: "投票",
    navAbout: "關於",
    navCourse: "課程",
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
    voteAddOption: "新增選項",
    voteAddOptionHint:
      "新增的選項預設為隱藏。請先挑一個 emoji 或上傳圖片、填好名稱，再於投票中顯示。",
    voteNameZh: "中文名稱",
    voteNameEn: "英文名稱",
    voteSaveNames: "儲存",
    voteHideFromPoll: "對訪客隱藏",
    voteShowInPoll: "顯示於投票",
    voteVisibilityOn: "顯示",
    voteVisibilityOff: "隱藏",
    voteReplaceImage: "點此更換",
    voteRemoveOption: "移除",
    workDeleteConfirm:
      "確定要刪除這幅作品嗎？所有相關照片都會一併移除，且無法復原。",
    wishResetConfirm: "確定要將所有票數歸零嗎？目前的投票紀錄將一併清除，且無法復原。",
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
    aboutKicker: "工坊誌",
    aboutTitle: "以慢工藝 \n換一段靜時刻",
    aboutLead:
      "花蜜水晶花工藝是一間小工房，以水晶花為主要媒材。\n每件作品從選料、裁切、組合到封存，都經過足夠沉靜的時間，能夠在日常裡靜靜安放多年，而不必被反覆照看，實現永恆。",
    aboutPhilosophyKicker: "理念",
    aboutPhilosophyTitle: "關於美學",
    aboutPhilosophyBody1:
      "我們不追求繁盛，而在意構圖所需的最少元素，讓一件作品完成的，往往是那唯一一枝、那唯一一道留白。",
    aboutPhilosophyBody2:
      "每件作品都是為了被生活所使用而設計：低彩度、斟酌過的比例、耐看的紋理。我們為空間而做，不為鏡頭而做。",
    aboutProcessKicker: "工序",
    aboutProcessTitle: "四段工序",
    aboutProcess1N: "一",
    aboutProcess1T: "選料",
    aboutProcess1B: "由信任的花農小批供花，於工房內完成保存與處理。",
    aboutProcess2N: "二",
    aboutProcess2T: "草圖",
    aboutProcess2B: "在下刀之前先於紙上推敲構圖，確立比例與方向。",
    aboutProcess3N: "三",
    aboutProcess3T: "組合",
    aboutProcess3B: "分數次手工組合，段與段之間靜置沉澱。",
    aboutProcess4N: "四",
    aboutProcess4T: "封存",
    aboutProcess4B: "以玻璃罩或樹脂封存，落款編號後靜置一週方出廠。",
    aboutArtistKicker: "藝術家介紹",
    aboutArtistName: "許婷婷",
    aboutArtistTitle: "日本水晶花 MADOKA 花藝設計學院 · 副教授",
    aboutArtistSubtitle: "擁有設計美學背景，專注於水晶花工藝創作與教學。",
    aboutArtistFact1: "花蜜創辦人。",
    aboutArtistFact2: "十年，飾品與水晶花工藝創作經驗。",
    aboutArtistFact3: "七年，用教學陪伴每一位，正在學會感受美的你。",
    aboutArtistFact4: "200+ 枝朝露彼岸花，幫助學員盛開，至今仍持續盛放。",
    aboutArtistBody1:
      "水晶花工藝，是一扇美學之門，帶你重新學會感受、學會觀察、學會在每一個細節中，品味生命力的流動。",
    aboutArtistBody2:
      "在這個時代，「美」早已滲透進生活的每一個角落，從儀態穿搭、到居家品味、視覺設計，美感正在悄悄決定一個人的選擇與生活感受。",
    aboutArtistBody3:
      "美，從來不是特權，是每個人值得擁有的生活能力。當開始感受美、辨別美、創造美，生活的每一個選擇，都會因此不同。",
    aboutArtistBody4:
      "我希望給你的，不只是一枝美麗的花，而是一雙發現美的眼睛。",
    aboutArtistUploadPortrait: "上傳肖像",
    aboutArtistReplacePortrait: "更換肖像",
    aboutArtistRemovePortrait: "移除肖像",
    aboutArtistRemovePortraitConfirm: "確定要移除肖像照嗎？此操作無法復原。",
    aboutArtistUploadSignature: "上傳簽名",
    aboutArtistReplaceSignature: "更換簽名",
    aboutArtistRemoveSignature: "移除簽名",
    aboutArtistRemoveSignatureConfirm: "確定要移除簽名檔嗎？此操作無法復原。",
    aboutArtistPortraitHint:
      "建議上傳直式肖像；簽名建議使用「透明背景」PNG，會疊在照片左下方。",
    aboutStudioKicker: "工作室",
    aboutStudioTitle: "完全預約制。",
    aboutStudioBody:
      "課程・證照・材料販售・品牌合作皆採私下預約。歡迎先來信，我們於兩個工作日內回覆。",
    aboutCtaNote: "客製與課程事宜",
    aboutCtaEmail: "寫信到工作室",
    aboutCtaInstagram: "透過 Instagram",
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
