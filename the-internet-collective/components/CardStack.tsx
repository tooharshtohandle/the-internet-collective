"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cards } from "@/data/card";
import Card from "./Card";

gsap.registerPlugin(ScrollTrigger);

// ── Animation constants ─────────────────────────────────────
const ENTRY_ROTATION = 45; // degrees clockwise start → rotates anticlockwise to 0
const ENTRY_Y = "110vh"; // start well below viewport
const SCRUB_SPEED = 1;
const TRANSFORM_ORIGIN = "left center";

// Each card gets two scroll phases:
//  1. ANIMATE phase  — the card sweeps in (rotation + y)
//  2. DWELL phase    — the card sits fully in place, nothing else moves
// This ensures the next card is never visible before the current one settles.
const ANIMATE_VH = 100; // viewport-heights of scroll to animate a card in
const DWELL_VH = 20; // viewport-heights of "rest" before next card starts
const SECTION_VH = ANIMATE_VH + DWELL_VH; // total per card

export default function CardStack() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const setCardRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      cardRefs.current[index] = el;
    },
    []
  );

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cardElements = cardRefs.current.filter(
        Boolean
      ) as HTMLDivElement[];
      const total = cardElements.length;

      if (total === 0) return;

      const vh = window.innerHeight;

      cardElements.forEach((cardEl, index) => {
        if (index === 0) {
          // First card: visible from the start, no animation
          gsap.set(cardEl, { y: 0, rotation: 0 });
          return;
        }

        // Per-card config (use card data overrides or global defaults)
        const cardData = cards[index];
        const rotation = cardData.entryRotation ?? ENTRY_ROTATION;
        const entryY = cardData.entryY ?? ENTRY_Y;
        const scrub = cardData.scrubSpeed ?? SCRUB_SPEED;
        const origin = cardData.transformOrigin ?? TRANSFORM_ORIGIN;

        // Set initial off-screen state
        gsap.set(cardEl, {
          y: entryY,
          rotation,
          transformOrigin: origin,
        });

        // Scroll position where this card's ANIMATE phase begins:
        // Card 1 starts after card 0's dwell, card 2 after card 1's dwell, etc.
        const scrollStart = (index - 1) * SECTION_VH * (vh / 100);

        // All cards (including last): animate from off-screen+rotated to flush
        gsap.to(cardEl, {
          y: 0,
          rotation: 0,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: `top+=${scrollStart} top`,
            end: `+=${vh * (ANIMATE_VH / 100)}`,
            scrub,
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Container height:
  // Total scroll needed for all animations + 100vh for the viewport itself.
  // Max scrollable distance = containerHeight - 100vh, so we add 100vh.
  const containerHeight =
    cards.length > 1
      ? `${(cards.length - 2) * SECTION_VH + ANIMATE_VH + 100}vh`
      : "100vh";

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: containerHeight,
      }}
    >
      {cards.map((card, index) => (
        <Card
          key={card.id}
          ref={setCardRef(index)}
          card={card}
          index={index}
          total={cards.length}
        />
      ))}
    </div>
  );
}
