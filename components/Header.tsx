export default function Header() {
  return (
    <header className="topbar">
      <div className="wrap nav">
        <a className="brand" href="/">
          <img alt="STL Diving logo" src="/assets/stl-diving-logo-transparent.png" />
        </a>
        <a className="mobile-contact cta" href="/contact">Contact</a>
        <nav className="navlinks">
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
