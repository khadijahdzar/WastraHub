import { createContext, useContext, useState, useCallback } from "react";

const DemoModeContext = createContext(null);

export function DemoModeProvider({ children }) {
  const [isDemoMode, setIsDemoMode] = useState(() => {
    try {
      return localStorage.getItem("wastrahub_demo_mode") === "1";
    } catch {
      return false;
    }
  });

  const [message, setMessage] = useState(
    "Mode Demo / Offline — data lokal atau cache sedang digunakan"
  );

  const enableDemoMode = useCallback((msg) => {
    setIsDemoMode(true);
    if (msg) setMessage(msg);
    try {
      localStorage.setItem("wastrahub_demo_mode", "1");
    } catch {}
  }, []);

  const disableDemoMode = useCallback(() => {
    setIsDemoMode(false);
    try {
      localStorage.removeItem("wastrahub_demo_mode");
    } catch {}
  }, []);

  return (
    <DemoModeContext.Provider
      value={{ isDemoMode, message, enableDemoMode, disableDemoMode }}
    >
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const ctx = useContext(DemoModeContext);
  if (!ctx) {
    throw new Error("useDemoMode must be used within DemoModeProvider");
  }
  return ctx;
}