import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { SoundProvider } from "./context/SoundProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SoundProvider>
      <App />
    </SoundProvider>
  </StrictMode>
);
