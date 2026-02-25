# The Internet Collective — Design & Build Specification

> A full-page card-scroll blog for sharing cool things found on the internet: music videos, brand campaigns, YouTube videos, Instagram posts, and more. Inspired by the scroll mechanic and visual language of [The Line Studio](https://thelinestudio.com). Written to be used as a precise prompt for code generation.

---

## Project Overview

**Site name:** The Internet Collective  
**Purpose:** Personal blog / curated content feed  
**Content types:** YouTube videos, external websites, Instagram posts, and similar embeddable or linkable web content  
**Layout paradigm:** Full-viewport pinned card scroll — one card per entry, stacked and animated in sequence  
**Colour palette:** To be decided by the author — keep all colours as CSS custom properties / design tokens so the entire palette can be swapped in one place  
**Hosting:** Vercel  
**Framework:** Next.js 14+ (App Router, TypeScript)

---

## Tech Stack

| Layer              | Technology                                   |
| ------------------ | -------------------------------------------- |
| Framework          | Next.js 14+ (App Router)                     |
| Language           | TypeScript                                   |
| Styling            | Tailwind CSS                                 |
| Scroll engine      | Lenis                                        |
| Animation          | GSAP + ScrollTrigger                         |
| Per-card effects   | ReactBits components (https://reactbits.dev) |
| Image optimisation | next/image                                   |
| Hosting            | Vercel                                       |

**Refer to `smooth-website-reference.md` for detailed setup instructions for each of the above.**

---

## File & Folder Structure

```
/app
  layout.tsx           — Root layout, Lenis provider, global styles
  page.tsx             — Home page: renders <CardStack /> and <Footer />
  globals.css          — CSS custom properties (colour tokens, font defaults)
/components
  CardStack.tsx        — Orchestrates all cards, owns the GSAP scroll logic
  Card.tsx             — Individual card component (receives card data as props)
  CardMedia.tsx        — Handles rendering: YouTube iframe, image, or other embed
  CardOverlay.tsx      — Headline, subheading, hover label — floats above media
  Footer.tsx           — Static footer section below the last (tilted) card
  /effects             — ALL effect components live here — purely additive, never edit Card.tsx
    GlitchText.tsx
    SplitText.tsx
    BlurIn.tsx
    SpotlightWrapper.tsx
    MagneticWrapper.tsx
    CrosshairWrapper.tsx
    NoiseOverlay.tsx
    Vignette.tsx
    AuroraBackground.tsx
    ...                — add new effects here freely, nothing else in the project changes
/data
  cards.ts             — The single source of truth for all card content and config
/types
  index.ts             — CardData TypeScript interface
/providers
  LenisProvider.tsx    — Smooth scroll setup
/public
  /images              — Static images for image-type cards
```

---

## The Card Data File — `data/cards.ts`

This is where all content lives. Adding a new card = adding a new object to the array. Every visual and behavioural property of a card is controlled here.

### Full card object shape (TypeScript interface)

```typescript
export interface CardData {
  // ── Identity ──────────────────────────────────────────────
  id: string; // unique slug, e.g. "nike-air-max-2024"

  // ── Content ───────────────────────────────────────────────
  mediaType: "youtube" | "image" | "instagram" | "website-preview";
  mediaSrc: string; // YouTube video ID, image path, or URL depending on mediaType
  link: string; // URL the card navigates to when clicked
  linkTarget?: "_blank" | "_self"; // default: '_blank'

  // ── Text Overlay ──────────────────────────────────────────
  headline: string; // large text, top-left of card
  subheading?: string; // smaller text below headline

  // ── Per-card Typography ───────────────────────────────────
  headlineFont?: string; // CSS font-family string or next/font variable
  headlineFontSize?: string; // e.g. '6rem', '10vw', 'clamp(2rem, 8vw, 8rem)'
  headlineColor?: string; // CSS colour value
  headlineWeight?: string | number; // e.g. 700, 'bold', '900'
  subheadingFont?: string;
  subheadingFontSize?: string;
  subheadingColor?: string;

  // ── Per-card Scroll Animation ─────────────────────────────
  entryRotation?: number; // starting rotation in degrees (default: -5)
  entryY?: string; // starting Y offset (default: '100vh')
  scrubSpeed?: number; // scrub value passed to ScrollTrigger (default: 1)
  transformOrigin?: string; // pivot point for rotation (default: 'left center')

  // ── Per-card Background ───────────────────────────────────
  backgroundColor?: string; // shown while media loads or for non-video cards
  mediaObjectFit?: "cover" | "contain"; // default: 'cover'

  // ── Per-card Cursor / Hover Effect ────────────────────────
  hoverLabel?: string; // text shown on hover (default: 'View →')

  // ── Per-card Effects (fully extensible) ───────────────────
  //
  // Effects are passed as actual React components, not string enums.
  // This means you NEVER need to edit Card.tsx or this type definition
  // to add a new effect. The workflow is always:
  //   1. Create a new file in components/effects/
  //   2. Import it in cards.ts and pass it to the card
  //   3. Done — Card.tsx renders whatever component it receives
  //
  // Each effect component must follow these contracts:
  //   HeadlineEffect  — accepts { children: React.ReactNode } + any extras via effectProps
  //   CursorEffect    — accepts { children: React.ReactNode } + any extras via effectProps
  //                     (wraps the entire card, handles all mouse interaction internally)
  //   BackgroundEffect — accepts no children, renders its own output + any extras via effectProps
  //                      (rendered as an absolutely-positioned layer inside the card)
  //
  // If a field is omitted, Card.tsx falls back to plain rendering — no effect.

  HeadlineEffect?: React.ComponentType<
    { children: React.ReactNode } & Record<string, unknown>
  >;
  // A React component that wraps and animates the headline text.
  // Source from ReactBits (https://reactbits.dev) or write your own in components/effects/
  // Examples you might build or pull: GlitchText, ScrambleText, SplitText, BlurIn, GradientFlow

  CursorEffect?: React.ComponentType<
    { children: React.ReactNode } & Record<string, unknown>
  >;
  // A React component that wraps the entire card and provides cursor interactivity.
  // Examples you might build or pull: SpotlightWrapper, MagneticWrapper, CrosshairWrapper

  BackgroundEffect?: React.ComponentType<Record<string, unknown>>;
  // A React component rendered as an absolutely-positioned layer inside the card.
  // Sits either above or below the media depending on its z-index.
  // Examples you might build or pull: NoiseOverlay, AuroraBackground, GridOverlay, Vignette

  effectProps?: Record<string, unknown>;
  // Extra config passed as props to ALL effect components on this card.
  // Each effect component destructures only what it needs and ignores the rest.
  // Use for per-card tuning: speed, colour, intensity, blendMode, etc.
}
```

### Example `cards.ts` file

```typescript
import { CardData } from "../types";

// Import your effect components — add new ones here freely
import GlitchText from "@/components/effects/GlitchText";
import SplitText from "@/components/effects/SplitText";
import BlurIn from "@/components/effects/BlurIn";
import SpotlightWrapper from "@/components/effects/SpotlightWrapper";
import MagneticWrapper from "@/components/effects/MagneticWrapper";
import CrosshairWrapper from "@/components/effects/CrosshairWrapper";
import NoiseOverlay from "@/components/effects/NoiseOverlay";
import Vignette from "@/components/effects/Vignette";
import AuroraBackground from "@/components/effects/AuroraBackground";

export const cards: CardData[] = [
  {
    id: "nike-nothing-beats-a-londoner",
    mediaType: "youtube",
    mediaSrc: "GVFOcIjUMnc", // YouTube video ID only, not full URL
    link: "https://www.youtube.com/watch?v=GVFOcIjUMnc",
    headline: "Nothing Beats a Londoner",
    subheading: "Nike / 2018",
    headlineFontSize: "clamp(3rem, 8vw, 9rem)",
    headlineWeight: 900,
    headlineColor: "#ffffff",
    entryRotation: -6,
    scrubSpeed: 1,
    CursorEffect: SpotlightWrapper,
    HeadlineEffect: SplitText,
    BackgroundEffect: Vignette,
    effectProps: { intensity: 0.8 },
  },
  {
    id: "gorillaz-cracker-island",
    mediaType: "youtube",
    mediaSrc: "VIDEO_ID_HERE",
    link: "https://www.youtube.com/watch?v=VIDEO_ID_HERE",
    headline: "Cracker Island",
    subheading: "Gorillaz / 2023",
    headlineFont: '"Your Custom Font", sans-serif',
    headlineFontSize: "12vw",
    headlineColor: "#ff4400",
    entryRotation: -4,
    CursorEffect: MagneticWrapper,
    HeadlineEffect: GlitchText,
    BackgroundEffect: NoiseOverlay,
    effectProps: { speed: 2, color: "#ff4400" },
  },
  {
    id: "some-article",
    mediaType: "image",
    mediaSrc: "/images/some-article-cover.jpg",
    link: "https://www.example.com/article",
    headline: "An Article I Liked",
    subheading: "The Verge / 2025",
    backgroundColor: "#1a1a2e",
    entryRotation: -3,
    CursorEffect: CrosshairWrapper,
    HeadlineEffect: BlurIn,
    BackgroundEffect: AuroraBackground,
    // no effectProps needed — all defaults work fine for this card
  },
];
```

> **To add a new card:** append a new object to the `cards` array. Only `id`, `mediaType`, `mediaSrc`, `link`, and `headline` are required. Everything else falls back to defaults defined in `Card.tsx`.

---

## The Scroll Mechanic — Detailed Spec

### General behaviour

- Each card fills 100% of the viewport width and height (`100vw × 100vh`)
- Cards are **stacked on top of each other** using absolute positioning within a container that has a total height of `(number of cards) × 100vh`
- As the user scrolls, the **current card is pinned** (stays fixed in place) while the **next card animates upward and rotates into vertical alignment**
- The feel is of physically sliding a new card in from below while the previous one stays frozen

### Entry animation (per card)

Each card (except the first) starts in this state:

- `y: card.entryY ?? '100vh'` — fully below the viewport
- `rotation: card.entryRotation ?? -5` — slightly counter-clockwise
- `transformOrigin: card.transformOrigin ?? 'left center'` — rotates around its left edge

As the previous card's scroll section progresses (via `scrub`), the incoming card transitions to:

- `y: 0`
- `rotation: 0`

### The last card (footer reveal)

The last card in the `cards` array **never completes** its entry animation. It is intentionally left in a mid-rotation, partially-visible state when the user reaches the bottom of the scroll. Specifically:

- It animates in only partway — enough for the bottom half to be visible on screen
- Its top half remains rotated out of the viewport to the upper-left
- It **does not get pinned** — it simply rests in its mid-rotation state at the bottom of the scroll container
- The static `<Footer />` component is rendered below the scroll container in normal document flow and becomes visible as the user reaches the bottom

To implement: give the last card a shorter scroll budget (e.g. `end: '+=50%'` instead of `'+=100%'`) and end its animation at `rotation: -8` and `y: '-20vh'` rather than `0, 0`. Tweak values visually.

### z-index stacking

Cards are absolutely positioned and stacked. Each card's z-index = `cards.length - index` so card 0 (first) is on top of card 1, and so on. The incoming card rises up from behind the current card. When it fully covers the current card, the scroll section ends and the cycle continues.

---

## Media Rendering — `CardMedia.tsx`

### YouTube (`mediaType: 'youtube'`)

Embed using the YouTube `nocookie` domain and `autoplay`, `mute`, `loop`, and `controls=0` parameters. Videos play silently in a loop as background media.

```
https://www.youtube-nocookie.com/embed/{mediaSrc}?autoplay=1&mute=1&loop=1&playlist={mediaSrc}&controls=0&disablekb=1&modestbranding=1
```

- The iframe should be `position: absolute; inset: 0; width: 100%; height: 100%; border: none; pointer-events: none`
- `pointer-events: none` on the iframe prevents it from capturing mouse events — the parent `<a>` tag handles the click to navigate
- Scale the iframe slightly larger than its container (e.g. `width: 110%; height: 110%; top: -5%; left: -5%`) to hide YouTube's black letterbox bars at the edges

### Static image (`mediaType: 'image'`)

Use `next/image` with `fill` and `objectFit: cover`. Add `placeholder="blur"` for a smooth load-in.

### Instagram / other (`mediaType: 'instagram'` or `'website-preview'`)

For Instagram posts, use a static screenshot image as the `mediaSrc` (Instagram does not allow background autoplay embeds). Link the card to the Instagram post URL. For other website previews, same approach — screenshot as image, link to the page.

---

## Text Overlay — `CardOverlay.tsx`

The headline and subheading are absolutely positioned within the card, bottom-left by default.

### Default positioning

```
position: absolute
bottom: 2rem (or top: 2rem — author's choice per card)
left: 2rem
z-index: 10
pointer-events: none  // so hover/click passes through to the card link
```

### Typography defaults (override per card in cards.ts)

```css
--headline-font: inherit;
--headline-size: clamp(3rem, 7vw, 8rem);
--headline-weight: 700;
--headline-color: #ffffff;
--subheading-font: inherit;
--subheading-size: clamp(1rem, 2vw, 1.5rem);
--subheading-color: rgba(255, 255, 255, 0.7);
```

### ReactBits headline effects

Each `headlineEffect` value maps to a specific ReactBits component. When implementing, wrap the headline string in the corresponding ReactBits component instead of a plain `<h1>`. Check https://reactbits.dev for the exact component API — effects are applied only on the headline, not the subheading (unless explicitly added).

---

## Cursor & Hover Effects — per card

### Cursor & Hover Effects — per card

### Hover label

On `mouseenter` on a card, show a small label (default: `"View →"`) near the cursor or fixed to the card. On `mouseleave`, hide it. Use GSAP `opacity` and `scale` for the show/hide transition (not CSS transitions — keeps it in sync with the GSAP animation system).

### `CursorEffect` — how it works

`CursorEffect` is a React component that **wraps the entire card**. It receives `children` (the card contents) and any config from `effectProps`. It is responsible for handling all mouse interaction internally — `Card.tsx` just renders it and passes the card contents through.

```tsx
// Inside Card.tsx — Card.tsx doesn't know or care what CursorEffect is
const { CursorEffect, effectProps } = card;

return CursorEffect ? (
  <CursorEffect {...effectProps}>{cardContents}</CursorEffect>
) : (
  <>{cardContents}</>
);
```

### Adding a new cursor effect

Create a new file in `components/effects/`. The component must accept `children` and render them, plus implement whatever cursor behaviour you want internally:

```tsx
// components/effects/MyCustomCursor.tsx
"use client";
import { useRef } from "react";
import gsap from "gsap";

export default function MyCustomCursor({ children, ...effectProps }) {
  const ref = useRef(null);

  // implement your cursor logic here using GSAP mousemove, etc.

  return <div ref={ref}>{children}</div>;
}
```

Then import it in `cards.ts` and pass it to whichever cards should use it. No other files need to change.

---

## Footer — `Footer.tsx`

The footer is a **static section** rendered below the card scroll container in normal document flow. It becomes visible as the user scrolls past the last (tilted) card.

### Content

- Site name / logo: **The Internet Collective**
- A brief disclaimer (e.g. "All content belongs to its respective creators. This site curates and links to publicly available work.")
- Contact info (author's choice — email, social handle, etc.)
- Copyright line

### Styling

- Background colour: author's choice (a strong contrast to the cards works well — see The Line's red footer as inspiration)
- Full viewport width, height auto (content-driven)
- Padding: generous (`4rem` or more) to give it breathing room

---

## Effects Architecture — `components/effects/`

This folder is the engine room of the site's customisation system. Every headline, cursor, and background effect is a self-contained React component that lives here. The folder is **purely additive** — you only ever add files, never edit existing ones when adding new effects.

### Folder structure

```
components/
  effects/
    GlitchText.tsx          ← wraps headline text with a glitch animation
    SplitText.tsx           ← animates each character/word individually
    BlurIn.tsx              ← fades text in from a blurred state
    ScrambleText.tsx        ← scrambles characters before settling
    GradientFlow.tsx        ← animated gradient colour across text
    SpotlightWrapper.tsx    ← radial light follows cursor across card
    MagneticWrapper.tsx     ← cursor/card pull effect on hover
    CrosshairWrapper.tsx    ← custom crosshair cursor
    NoiseOverlay.tsx        ← film grain texture layer
    Vignette.tsx            ← dark edge vignette
    AuroraBackground.tsx    ← animated gradient background
    GridOverlay.tsx         ← subtle grid texture
    ... add more freely
```

### Contract each effect component must follow

**HeadlineEffect components:**

- Accept `children: React.ReactNode` — the headline string is passed as children
- Accept any extra config via spread props (from `effectProps`)
- Must be `'use client'` since they use browser APIs

**CursorEffect components:**

- Accept `children: React.ReactNode` — the entire card contents are passed as children
- Handle all mouse events internally
- Must be `'use client'`

**BackgroundEffect components:**

- Accept no children — they render their own output
- Must use `position: absolute; inset: 0` to fill the card
- Accept any extra config via spread props (from `effectProps`)
- Must be `'use client'`

### Sourcing effects

Effects can be sourced from three places — all are valid and can be mixed:

1. **ReactBits** (https://reactbits.dev) — browse the text, cursor, and background categories. Copy the component code into the appropriate file in `components/effects/`. Check ReactBits docs for exact prop names before using.
2. **GSAP** — write custom components using GSAP animations. Use `useRef` + `useEffect` + `gsap.context()` pattern (see `smooth-website-reference.md` Section 3).
3. **Custom CSS/Canvas** — for simpler effects like noise overlays or vignettes, plain CSS or a `<canvas>` element is fine.

> **Do not use CSS `transition` or `animation` properties for effects that need to feel in sync with scroll or other GSAP animations** — keep everything in GSAP to avoid timing conflicts.

---

## Global Defaults & CSS Custom Properties

Define all tokens in `globals.css`. This makes the palette swappable in one edit:

```css
:root {
  /* Colours — fill these in when palette is decided */
  --color-bg: #000000;
  --color-text-primary: #ffffff;
  --color-text-secondary: rgba(255, 255, 255, 0.6);
  --color-footer-bg: #your-choice;
  --color-footer-text: #your-choice;

  /* Typography */
  --font-headline: inherit; /* override with next/font variable */
  --font-body: inherit;

  /* Scroll */
  --lenis-duration: 1.2;

  /* Cards */
  --card-entry-rotation: -5deg;
  --card-scrub-speed: 1;
}
```

---

## Performance Considerations

- Import GSAP and ScrollTrigger with `dynamic(() => import(...), { ssr: false })` — they require the DOM
- Import Lenis the same way
- All ReactBits components that use canvas or WebGL should also be dynamically imported with `ssr: false`
- YouTube iframes are only rendered when the card is within 1 viewport of the current scroll position (lazy render) — prevents 10+ iframes loading simultaneously on page load
- Use `will-change: transform` on all card elements for GPU compositing

---

## Adding a New Card — Step by Step

1. Open `data/cards.ts`
2. Add a new object to the `cards` array (see the CardData interface above for all available properties)
3. Only these fields are required:
   - `id` — a unique string slug
   - `mediaType` — `'youtube'` | `'image'` | `'instagram'`
   - `mediaSrc` — YouTube video ID or image path
   - `link` — the URL to navigate to on click
   - `headline` — the text displayed on the card
4. Add any optional overrides (font, animation, cursor effect, etc.) as needed
5. Save the file — the card appears automatically in the stack in array order
6. Deploy to Vercel

> The order of cards in the array is the order they appear on the site. First item = topmost card (first one the user sees).

---

## Open Questions / Author Decisions Remaining

- [ ] Final colour palette (background, footer, text colours)
- [ ] Font choices — which typefaces for headlines and subheadings (can differ per card but a default should be set)
- [ ] Whether the site needs a header/nav or is purely the card scroll with no chrome
- [ ] Whether to add a site intro / loading screen before the cards begin
- [ ] Contact info and disclaimer text for the footer
- [ ] Whether Instagram cards should open in a new tab (recommended: yes, `linkTarget: '_blank'`)

---

_Spec compiled for: The Internet Collective — a personal curated blog._  
_Reference stack analysis: `smooth-website-reference.md`_
