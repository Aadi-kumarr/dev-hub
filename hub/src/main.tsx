import "@fontsource-variable/geist";
import "@fontsource-variable/jetbrains-mono";
import { MotionConfig } from "framer-motion";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { AppStatusProvider } from "./lib/appStatus";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
        <AppStatusProvider>
          <App />
        </AppStatusProvider>
      </MotionConfig>
    </BrowserRouter>
  </StrictMode>,
);
