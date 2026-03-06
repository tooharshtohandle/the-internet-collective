"use client";

import { useRef } from "react";
import CardStack from "@/components/CardStack";
import Footer from "@/components/Footer";

export default function Home() {
  const footerRef = useRef<HTMLElement>(null);

  return (
    <main>
      <CardStack footerRef={footerRef} />
      <Footer ref={footerRef} />
    </main>
  );
}
