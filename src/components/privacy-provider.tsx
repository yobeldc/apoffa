"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface PrivacyContextType {
  privacyMode: boolean;
  togglePrivacy: () => void;
}

const PrivacyContext = createContext<PrivacyContextType>({
  privacyMode: false,
  togglePrivacy: () => {},
});

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const [privacyMode, setPrivacyMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("privacy-mode");
    if (stored) {
      setPrivacyMode(stored === "true");
    }
  }, []);

  function togglePrivacy() {
    setPrivacyMode((prev) => {
      const next = !prev;
      localStorage.setItem("privacy-mode", String(next));
      return next;
    });
  }

  return (
    <PrivacyContext.Provider value={{ privacyMode, togglePrivacy }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  return useContext(PrivacyContext);
}
