"use client";

import { useRef, useCallback } from "react";
import gsap from "gsap";
import { CardData } from "@/types";

interface CardOverlayProps {
  card: CardData;
}

export default function CardOverlay({ card }: CardOverlayProps) {
  const labelRef = useRef<HTMLSpanElement>(null);

  const {
    headline,
    subheading,
    headlineFont,
    headlineFontSize,
    headlineColor = "var(--headline-color)",
    headlineWeight = "var(--headline-weight)",
    subheadingFont,
    subheadingFontSize,
    subheadingColor = "var(--subheading-color)",
    hoverLabel = "View →",
    HeadlineEffect,
    effectProps = {},
  } = card;

  const showLabel = useCallback(() => {
    if (labelRef.current) {
      gsap.to(labelRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  }, []);

  const hideLabel = useCallback(() => {
    if (labelRef.current) {
      gsap.to(labelRef.current, {
        opacity: 0,
        scale: 0.8,
        duration: 0.25,
        ease: "power2.in",
      });
    }
  }, []);

  const headlineContent = (
    <h2
      style={{
        fontFamily: headlineFont || "var(--font-headline)",
        fontSize: headlineFontSize || "var(--headline-size)",
        fontWeight: headlineWeight as React.CSSProperties["fontWeight"],
        color: headlineColor,
        lineHeight: 1,
        letterSpacing: "-0.02em",
        margin: 0,
      }}
    >
      {headline}
    </h2>
  );

  return (
    <div
      onMouseEnter={showLabel}
      onMouseLeave={hideLabel}
      style={{
        position: "absolute",
        bottom: "3rem",
        left: "3rem",
        right: "3rem",
        zIndex: 10,
        pointerEvents: "none",
      }}
    >
      {/* Headline — optionally wrapped in effect */}
      {HeadlineEffect ? (
        <HeadlineEffect {...effectProps}>{headlineContent}</HeadlineEffect>
      ) : (
        headlineContent
      )}

      {/* Subheading */}
      {subheading && (
        <p
          style={{
            fontFamily: subheadingFont || "var(--font-body)",
            fontSize: subheadingFontSize || "var(--subheading-size)",
            color: subheadingColor,
            marginTop: "0.75rem",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            fontWeight: 400,
          }}
        >
          {subheading}
        </p>
      )}

      {/* Hover label */}
      <span
        ref={labelRef}
        style={{
          display: "inline-block",
          marginTop: "1.25rem",
          padding: "0.5rem 1.25rem",
          background: "rgba(255, 255, 255, 0.12)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: "100px",
          color: "#ffffff",
          fontSize: "0.875rem",
          fontWeight: 500,
          letterSpacing: "0.05em",
          opacity: 0,
          transform: "scale(0.8)",
          pointerEvents: "auto",
        }}
      >
        {hoverLabel}
      </span>
    </div>
  );
}
