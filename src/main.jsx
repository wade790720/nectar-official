import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { I18nProvider } from "./i18n.jsx";
import { ConfirmProvider } from "./components/ConfirmDialog.jsx";
import "./styles/tokens.css";
import "./styles/nectar-global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <ConfirmProvider>
          <App />
        </ConfirmProvider>
      </I18nProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
