// company.js - shared script for all company sub-pages

// ÄÄÄ BACK NAVIGATION with View Transition API ÄÄÄ
// Adds the .back-transition class to <html> so the main style.css
// can pick the reverse animation direction (rightleft instead of leftright).
function initBackNavigation() {
  const backBtn = document.querySelector(".back-btn");
  if (!backBtn) return;

  backBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const href = backBtn.getAttribute("data-href") || "../index.html";

    // Signal to the index page's CSS that this is a "back" transition
    document.documentElement.classList.add("back-transition");

    if (!document.startViewTransition) {
      window.location.href = href;
      return;
    }

    document.startViewTransition(() => {
      window.location.href = href;
    });
  });
}

// ÄÄÄ SIBLING COMPANY LINKS ÄÄÄ
// Navigate to another company page with a neutral horizontal transition.
function initSiblingNavigation() {
  document.querySelectorAll(".sibling-link[data-href]").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const href = link.getAttribute("data-href");

      if (!document.startViewTransition) {
        window.location.href = href;
        return;
      }

      document.startViewTransition(() => {
        window.location.href = href;
      });
    });
  });
}

// ÄÄÄ CUSTOM CURSOR ÄÄÄ
function initCursor() {
  const trail = document.querySelector(".cursor-trail");
  if (!trail) return;

  const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const mouse = { x: pos.x, y: pos.y };
  const speed = 0.15;

  // Lazy GSAP load (GSAP is included in the company pages via CDN)
  const xSet = gsap.quickSetter(trail, "x", "px");
  const ySet = gsap.quickSetter(trail, "y", "px");

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    trail.style.opacity = "1";
  });

  gsap.ticker.add(() => {
    const dt = 1.0 - Math.pow(1.0 - speed, gsap.ticker.deltaRatio());
    pos.x += (mouse.x - pos.x) * dt;
    pos.y += (mouse.y - pos.y) * dt;
    xSet(pos.x);
    ySet(pos.y);
  });

  document.querySelectorAll("a, .back-btn, .sibling-link").forEach(el => {
    el.addEventListener("mouseenter", () => gsap.to(trail, { scale: 3, rotation: 135, duration: 0.3 }));
    el.addEventListener("mouseleave", () => gsap.to(trail, { scale: 1, rotation: 45, duration: 0.3 }));
  });
}

// ÄÄÄ SCROLL REVEAL ÄÄÄ
// Simple IntersectionObserver-based reveal for .anim elements.
// Hero .anim elements are handled by CSS animation (always visible).
function initScrollReveal() {
  // Exclude hero children - they're revealed by CSS keyframe animation
  const els = Array.from(document.querySelectorAll(".anim")).filter(
    el => !el.closest(".company-hero")
  );
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.05,      // trigger as soon as 5% is visible
    rootMargin: "0px 0px -40px 0px"
  });

  els.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i * 0.07, 0.4)}s`;
    observer.observe(el);
  });

  // Hard fallback: if anything is still invisible after 2s, force-reveal it.
  // Catches cases where the observer never fires (e.g. cached page, instant scroll).
  setTimeout(() => {
    els.forEach(el => el.classList.add("visible"));
  }, 2000);
}

// ÄÄÄ HERO PARALLAX ÄÄÄ
function initHeroParallax() {
  const bg = document.querySelector(".company-hero-bg");
  if (!bg) return;

  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    bg.style.transform = `translateY(${y * 0.35}px)`;
  }, { passive: true });
}

// ÄÄÄ INIT ÄÄÄ
document.addEventListener("DOMContentLoaded", () => {
  initBackNavigation();
  initSiblingNavigation();
  initCursor();
  initScrollReveal();
  initHeroParallax();
});
