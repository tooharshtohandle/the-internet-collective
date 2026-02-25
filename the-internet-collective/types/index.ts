import React from "react";

export interface CardData {
  // ── Identity ──────────────────────────────────────────────
  id: string;

  // ── Content ───────────────────────────────────────────────
  mediaType: "youtube" | "image" | "instagram" | "website-preview";
  mediaSrc: string;
  link: string;
  linkTarget?: "_blank" | "_self";

  // ── Text Overlay ──────────────────────────────────────────
  headline: string;
  subheading?: string;

  // ── Per-card Typography ───────────────────────────────────
  headlineFont?: string;
  headlineFontSize?: string;
  headlineColor?: string;
  headlineWeight?: string | number;
  subheadingFont?: string;
  subheadingFontSize?: string;
  subheadingColor?: string;

  // ── Per-card Scroll Animation ─────────────────────────────
  entryRotation?: number;
  entryY?: string;
  scrubSpeed?: number;
  transformOrigin?: string;

  // ── Per-card Background ───────────────────────────────────
  backgroundColor?: string;
  mediaObjectFit?: "cover" | "contain";

  // ── Per-card Cursor / Hover Effect ────────────────────────
  hoverLabel?: string;

  // ── Per-card Effects ──────────────────────────────────────
  HeadlineEffect?: React.ComponentType<
    { children: React.ReactNode } & Record<string, unknown>
  >;

  CursorEffect?: React.ComponentType<
    { children: React.ReactNode } & Record<string, unknown>
  >;

  BackgroundEffect?: React.ComponentType<Record<string, unknown>>;

  effectProps?: Record<string, unknown>;
}
