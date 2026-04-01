/* =============================================================
   company.js  -  Filpride Company Sub-pages (shared)
   Architecture:
     1. Navigation      (back + sibling, with distinct VT)
     2. Cursor          (same diamond as index)
     3. Scroll Reveal   (IntersectionObserver, hero excluded)
     4. Hero Parallax
   View Transition rules:
     - back btn  - simple cross-fade (least jarring, feels like "back")
     - sibling   - clip-path vertical wipe (distinct from back/forward)
     - Named transition (company-hero) is DISABLED on company pages
       to avoid fighting the sibling/back transitions.
   ============================================================= */


// SLUG - NUMBER MAP
// Single source of truth used by both the
// sibling navigation and any future feature
// that needs company ordering.
const COMPANY_MAP = {
  "filpride-resources.html": { num: "01", label: "Filpride Resources" },
  "mobility-group.html": { num: "02", label: "Mobility Group" },
  "mcy-container.html": { num: "03", label: "MCY Container" },
  "syvill.html": { num: "04", label: "Syvill" },
  "bienes-de-oro.html": { num: "05", label: "Bienes de Oro" },
  "malayan-maritime.html": { num: "06", label: "Malayan Maritime" },
  "barge.html": { num: "07", label: "Barge" },
  "vosa.html": { num: "08", label: "Vosa" },
};

const supportsVT = typeof document.startViewTransition === "function";


// 1a. BACK NAVIGATION  -  company  index
// Transition: simple cross-fade.
// Reasoning: the user is going "up" in
// hierarchy. A cross-fade is fast, clean,
// and doesn't fight the index loader state.
function initBackNavigation() {
  const btn = document.querySelector(".back-btn");
  if (!btn) return;

  btn.addEventListener("click", e => {
    e.preventDefault();
    const href = btn.getAttribute("data-href") || "../index.html";

    // Mark direction so index-side CSS can respond if needed
    document.documentElement.setAttribute("data-nav", "back");

    if (!supportsVT) { window.location.href = href; return; }

    window.location.href = href;
  });
}


// 1b. SIBLING NAVIGATION  -  company  company
// Transition: vertical clip-path wipe.
// The number flash overlay is injected and
// hidden from the VT snapshot using a
// visibility trick so it doesn't appear
// in the "old page" screenshot.
function initSiblingNavigation() {
  document.querySelectorAll(".sibling-link[data-href]").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const href = link.getAttribute("data-href");
      const meta = COMPANY_MAP[href];
      const num = meta ? meta.num : "-";

      // Create the flash overlay but keep it invisible initially
      // so the VT API snapshots a clean old-page state
      const flash = document.createElement("div");
      flash.className = "vt-number-flash";
      flash.style.opacity = "0";          // invisible during snapshot
      flash.innerHTML = `<span>${num}</span>`;
      document.body.appendChild(flash);

      // Tag html so CSS picks the sibling keyframes
      document.documentElement.setAttribute("data-nav", "sibling");

      // Flash overlay for native cross-document view transitions
      flash.style.opacity = "1";
      flash.style.transition = "opacity 0.1s";
      
      setTimeout(() => {
        window.location.href = href;
      }, 30);
    });
  });
}


// 2. CURSOR
function initCursor() {
  const trail = document.querySelector(".cursor-trail");
  if (!trail) return;

  const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const mouse = { x: pos.x, y: pos.y };

  const setX = gsap.quickSetter(trail, "x", "px");
  const setY = gsap.quickSetter(trail, "y", "px");

  window.addEventListener("mousemove", e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    gsap.to(trail, { opacity: 1, duration: 0.4 });
  });

  gsap.ticker.add(() => {
    const dt = 1 - Math.pow(0.85, gsap.ticker.deltaRatio());
    pos.x += (mouse.x - pos.x) * dt;
    pos.y += (mouse.y - pos.y) * dt;
    setX(pos.x);
    setY(pos.y);
  });

  document.querySelectorAll("a, button, .sibling-link, .back-btn").forEach(el => {
    el.addEventListener("mouseenter", () => gsap.to(trail, { scale: 3, rotation: 135, duration: 0.25 }));
    el.addEventListener("mouseleave", () => gsap.to(trail, { scale: 1, rotation: 45, duration: 0.25 }));
  });
}


// 3. SCROLL REVEAL
//    Hero elements use CSS keyframe animation
//   (always visible).Everything else is
//    revealed by IntersectionObserver as it
//    enters the viewport.
function initScrollReveal() {
  const els = Array.from(document.querySelectorAll(".anim"))
    .filter(el => !el.closest(".company-hero"));

  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.06, rootMargin: "0px 0px -30px 0px" });

  els.forEach((el, i) => {
    // Cap stagger at 0.35s so deep sections don't feel delayed
    el.style.transitionDelay = `${Math.min(i * 0.06, 0.35)}s`;
    observer.observe(el);
  });

  // Hard safety net - reveal everything after 1.8s regardless
  setTimeout(() => {
    els.forEach(el => {
      el.style.transitionDelay = "0s";
      el.classList.add("visible");
    });
  }, 1800);
}


// 4. HERO PARALLAX
function initHeroParallax() {
  const bg = document.querySelector(".company-hero-bg");
  if (!bg) return;

  window.addEventListener("scroll", () => {
    bg.style.transform = `translateY(${window.scrollY * 0.3}px)`;
  }, { passive: true });
}


// INIT
document.addEventListener("DOMContentLoaded", () => {
  initBackNavigation();
  initSiblingNavigation();
  initCursor();
  initScrollReveal();
  initHeroParallax();
});
