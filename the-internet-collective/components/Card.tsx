"use client";

import { forwardRef } from "react";
import { CardData } from "@/types";
import CardMedia from "./CardMedia";
import CardOverlay from "./CardOverlay";

interface CardProps {
  card: CardData;
  index: number;
  total: number;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ card, index, total }, ref) => {
    const {
      backgroundColor = "var(--color-card-bg)",
      CursorEffect,
      BackgroundEffect,
      effectProps = {},
      link,
      linkTarget = "_blank",
    } = card;

    const cardContents = (
      <>
        {/* Background colour layer */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor,
            zIndex: 0,
          }}
        />

        {/* Media layer */}
        <CardMedia card={card} />

        {/* Background effect layer */}
        {BackgroundEffect && <BackgroundEffect {...effectProps} />}

        {/* Text overlay layer */}
        <CardOverlay card={card} />
      </>
    );

    // Cards are position: fixed so they stay on the viewport.
    // z-index increases with index so incoming cards cover previous ones.
    const cardStyle: React.CSSProperties = {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      overflow: "hidden",
      zIndex: index + 1,
      willChange: "transform",
    };

    const innerContent = CursorEffect ? (
      <CursorEffect {...effectProps}>{cardContents}</CursorEffect>
    ) : (
      <>{cardContents}</>
    );

    return (
      <div ref={ref} style={cardStyle}>
        <a
          href={link}
          target={linkTarget}
          rel="noopener noreferrer"
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            position: "relative",
            textDecoration: "none",
            color: "inherit",
            cursor: "pointer",
          }}
        >
          {innerContent}
        </a>
      </div>
    );
  }
);

Card.displayName = "Card";
export default Card;
