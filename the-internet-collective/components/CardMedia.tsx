"use client";

import Image from "next/image";
import { CardData } from "@/types";

interface CardMediaProps {
  card: CardData;
}

export default function CardMedia({ card }: CardMediaProps) {
  const { mediaType, mediaSrc, mediaObjectFit = "cover" } = card;

  if (mediaType === "youtube") {
    const embedUrl = `https://www.youtube-nocookie.com/embed/${mediaSrc}?autoplay=1&mute=1&loop=1&playlist=${mediaSrc}&controls=0&disablekb=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3`;

    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
        }}
      >
        <iframe
          src={embedUrl}
          title="Background video"
          allow="autoplay; encrypted-media"
          allowFullScreen={false}
          style={{
            position: "absolute",
            top: "-5%",
            left: "-5%",
            width: "110%",
            height: "110%",
            border: "none",
            pointerEvents: "none",
            objectFit: mediaObjectFit,
          }}
        />
      </div>
    );
  }

  if (mediaType === "image" || mediaType === "instagram" || mediaType === "website-preview") {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
        }}
      >
        <Image
          src={mediaSrc}
          alt={card.headline}
          fill
          style={{ objectFit: mediaObjectFit }}
          sizes="100vw"
          priority={false}
        />
      </div>
    );
  }

  return null;
}
