import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { I18nProvider } from "./i18n.jsx";
import { ConfirmProvider } from "./components/ConfirmDialog.jsx";
import "./index.css";
import "./styles/tokens.css";
import "./styles/nectar-global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <I18nProvider>
      <ConfirmProvider>
        <App />
      </ConfirmProvider>
    </I18nProvider>
  </React.StrictMode>,
);
