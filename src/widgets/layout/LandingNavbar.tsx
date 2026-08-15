import { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import "../../pages/landing.css";

const PRIMARY = "#0066FF";
const NAVY = "#08183A";
const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/#features" },
  { label: "Process", href: "/#process" },
  { label: "AI in Action", href: "/#ai-showcase" },
  { label: "Contact", href: "/contact" },
];

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: scrolled ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: scrolled ? `1px solid ${NAVY}0d` : "1px solid transparent",
        transition: "all 0.3s ease",
        boxShadow: scrolled ? `0 2px 24px ${NAVY}10` : "none",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 24px 0 8px",
          height: 68,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <a
          href="/"
          style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}
        >
          <img src="/logo.png" alt="preparekaro.in" style={{ height: 68, width: "auto" }} />
        </a>

        <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 36 }}>
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                fontWeight: 600,
                color: `${NAVY}b3`,
                textDecoration: "none",
                letterSpacing: "0.01em",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = NAVY)}
              onMouseLeave={(e) => (e.currentTarget.style.color = `${NAVY}b3`)}
            >
              {l.label}
            </a>
          ))}
          <a
            href="/#interest-form"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 22px",
              background: PRIMARY,
              color: "#fff",
              borderRadius: 8,
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "none",
              transition: "opacity 0.2s",
              boxShadow: `0 4px 16px ${PRIMARY}40`,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Book a Demo <ArrowRight size={15} />
          </a>
        </div>

        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="mobile-menu-btn"
          style={{
            display: "none",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 4,
            color: NAVY,
          }}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div
          className="mobile-menu-panel"
          style={{
            background: "#fff",
            borderTop: `1px solid ${NAVY}0d`,
            padding: "16px 24px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <img src="/logo-compact.png" alt="Preparekaro.in" style={{ height: 40, width: 40 }} />
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              style={{ fontSize: 16, fontWeight: 600, color: NAVY, textDecoration: "none" }}
            >
              {l.label}
            </a>
          ))}
          <a
            href="/#interest-form"
            onClick={() => setMobileOpen(false)}
            style={{
              padding: "12px 22px",
              background: PRIMARY,
              color: "#fff",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 15,
              textDecoration: "none",
              textAlign: "center",
            }}
          >
            Book a Demo
          </a>
        </div>
      )}
    </nav>
  );
}
