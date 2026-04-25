# Nectar Artistry（nectar-official）

Nectar Artistry 官方形象網站：水晶花工藝作品集、關於藝術家、畫廊、投票與課程導向。  
前端以 React + Vite 建置，資料與圖片透過 Cloudflare Pages Functions 搭配 R2 儲存與同步。

## 技術棧

- **UI**：React 18、Vite 5
- **樣式**：自訂 CSS（`src/styles/`，含 design tokens）
- **i18n**：自製 `I18nProvider`（英／繁）
- **後端（邊緣）**：Cloudflare Pages Functions（`functions/`），REST API
- **儲存**：Cloudflare R2（網站 JSON 資料與圖片物件）
- **品質**：ESLint、Prettier

## 需求環境

- Node.js 18+（建議 LTS）
- npm

## 快速開始

```bash
npm install
npm run dev
```

瀏覽器開啟終端顯示的本機位址（預設 `http://localhost:5173`）。

## 腳本

| 指令                | 說明                                                              |
| ------------------- | ----------------------------------------------------------------- |
| `npm run dev`       | 本機開發（Vite HMR）                                              |
| `npm run build`     | 產出 `dist/` 供正式部署                                           |
| `npm run preview`   | 預覽正式建置                                                      |
| `npm run format`    | 以 Prettier 格式化專案                                            |
| `npm run lint`      | 執行 ESLint                                                       |
| `npm run dev:pages` | 建置後以 Wrangler 模擬 Pages + Functions（埠見終端；無 Vite HMR） |

## 環境變數

專案根目錄可複製 `.env.example` 為 `.env` 設定（**勿**將含密碼的檔案提交至版控）。  
重點說明：

- **VITE_DEV_PROXY_TARGET**：本機開發時將 `/api` 轉向已部署的 Pages 網址，可與正式 R2 同桶測試。
- **VITE_USE_REMOTE**：是否讓瀏覽器走遠端 API（與前項搭配使用方式見範例檔內註解）。
- **VITE_API_BASE**：僅在「API 與網站不同網域」時需要。
- **VITE_SOCIAL_INSTAGRAM**、**VITE_SOCIAL_FACEBOOK**、**VITE_CONTACT_EMAIL**：頁尾社群與聯絡方式。
- **VITE_ADMIN_KEY**：僅本機可選，略過管理登入；**正式站請勿設定**，後台以 `ADMIN_SECRET`（Cloudflare Secret）驗證。

完整註解見 `.env.example`。

## 部署（Cloudflare Pages）

1. 於 Cloudflare 建立 R2 bucket，bucket 名稱需與 `wrangler.toml` 的 `bucket_name` 一致（或自行修改後再部署）。
2. Pages 專案設定：**Build** 產出目錄為 `dist`；**Functions** 綁定 R2，binding 名稱 `BUCKET`（與程式一致）。
3. 設定祕密：`npx wrangler pages secret put ADMIN_SECRET --project-name=<專案名>`。
4. 其餘綁定與變數依 Cloudflare 儀表板與團隊慣例補齊。

本機以 Wrangler 模擬全站時，可參考 `wrangler.toml` 內註解與 `npm run dev:pages`。

## 專案結構（精簡）

```text
src/
  NectarApp.jsx    # 全站殼層、路由、狀態、管理後台
  main.jsx
  i18n.jsx
  persist.js       # 本地／雲端 bundle 與圖片參考
  pages/           # HomePage, AboutPage, GalleryPage, VotePage
  components/      # 共用 UI（Hero、WorkSlide、DetailLightbox 等）
  config/          # 預設內容
  styles/          # 全域與 tokens
  hooks/, utils/
functions/         # Pages Functions：/api/data、upload、delete 等
public/            # 靜態檔（favicon、OG 圖等）
```

## SEO 關鍵主題

可於 `index.html` 維護（勿重複堆疊無意義字串）：

- **主題標籤**：`dipart`、`dipflower`、`americanflower`、`水晶花`（見 `<meta name="keywords">` 與 JSON-LD `WebSite` 的 `keywords`）
- 正式網域已設為 **<https://www.lustreyellow.com/>**（`index.html` 內的 `link[rel=canonical]`、`og:url`、JSON-LD `url` 與社群圖之絕對路徑）。

## 授權

本儲存庫若為私人專案，請依團隊政策使用，未聲明開源授權則不視為公共領域。
