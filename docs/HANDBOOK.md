# Nectar Artistry 從零打造手冊

> 一份把真實專案整個做過一遍的教材。
> 記錄一個 Shokunin（日本職人）美學水晶花藝術家網站，從 3000 行單檔到模組化、
> 上 Cloudflare R2、接管理後台、做 SEO、加路由、接 Zaraz 的全過程。
>
> 讀這份手冊的目的不是抄方案，而是看每一步**為什麼這樣決定**。

- **Stack**：React 18 + Vite 5 + Cloudflare Pages Functions + Cloudflare R2
- **範圍**：單頁作品集 → 多頁站點（Home / About / Gallery / Vote），含管理後台
- **正式站**：<https://www.lustreyellow.com/>

---

## 目錄

- [小白術語小辭典（隨時查）](#小白術語小辭典隨時查)
- [Part 1｜專案總覽](#part-1專案總覽)
  - [1.1 我們蓋了什麼](#11-我們蓋了什麼)
  - [1.2 技術選型與原因](#12-技術選型與原因)
  - [1.3 設計哲學：Shokunin 職人精神](#13-設計哲學shokunin-職人精神)
- [Part 2｜開發時間軸（九個階段）](#part-2開發時間軸九個階段)
- [Part 3｜設計 Prompt 對話法：從 Generic 到 High-end](#part-3設計-prompt-對話法從-generic-到-high-end)
  - [3.1 為什麼 AI 預設會做出「很網站」的設計](#31-為什麼-ai-預設會做出很網站的設計)
  - [3.2 設計憲章 Prompt：一次奠定基調](#32-設計憲章-prompt一次奠定基調)
  - [3.3 走出 Generic 的四個階段（Prompt 節奏感）](#33-走出-generic-的四個階段prompt-節奏感)
  - [3.4 個案拆解：Hero 光暈的三次來回](#34-個案拆解hero-光暈的三次來回)
  - [3.5 個案拆解：Vote 頁從功能頁變成編輯感](#35-個案拆解vote-頁從功能頁變成編輯感)
  - [3.6 個案拆解：Mobile Nav 從「能用」到「好看」](#36-個案拆解mobile-nav-從能用到好看)
  - [3.7 設計 Prompt 技巧清單（可複用模板）](#37-設計-prompt-技巧清單可複用模板)
  - [3.8 不要犯的 Prompt 錯誤](#38-不要犯的-prompt-錯誤)
- [Part 4｜核心技術章節](#part-4核心技術章節)
  - [Ch.1 元件拆分：Bulletproof 部分採用](#ch1-元件拆分bulletproof-部分採用)
  - [Ch.2 資料驅動 UI 與 i18n](#ch2-資料驅動-ui-與-i18n)
  - [Ch.3 Cloudflare Pages + R2 後端](#ch3-cloudflare-pages--r2-後端)
  - [Ch.4 管理者權限與資料同步](#ch4-管理者權限與資料同步)
  - [Ch.5 圖片生命週期：上傳、追蹤、清理](#ch5-圖片生命週期上傳追蹤清理)
  - [Ch.6 Scroll Snap 與滾動體驗](#ch6-scroll-snap-與滾動體驗)
  - [Ch.7 Hero 視覺實驗：Canvas vs CSS 光暈](#ch7-hero-視覺實驗canvas-vs-css-光暈)
  - [Ch.8 Mobile-First 導覽列](#ch8-mobile-first-導覽列)
  - [Ch.9 效能排查：Vote 頁捲動卡頓](#ch9-效能排查vote-頁捲動卡頓)
  - [Ch.10 資料完整性：訪客合併 + Admin 立即 flush](#ch10-資料完整性訪客合併--admin-立即-flush)
  - [Ch.11 防呆確認：從 alert 到 ConfirmDialog](#ch11-防呆確認從-alert-到-confirmdialog)
  - [Ch.12 SEO：標題、描述、OG、Canonical](#ch12-seo標題描述ogcanonical)
  - [Ch.13 路由：HTML5 History + 每頁 Meta](#ch13-路由html5-history--每頁-meta)
- [Part 5｜通用心法](#part-5通用心法)
- [Part 6｜User Prompt 精選附錄（依時序）](#part-6user-prompt-精選附錄依時序)
- [附錄：檔案結構速查](#附錄檔案結構速查)

---

## 小白術語小辭典（隨時查）

手冊裡會反覆出現這些詞。一開始看不懂完全正常，跳過讀完再回來查。

### React 與前端基礎

| 術語                 | 白話解釋                                                                       |
| -------------------- | ------------------------------------------------------------------------------ |
| **SPA**              | Single Page Application，單頁應用。整站只載入一次 HTML，切頁由 JS 在瀏覽器內切 |
| **Component / 元件** | 可重用的 UI 積木（`Button`、`HeroSlide` 都是元件）                             |
| **Props**            | 元件從父層接收到的參數，唯讀                                                   |
| **State / 狀態**     | 元件會「記住」、變動時會觸發重繪的資料                                         |
| **Hook**             | React 的函式型 API（`useState`、`useEffect`、`useMemo`…），讓函式元件有狀態    |
| **JSX**              | React 語法：可以在 JS 裡寫 HTML 標籤                                           |
| **Re-render 重繪**   | State 或 props 變化時，React 重新執行元件函式、更新畫面                        |
| **Context**          | 跨元件共享資料的機制（如 i18n、登入狀態），不用一層層傳 props                  |
| **Bundle（資料包）** | 這份專案裡指整站資料的 JSON（`works + votes + wishes + artist + courses`）     |

### CSS / 視覺

| 術語                | 白話解釋                                                             |
| ------------------- | -------------------------------------------------------------------- |
| **Design Token**    | 全站共用的設計參數（顏色、間距、動畫曲線），以 CSS Variable 形式實作 |
| **CSS Variable**    | `--var-name: value;`，可跨檔共享的 CSS 變數                          |
| **keyframes**       | CSS 動畫關鍵影格（定義 0%、50%、100% 的樣子）                        |
| **radial-gradient** | 放射狀漸層，常用來做光暈                                             |
| **backdrop-filter** | 對元素「後面」的背景做濾鏡（毛玻璃效果）                             |
| **scroll-snap**     | CSS 讓捲動「吸附」到指定位置的能力（本專案 Home 頁用）               |
| **ease curve**      | 動畫加速曲線，`cubic-bezier(...)` 能做出「慢—快—慢」的自然感         |

### 瀏覽器 / Web API

| 術語               | 白話解釋                                                          |
| ------------------ | ----------------------------------------------------------------- |
| **DOM**            | Document Object Model，瀏覽器把 HTML 變成可操作的樹狀物件         |
| **localStorage**   | 瀏覽器本地儲存空間，**關掉瀏覽器也還在**（本專案存 `voted` 狀態） |
| **sessionStorage** | 瀏覽器本地儲存空間，**關分頁就消失**（本專案存 admin token）      |
| **Debounce**       | 等一段時間沒新動作才執行一次（打字停了才去搜尋）                  |
| **Flush**          | 強制把緩衝中的動作立刻執行                                        |
| **keepalive**      | `fetch` 的選項：即使頁面關掉，請求也會送完                        |
| **pagehide**       | 瀏覽器事件：使用者離開頁面時觸發，用來做最後一次儲存              |

### 資料 / API / 後端

| 術語             | 白話解釋                                                             |
| ---------------- | -------------------------------------------------------------------- |
| **CRUD**         | Create / Read / Update / Delete，增刪改查。資料操作的四件事          |
| **API**          | 程式之間溝通的介面。本專案指 `/api/data`、`/api/upload` 這類後端端點 |
| **Bearer Token** | HTTP 認證格式，在 header 塞 `Authorization: Bearer <token>`          |
| **Secret**       | 不能曝光的密鑰，存雲端平台的 Secret 區，絕不進 git                   |
| **JSON**         | 資料交換格式（`{ "key": "value" }`）                                 |
| **multipart**    | 上傳檔案用的 HTTP body 格式                                          |
| **MIME type**    | 檔案類型標記（`image/jpeg`、`application/json`）                     |
| **Merge 合併**   | 新舊資料的融合邏輯（本專案訪客投票時，只合併票數不蓋選項）           |

### 雲端 / 部署

| 術語                 | 白話解釋                                                                    |
| -------------------- | --------------------------------------------------------------------------- |
| **Cloudflare Pages** | Cloudflare 的靜態網站 + 邊緣函式託管服務，免費且快                          |
| **Pages Functions**  | Pages 站點附帶的邊緣函式（相當於小型 API server），放在 `/functions` 資料夾 |
| **Cloudflare R2**    | Cloudflare 的物件儲存（類似 AWS S3），存圖片與 JSON                         |
| **Bucket 桶**        | 物件儲存的容器，一個專案通常用一個 bucket                                   |
| **邊緣（Edge）**     | 指離使用者最近的節點，能降低延遲                                            |
| **Zaraz**            | Cloudflare 的第三方腳本管理工具，在邊緣執行 GA / Pixel 等追蹤腳本           |
| **GA4**              | Google Analytics 4，Google 的網站分析服務                                   |
| **SPA fallback**     | 靜態主機的通用設定：所有非 API 請求都回 `index.html`，讓前端路由接手        |

### SEO

| 術語                | 白話解釋                                                                   |
| ------------------- | -------------------------------------------------------------------------- |
| **SEO**             | Search Engine Optimization，搜尋引擎優化                                   |
| **Meta tag**        | HTML `<head>` 裡的中繼資訊標籤（title、description、og 等）                |
| **OG / Open Graph** | Facebook 發明的分享預覽標準，LINE / Twitter 等社群也用                     |
| **Canonical URL**   | 告訴搜尋引擎「這頁的正式網址」，避免重複內容扣分                           |
| **JSON-LD**         | 結構化資料格式，幫搜尋引擎理解網站是什麼類型（WebSite / Person / Product） |

### 工具與概念

| 術語              | 白話解釋                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------- |
| **Vite**          | 前端建置工具，開發時超快、打包產出小                                                        |
| **Prettier**      | 自動程式碼格式化工具                                                                        |
| **ESLint**        | JS 語法檢查器                                                                               |
| **Refactor 重構** | 不改功能、只改結構的程式碼改寫（目的：更好讀、更好改）                                      |
| **Bulletproof**   | 一套 React 專案組織原則（來自 Alan Alickovic 同名開源書），主張分層清楚、資料驅動、邏輯抽離 |
| **i18n**          | internationalization 的縮寫（i 到 n 之間有 18 個字母），指多語系支援                        |
| **Shokunin**      | 日文「職人」，形容把一件事做到極致的工匠精神                                                |
| **RBAC**          | Role-Based Access Control，角色權限控制（如 admin / editor / viewer 分級）                  |
| **UUID**          | 通用唯一識別碼（例：`7b3a...`），本專案用來幫上傳的圖檔取名                                 |

---

## Part 1｜專案總覽

### 1.1 我們蓋了什麼

一個以台灣水晶花工藝為主題的品牌形象網站，同時也是後台管理工具：

| 頁面    | 路徑                              | 功能                                 |
| ------- | --------------------------------- | ------------------------------------ |
| Home    | `/`                               | Hero + 前 6 件作品（直向編輯式瀏覽） |
| About   | `/about`                          | 藝術家介紹、工作方法、聯絡 CTA       |
| Gallery | `/gallery`                        | 全部作品 + 課程影像集                |
| Vote    | `/vote`                           | 作品票選、許願池                     |
| Course  | 外連 `https://yellow510.kaik.io/` | （不進路由）                         |

**後台功能**：

- 作品 CRUD（含主圖、縮圖集、尺寸／材質／重量 specs、價格）
- About 頁藝術家肖像與簽名圖上傳
- Gallery 課程影像 CRUD
- Vote 選項 CRUD、隱藏、替換圖、刪除、重設票數
- 許願池留言刪除

**資料流**：瀏覽器 ↔ Cloudflare Pages Functions（邊緣函式）↔ R2（JSON bundle + 圖片物件）

**工程風格的定位**：本專案**部分**採用 [Bulletproof React](https://github.com/alan2207/bulletproof-react) 的思路 ——
取其「邏輯抽離 / 資料驅動 UI / 分層目錄」三條，但沒有走到它完整那套（`features/` 資料夾切分、
每個 feature 獨立 Zustand store、TanStack Query、DDD 風格的 `api/` 層）。

為什麼只採一部分？規模不到。形象站 + 4 頁，一個殼層 + 13 個元件 + 4 個頁面就乾淨俐落。
Bulletproof 完整套件是為 10+ feature 的應用設計的，硬套進來反而笨重。**規則跟規模要匹配**，
這是最重要的取捨。[→ 詳見 Ch.1](#ch1-元件拆分bulletproof-部分採用)

---

### 1.2 技術選型與原因

| 類別     | 選擇                             | 為什麼                                                           |
| -------- | -------------------------------- | ---------------------------------------------------------------- |
| 框架     | React 18 + Vite 5                | 形象站規模小，不需要 Next.js 的 SSR；Vite 快、無儀式感           |
| 樣式     | 自寫 CSS + design tokens         | 追 Shokunin 美學時，CSS-in-JS / Tailwind 反而太吵；tokens 保精準 |
| i18n     | 自寫 `I18nProvider`              | 只有中英雙語，2KB 就搞定；不需要 react-intl 的重量               |
| 後端     | Cloudflare Pages Functions       | 跟網站同網域、免冷啟動、免管理伺服器                             |
| 儲存     | Cloudflare R2                    | S3 相容 API、免出站費用、跟 Pages 同生態                         |
| 管理認證 | 共享 secret bearer               | 1 人站長無需 OAuth；`ADMIN_SECRET` 存 Cloudflare Secret          |
| 路由     | react-router-dom（史上最晚才加） | 早期 4 頁用 state 切就夠；要 GA / 分享 / SEO 才升級              |
| 分析     | 不埋 gtag，交給 Cloudflare Zaraz | 雲端配置即可，不佔 runtime、自帶 consent                         |
| 格式化   | Prettier + ESLint                | 保底                                                             |

**關鍵思考**：**用最少的東西把事情做好**。每多一個相依就多一份維護責任。直到真有需要才升級（例如路由）。

---

### 1.3 設計哲學：Shokunin 職人精神

這份規範在第 11 個 prompt 被明確提出，之後所有設計決策都回去對照它：

> Do not produce generic UI. Push for world-class execution quality.
> You are a world-class digital designer with the craftsmanship mindset of a Japanese artisan (Shokunin).

核心原則：

1. **Minimalism as foundation**：留白不是省略，是刻意
2. **Editorial sophistication**：不對稱編排、節奏感
3. **Content-first**：作品永遠是主角，UI「消失」
4. **Mobile-first, but equally exceptional on desktop**
5. **Precision spacing system**：每個 padding／margin 都要有理由
6. **Typography-driven hierarchy**：字體、字重、字距取代裝飾
7. **Subtle micro-interactions**：慢、刻意、絕不華麗

**實務對應：**

- 拒絕 SaaS 感：不做 drop shadow 的卡片、不做高彩度按鈕
- 顏色：黑底 `#080706` + 奶油白 `#F5F0EB` + 金 `#C9A96E`，全站高對比低彩度
- 字體：`Instrument Serif` (英) × `Noto Serif TC` (中) + `Inter` (sans)
- 動畫：慢曲線（`cubic-bezier(0.2, 0.8, 0.2, 1)`），300ms+ 起跳
- 手寫感：細髮絲線條（`rgba(201,169,110,0.12)` 1px）

---

## Part 2｜開發時間軸（九個階段）

> 專案從頭到尾走過的九個大階段。每階段都是一次 prompt 批次的總成。

### 第 1 階段：Bulletproof 重構（單檔 3000 行 → 模組化）

**痛點**：`Portfolio.jsx` 肥到 3000 行，邏輯與 UI 混在一起，文案寫死在 JSX。

**採用的「Bulletproof」精華**：

1. 邏輯抽離：`return (...)` 佔 70%+，副作用進 hooks
2. 資料驅動：網站文案集中到 `src/config/content.js`
3. 分層目錄：`components/` `sections/` `hooks/` `config/`

**產出**：`src/` 從 1 檔拆成約 30 個模組。每個檔案只做一件事。

### 第 2 階段：作品規格欄位

加上 size / material / weight 可編輯欄位，首頁卡片與 DetailLightbox 都顯示；排序嚴格 Weight → Size → Materials（通常越短的欄位放前面，節奏比較好看）。

### 第 3 階段：Scroll Snap 滾動體驗

`scroll-snap-type: y mandatory` 一開始太剛強，由上往下 snap 位置會偏一點。改 `proximity` 稍軟、再用關鍵幀 `scroll-margin-top` 對齊；手機板不 snap，改成自然滾。

### 第 4 階段：Shokunin 設計升級

從這裡開始全面重構 Hero、WorkSlide、DetailLightbox、Vote 頁。加入 design tokens：

```
src/styles/tokens.css
  --bg-base: #080706;
  --text-primary: #F5F0EB;
  --accent-gold: #C9A96E;
  --ease-editorial: cubic-bezier(0.2, 0.8, 0.2, 1);
  --dur-short: 220ms;
  --dur-long: 640ms;
```

### 第 5 階段：後端接入 — R2 + Cloudflare Pages Functions

痛點：資料儲 localStorage，換裝置就沒了。改走：

```
functions/api/
  data.js       GET/PUT data.json
  upload.js     POST file → R2 images/<uuid>.<ext>
  delete.js     POST urls[] → R2 刪除（best-effort）
  file/[[path]].js  GET R2 物件
  admin/verify.js   驗證管理密碼
```

順便回答了：**上傳圖會不會堆積垃圾？**會，所以同時做了[圖片參照追蹤系統](#ch5-圖片生命週期上傳追蹤清理)。

### 第 6 階段：內容擴張（About / Gallery / Course）

- About：藝術家肖像＋簽名＋製程四步驟
- Gallery：分成「藝術品」（= Home 作品資料）＋「課程」（獨立資料）
- Course：Nav 外連到 `yellow510.kaik.io`
- i18n 補：Gallery→畫廊、Works→藝術品

**同時**：把 `Portfolio.jsx` 拆成 `PortfolioPage.jsx` + `VotePage.jsx`（後來又改名）。

### 第 7 階段：品牌與 SEO 基礎

- `Nectar` → `Nectar Artistry`
- 換 `.ico`、量身 1200×630 OG 圖
- `og:title`：`Nectar Artistry · 花蜜水晶花工藝`
- `og:description`：_Elegant floral artistry from Taiwan…_
- Course Nav 配套 1440×500 banner

### 第 8 階段：Mobile-First 導覽 + Hero 視覺實驗

- 漢堡選單 + 全螢幕 overlay，語言切換放 overlay 底部
- 兩階段漢堡動畫、staggered 選單項目進場
- Hero 背景嘗試 Canvas 光纖（`HeroFiberLines.jsx`）→ 覺得不對 →
  改 CSS 右下角呼吸光暈（alpha 0.14、58%×48%、8s 週期）
- 首頁 Scroll 指示器放大加明顯
- Portfolio 從 nav 拿掉（它就是首頁）
- Gallery Works 支援新增作品，首頁只顯示前 6 件

### 第 9 階段：結構正名 + Prettier + SEO 關鍵字

- `Portfolio.jsx` → `NectarApp.jsx`（是殼層不是頁面）
- `PortfolioPage.jsx` → `HomePage.jsx`（命名對齊 URL）
- `html.portfolio-scroll-snap` → `html.home-scroll-snap`
- 刪除 `HeroFiberLines.jsx`、`public/vite.svg`、`src/assets/react.svg`
- 整個 repo 跑 Prettier
- `index.html` 加 `<meta name="keywords">` `dipart, dipflower, americanflower, 水晶花`
- 加 JSON-LD `WebSite` schema
- 加 `<link rel="canonical">` `https://www.lustreyellow.com/`
- OG / Twitter image 改絕對 URL
- README 完整重寫

### 第 10 階段：效能與資料完整性

- Vote 頁捲動卡頓 → 移除 `transition-delay: i * 40ms` → 改圖片 lazy-load →
  refactor Danmaku（許願跑馬燈）減少 re-render + 支援 `prefers-reduced-motion`
- Vote 資料遺失（新增選項、換圖被覆寫）→ 後端加 `mergeVisitorVoteCounts`，
  訪客 PUT 只合併票數不蓋選項
- 上傳後 refresh 沒替換 → 加 `forceFlushBundle` + `keepalive: true`

### 第 11 階段：路由 + 追蹤

- 裝 react-router-dom、`pg` state 改由 `useLocation` 衍生
- `usePageMeta` hook 在切頁更新 `document.title` / 描述 / og / canonical
- `public/_redirects` SPA fallback
- GA 不埋 gtag，用 Cloudflare Zaraz 自動 track SPA
- 同時把 `voted` 狀態存到 localStorage，解決「F5 後可以重投」

---

## Part 3｜設計 Prompt 對話法：從 Generic 到 High-end

> 這一部分是本手冊的核心教材。技術章節誰都能抄，但**怎麼跟 AI 聊出不像 AI 做的網站**，才是稀有技能。

---

### 3.1 為什麼 AI 預設會做出「很網站」的設計

AI 的訓練資料裡，網站類素材有 **80% 是 SaaS、電商、工具型首頁**。
如果你只丟「幫我做個作品集網站」，AI 預設會長出：

- 超大 Hero 標題 + gradient 漸層背景
- 明顯的主視覺 CTA 按鈕（帶 box-shadow、hover 會放大）
- `feature × 3` 的卡片網格
- Inter 字體 + 中性灰藍
- `fade-in-up` 進場動畫

這不是 AI 不行，是你**沒給約束**。這套預設長相叫「generic SaaS aesthetic」——
能用、不醜、但沒有靈魂，放到藝術家網站就會看起來像 Notion 的登陸頁。

**解法有兩件事**：

1. **先給身份**：告訴 AI「你是誰」—— 是 SaaS 設計師還是美術館網站設計師
2. **再給禁止**：告訴 AI「不要做什麼」—— 比「要做什麼」更有力

---

### 3.2 設計憲章 Prompt：一次奠定基調

在第 11 個 prompt，使用者丟了一段完整的「設計憲章」。這段 prompt 決定了之後所有設計對話的基準：

```text
Do not produce generic UI. Push for world-class execution quality.

You are a world-class digital designer with the craftsmanship mindset of a
Japanese artisan (Shokunin). Your task is to design a top-tier, high-end
art portfolio website.

Design philosophy:
* Extreme attention to detail, precision, and restraint
* Every element must feel intentional, refined, and necessary
* Avoid anything generic, template-like, or overly trendy
* Prioritize timeless elegance over decoration

Core principles:
1. Minimalism as foundation (Apple-level clarity)
2. Editorial sophistication (asymmetrical grid, refined layout rhythm)
3. Content-first (artwork is always the hero)
4. Mobile-first, but equally exceptional on desktop
5. Precision spacing system
6. Typography-driven hierarchy
7. Subtle, high-quality micro-interactions (never flashy)

Motion & interaction:
* Use slow, intentional animations (refined easing, not default curves)
* Hover states should be subtle and tactile
* No excessive animation — only where it enhances perception

Visual tone:
* High-end, quiet luxury
* Inspired by premium editorial design, galleries, and museum websites
* Avoid UI elements that feel like SaaS (no heavy buttons, cards, or
  obvious components)
```

#### 這段 prompt 為什麼有效？拆解給你看

| 段落            | 作用                                        | 如何移植                                           |
| --------------- | ------------------------------------------- | -------------------------------------------------- |
| **第一句**      | 直接否定預設（"Do not produce generic UI"） | 替換為你要拒絕的風格（"Do not produce corporate"） |
| **Identity**    | 給 AI 扮演一個具體身份                      | 換成任何具體職業 + 文化原型（"瑞士版畫設計師"）    |
| **Philosophy**  | 4 條哲學，全是形容詞，規範情緒              | 挑 3-5 個形容詞（restraint / bold / playful…）     |
| **Core 7**      | 可檢核的規則，每條都能對照現成元素          | 你的專案就挑 5-7 條                                |
| **Motion**      | 具體到曲線 / 速度，AI 才不會用預設 ease     | 一定要寫「不要什麼動畫」                           |
| **Visual tone** | 舉同類參考（"museum websites"）             | 永遠給對照組 —— "不像 X，像 Y"                     |

#### 要點：「禁止」比「要求」強大

回頭看第一段：

- ✅ `Do not produce generic UI` ← 明確禁止
- ✅ `Avoid anything template-like` ← 排除
- ✅ `No heavy buttons, cards` ← 點名拒絕

AI 預設會做加法，這段 prompt 強制它做減法。這是讓產出跳出訓練資料均值的關鍵。

---

### 3.3 走出 Generic 的四個階段（Prompt 節奏感）

觀察 66 則真實對話，使用者逐步掌握了 prompt 節奏。這四個階段可以照抄：

#### 階段 1｜大方向 Prompt（AI 給出保底版）

> _「幫我加上 scroll snap」_

AI 給什麼：預設最保守的 `scroll-snap-type: y mandatory`，能用但**過頭**。

這階段不要期待一次到位，讓 AI 先給 baseline。**你的下一步是回饋體感。**

#### 階段 2｜體感回饋 Prompt（AI 要把感覺翻譯成參數）

> _「看起來有點卡 不夠滑順」_
> _「由上往下滾，滾動到下一幅時，上面都會差一點點」_

這類 prompt 對 AI 是**診斷題**。好的 AI 會把你的體感翻譯成：

- 「卡」→ 過度剛性的 `mandatory` → 改 `proximity`
- 「不夠滑順」→ `scroll-snap-stop: always` 在每個段落黏住 → 改 `normal`
- 「上面都會差一點點」→ 沒有 `scroll-margin-top` 預留 nav 空間 → 加 72px

**教學重點**：你不用會 CSS，但要學會**用具體場景描述問題**（「往下滾時」、「不夠滑順」）。
「不好看」「怪怪的」這種話無法診斷，AI 只會胡亂猜。

#### 階段 3｜對照組 Prompt（讓 AI 做 A/B 選擇）

> _「你覺得這個好 還是光暈好? 光雲之前是右上角 假設光暈到右下角 忽明忽暗的」_

這是最高效的 prompt 模式之一。你給 A、B 兩個方向，AI 一次給你雙方案比較，
你從中挑一個，或把兩個的優點合併。

**為什麼有效**：AI 不用「猜你心思」，它只要做「評估與取捨」，這是它更擅長的任務。

#### 階段 4｜確認後放行 Prompt（你下最終判斷）

> _「不用 直接做光暈版本」_
> _「好 你試調看看」_

此時你已經知道要什麼。下簡短指令，AI 專心執行。

**節奏感結論**：

```
大方向（丟出去）→ 體感回饋（翻譯）→ 對照組（決策）→ 放行（執行）
    粗略勾勒          精緻調整           最終決定        快速收斂
```

每次迭代 3-5 回合內收斂，不要陷入無止境的 tweak。

---

### 3.4 個案拆解：Hero 光暈的三次來回

Hero 背景動效是本專案**最反覆**的一個元素。完整對話軌跡如下：

#### Round 1：第一次嘗試 `background-image` 漸層流動（被拒絕）

使用者給了 `nectar-hero-animation-prompt.md` 附件 +「try it & dont push」。

AI 實作：用 `background: linear-gradient(...)` + `@keyframes` 位移，做黑底暗金流動。
語法上正確、瀏覽器支援度也高、無需 JS。

使用者回饋：

> _「黑底極輕微暗金流動光影 這個移除 效果看起來不好」_

**問題根因**：漸層流動**視覺語彙與高端畫廊不符**，反而像 SaaS 登入頁。
技術正確 ≠ 美學正確。

#### Round 2：提出對照組（Canvas 光纖 vs CSS 光暈）

使用者開始用 **對照組 prompt**：

> _「你覺得這個好 還是光暈好? 光雲之前是右上角 假設光暈到右下角 忽明忽暗的」_

這句 prompt 的精華：

1. **給 AI 判斷權**（"你覺得"）
2. **提供具體座標**（"右下角"）
3. **描述節奏感**（"忽明忽暗"）—— 是 "pulse" 不是 "flow"

AI 回：比較兩方案利弊，建議 CSS 光暈（輕量、Shokunin 感、無 GPU 峰值）。

使用者：

> _「不用 直接做光暈版本」_

一句話執行落地，連 Canvas 版本的 `HeroFiberLines.jsx` 都刪掉。

#### Round 3：微調參數（位置 / 強度 / 速度）

> _「你覺得光暈放在 Hero 的中間比較好 還是右下角比較好?」_
> _「好 你試調看看」_

這時的 prompt 全部是**單參數微調**，不再重定義方向。AI 最後定版：

```css
.hero-slide::before {
  right: -10%;
  bottom: -15%;
  width: 58%;
  height: 48%;
  background: radial-gradient(
    circle,
    rgba(201, 169, 110, 0.14) 0%,
    /* α=0.14，安靜不發光 */ rgba(201, 169, 110, 0) 60%
  );
  animation: heroGlow 8s ease-in-out infinite;
}
```

#### 教訓：三次來回才能到位，這很正常

| Round   | Prompt 類型 | 結果     | 學到什麼                              |
| ------- | ----------- | -------- | ------------------------------------- |
| Round 1 | 大方向      | 被否決   | 技術正確 ≠ 美學正確，要給「拒絕什麼」 |
| Round 2 | 對照組      | 定調 CSS | A/B prompt 快速收斂                   |
| Round 3 | 微調        | 定稿     | 位置 + 速度 + 強度三軸，每次只動一軸  |

**關鍵心法**：**不要一次就要求最終版**。AI 不是想不出，是它沒有你的審美。
允許 2-3 次來回，用「拒絕」和「對照」把它校準。

---

### 3.5 個案拆解：Vote 頁從功能頁變成編輯感

#### 原本的問題

Vote 頁最早只是「選項列表 + 按鈕」，功能完整但**醜**。使用者丟的 prompt：

> _「Vote 頁語彙統一（保留活潑感，但去掉 breathe 動畫、改用新 tokens）+ Vote 頁全面編輯化（純黑白 + 髮絲）」_

這段 prompt 有四個精準動作：

| Prompt 片段           | 實際意涵                                               |
| --------------------- | ------------------------------------------------------ |
| **語彙統一**          | 用全站 design token，不自創顏色                        |
| **保留活潑感**        | 仍然要有一點生氣（許願跑馬燈留下）                     |
| **去掉 breathe 動畫** | 舊版有脈動呼吸，不符合 Shokunin 的「靜」               |
| **純黑白 + 髮絲**     | 這 5 個字決定整個視覺方向：黑白對比 + 1px 金色髮絲線條 |

#### 為什麼「純黑白 + 髮絲」這五個字這麼值錢

它一句話同時規範了：

- **顏色**：黑 / 白（最少色）
- **分隔方式**：髮絲線（不用 box / shadow / fill）
- **設計出處**：編輯排版美學（對照組：報紙、藝術目錄）

AI 拿到這五個字，可以直接推導出：

- 不用 `background-color` 填色塊
- 不用 `box-shadow` 浮起
- 用 `border-bottom: 1px solid rgba(201,169,110,0.12)` 分隔
- 用 `letter-spacing: 0.06em` + 襯線字製造編輯感

**通用技巧**：想取代一整套 UI 風格時，找一個「**視覺原型**」關鍵字：

| 你想要的感覺 | 可以用的關鍵字           |
| ------------ | ------------------------ |
| 安靜高雅     | 純黑白 + 髮絲 / 美術館   |
| 運動動感     | 高對比 + 斜線 + 大字     |
| 柔和親切     | 低飽和 + 圓角 + 手繪感   |
| 科技未來     | 深藍黑 + 螢光綠 + 等寬字 |
| 日系雜誌     | 象牙底 + 大塊留白 + 直排 |

---

### 3.6 個案拆解：Mobile Nav 從「能用」到「好看」

這是另一個經典三回合：

#### Round 1：Prompt 開起來

> _「導覽列在有些手機裝置 太多被截掉，也許需要漢堡把導覽列影藏起來 overlay 顯示出導覽列」_

這是**功能性 prompt**：明確問題（被截掉）+ 提議解法（漢堡 overlay）+ 意圖（顯示出來）。
AI 拿到 baseline 做出來 —— 能用但**平**。

#### Round 2：視覺挑剔

> _「我覺得漢堡 icon 有點醜 再幫我優化」_
> _「有漢堡時 中英切換的擺放也有點尷尬 再優化」_

一句「有點醜」**對 AI 是空話**。但配合「中英切換擺放尷尬」，AI 能推測出：

- 漢堡太粗重 → 改細線、減大小
- 語言切換不應該跟漢堡並排 → 移到 overlay 內部

**教學重點**：「醜」、「尷尬」要成對出現才有意義。單獨一句話等於沒說。

#### Round 3：動畫節奏

> _「選單打開的方式想要有一些微動畫 絲滑一點」_

「微動畫」 + 「絲滑」這兩個形容詞在 AI 的 vocabulary 裡對應：

- 不要 bounce / spring（那是「彈」不是「絲滑」）
- 要長一點的曲線（300ms+）
- 分段進場（panel 先落下、link 再淡入）

產出 CSS：

```css
.nav-overlay-panel {
  transform: translateY(-20px) scale(0.985);
  transition:
    opacity 0.42s,
    transform 0.52s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.is-open .nav-overlay-link:nth-child(1) {
  transition-delay: 0.12s;
}
.is-open .nav-overlay-link:nth-child(2) {
  transition-delay: 0.18s;
}
```

#### Round 4：共用語系細節（Prompt 雕到非常細）

> _「選單打開的 Language EN/中 跟原本的桌機的語系不同 共用語系，並且 切換到英文是 Language，切換到中文是 語言」_

這句 prompt 示範了**到了細節階段，prompt 長度反而該加長**：

- 指出問題（「跟桌機不同」）
- 指出期待（「共用語系」）
- 指出實作細節（「英文是 Language, 中文是 語言」）

越細節的 prompt 越不該簡寫。AI 對精確指令反應最好。

---

### 3.7 設計 Prompt 技巧清單（可複用模板）

把前述觀察整理成 **8 個可複用模板**：

#### 技巧 1：給身份（Identity Priming）

```
❌ 幫我設計一個網站
✅ 你是一位 [Swiss modernist / Shokunin / editorial] 設計師，為 [具體場景] 設計
```

#### 技巧 2：給禁止清單（Negative Constraints）

```
❌ 我要高質感
✅ 不要 SaaS 按鈕、不要卡片陰影、不要 gradient 漸層、不要 fade-in-up 進場
```

#### 技巧 3：用「像 / 不像」參考（Analogy）

```
❌ 做好看一點
✅ 像 MoMA 官網、像 Apple 產品頁，不像 Shopify 店面
```

#### 技巧 4：給對照組（A or B）

```
✅ 光暈放在 Hero 中間比較好還是右下角比較好？
✅ 這個動畫你覺得好，還是光暈好？
```

#### 技巧 5：用體感 + 場景（不要只說「怪」）

```
❌ 動畫怪怪的
✅ 由上往下滾，滾動到下一幅時，上面都會差一點點
```

#### 技巧 6：單參數微調（Single-axis Tuning）

```
✅ 光暈再暗一點
✅ 動畫再慢一點
✅ 位置再下面一點
```

越到後期越要這樣下，不要同時改兩個軸。

#### 技巧 7：請 AI 表達判斷（Elicit Opinion）

```
✅ 你覺得...比較好？
✅ 哪個比較適合 Shokunin 美學？
✅ 有沒有更好的方式？
```

讓 AI 當顧問，不只當工人。

#### 技巧 8：明確禁止副作用（Scope Guard）

```
✅ try it & dont push
✅ 不用幫我埋 GA，只要處理路由
✅ 先跟我討論做法，再執行
```

AI 很容易「順手」做完。用 `dont X` 或 `只要 X` 精準劃線。

---

### 3.8 不要犯的 Prompt 錯誤

| 壞 Prompt                | 為什麼不好                      | 改成                                                 |
| ------------------------ | ------------------------------- | ---------------------------------------------------- |
| _「做好看一點」_         | 沒有定義「好看」                | _「像 MoMA 官網那種編輯感，不要 SaaS 風」_           |
| _「幫我改一下動畫」_     | 不知道動哪個、怎麼改            | _「Hero 光暈脈動週期從 4s 改到 8s，更安靜」_         |
| _「顏色怪怪的」_         | AI 看不到你的螢幕               | _「金色 #C9A96E 在黑底上太亮，降到 alpha 0.14」_     |
| _「全部重做一次」_       | 等於丟回 baseline，浪費前面對話 | _「只動 nav 區塊，其餘不變」_                        |
| _「跟之前一樣，但不同」_ | 沒有收斂條件                    | _「保留直向滾動，但手機版改為自然滾（不 snap）」_    |
| _「越簡單越好」_         | AI 會把你重要的東西也刪掉       | _「簡化文案，但保留三項核心資訊：材質、重量、尺寸」_ |

**規律**：好的設計 prompt 都在做三件事之一：

1. **定義**（這是什麼風格、這是給誰用）
2. **限定**（只改這塊、只動這個參數）
3. **對照**（像 X 不像 Y、A 還是 B）

---

## Part 4｜核心技術章節

### Ch.1 元件拆分：Bulletproof 部分採用

**病灶**：3000 行單檔，state、effect、handler、JSX 全混在 `Portfolio.jsx` 裡。

#### Bulletproof React 是什麼？

[Bulletproof React](https://github.com/alan2207/bulletproof-react) 是開源 React 架構指南，主張：
專案要**分層清楚**、**資料驅動**、**邏輯與 UI 分離**，並用 `features/` 資料夾把每個業務領域的元件／hook／API／型別 _co-locate_（放一起）。

#### 我們採用了哪些

| Bulletproof 原則                     | 我們採用 | 採用方式                                                                      |
| ------------------------------------ | -------- | ----------------------------------------------------------------------------- |
| **邏輯抽離（Logic-free Component）** | ✅       | JSX return 佔 70% 以上，副作用放 hooks / utils                                |
| **資料驅動 UI**                      | ✅       | 文案進 `src/i18n.jsx`，結構資料進 `src/config/content.js`                     |
| **分層目錄**                         | ✅       | `pages/` `components/` `hooks/` `utils/` `config/` `styles/`                  |
| **Custom Hook 抽象**                 | ✅ 部分  | 有 `useP`、`usePageMeta`、`useParallaxScroll`；但沒做 `useBundle`、`useAdmin` |

#### 我們**刻意沒採用**的部分

| Bulletproof 原則             | 我們沒採用 | 為什麼                                                                |
| ---------------------------- | ---------- | --------------------------------------------------------------------- |
| **`features/` 資料夾切分**   | ❌         | 只有 4 頁 + 1 後台，一層 `pages/` 就夠；切 `features/` 反而讓檔案散開 |
| **TanStack Query**           | ❌         | 只有一包 `/api/data`，自寫 `useP` 兩百行搞定，不值得引入 ~40KB 依賴   |
| **Zustand / Redux 全域狀態** | ❌         | 殼層集中管理就好。引入全域 store 對這個規模是 over-engineering        |
| **Schema 驗證層（Zod）**     | ❌         | 單 admin 站，信任後台；資料結構簡單，TypeScript 都沒上                |
| **DDD 風格的 `api/` 層**     | ❌         | Cloudflare Pages Functions 本身就是 API 層                            |

#### 「規則要跟規模匹配」

Bulletproof 完整套件是為 **10+ feature、多工程師、長期維運** 的應用設計的。
硬套進 4 頁形象站只會變：

- 資料夾一堆卻每個裡面 1-2 檔
- 抽象層多但實作根本不會變
- 新人要跨 5 層檔案才能改一個按鈕

**我們採用的三條規範**：

1. **邏輯抽離**：JSX return 佔 70% 以上，剩下都放 hooks / utils
2. **資料驅動 UI**：JSX 內不寫文案，全進 `src/i18n.jsx` + `src/config/content.js`
3. **分層目錄**：

```text
src/
  NectarApp.jsx       # 殼層：bundle state、admin、navigation、modals、routes
  pages/              # HomePage / AboutPage / GalleryPage / VotePage
  components/         # 可重用 UI（WorkSlide、HeroSlide、Danmaku、ConfirmDialog...）
  hooks/              # useParallaxScroll、usePageMeta
  utils/              # workGallery、social
  config/             # content（預設資料、分類、貨幣參考）
  styles/             # tokens.css + nectar-global.css
```

**關鍵收斂**：

- **頁面（page）**：接 props，只管顯示
- **殼層（`NectarApp.jsx`）**：唯一擁有全域 state 跟 CRUD handler 的地方
- **元件（component）**：純展示 + 事件往上冒

**產品化取捨**：沒有把 hooks 再細分（像 `useBundle`、`useAdmin`），因為站層級夠單純，一個殼層不算過肥（~1200 行可讀）。**過早抽象比過肥更貴。**

#### 什麼時候該升級到完整 Bulletproof？

出現下列 2 項以上再升級：

- [ ] 有 5+ 個明確獨立的業務領域（feature）
- [ ] 團隊有 3+ 位前端工程師，需要檔案邊界隔離
- [ ] 同一塊資料在多個地方讀寫，需要中心化 store
- [ ] 後端 API 變複雜（多支、分頁、快取、樂觀更新）
- [ ] 需要型別安全（上 TypeScript + Zod）

---

### Ch.2 資料驅動 UI 與 i18n

**原則**：改文案不用碰 JSX。

#### 內容層（`src/config/content.js`）

存「結構性資料」：預設作品、預設投票選項、類別列表、storage key 常數。

#### 語系層（`src/i18n.jsx`）

存「顯示字串」：

```jsx
const messages = {
  en: { navAbout: "About", heroScroll: "Scroll", ... },
  "zh-TW": { navAbout: "關於", heroScroll: "滑動", ... },
};
export function useI18n() {
  return { t: (k) => messages[locale][k], locale, setLocale, ... };
}
```

**兩個細節**：

- `flowerName(zh, en)`：作品標題中英，i18n 層自動挑語系顯示
- 英文介面顯示 USD（TWD ÷ 32），避免前端存兩份幣別

#### Meta 也走 i18n（晚期加入）

第 11 階段加路由後，每頁 title / description 也放進 i18n：

```jsx
metaHomeTitle: "Nectar Artistry · Handcrafted Crystal Flowers from Taiwan",
metaHomeDesc: "A quiet study of preserved bloom — composed in studio..."
```

這樣切語系時連 SEO meta 都會同步改。

---

### Ch.3 Cloudflare Pages + R2 後端

#### 為什麼選 Pages Functions 而非 Workers / Express

- **同網域**：`/api/*` 直接在 Pages 專案裡，零 CORS
- **邊緣**：自動分散到全球
- **免冷啟**：Functions 是 Workers Runtime
- **一鍵部署**：push main → auto deploy

#### 檔案佈局

```
functions/
  api/
    data.js               # GET/PUT 整包 JSON（works/votes/wishes/artist/courses）
    upload.js             # POST multipart → R2
    delete.js             # POST { urls[] } → 逐一 delete
    file/[[path]].js      # GET /api/file/images/<uuid>.jpg
    admin/verify.js       # POST Authorization → 驗 ADMIN_SECRET
```

#### R2 綁定

`wrangler.toml`：

```toml
[[r2_buckets]]
binding = "BUCKET"
bucket_name = "nectar-data"
```

程式內就 `env.BUCKET.get(key)` / `env.BUCKET.put(key, body, { httpMetadata })`。

#### 單一 `data.json` 的取捨

好處：一次 GET 拿全站、原子性寫入、備份容易  
壞處：資料變大後所有訪客都下載完整 bundle

**目前尺寸估算**：

- 30 件作品 + 20 個投票選項 + 100 則許願 ≈ 30KB（未 gzip）
- 完全夠用，到 500KB 前都不用動

未來擴增如果超過 200KB，才需要考慮分桶（works / votes / wishes 拆檔）。

---

### Ch.4 管理者權限與資料同步

#### 驗證：極簡共享 secret

不做 OAuth（第三方登入）、不做 session store（伺服器端的登入狀態資料庫）。
環境變數一支：

```
ADMIN_SECRET = 某個長字串   # 存在 Cloudflare Pages 的 Secret 區，不進 git
```

前端流程：

1. 使用者導到 `#nectar-admin` → 開登入 modal（彈窗）
2. 密碼用 `fetch("/api/admin/verify", { Authorization: `Bearer ${pwd}` })` 送出
3. 通過就 `sessionStorage.setItem("nectar_admin_session", pwd)`
   （sessionStorage = 只在這個分頁、關了就消失的儲存空間）
4. 之後所有 PUT / POST 都帶 `Authorization: Bearer ${sessionStorage 取出的值}`

後端每支寫入函式都檢查：

```js
if (!secret || auth !== `Bearer ${secret}`)
  return j({ error: "Unauthorized" }, 401);
```

**為什麼這樣做夠安全（給這個規模）**：

- 1 人站、不可能做 RBAC
- sessionStorage 關分頁就沒（比 localStorage 保守）
- HTTPS 全程加密，只要 `ADMIN_SECRET` 不外洩就安全

**不要做的事**：

- 別把 `ADMIN_SECRET` 寫進 `.env`（會被打包到 JS bundle）
- 一定用 Cloudflare Pages 的 **Secret** 功能，不是環境變數

#### 資料同步：`useP` + debounce + flush

`src/persist.js` 提供：

```js
const [bundle, setBundle] = useP(SK.w, initial, { cloud: true });
```

內部做的事：

1. 初始化：GET `/api/data` → 回 bundle → `setS(...)`
2. 每次 `setBundle(fn)`：
   - 更新 React state
   - 寫 `memCloudData = n`
   - 呼叫 `scheduleSaveBundle(k)`（**280ms debounce**）
3. 背景事件：`pagehide` / `visibilitychange` → 立刻 flush
4. `pagehide` 的 PUT 用 `keepalive: true`，避免瀏覽器取消

---

### Ch.5 圖片生命週期：上傳、追蹤、清理

**問題**：每次上傳 `images/<uuid>.<ext>`，舊圖會累積在 R2。

**解法**：在應用層追蹤「哪些 URL 還被誰引用」，上傳新圖時把舊的標為孤兒：

```js
// 替換主圖
const prev = works.find((x) => x.id === wid)?.image || "";
const ref = await fileToImageRef(file); // 上傳成功拿新 URL
setW((p) => p.map((w) => (w.id === wid ? { ...w, image: ref } : w)));
if (prev && prev !== ref) void deleteImageRefs([prev]); // 背景刪舊
```

**關鍵工具**：

```js
// src/utils/workGallery.js
export function collectWorkImageRefs(work);    // 拿作品所有圖
export function diffImageRefs(oldSet, newSet); // 找出被移除的
export function removeWorkImageAtThumbIndex(); // 作品內刪縮圖
```

**刪除採 best-effort**：

```js
// src/persist.js
export async function deleteImageRefs(urls) {
  try { await fetch("/api/delete", { method: "POST", ... }); }
  catch { /* 吞錯：清理屬背景維運，不得中斷編輯流程 */ }
}
```

**安全限制**：後端只允許刪 `/api/file/images/*` 的 key，外部 URL 被直接忽略。

---

### Ch.6 Scroll Snap 與滾動體驗

**想要**：直向閱讀作品，每幅自動對齊。  
**不想要**：硬性吸附造成卡頓、由上滾下時偏移一點。

**最終方案**：

```css
html.home-scroll-snap {
  scroll-snap-type: y proximity; /* 不是 mandatory */
  scroll-behavior: smooth;
}
.ws {
  scroll-snap-align: start;
  scroll-snap-stop: normal; /* 不是 always */
  scroll-margin-top: 72px; /* nav 高度 */
}
@media (max-width: 768px) {
  html.home-scroll-snap {
    scroll-snap-type: none;
  }
}
```

**三個教訓**：

1. **`mandatory` 太剛**：用滾輪慢滑時會被硬拉到下一個，像壞掉
2. **`scroll-snap-stop: always` 太黏**：快速滑時會每幅停一下，絕對不能過兩個
3. **手機一律關**：觸控本來就自然對齊，強制 snap 反而卡

---

### Ch.7 Hero 視覺實驗：Canvas vs CSS 光暈

Hero 一開始就是純黑 + 一段文字（是刻意的）。後來想加點「有生命」的背景。

#### 嘗試 1：`background-image` + keyframes 流動漸層 → **拿掉**

> 黑底極輕微暗金流動光影（純 CSS）這個移除 效果看起來不好 — user

**原因**：漸層動畫跑起來像 SaaS 登入頁，太廉價。

#### 嘗試 2：Canvas 2D 光纖（`HeroFiberLines.jsx`） → **拿掉**

做了 ~200 行 Canvas 動畫：金色細線像光纖飄動，有 `requestAnimationFrame` + `prefers-reduced-motion`。技術正確，但**不優雅**。

> 不用 直接做光暈版本 — user

**原因**：太吵。Shokunin 的 quiet luxury 是「你要認真看才看到」，不是「我在發光」。

#### 最終方案：純 CSS 呼吸光暈

```css
.hero-slide::before {
  content: "";
  position: absolute;
  right: -10%;
  bottom: -15%;
  width: 58%;
  height: 48%;
  background: radial-gradient(
    circle,
    rgba(201, 169, 110, 0.14) 0%,
    rgba(201, 169, 110, 0) 60%
  );
  animation: heroGlow 8s ease-in-out infinite;
  pointer-events: none;
}
@keyframes heroGlow {
  0%,
  100% {
    opacity: 0.65;
  }
  50% {
    opacity: 1;
  }
}
```

**為什麼右下角**：左上是視覺重點（標題從這來），右下是「氣息逸散」的自然位置。中間會跟文字打架。

**參數心法**：

- alpha 不要超過 `0.2`，否則變成 spotlight
- 動畫 > 6 秒才看不出「脈動感」
- `pointer-events: none` 永遠要加，別擋點擊

---

### Ch.8 Mobile-First 導覽列

**問題**：手機在某些裝置上 nav 項目會被截斷。

**方案**：斷點 768px 以下改漢堡 + 全螢幕 overlay。

#### 漢堡按鈕：兩階段動畫

```jsx
<button className={`nav-menu-btn ${open ? "is-open" : ""}`}>
  <span className="nav-menu-line" />
  <span className="nav-menu-line" />
</button>
```

```css
.nav-menu-line {
  position: absolute;
  transition:
    top 0.3s 0.2s,
    transform 0.24s; /* 先移動、再旋轉 */
}
.is-open .nav-menu-line:first-child {
  transition:
    top 0.3s,
    transform 0.24s 0.2s; /* 打開時順序相反 */
  top: 50%;
  transform: rotate(45deg);
}
```

**細節**：兩條線動畫延遲順序相反，開啟時「先合攏再旋轉」，關閉時「先分開再歸位」，視覺上像折紙。

#### Overlay：像幕簾降下

```css
.nav-overlay-panel {
  transform: translateY(-20px) scale(0.985);
  backdrop-filter: blur(20px);
  transition:
    opacity 0.42s,
    transform 0.52s;
}
.is-open .nav-overlay-panel {
  transform: translateY(0) scale(1);
}
.nav-overlay-link {
  opacity: 0;
  transform: translateY(8px);
}
/* 只在打開時給延遲，關閉時全部一起消失 */
.is-open .nav-overlay-link:nth-child(1) {
  transition-delay: 0.12s;
}
.is-open .nav-overlay-link:nth-child(2) {
  transition-delay: 0.18s;
}
.is-open .nav-overlay-link:nth-child(3) {
  transition-delay: 0.24s;
}
```

**關鍵**：只在 `is-open` 狀態加 `transition-delay`，關閉時不延遲 —— 這樣關閉感覺乾脆，打開感覺優雅。

#### 語言切換改放 overlay 底部

原本 nav 列裡的 EN/中 按鈕在漢堡下擺「尷尬」。新位置：

```
┌─────────────┐
│   About     │
│   Gallery   │
│   Vote      │
│   Course ↗  │
│   ─────     │
│ Language    │  ← t("navLanguage")，中英切換會動態變 Language/語言
│ [EN] | [中] │
└─────────────┘
```

i18n 鍵共用（`langEn` / `langZh`），不會出現「中文介面還顯示 EN/CN」。

---

### Ch.9 效能排查：Vote 頁捲動卡頓

**回報**：「Vote 往下滾的時候 會像這樣卡頓 才跑出東西」（附圖）。

#### 偵錯過程

1. 第一直覺：圖片太多、太大
2. 加 `loading="lazy"`（圖片延遲載入，捲到才載）/ `fetchPriority="low"`（告訴瀏覽器這張不急）
   → 改善一點但主因還在
3. 打開 DevTools Performance（瀏覽器內建的效能分析工具）→ 發現是 **CSS `transition-delay`**
   （每個項目的進場動畫延遲時間）累加出來的問題

#### 根因

```css
/* 錯誤版 */
li.vp-row {
  opacity: 0;
  transform: translateY(10px);
  transition:
    opacity 0.6s,
    transform 0.6s;
}
li.vp-row[data-i="0"] {
  transition-delay: 0s;
}
li.vp-row[data-i="1"] {
  transition-delay: 0.04s;
}
... li.vp-row[data-i="25"] {
  transition-delay: 1s;
} /* ← 第 25 個要等 1 秒才開始 fade */
```

意思是：列表最下面的項目要等 **1 秒以上** 才開始淡入。使用者一滾下來，看到的是「空白 → 突然浮現」。

#### 修法

```css
li.vp-row {
  transition:
    opacity 0.42s var(--ease-out-curve),
    transform 0.42s var(--ease-out-curve);
}
/* 移除所有 transition-delay */

@media (prefers-reduced-motion: reduce) {
  li.vp-row {
    transition: none;
  }
}
```

所有項目**同時**淡入，0.42 秒就結束。視覺上還是有進場感但不會空白。

#### 順帶解決：Danmaku（許願跑馬燈）re-render 風暴

```jsx
// 錯誤版：每次父元件 re-render 都會加 setTimeout
useEffect(() => {
  const t = setTimeout(addNew, 2400);
  return () => clearTimeout(t);
}, [wishes]); // wishes 變就重設
```

改成：

```jsx
useEffect(() => {
  if (prefersReducedMotion) return;
  const interval = setInterval(() => {
    if (items.length >= MAX_DANMU) return;
    addOne();
  }, 3200);
  return () => clearInterval(interval);
}, []); // 只跑一次

// 用 onAnimationEnd 移除，不用 setTimeout
<span onAnimationEnd={() => removeItem(id)}>...</span>;
```

加上 CSS `contain: paint; isolation: isolate;` 讓瀏覽器可以獨立合成，不會每幀重繪整棵樹。

#### 圖片載入策略

```jsx
<img
  src={item.image}
  loading={i < 6 ? "eager" : "lazy"}
  fetchPriority={i < 2 ? "high" : "low"}
  decoding="async"
/>
```

首屏優先，後面讓瀏覽器自己排。

---

### Ch.10 資料完整性：訪客合併 + Admin 立即 flush

最複雜的一個 bug，分兩層才修完。
在開始前，先補個基礎概念：

- **訪客（visitor）**：一般使用者，可以投票、留言，但不能改站點內容
- **Admin（管理者）**：站長，可以改所有東西（作品、選項、圖片）
- **R2**：雲端物件儲存，最終資料的家
- **PUT**：HTTP 方法，代表「把這份資料寫進去」
- **Debounce**：等一段時間沒動作才送出，用來合併連續多次變更

#### Bug 1：訪客投票覆寫 admin 改動

**病灶**：訪客 A 打開頁面（載入當時的 votes 到他的瀏覽器記憶體）→ 幾分鐘後 admin 新增了選項 B、
還換了選項 A 的圖 → 訪客 A 此時按下「投給選項 A」→ 他的瀏覽器把**記憶體裡的舊版陣列**
整包 PUT 回 R2 → **覆蓋掉了 admin 剛剛的修改**。

**修法**：後端分辨「是否通過驗證」：

```js
// functions/api/data.js
function mergeVisitorVoteCounts(existingVotes, bodyVotes) {
  // 以 R2 既有的 votes 為準，只把匹配 id 的票數套過去
  const byId = new Map(bodyVotes.map((v) => [String(v.id), v]));
  return existingVotes.map((ex) => {
    const cl = byId.get(String(ex.id));
    if (!cl || typeof cl.votes !== "number") return ex;
    return { ...ex, votes: Math.max(0, Math.floor(cl.votes)) };
  });
}

// onRequestPut
if (authenticated) {
  merged = { ...existing, ...body }; // admin 可以全覆寫
} else {
  merged = {
    ...existing,
    votes: bodyVotes
      ? mergeVisitorVoteCounts(existing.votes, bodyVotes)
      : existing.votes,
    wishes: bodyWishes ?? existing.wishes,
  };
}
```

**前端配合**：未登入狀態不送沒意義的欄位：

```js
const authed = Boolean(getAdminToken());
const payload = authed
  ? memCloudData
  : { votes: memCloudData.votes, wishes: memCloudData.wishes };
```

#### Bug 2：Admin 換圖後 refresh 發現沒替換

**回報**：「我 Click to replace 圖片後 沒有替換」

**病灶**：

- `doVoteImg` 上傳完只呼叫 `setVotes(...)`，寫回被 **280ms debounce** 延遲
- 使用者在 280ms 內 refresh 去驗證 → R2 還是舊資料 → 看起來沒換

**對照組**：`doArtistImg`（肖像上傳）本來就有 `queueMicrotask(() => forceFlushBundle(SK.w))` 立即寫入，所以沒這問題。

**修法**：所有 admin 級別的 bundle 變更都立即 flush：

```js
const doVoteImg = async (id, file) => {
  const ref = await fileToImageRef(file);
  setVotes((p) => {
    const next = p.map((x) => (x.id === id ? { ...x, image: ref } : x));
    /** 上傳是 admin 明確動作，若等 280ms debounce，馬上重整會遺失 */
    queueMicrotask(() => void forceFlushBundle(SK.w));
    return next;
  });
  if (prev && prev !== ref) void deleteImageRefs([prev]);
};
```

同樣模式套用在：`saveVoteNames` / `toggleVoteHidden` / `addVoteOption` / `deleteVoteOption` / `uploadCourseImage` / `saveCourseNames` / `addCourse` / `deleteCourse` / `doWi` / `deleteWish`。

#### Bug 2 第二道保險：keepalive

```js
await fetch("/api/data", {
  method: "PUT",
  body,
  keepalive: body.length < 60000, // <64KB 時用，超過會被瀏覽器忽略 keepalive
});
```

這樣即使 debounce 剛觸發、使用者馬上關分頁，pending fetch 也不會被取消。

#### 教訓

- **誰能寫**和**寫什麼**要分開思考。訪客能寫，但只能寫自己負責的欄位
- **Debounce 對 admin 動作不夠**。Admin 剛做完的動作，他會馬上想驗證，不能讓他等
- **瀏覽器會砍 pending fetch**。`keepalive: true` 是 SPA 的必備

---

### Ch.11 防呆確認：從 alert 到 ConfirmDialog

**演進**：

1. **v1**：`window.confirm("確定刪除？")` → 能用但醜、阻塞 thread、不支援 i18n
2. **v2（一度誤刪）**：某次重構把 alert 拿掉，變成點了就刪 → user 回報「為什麼原本的 alert 不見了」
3. **v3 現行**：自訂 `ConfirmDialog` + `useConfirm` hook

```jsx
// src/components/ConfirmDialog.jsx
export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);
  const confirm = useCallback(({ title, message, confirmLabel, tone }) => {
    return new Promise((resolve) => {
      setState({ title, message, confirmLabel, tone, resolve });
    });
  }, []);
  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <Dialog
          {...state}
          onClose={(ok) => {
            state.resolve(ok);
            setState(null);
          }}
        />
      )}
    </ConfirmContext.Provider>
  );
}
export const useConfirm = () => useContext(ConfirmContext);
```

**使用**：

```js
const confirm = useConfirm();
const doDelete = async () => {
  const ok = await confirm({
    title: t("confirmTitleDestructive"),
    message: t("workDeleteConfirm"),
    confirmLabel: t("confirmDelete"),
    tone: "danger",
  });
  if (!ok) return;
  // 真的刪
};
```

**全面覆蓋**：每個刪除入口都接 `useConfirm`：

- 刪作品 / 刪圖 / 刪投票選項 / 刪許願 / 刪課程 / 移除肖像 / 移除簽名
- 重設票數（不是刪但是破壞性）

**教訓**：**破壞性動作一律要二次確認**。功能開發時順手寫「哪個會回不去」就立刻加確認。

---

### Ch.12 SEO：標題、描述、OG、Canonical

#### index.html（全域預設）

```html
<link rel="canonical" href="https://www.lustreyellow.com/" />
<title>Nectar Artistry · 花蜜水晶花工藝</title>
<meta name="description" content="Elegant floral artistry from Taiwan..." />
<meta
  name="keywords"
  content="dipart, dipflower, americanflower, 水晶花, ..."
/>

<meta property="og:type" content="website" />
<meta property="og:url" content="https://www.lustreyellow.com/" />
<meta property="og:image" content="https://www.lustreyellow.com/og-image.jpg" />
<meta property="og:image:width" content="1024" />
<meta property="og:image:height" content="576" />
<meta property="og:locale" content="en_US" />
<meta property="og:locale:alternate" content="zh_TW" />

<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": "https://www.lustreyellow.com/",
    "name": "Nectar Artistry",
    "alternateName": "花蜜水晶花工藝",
    "keywords": ["dipart", "dipflower", "americanflower", "水晶花"],
    "inLanguage": ["en", "zh-TW"]
  }
</script>
```

#### 絕對 URL 非常重要

```html
<!-- ❌ 錯：分享時變 https://www.lustreyellow.com/og-image.jpg 的破圖 -->
<meta property="og:image" content="/og-image.jpg" />

<!-- ✅ 對 -->
<meta property="og:image" content="https://www.lustreyellow.com/og-image.jpg" />
```

FB / LINE / Twitter 爬蟲對相對路徑支援不一致，寫絕對路徑最安全。

#### `#` 關鍵字不要塞

```
❌ #dipart #dipflower
✅ dipart, dipflower
```

`meta[keywords]` 早就不被 Google 吃，但還是要給得像樣。hashtag 是社群行為，meta 裡用 `,` 分隔。

---

### Ch.13 路由：HTML5 History + 每頁 Meta

**路由（routing）是什麼？** 就是「網址 → 對應畫面」的對照關係。
以前 `/about` `/vote` 都會跟伺服器請求一張新 HTML；SPA 時代全部交給瀏覽器內的 JS 處理，
切頁不重新載入，但**網址會正確變化**。

**HTML5 History API**：瀏覽器提供的 API，讓 JS 可以改網址但不觸發整頁重新載入。
這就是「乾淨網址」（`/about`）能跑 SPA 的基礎，取代老式的 `#/about`（hash 路由）。

#### 為什麼很晚才加

- 原本 4 頁用 `pg` state 切，簡單沒 bug
- 直到使用者問 **「是否要做路由？讓 GA 比較好追蹤？」** 才是分水嶺

#### 觸發條件

| 徵兆                           | 該加路由了嗎 |
| ------------------------------ | ------------ |
| 使用者想分享「/vote 頁」的連結 | ✅           |
| 要接 GA4 / Zaraz 分頁追蹤      | ✅           |
| 有 3 頁以上不同內容            | ✅           |
| Google 沒爬到除首頁外的內容    | ✅           |
| 網站只有首頁＋聯絡             | ❌ 不需要    |

#### 實作

```jsx
// main.jsx
<BrowserRouter>
  <I18nProvider>
    <ConfirmProvider>
      <App />
    </ConfirmProvider>
  </I18nProvider>
</BrowserRouter>
```

```jsx
// NectarApp.jsx
const pg = useMemo(() => pathToPg(location.pathname), [location.pathname]);
const goto = (path) => location.pathname !== path && navigate(path);

// ...
<Routes>
  <Route path="/" element={<HomePage ... />} />
  <Route path="/about" element={<AboutPage ... />} />
  <Route path="/gallery" element={<GalleryPage ... />} />
  <Route path="/vote" element={<VotePage ... />} />
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

#### 每頁 meta：輕量 hook，不用 helmet

```js
// src/hooks/usePageMeta.js
export function usePageMeta({ title, description, pathname }) {
  useEffect(() => {
    if (title) document.title = title;
    setMetaByName("description", description);
    setMetaByProperty("og:title", title);
    setMetaByProperty("og:description", description);
    setCanonical(pathname ?? window.location.pathname);
  }, [title, description, pathname]);
}
```

**為什麼不用 `react-helmet-async`**：

- 只 4 頁，不需 meta 堆疊
- 少一個 runtime 相依（省 ~3KB + 複雜度）
- Zaraz 只讀 `document.title`，我們直接改就好

#### SPA fallback：`public/_redirects`

```
/*    /index.html   200
```

沒這個，直打 `https://www.lustreyellow.com/about` 會 404（靜態主機找不到 `about/index.html`）。這行告訴 Cloudflare Pages：所有非 API、非靜態檔的請求都回 `index.html`，React Router 再接手路由。

**API 優先序**：Pages Functions（`/api/*`）比 `_redirects` 優先匹配，所以不會誤傷 API。

#### 路由切換副作用

```jsx
useEffect(() => {
  window.scrollTo({ top: 0, behavior: "instant" });
  setMobileNavOpen(false);
  setDt(null); // 關 DetailLightbox
}, [location.pathname]);
```

這三件事基本上就是「路由切換該做的清場」，集中放，不要散在各 nav onClick。

#### GA 整合：交給 Zaraz 做

在 Cloudflare Zaraz 建 GA4 tool，填 Measurement ID `G-GFLZSR42B7`，**開啟 Auto-track SPA**。Zaraz 在 History API 變動時自動發 `page_view`，`page_title` 讀當下 `document.title`（我們 `usePageMeta` 已更新）。

**好處**：

- Zero runtime code
- Consent 管理在 Cloudflare
- 不會被 ad blocker 擋（因為從 Cloudflare 轉發，看起來是第一方）
- 多加事件只要 `zaraz.track("vote_cast", {...})`

---

## Part 5｜通用心法

### 4.1 先診斷，後治療

**壞習慣**：使用者說「卡」，直接加 `will-change: transform`、`transform: translateZ(0)` 硬催 GPU。  
**好習慣**：打開 DevTools Performance，看 frame，找真正的瓶頸。

Vote 頁的「卡頓」根本不是渲染問題，是 CSS `transition-delay` 累加造成的**視覺上的空白**。加 GPU 加速只會讓空白跑得更快一點，毫無幫助。

---

### 4.2 誰能寫什麼要分開思考

資料庫能更新不代表 API 該隨便更新。對 API 來說：

- Admin：你信任他，整包資料全部能蓋
- 訪客：你不信任他，只能動「他應該能動」的欄位

後端 merge 的邏輯要依來源決定。前端也要對應地不要送沒意義的欄位（訪客不送 works）。

---

### 4.3 Debounce 不是萬能

**適用**：輸入框打字、resize 重算、scroll 算位置  
**不適用**：使用者剛做的明確動作，他可能馬上要驗證

原則：**「這個動作 user 可能會馬上想看到結果」→ 立即 flush，不要 debounce**。

上傳圖、儲存名稱、刪除選項都是明確動作。純游標移動、文字輸入才走 debounce。

---

### 4.4 設計感是一層層堆出來的

Shokunin 不是「選個字體、拉個動畫」就有。它是：

- 先有高對比黑白 → 過太正式
- 加一個金 `#C9A96E` 點綴 → 開始有氣質
- 動畫延長到 8 秒 → 有「呼吸」
- 光暈 alpha 壓到 0.14 → 安靜而非發光
- 再留 72px scroll-margin → 不緊湊

**每一步都是減法**。每加一個元素之前先問：「拿掉它會怎樣？」

---

### 4.5 破壞性動作一律要防呆

六字真言：**「刪掉能不能救？」**

- 能救 → alert + 簡單 confirm
- 不能救 → 自訂 Dialog + 明確寫「這動作無法復原」 + tone="danger" 紅字

重設票數、刪除作品、清除圖庫這類一旦錯就完蛋的，一定要紅字二次確認。

---

### 4.6 「先救圖，再救結構」

這專案的清理順序：

1. **先做的**：R2 圖片參照追蹤 + 自動清孤兒
2. **後做的**：檔案結構重命名（`Portfolio.jsx` → `NectarApp.jsx`）

為什麼？**花錢的事先處理**。R2 存錯了會每月扣你錢、放久了還找不到對應圖；命名不對只會讓你打字難受。

---

### 4.7 當你覺得「差不多了」才是分水嶺

當你說出「差不多了」—— 通常表示：

- 基本功能都有了
- 還沒做的是錦上添花（路由、GA、每頁 meta、事件追蹤）
- 這些不加也能活，加了才能**成長**

這階段才開始做：

- 路由（讓內容可被分享、可被索引）
- 追蹤（知道使用者行為）
- 事件（知道哪個作品最吸引人）

不要倒過來做。Done is better than perfect 沒錯，但 **perfect 的前提是 done**。

---

## Part 6｜User Prompt 精選附錄（依時序）

> 這是真實使用者給的 prompt，保留原始措辭。
> 當作教材使用時可以對照 Part 2 時間軸，看每一則 prompt 如何落地。

### 階段 A：結構整理

1. _「Portfolio.jsx 3000 行有點肥 ... Bulletproof 規範保留的精華部分 ...」_
2. _「幫我補上作品的尺寸、材質、重量等規格資訊（可編輯），首頁+彈框內都要有」_
3. _「當我畫面漸漸變大時，編輯照片的按鈕會被照片蓋掉 / Specifications 上面給一點 padding」_
4. _「改成 8 / 排序 Weight Size Materials」_
5. _「git push 一版上去」_

### 階段 B：Scroll Snap

6. _「幫我加上 scroll snap 讓滾動對齊到正確的位置，像磁鐵吸附一樣」_
7. _「改成 proximity 或把 scroll-snap-stop 改成 normal / 目前看起來有點卡 不夠滑順」_
8. _「由上往下滾，滾動到下一幅時，上面都會差一點點 / 手機板才能看到 remove cover image」_
9. _「我已經還原你的修改 ... 為什麼要用 injectedCSS 這樣管理不會很難閱讀嗎」_

### 階段 C：Shokunin 設計升級

10. _「git push 一版」_
11. _「Do not produce generic UI. ... Shokunin ...」_ ← 設計憲章
12. _「右下 髮絲+價錢 切換到手機板會跑版到上面 ... 以上都是確認 沒有要執行」_
13. _「DetailLightbox 有優化嗎? Vote 頁面有優化嗎?」_
14. _「優先 DetailLightbox」_
15. _「直接 git push」_
16. _「Vote 頁語彙統一（保留活潑感，但去掉 breathe 動畫）+ 全面編輯化（純黑白 + 髮絲）」_

### 階段 D：後端接入 + R2 清理

17. _「git push / 上傳圖片時，cloudflare 會覆蓋取代之前的照片，還是會另外上傳？ 會不會一直堆積？」_
18. _「先看一下 R2 儀表板」_
19. _「先做 A」_（A = 作應用層圖片參照追蹤）
20. _「先 push 一版」_

### 階段 E：內容擴張（About / Gallery / Course）

21. _「幫我製作一個 about 頁面 / @Portfolio.jsx 是不是有點肥 應該把 Portfolio 跟 Vote 分開」_
22. _「The Maker 改成 藝術家 / 我這邊可以上傳簽名檔」_
23. _「圖片上傳了但沒被儲存起來 重新整理就消失」_
24. _「所以是要先佈署 才會被儲存 是嗎?」_
25. _「nav about 在 collection 前面 / collection 要叫 Portfolio / vote Edit options 要能新增 option」_
26. _「git push 一版」_

### 階段 F：品牌 / OG / 網域

27. _「https://www.lustreyellow.com/ / .ico 幫我改一下 / 訊息的 OG image 跟文字也幫我調整」_
28. _「Nectar → Nectar Artistry / Add option 回饋感太低 / Hide from visitors 用 switch / 編輯卡片 hover 顯示重新上傳」_
29. _「OG image 用這個圖 不用有字」_
30. _「Visible & Hidden 就好 / 幫我確認所有刪除是否都有防呆機制」_
31. _「git push 上一版」_
32. *「nav 新增 Course / 依據網站風格 做一張 banner 1440*500」\*
33. _「先 push 這一版」_
34. _「為什麼原本投票的刪除是會跳出 alert 確認 現在不見了? 現在按了就直接不見?」_
35. _「git push 上一版」_
36. _「投票照片最佳尺寸 / 點一次是投 再點一次取消 / Whisper a wish 編輯模式 新增刪除」_

### 階段 G：Gallery 與細節

37. _「想要多一個頁面是 Gallery / 分成作品 gallery + 課程 gallery」_
38. _「Gallery → 畫廊 / Works → 藝術品」_
39. _「push git」_
40. _「persist.js 為什麼沒有放到 utils 裡面?」_

### 階段 H：Mobile Nav + Hero 動效

41. _「導覽列在有些手機裝置太多被截掉 / 首頁 SCROLL 要明顯一點 / Portfolio 既然是首頁是不是就不用放在 nav / Gallery Works 要可以新增更多作品但首頁只顯示前六個」_
42. _「@nectar-hero-animation-prompt.md try it & dont push」_
43. _「黑底極輕微暗金流動光影 這個移除 效果看起來不好」_
44. _「你覺得這個好 還是光暈好? 光暈之前是右上角 假設光暈到右下角 忽明忽暗的」_
45. _「不用 直接做光暈版本」_
46. _「漢堡 icon 有點醜 / 中英切換的擺放也有點尷尬」_
47. _「選單打開的方式想要有一些微動畫 絲滑一點」_
48. _「Language EN/中 跟原本的桌機的語系不同 共用語系 / 英文是 Language 中文是 語言」_
49. _「你覺得光暈放在 Hero 的中間比較好 還是右下角比較好?」_
50. _「好 你試調看看」_
51. _「git push 一版吧」_

### 階段 I：結構正名 + Prettier + SEO 關鍵字

52. _「portfolio.jsx 是不是其實要改名成 HomePage / 整理專案結構 / 檢查沒有用途的檔案 幫我移除」_
53. _「幫我將全專案檔案跑過一次 Prettier format」_
54. _「幫我增加 SEO 的標籤 #dipart #dipflower #americanflower #水晶花 / @README.md 幫我撰寫」_
55. _「有正式網域 https://www.lustreyellow.com/ / Vote 進入頁面會卡卡的 幫我排查」_
56. _「Vote 往下滾的時候會像這樣卡頓 才跑出東西」_（附圖）
57. _「先 push 一版」_
58. _「幫我檢查 vote 資料儲存問題 / 新增 option 但資料遺失 / 替換過新照片但看起來還是舊的」_
59. _「git push」_
60. _「現在好像還是一樣問題 我 Click to replace 圖片後 沒有替換」_

### 階段 J：投票記憶 + 路由 + GA 計畫

61. _「怎麼知道這個裝置投票過? 目前重新整理還能再投一次 / 是否要做路由? 讓 GA 比較好追蹤?」_
62. _「B，我這邊需要給你什麼資料?」_（選 HTML5 history）
63. _「Measurement ID: G-GFLZSR42B7 / 用你建議的即可」_
64. _「不用幫我埋 GA 我會在 cloudflare 裡面用 zaraz 去處理 GA 的追蹤 只要幫我處理路由即可」_
65. _「push」_
66. _「ok 差不多了 你可以將所有步驟整理成教材嗎?」_ ← **本文件的起點**

---

## 附錄｜檔案結構速查

```text
nectar-official/
├── docs/
│   └── HANDBOOK.md            # 本文件
├── functions/                  # Cloudflare Pages Functions
│   └── api/
│       ├── admin/verify.js
│       ├── data.js             # GET/PUT JSON bundle（含 visitor merge）
│       ├── delete.js           # POST urls[] → R2 刪除
│       ├── file/[[path]].js    # GET R2 物件
│       └── upload.js           # POST multipart → R2
├── public/
│   ├── _redirects              # SPA fallback：/* /index.html 200
│   ├── favicon.svg
│   └── og-image.jpg
├── src/
│   ├── NectarApp.jsx           # 殼層：state / routes / admin / modals
│   ├── App.jsx
│   ├── main.jsx                # BrowserRouter / I18nProvider / ConfirmProvider
│   ├── i18n.jsx                # 中英 messages + useI18n
│   ├── persist.js              # useP / fileToImageRef / deleteImageRefs / flush
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── AboutPage.jsx
│   │   ├── GalleryPage.jsx
│   │   └── VotePage.jsx
│   ├── components/
│   │   ├── HeroSlide.jsx       # Hero + CSS 光暈
│   │   ├── WorkSlide.jsx       # 作品直向卡片
│   │   ├── DetailLightbox.jsx  # 作品詳情彈框
│   │   ├── Danmaku.jsx         # 許願跑馬燈（優化版）
│   │   ├── VoteAdminRow.jsx    # Vote 選項行（admin 編輯器）
│   │   ├── ConfirmDialog.jsx   # 自訂確認框 + useConfirm
│   │   ├── FormFields.jsx
│   │   ├── SocialContactChips.jsx
│   │   └── icons/Icons.jsx
│   ├── hooks/
│   │   ├── useParallaxScroll.js
│   │   └── usePageMeta.js      # 切頁更新 title/description/og/canonical
│   ├── utils/
│   │   ├── social.js
│   │   └── workGallery.js      # 圖片參照收集 / diff
│   ├── config/
│   │   └── content.js          # 預設作品、預設投票、常數
│   └── styles/
│       ├── tokens.css          # CSS variables
│       └── nectar-global.css   # 全域樣式
├── index.html                   # 站根 meta（全域預設 OG / keywords / JSON-LD）
├── package.json
├── wrangler.toml
├── .prettierrc / .prettierignore
└── README.md                    # 快速起步、部署、環境變數
```

---

## 結語

這個專案從 3000 行單檔走到 30+ 個模組、有後端、有路由、有追蹤，花了 66+ 輪對話。

**如果只能帶走五件事：**

1. **最小可行架構先做起來**，不夠再加（路由、狀態管理、helmet 都是這樣）
2. **設計是減法**，每加一個元素前先問「拿掉會怎樣」
3. **資料流的邊界要清楚**：誰能寫、什麼時候寫、寫失敗怎辦
4. **Prompt 要有節奏感**：大方向 → 體感回饋 → 對照組 → 放行（[詳見 Part 3](#part-3設計-prompt-對話法從-generic-到-high-end)）
5. **規則要跟規模匹配**：Bulletproof 只採三條，不全套

**設計對話特別重要的一句話：**

> 告訴 AI「不要做什麼」，比告訴它「要做什麼」更有力。

歡迎 fork 當教材。看到不同意的地方請抬槓 —— 那才是學習的起點。
