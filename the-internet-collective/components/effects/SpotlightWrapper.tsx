"use client";

import { useRef, useCallback } from "react";

interface SpotlightWrapperProps {
  children: React.ReactNode;
  intensity?: number;
  size?: number;
  color?: string;
  [key: string]: unknown;
}

export default function SpotlightWrapper({
  children,
  intensity = 0.15,
  size = 400,
  color = "255, 255, 255",
}: SpotlightWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current || !spotlightRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      spotlightRef.current.style.opacity = "1";
      spotlightRef.current.style.background = `radial-gradient(${size}px circle at ${x}px ${y}px, rgba(${color}, ${intensity}), transparent 80%)`;
    },
    [intensity, size, color]
  );

  const handleMouseLeave = useCallback(() => {
    if (spotlightRef.current) {
      spotlightRef.current.style.opacity = "0";
    }
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ position: "relative" }}
    >
      {children}
      <div
        ref={spotlightRef}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0,
          transition: "opacity 0.3s ease",
          zIndex: 5,
        }}
      />
    </div>
  );
}
