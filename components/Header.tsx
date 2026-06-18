import { useEffect, useRef, useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const lastScrollY = useRef(0);
  const lastTouchY = useRef<number | null>(null);
  const ticking = useRef(false);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const showHeader = () => {
      setHeaderHidden(false);
    };

    const handleScroll = () => {
      if (ticking.current) return;

      ticking.current = true;
      window.requestAnimationFrame(() => {
        const currentScrollY = Math.max(window.scrollY, 0);
        const scrollDelta = currentScrollY - lastScrollY.current;

        if (menuOpen || currentScrollY < 24 || scrollDelta < -2) {
          setHeaderHidden(false);
        } else if (scrollDelta > 8 && currentScrollY > 96) {
          setHeaderHidden(true);
        }

        lastScrollY.current = currentScrollY;
        ticking.current = false;
      });
    };

    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY < 0) showHeader();
    };

    const handleTouchStart = (event: TouchEvent) => {
      lastTouchY.current = event.touches[0]?.clientY ?? null;
    };

    const handleTouchMove = (event: TouchEvent) => {
      const currentTouchY = event.touches[0]?.clientY;
      if (currentTouchY == null || lastTouchY.current == null) return;

      if (currentTouchY - lastTouchY.current > 3) {
        showHeader();
      }

      lastTouchY.current = currentTouchY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [menuOpen]);

  return (
    <header className={`topbar${headerHidden ? " is-hidden" : ""}`}>
      <div className="wrap nav">
        <a className="brand" href="/">
          <img alt="STL Diving logo" src="/assets/stl-diving-logo-transparent.png" />
        </a>
        <button
          aria-controls="site-navigation"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          className="menu-toggle"
          onClick={() => setMenuOpen((isOpen) => !isOpen)}
          type="button"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <nav className={`navlinks${menuOpen ? " is-open" : ""}`} id="site-navigation">
          <a href="/">Home</a>
          <a href="/programs">Training Info</a>
          <a href="/coaches">Coaches</a>
          <a href="/signup">Sign Up</a>
          <a className="cta" href="/contact">Contact</a>
        </nav>
      </div>
    </header>
  );
}
