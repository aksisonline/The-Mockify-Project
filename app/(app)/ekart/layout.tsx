"use client";

import React from "react";
import { EkartProvider } from "./ekart-context";

export default React.memo(function EkartLayout({ children }: { children: React.ReactNode }) {
  return (
    <EkartProvider>
      {children}
    </EkartProvider>
  );
});