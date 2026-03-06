# Building Smooth & Seamless Websites in React

> Reference notes inspired by [The Line Studio](https://thelinestudio.com) — a best-in-class animation studio portfolio built with Nuxt 3 + Vue. Everything here is the React/Next.js equivalent of what they achieved.

---

## The Core Stack

| Layer              | The Line Used           | React Equivalent                                     |
| ------------------ | ----------------------- | ---------------------------------------------------- |
| Framework          | Nuxt 3 (Vue)            | **Next.js 14+** (App Router)                         |
| Bundler            | Vite (via Nuxt)         | **Vite** or Turbopack (built into Next.js)           |
| Scroll animations  | GSAP + ScrollTrigger    | **GSAP + ScrollTrigger** (same — framework agnostic) |
| Smooth scroll      | Likely Lenis            | **Lenis** (same — framework agnostic)                |
| Image optimization | Nuxt Image              | **next/image**                                       |
| Video hosting      | **Vimeo CDN**           | **Vimeo CDN** (same)                                 |
| Hosting            | Unknown (likely Vercel) | **Vercel**                                           |

---

## 1. Framework — Next.js

Use **Next.js 14+** with the App Router. It gives you:

- **Server-side rendering (SSR)** and **static generation (SSG)** out of the box — pages load with real HTML, not a blank div
- **Automatic code splitting** via Vite/Turbopack — JS is broken into ~40-50 small chunks, so the browser only downloads what's needed for the current page, then **prefetches** the next page in the background. This makes navigation feel instant.
- **`next/image`** for automatic image optimization (WebP/AVIF conversion, correct sizing per device, lazy loading, no layout shift)
- **File-based routing** keeps the project clean and organised

```bash
npx create-next-app@latest my-project --typescript --tailwind --app
```

---

## 2. Smooth Scrolling — Lenis

Lenis replaces native browser scrolling with a **lerp-based (linear interpolation)** version. This gives that buttery, slightly-easing feel where the page glides rather than jumps. It's the single biggest contributor to a site feeling "premium".

```bash
npm install lenis
```

**Setup in Next.js (App Router):**

```jsx
// app/providers/LenisProvider.jsx
"use client";
import { useEffect } from "react";
import Lenis from "lenis";

export default function LenisProvider({ children }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2, // scroll duration (higher = slower/smoother)
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  return <>{children}</>;
}
```

> **Important:** Lenis and GSAP ScrollTrigger need to share the same scroll position. Pass Lenis's scroll values to ScrollTrigger using `ScrollTrigger.scrollerProxy()` or the official Lenis GSAP integration.

---

## 3. Animations — GSAP + ScrollTrigger

GSAP is the industry standard for high-performance web animation. It bypasses React's rendering cycle entirely by working directly with the DOM via refs — this is key to keeping animations silky and not janky.

```bash
npm install gsap
```

**The golden rule in React: always use `useRef` to give GSAP DOM access, never animate state.**

```jsx
"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function AnimatedSection() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade + slide up on scroll
      gsap.from(headingRef.current, {
        y: 80,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%", // animation starts when top of section hits 80% of viewport
          end: "top 40%",
          scrub: false, // set to true to tie animation directly to scroll position
        },
      });
    }, sectionRef);

    return () => ctx.revert(); // cleanup on unmount — critical in React
  }, []);

  return (
    <section ref={sectionRef}>
      <h2 ref={headingRef}>Hello World</h2>
    </section>
  );
}
```

**Key GSAP concepts to learn:**

- `gsap.from()` — animate from a starting state to current
- `gsap.to()` — animate from current to an end state
- `gsap.timeline()` — chain multiple animations with precise timing
- `ScrollTrigger.scrub` — ties animation progress directly to scroll position (great for parallax)
- `gsap.context()` — scopes animations to a component, making cleanup easy

---

## 4. Image Optimisation — next/image

Never use a plain `<img>` tag. `next/image` automatically:

- Converts images to **WebP or AVIF** (much smaller file sizes)
- Serves the **correct resolution** for the user's screen (no oversized images on mobile)
- **Lazy loads** by default
- Prevents **Cumulative Layout Shift (CLS)** by reserving space before the image loads

```jsx
import Image from 'next/image'

// For images where you know the dimensions:
<Image
  src="/my-image.jpg"
  width={1200}
  height={800}
  alt="Description"
  priority={false}   // set to true for above-the-fold images (disables lazy load)
/>

// For images that fill their container:
<div style={{ position: 'relative', width: '100%', height: '600px' }}>
  <Image
    src="/my-image.jpg"
    fill
    style={{ objectFit: 'cover' }}
    alt="Description"
  />
</div>
```

**The SVG placeholder trick (what The Line uses):**
Pre-render a black/coloured SVG rectangle at the exact image dimensions as a placeholder. This means zero layout shift and a smooth fade-in when the real image loads. `next/image` handles this automatically with the `placeholder="blur"` prop.

```jsx
<Image
  src="/my-image.jpg"
  width={1200}
  height={800}
  alt="Description"
  placeholder="blur"
  blurDataURL="data:image/svg+xml,..." // or use a real low-res base64 image
/>
```

---

## 5. Video — Vimeo CDN

**Never self-host video.** The Line uses Vimeo to serve all their video content. Here's why:

- Vimeo uses **adaptive bitrate streaming** — it serves different quality levels based on the user's connection speed, so video always starts fast
- It delivers via **HTTP range requests (206 Partial Content)** — the browser fetches video in chunks rather than waiting for the whole file, which is why it starts playing almost instantly
- Vimeo's **global CDN** means the video is served from a server geographically close to the user
- You stay in control of privacy settings (unlisted videos, domain-restricted embeds)

For background/hero videos, embed Vimeo in background mode:

```jsx
<iframe
  src="https://player.vimeo.com/video/YOUR_VIDEO_ID?background=1&autoplay=1&loop=1&muted=1"
  frameBorder="0"
  allow="autoplay; fullscreen"
  style={{ position: "absolute", width: "100%", height: "100%" }}
/>
```

The `background=1` parameter removes all UI controls and makes it behave like a pure background video.

---

## 6. Performance — Code Splitting & Bundle Size

Next.js handles code splitting automatically, but a few extra habits matter:

**Dynamic imports** — for heavy components or libraries (like GSAP or a 3D scene), import them dynamically so they don't block the initial page load:

```jsx
import dynamic from "next/dynamic";

const HeavyAnimation = dynamic(() => import("@/components/HeavyAnimation"), {
  ssr: false, // don't run on server (important for GSAP/Lenis which need the DOM)
});
```

**Register GSAP plugins once** — do it at the top of the file, not inside components or useEffect:

```jsx
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
```

---

## 7. Hosting — Vercel

Deploy on **Vercel** (made by the Next.js team). It gives you:

- **Edge network / CDN** — your site is served from locations close to every user globally
- **Automatic image CDN** — works seamlessly with `next/image`
- Zero-config deploys from GitHub
- Free tier is generous for portfolio/studio sites

---

## 8. The Subtle Details That Make It Feel Premium

These are the small things that separate a good site from a great one:

- **Page transitions** — use GSAP or Framer Motion to animate between pages rather than hard cuts. A simple opacity fade goes a long way.
- **Cursor effects** — a custom cursor that reacts to hover states (scales up, changes colour) adds a tactile feel. Build with GSAP tracking `mousemove`.
- **Staggered list animations** — when multiple items appear, stagger them with a small delay (`gsap.from('.item', { stagger: 0.1 })`).
- **Ease curves** — avoid linear animations. Always use eases like `power3.out`, `expo.out`, or custom cubic beziers. Linear movement looks mechanical.
- **Console credit** — a small developer signature logged to the console is a nice professional touch: `console.log('%c Built by You — https://yoursite.com', 'color: #fff; background: #000; padding: 4px 8px;')`
- **Font loading** — use `next/font` to load custom fonts with zero layout shift and optimal performance.
- **Prefers-reduced-motion** — always respect the user's accessibility settings by wrapping animations in a check:

```jsx
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
if (!prefersReducedMotion) {
  // run animations
}
```

---

## 9. The Pinned Card Scroll Effect (as seen on The Line Studio)

This is one of the most striking scroll patterns on the modern web. Each card occupies the full viewport height. As you scroll, the current card stays **pinned/frozen** in place while the next card rises up from below, simultaneously **rotating from a slight angle to perfectly vertical** as it takes over the screen. All card media (video/image) plays or displays continuously in the background regardless of which card is "active".

### How it works conceptually

- Each card is a full-viewport-height (`100vh`) section
- GSAP `pin: true` locks the current card in place while the user scrolls through its "scroll budget"
- The incoming card starts off-screen below, slightly rotated (e.g. `rotation: -4deg`, `y: '100vh'`)
- `scrub: true` ties the incoming card's `y` position and `rotation` directly to scroll progress — so it physically follows the user's scroll, not a timer
- When the incoming card reaches `rotation: 0` and `y: 0` it has fully taken over, and the cycle repeats for the next card

### The final/footer card effect

The last card does **not** complete its rotation. It is intentionally left mid-animation — slanted, with its top half rotated out of the viewport to the upper-left — as the user reaches the bottom of the page. The static footer sits below it in screen flow. This gives the impression of a card that "fell" and never got back up. Achieved by simply not providing a final scroll section for the last card to complete into — its ScrollTrigger ends before `rotation: 0` is reached.

### Core GSAP pattern

```jsx
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

// Called once on mount, iterating over all card elements
cards.forEach((card, index) => {
  if (index === cards.length - 1) return; // skip last card — it stays mid-rotation

  // Pin the current card while the next one animates in
  ScrollTrigger.create({
    trigger: card,
    start: "top top",
    end: "+=100%", // scroll budget = one viewport height
    pin: true,
    pinSpacing: false,
  });

  // Animate the NEXT card rising up and straightening
  const nextCard = cards[index + 1];
  gsap.fromTo(
    nextCard,
    { y: "100vh", rotation: -5, transformOrigin: "left center" },
    {
      y: 0,
      rotation: 0,
      ease: "none", // ease: none because scrub handles feel
      scrollTrigger: {
        trigger: card,
        start: "top top",
        end: "+=100%",
        scrub: true, // directly tied to scroll position
      },
    },
  );
});
```

### Key implementation notes

- Set `transformOrigin: 'left center'` or `'bottom left'` on the incoming card to control the pivot point of the rotation — this determines whether it swings in from the bottom-left corner or the left edge
- All cards should be stacked via `position: absolute` or CSS stacking — not in normal document flow. The outermost wrapper needs a total height of `(number of cards) * 100vh` to give ScrollTrigger enough scroll room
- Use `will-change: transform` on each card for GPU compositing — keeps rotation and translation on the compositor thread and prevents paint jank
- Videos/images inside cards should be `position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover` so they fill the card regardless of the card's current rotation state
- `scrub: 1` (a number instead of `true`) adds a small lag/smoothing to the scrub — experiment between `scrub: true` and `scrub: 1.5` for feel
- Always pair with **Lenis** smooth scroll — without it, the scrub feels mechanical because native scroll events fire at low resolution

### Per-card text overlay

Headline and subheading float above the media using `position: absolute; z-index: 10; bottom: left: 0` (or wherever desired). They are part of the card's DOM so they rotate and move with the card automatically — no extra animation needed.

### Hover interaction + click-through

The entire card is wrapped in an `<a href={card.link} target="_blank">` tag. A custom cursor or absolutely-positioned label (`"View →"`) is shown on `mouseenter` and hidden on `mouseleave` via GSAP or CSS. The entire card surface is therefore clickable.

```jsx
// Simple hover label approach
<div
  className="card"
  onMouseEnter={() => gsap.to(cursorLabel, { opacity: 1, scale: 1 })}
  onMouseLeave={() => gsap.to(cursorLabel, { opacity: 0, scale: 0.8 })}
>
  ...media...
  <div ref={cursorLabelRef} className="cursor-label">
    View →
  </div>
</div>
```

---

## Quick-Start Checklist

- [ ] Scaffold with `create-next-app` (TypeScript + Tailwind)
- [ ] Install and configure Lenis for smooth scroll
- [ ] Install GSAP + ScrollTrigger, register plugins at module level
- [ ] Replace all `<img>` tags with `next/image`
- [ ] Host videos on Vimeo, embed in background mode
- [ ] Use `dynamic()` imports for heavy animation components
- [ ] Deploy on Vercel
- [ ] Add `prefers-reduced-motion` checks to all animations
- [ ] Add a console signature

---

_Notes compiled from analysis of [thelinestudio.com](https://thelinestudio.com) — designed by Isaac Powell, developed by Thomas Aufresne._
