import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { LanguageProvider } from "./context/LanguageContext";
import { DemoModeProvider } from "./context/DemoModeContext";
import "./styles/global.css";
import "./styles/animations.css"; // ← FASE 2

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <DemoModeProvider>
          <AuthProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </AuthProvider>
        </DemoModeProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
);