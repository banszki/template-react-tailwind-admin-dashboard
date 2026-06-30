import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./brand.css"; // per-app brand override (must load after index.css)
import "flatpickr/dist/flatpickr.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { SiteConfigProvider } from "./context/SiteConfigContext.tsx";
import { siteConfig } from "./config/site.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <SiteConfigProvider value={siteConfig}>
        <AppWrapper>
          <App />
        </AppWrapper>
      </SiteConfigProvider>
    </ThemeProvider>
  </StrictMode>,
);
