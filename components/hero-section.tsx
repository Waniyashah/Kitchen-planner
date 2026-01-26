"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, User, Edit2 } from "lucide-react";
import { useState } from "react";

export function HeroSection() {
  // -----------------------------------------------------------------
  // Language state – replace with your real i18n solution later
  // -----------------------------------------------------------------
  const [lang, setLang] = useState<"en" | "sv">("en");

  const t = {
    en: {
      title: "KITCHEN PLANNER",
      subtitle:
        "Design your dream kitchen with our advanced 3D planner. Visualize, customize, and purchase all in one place.",
      saved: "Your Saved Designs",
      start: "Start Designing",
    },
    sv: {
      title: "KÖKPLANERARE",
      subtitle:
        "Designa ditt drömkök med vår avancerade 3D-planerare. Visualisera, anpassa och köp allt på ett ställe.",
      saved: "Dina Sparade Designer",
      start: "Börja Designa",
    },
  };

  const texts = t[lang];

  return (
    <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
      {/* --------------------------------------------------- */}
      {/* Background image */}
      {/* --------------------------------------------------- */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/hero-kitchen-background.jpg)" }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* --------------------------------------------------- */}
      {/* Language switcher – top-right */}
      {/* --------------------------------------------------- */}
      <div className="absolute top-4 right-4 flex items-center gap-4">
        <button
          onClick={() => setLang("en")}
          className={`flex items-center gap-2 px-2 py-1 rounded-md transition ${
            lang === "en" ? "bg-white/10" : "hover:bg-white/10"
          } text-white font-semibold`}
          aria-label="Switch to English"
        >
          <span className="fi fi-gb w-8 h-5 rounded-sm bg-contain bg-no-repeat" />
          <span className="hidden sm:inline">EN</span>
        </button>

        <button
          onClick={() => setLang("sv")}
          className={`flex items-center gap-2 px-2 py-1 rounded-md transition ${
            lang === "sv" ? "bg-white/10" : "hover:bg-white/10"
          } text-white font-semibold`}
          aria-label="Switch to Swedish"
        >
          <span className="fi fi-se w-8 h-5 rounded-sm bg-contain bg-no-repeat" />
          <span className="hidden sm:inline">SV</span>
        </button>
      </div>

      {/* --------------------------------------------------- */}
      {/* Main content */}
      {/* --------------------------------------------------- */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center items-center text-center">
        <div className="max-w-2xl animate-fade-in">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {texts.title}
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8">{texts.subtitle}</p>

          {/* --------------------------------------------------- */}
          {/* Buttons – equal height, equal padding, clean layout */}
          {/* --------------------------------------------------- */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* Your Saved Designs – outline button */}
            <Link href="/auth">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-2 border-white text-white hover:bg-white/10 bg-transparent 
                 w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3 h-14"
              >
                <User className="w-5 h-5" />
                <span className="text-sm sm:text-base font-medium">{texts.saved}</span>
              </Button>
            </Link>

            {/* Start Designing – filled button */}
            <button
              onClick={() => {
                const el = document.getElementById("planning-steps");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="rounded-full bg-black text-white border-2 border-black hover:bg-black/90 transition-all 
                         w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3 h-14"
            >
              <Edit2 className="w-5 h-5" />
              <span className="text-sm sm:text-base font-medium">{texts.start}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
