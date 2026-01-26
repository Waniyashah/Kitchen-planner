"use client";

import React from "react";
import { AnswersProvider } from "@/context/AnswerContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <AnswersProvider>{children}</AnswersProvider>;
}
