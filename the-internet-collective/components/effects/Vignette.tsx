"use client";

interface VignetteProps {
  intensity?: number;
  color?: string;
  [key: string]: unknown;
}

export default function Vignette({
  intensity = 0.8,
  color = "0, 0, 0",
}: VignetteProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 4,
        pointerEvents: "none",
        background: `radial-gradient(ellipse at center, transparent 40%, rgba(${color}, ${intensity}) 100%)`,
      }}
    />
  );
}
