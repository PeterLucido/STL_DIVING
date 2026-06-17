import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="topbar">
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
