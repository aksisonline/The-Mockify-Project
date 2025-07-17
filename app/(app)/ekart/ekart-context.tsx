"use client";

import React, { createContext, useContext } from "react";
import { useProfile } from "@/hooks/use-profile";

// You can add Ekart-specific shared state here in the future
// For now, the context is empty

type EkartContextType = {
  profile: ReturnType<typeof useProfile>["profile"] | undefined;
};

const EkartContext = createContext<EkartContextType | undefined>(undefined);

export function EkartProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useProfile();

  return (
    <EkartContext.Provider value={{ profile }}>
      {children}
    </EkartContext.Provider>
  );
}

export function useEkartCache() {
  const ctx = useContext(EkartContext);
  if (!ctx) throw new Error("useEkartCache must be used within EkartProvider");
  return ctx;
}