"use client";

export default function Footer() {
  return (
    <footer
      style={{
        position: "relative",
        width: "100%",
        backgroundColor: "var(--color-footer-bg)",
        color: "var(--color-footer-text)",
        padding: "6rem 3rem",
        zIndex: 0,
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "2.5rem",
        }}
      >
        {/* Site name */}
        <h2
          style={{
            fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
            fontWeight: 900,
            letterSpacing: "-0.03em",
            lineHeight: 1,
            fontFamily: "var(--font-headline)",
          }}
        >
          The Internet Collective
        </h2>

        {/* Divider */}
        <div
          style={{
            width: "60px",
            height: "3px",
            backgroundColor: "rgba(255, 255, 255, 0.3)",
          }}
        />

        {/* Disclaimer */}
        <p
          style={{
            fontSize: "1rem",
            lineHeight: 1.7,
            maxWidth: "600px",
            opacity: 0.85,
          }}
        >
          All content belongs to its respective creators. This site curates and
          links to publicly available work on the internet. Nothing here is
          claimed as original.
        </p>

        {/* Bottom row */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            paddingTop: "2rem",
            borderTop: "1px solid rgba(255, 255, 255, 0.15)",
          }}
        >
          <p
            style={{
              fontSize: "0.875rem",
              opacity: 0.6,
            }}
          >
            © {new Date().getFullYear()} The Internet Collective. All rights
            reserved.
          </p>

          <div
            style={{
              display: "flex",
              gap: "1.5rem",
              fontSize: "0.875rem",
            }}
          >
            <a
              href="mailto:hello@theinternetcollective.com"
              style={{
                color: "inherit",
                textDecoration: "none",
                opacity: 0.7,
                transition: "opacity 0.2s ease",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.opacity = "1";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.opacity = "0.7";
              }}
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
