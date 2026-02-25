"use client";

interface NoiseOverlayProps {
  opacity?: number;
  blendMode?: string;
  [key: string]: unknown;
}

export default function NoiseOverlay({
  opacity = 0.06,
  blendMode = "overlay",
}: NoiseOverlayProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 3,
        pointerEvents: "none",
        opacity,
        mixBlendMode: blendMode as React.CSSProperties["mixBlendMode"],
      }}
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <filter id="noise-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise-filter)" />
      </svg>
    </div>
  );
}
