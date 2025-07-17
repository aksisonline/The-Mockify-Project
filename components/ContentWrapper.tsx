"use client"

import React from "react"


export default function ContentWrapper({ children }: { children: React.ReactNode }) {

  return <div className="pl-0 lg:pl-28 pr-0 md:pr-4">{children}</div>;
} 