"use client";

import { ScrollToTopBtn } from "./ScrollToTopBtn";

export function MarketingFooter() {
  return (
    <>
      <footer className="site-footer">
        <div className="container footer-grid">
          <p>&copy; {new Date().getFullYear()} seoprospector</p>
          <nav>
            <a href="/changelog">Changelog</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="/refund">Refund Policy</a>
            <a href="/contact">Contact</a>
          </nav>
        </div>
      </footer>

      <ScrollToTopBtn />
    </>
  );
}
