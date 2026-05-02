"use client";

import { useEffect } from "react";
import { LANDING_FR } from "@/lib/i18n";

function applyLandingLang(lang: "en" | "fr", animate = false) {
  const els = document.querySelectorAll<HTMLElement>("[data-i18n]");

  const swap = () => {
    els.forEach(el => {
      const key = el.getAttribute("data-i18n") ?? "";
      const fr = LANDING_FR[key];
      if (!fr) return;
      if (lang === "fr") {
        if (!el.dataset.en) el.dataset.en = el.textContent ?? "";
        el.textContent = fr;
      } else {
        if (el.dataset.en) el.textContent = el.dataset.en;
      }
    });
    document.querySelectorAll<HTMLElement>(".lang-btn").forEach(btn => {
      btn.classList.toggle("lang-btn--active", btn.dataset.lang === lang);
    });
    localStorage.setItem("lang", lang);
  };

  if (!animate) { swap(); return; }

  // Fade out → swap → fade in
  els.forEach(el => { el.style.transition = "opacity 0.15s ease"; el.style.opacity = "0"; });
  setTimeout(() => {
    swap();
    els.forEach(el => { el.style.opacity = "1"; });
    setTimeout(() => { els.forEach(el => { el.style.transition = ""; el.style.opacity = ""; }); }, 160);
  }, 150);
}

export default function NavScript() {
  useEffect(() => {
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    // Apply saved language on load
    const savedLang = (localStorage.getItem("lang") ?? "en") as "en" | "fr";
    if (savedLang === "fr") applyLandingLang("fr", true);
    else applyLandingLang("en", true);

    // Wire lang buttons — animate on user click only
    document.getElementById("langBtnEn")?.addEventListener("click", () => applyLandingLang("en", true));
    document.getElementById("langBtnFr")?.addEventListener("click", () => applyLandingLang("fr", true));

    const navDropdowns = Array.from(
      document.querySelectorAll<HTMLElement>(".nav-dropdown")
    );

    const closeDropdowns = (exceptDropdown: HTMLElement | null = null) => {
      navDropdowns.forEach((dropdown) => {
        if (exceptDropdown && dropdown === exceptDropdown) return;
        dropdown.classList.remove("is-open");
        const trigger = dropdown.querySelector<HTMLElement>(".nav-drop-trigger");
        if (trigger) trigger.setAttribute("aria-expanded", "false");
      });
    };

    navDropdowns.forEach((dropdown) => {
      const trigger = dropdown.querySelector<HTMLElement>(".nav-drop-trigger");
      if (!trigger) return;
      trigger.setAttribute("aria-expanded", "false");

      const handleTriggerClick = (event: Event) => {
        event.preventDefault();
        const wasOpen = dropdown.classList.contains("is-open");
        closeDropdowns(dropdown);
        if (!wasOpen) {
          dropdown.classList.add("is-open");
          trigger.setAttribute("aria-expanded", "true");
        }
      };

      trigger.addEventListener("click", handleTriggerClick);

      dropdown.querySelectorAll<HTMLElement>(".nav-drop-menu a").forEach((item) => {
        item.addEventListener("click", () => closeDropdowns());
      });
    });

    const handleDocClick = (event: MouseEvent) => {
      if (!(event.target as Element).closest(".nav-dropdown")) closeDropdowns();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDropdowns();
    };

    document.addEventListener("click", handleDocClick);
    document.addEventListener("keydown", handleKeyDown);

    const siteHeader = document.getElementById("siteHeader");
    let handleHeaderMorph: (() => void) | null = null;
    if (siteHeader) {
      handleHeaderMorph = () => {
        if (window.scrollY > 24) siteHeader.classList.add("is-compact");
        else siteHeader.classList.remove("is-compact");
      };
      handleHeaderMorph();
      window.addEventListener("scroll", handleHeaderMorph, { passive: true });
    }

    // Mobile burger
    const burger = document.getElementById("navBurger");
    const closeMobileNav = () => {
      siteHeader?.classList.remove("nav-is-open");
      document.body.classList.remove("nav-is-open");
      burger?.setAttribute("aria-expanded", "false");
    };
    if (burger && siteHeader) {
      burger.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = siteHeader.classList.toggle("nav-is-open");
        document.body.classList.toggle("nav-is-open", isOpen);
        burger.setAttribute("aria-expanded", String(isOpen));
      });
    }
    // Close mobile nav on link click
    document.querySelectorAll(".main-nav > a").forEach(a =>
      a.addEventListener("click", closeMobileNav)
    );
    // Close on resize to desktop
    const handleResize = () => { if (window.innerWidth > 768) closeMobileNav(); };
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("click", handleDocClick);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
      if (siteHeader && handleHeaderMorph) {
        window.removeEventListener("scroll", handleHeaderMorph);
      }
    };
  }, []);

  return null;
}
