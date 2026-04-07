/* =============================================================
   script.js  -  Filpride Index Page
   Architecture:
     1. Config & Preload
     2. Loader          (session-gated cinematic intro)
     3. Cursor          (GSAP magnetic diamond)
     4. Background      (slideshow + hover)
     5. Horizontal Scroll
     6. Wiper
     7. Scroll Reveals  (text + progress bar + light-mode)
     8. Navigation      (View Transition API - index - company)
   Each module is self-contained. No shared mutable state
   across modules except where explicitly documented.
   ============================================================= */

gsap.registerPlugin(ScrollTrigger);

// 1. CONFIG & PRELOAD
const BG_IMAGES = [
  "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1920",
  "https://images.unsplash.com/photo-1466611653911-95282fc365d5?auto=format&fit=crop&q=80&w=1920",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1920",
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1920"
];

(function preload() {
  BG_IMAGES.forEach(url => { const i = new Image(); i.src = url; });
})();


// 2. LOADER
// Plays the full cinematic sequence on first
// visit only. Subsequent visits (return from
// company page) skip straight to a soft hero
// reveal, matching the View Transition feel.
function initLoader() {
  const SESSION_KEY = "filpride_loaded";
  const isReturn = sessionStorage.getItem(SESSION_KEY);

  if (isReturn) {
    document.querySelector(".loader-wrapper").style.display = "none";
    document.querySelector(".curtain-panel.left").style.transform = "translateX(-100%)";
    document.querySelector(".curtain-panel.right").style.transform = "translateX(100%)";
    document.body.classList.remove("no-scroll");

    gsap.fromTo(
      [".hero-title .line", ".hero-eyebrow", ".hero-subtitle", ".scroll-indicator", ".glass-nav"],
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", stagger: 0.08, delay: 0.05 }
    );
    return;
  }

  sessionStorage.setItem(SESSION_KEY, "true");
  window.scrollTo(0, 0);

  const tl = gsap.timeline();
  const counter = { val: 0 };

  tl.to(counter, {
    val: 100, duration: 2.5, ease: "power2.inOut",
    onUpdate() {
      document.querySelector(".loader-num").textContent =
        Math.floor(counter.val).toString().padStart(2, "0");
      document.querySelector(".loader-bar-inner").style.width = `${counter.val}%`;
    }
  });

  tl.to(".loader-wrapper", {
    opacity: 0, duration: 0.5,
    onComplete() {
      document.querySelector(".loader-wrapper").style.display = "none";
      document.body.classList.remove("no-scroll");
    }
  });

  tl.fromTo(".r1", { y: -800, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "back.out(1.7)" }, "-=0.1");
  tl.fromTo(".r2", { y: 800, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "back.out(1.7)" }, "-=0.55");
  tl.fromTo(".r3", { x: -800, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, ease: "back.out(1.7)" }, "-=0.55");
  tl.fromTo(".r4", { x: 800, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, ease: "back.out(1.7)" }, "-=0.55");
  tl.to(".rhombus-core", { scale: 1, opacity: 1, duration: 0.35 }, "-=0.15");

  tl.to(".rhombus", {
    x: i => (i % 2 ? 1500 : -1500),
    y: i => (i < 2 ? -1000 : 1000),
    rotation: 180, opacity: 0, duration: 0.9, ease: "power4.in"
  }, "+=0.15");
  tl.to(".rhombus-core", { scale: 8, opacity: 0, duration: 0.7, ease: "power4.in" }, "-=0.9");
  tl.to(".curtain-panel.left", { xPercent: -100, duration: 1.1, ease: "expo.inOut" }, "-=0.7");
  tl.to(".curtain-panel.right", { xPercent: 100, duration: 1.1, ease: "expo.inOut" }, "-=1.1");

  tl.from(".hero-title .line",
    { y: 70, opacity: 0, stagger: 0.12, duration: 1.1, ease: "power4.out" }, "-=0.5");
  tl.from(".hero-eyebrow, .hero-subtitle, .scroll-indicator, .glass-nav",
    { opacity: 0, y: 18, stagger: 0.09, duration: 0.75 }, "-=0.35");
}


// 3. CURSOR
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

  document.querySelectorAll("a, button, .bg-trigger, .cta-link, .mega-item, .fade-trigger, .milestone-card, .group-card")
    .forEach(el => {
      el.addEventListener("mouseenter", () => gsap.to(trail, { scale: 3, rotation: 135, duration: 0.25 }));
      el.addEventListener("mouseleave", () => gsap.to(trail, { scale: 1, rotation: 45, duration: 0.25 }));
    });
}


// 4. BACKGROUND
function initBackground() {
  const bgWrapper = document.querySelector(".bg-wrapper");
  const slides = [document.querySelector(".s1"), document.querySelector(".s2")];
  let activeIdx = 0;
  let bgIndex = 0;
  let slideshowInterval = null;
  let isSlideshowActive = false;
  let isHovering = false;

  function crossfadeTo(url) {
    const next = slides[1 - activeIdx];
    const img = new Image();
    img.src = url;
    img.onload = () => {
      next.style.backgroundImage = `url('${url}')`;
      next.classList.add("active");
      slides[activeIdx].classList.remove("active");
      activeIdx = 1 - activeIdx;
    };
  }

  function showBg() { gsap.to(bgWrapper, { opacity: 1, duration: 1.2, overwrite: true }); }
  function hideBg() { gsap.to(bgWrapper, { opacity: 0, duration: 1.2, overwrite: true }); }

  function startSlideshow(image) {
    isSlideshowActive = true;
    if (image) crossfadeTo(image);
    showBg();
    clearInterval(slideshowInterval);
    slideshowInterval = setInterval(() => {
      if (isHovering) return;
      bgIndex = (bgIndex + 1) % BG_IMAGES.length;
      crossfadeTo(BG_IMAGES[bgIndex]);
    }, 6000);
  }

  function stopSlideshow() {
    isSlideshowActive = false;
    clearInterval(slideshowInterval);
    if (!isHovering) hideBg();
  }

  crossfadeTo(BG_IMAGES[0]);

  const SECTIONS = [
    { id: "#hero", slideshow: true },
    { id: "#about", slideshow: false },
    { id: "#group", slideshow: false },
    { id: "#brand", slideshow: false },
    { id: "#history", slideshow: false },
    {
      id: "#green", slideshow: true,
      image: "https://images.unsplash.com/photo-1466611653911-95282fc365d5?auto=format&fit=crop&q=80&w=1920"
    },
    { id: "#contact", slideshow: true },
  ];

  SECTIONS.forEach(({ id, slideshow, image }) => {
    const el = document.querySelector(id);
    if (!el) return;
    const enter = () => slideshow ? startSlideshow(image) : stopSlideshow();
    const leave = () => { if (!slideshow && !isHovering) hideBg(); };
    ScrollTrigger.create({
      trigger: el, start: "top center", end: "bottom center",
      onEnter: enter, onLeave: leave, onEnterBack: enter, onLeaveBack: leave
    });
  });

  document.querySelectorAll(".bg-trigger").forEach(el => {
    el.addEventListener("mouseenter", () => {
      isHovering = true;
      crossfadeTo(el.dataset.bg);
      showBg();
    });
    el.addEventListener("mouseleave", () => {
      isHovering = false;
      if (!isSlideshowActive) hideBg();
    });
  });
}


// 5. HORIZONTAL SCROLL
function initHorizontal() {
  document.querySelectorAll(".horizontal-panel").forEach(section => {
    const wrapper = section.querySelector(".horizontal-wrapper");
    const getWidth = () => wrapper.scrollWidth - window.innerWidth + window.innerWidth * 0.1;

    gsap.to(wrapper, {
      x: () => -getWidth(),
      ease: "none",
      scrollTrigger: {
        trigger: section,
        pin: true,
        scrub: 1,
        end: () => `+=${getWidth()}`,
        invalidateOnRefresh: true,
      }
    });

    const cards = section.querySelectorAll(".group-card");
    cards.forEach(card => {
      card.addEventListener("mouseenter", () => {
        gsap.to(cards, { opacity: 0.35, duration: 0.25, overwrite: true });
        gsap.to(card, { opacity: 1, duration: 0.25, overwrite: true });
      });
      card.addEventListener("mouseleave", () => {
        gsap.to(cards, { opacity: 1, duration: 0.25, overwrite: true });
      });
    });
  });
}


// 6. VERTICAL TIMELINE 
function initVerticalTimeline() {
  const events = gsap.utils.toArray(".timeline-event");
  const activeYearEl = document.getElementById("active-year");
  if (!events.length || !activeYearEl) return;

  events.forEach((event, i) => {
    ScrollTrigger.create({
      trigger: event,
      start: "top 60%", // Activate when event crosses this upper-middle threshold
      end: "bottom 60%",
      onEnter: () => activateEvent(event),
      onEnterBack: () => activateEvent(event),
    });
  });

  function activateEvent(el) {
    events.forEach(e => e.classList.remove("is-active"));
    el.classList.add("is-active");

    const year = el.dataset.year;
    if (activeYearEl.innerText !== year) {
      // Smooth crossfade for massive year text
      gsap.to(activeYearEl, {
        opacity: 0,
        duration: 0.2,
        onComplete: () => {
          activeYearEl.innerText = year;
          gsap.to(activeYearEl, { opacity: 0.7, duration: 0.1 });
        }
      });
    }
  }

  if (events[0]) activateEvent(events[0]);
}

// 7. WIPER
function initWiper() {
  const overlay = document.querySelector(".wiper-overlay");
  if (!overlay) return;
  gsap.fromTo(overlay, { rotate: 0 }, {
    rotate: -110, ease: "power2.inOut",
    scrollTrigger: { trigger: "#brand", start: "top bottom", end: "top 10%", scrub: 1.5 }
  });
}


// 7. SCROLL REVEALS
function initScrollReveals() {
  gsap.to(".scroll-progress", {
    width: "100%", ease: "none",
    scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: true }
  });

  gsap.utils.toArray(".panel:not(.horizontal-panel)").forEach(panel => {
    if (panel.classList.contains("light")) {
      ScrollTrigger.create({
        trigger: panel, start: "top 50%", end: "bottom 50%",
        onEnter: () => document.body.classList.add("light-mode"),
        onLeave: () => document.body.classList.remove("light-mode"),
        onEnterBack: () => document.body.classList.add("light-mode"),
        onLeaveBack: () => document.body.classList.remove("light-mode"),
      });
    }

    const els = panel.querySelectorAll(".animate-text");
    if (els.length) {
      gsap.from(els, {
        y: 45, opacity: 0, stagger: 0.09, duration: 0.95, ease: "power2.out",
        scrollTrigger: { trigger: panel, start: "top 75%", toggleActions: "play none none reverse" }
      });
    }
  });

  gsap.to(".leaf-shape", {
    y: -28, rotation: 14, duration: 3.8,
    repeat: -1, yoyo: true, ease: "sine.inOut", stagger: 0.5
  });
}


// 8. NAVIGATION - index - company page
// Named transition (company-hero) is assigned
// to exactly ONE card at click time, ensuring
// no duplicate view-transition-name conflicts.
function initNavigation() {
  const supportsVT = typeof document.startViewTransition === "function";
  const allCards = document.querySelectorAll(".group-card");

  allCards.forEach(card => {
    card.addEventListener("click", e => {
      e.preventDefault();
      const href = card.getAttribute("data-href");
      if (!href) return;

      if (!supportsVT) {
        window.location.href = href;
        return;
      }

      // Clear name from all cards, assign only to clicked one
      allCards.forEach(c => { c.style.viewTransitionName = ""; });
      card.style.viewTransitionName = "company-hero";

      // Use startViewTransition to properly handle the view transition
      document.startViewTransition(() => {
        window.location.href = href;
      });
    });
  });
}


// 9. MEGA LIST EXPANDER
function initMegaList() {
  const container = document.querySelector(".mega-list-container");
  const fade = document.querySelector(".mega-list-fade");
  if (!container || !fade) return;

  fade.addEventListener("click", () => {
    container.classList.add("is-expanded");
    // Refresh ScrollTrigger so pinned sections know about the new document height
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 1200);
  });
}


// 10. FULLSCREEN NAVIGATION MENU
function initNavigationMenu() {
  const menuBtn = document.querySelector(".menu-btn");
  const fullscreenNav = document.querySelector(".fullscreen-nav");
  const navCircle = document.querySelector(".nav-circle");
  const navContent = document.querySelector(".nav-content");
  const navSectionTag = document.querySelector(".nav-section-tag");
  const navLinkItems = document.querySelectorAll(".nav-link-item");
  const navLinks = document.querySelectorAll(".nav-link");
  const navSocials = document.querySelector(".nav-socials");
  const navSocialLinks = document.querySelectorAll(".nav-social-link");

  let isOpen = false;
  let animTimeline = null;

  if (!menuBtn || !fullscreenNav) return;

  // Add close text to menu button
  let closeText = menuBtn.querySelector(".menu-btn-close");
  if (!closeText) {
    closeText = document.createElement("span");
    closeText.className = "menu-btn-close";
    closeText.textContent = "Close";
    menuBtn.appendChild(closeText);
  }

  function openMenu() {
    if (isOpen) return;
    isOpen = true;

    // Add active state to menu button (shows "Close" text)
    menuBtn.classList.add("is-active");

    // Enable pointer events on overlay
    fullscreenNav.classList.add("is-open");

    // Lock body scroll
    document.body.classList.add("no-scroll");

    // Calculate the diagonal distance to ensure circle covers entire screen
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const maxRadius = Math.sqrt(viewportWidth * viewportWidth + viewportHeight * viewportHeight);

    // Create animation timeline
    animTimeline = gsap.timeline({ defaults: { ease: "power3.inOut" } });

    // Phase 1: Circle expands from button position
    animTimeline.to(navCircle, {
      scale: maxRadius / 24,
      duration: 0.6,
      ease: "power2.inOut"
    });

    // Phase 2: Content fades in
    animTimeline.to(navContent, {
      opacity: 1,
      duration: 0.3
    }, "-=0.15");

    // Phase 3: Section tag appears
    animTimeline.to(navSectionTag, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: "power2.out"
    }, "-=0.1");

    // Phase 4: Links stagger in
    animTimeline.to(navLinkItems, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.08,
      ease: "power3.out"
    }, "-=0.2");

    // Phase 5: Socials fade in
    animTimeline.to(navSocials, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: "power2.out"
    }, "-=0.15");
  }

  function closeMenu() {
    if (!isOpen) return;
    isOpen = false;

    // Remove active state (shows "Menu" text again)
    menuBtn.classList.remove("is-active");

    // Create reverse animation
    const closeTl = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      onComplete: () => {
        fullscreenNav.classList.remove("is-open");
        document.body.classList.remove("no-scroll");
        gsap.set(navContent, { opacity: 0 });
        gsap.set(navSectionTag, { opacity: 0, y: 20 });
        gsap.set(navLinkItems, { opacity: 0, y: 60 });
        gsap.set(navSocials, { opacity: 0, y: 20 });
        gsap.set(navCircle, { scale: 0 });
      }
    });

    // Phase 1: Socials fade out
    closeTl.to(navSocials, {
      opacity: 0,
      y: 20,
      duration: 0.25
    });

    // Phase 2: Links stagger out
    closeTl.to(navLinkItems, {
      opacity: 0,
      y: 60,
      duration: 0.3,
      stagger: 0.04,
      ease: "power2.in"
    }, "-=0.1");

    // Phase 3: Section tag fades out
    closeTl.to(navSectionTag, {
      opacity: 0,
      y: 20,
      duration: 0.25
    }, "-=0.15");

    // Phase 4: Content fades out
    closeTl.to(navContent, {
      opacity: 0,
      duration: 0.2
    }, "-=0.1");

    // Phase 5: Circle shrinks back
    closeTl.to(navCircle, {
      scale: 0,
      duration: 0.5,
      ease: "power2.inOut"
    }, "-=0.05");
  }

  // Event listeners
  menuBtn.addEventListener("click", () => {
    if (isOpen) closeMenu();
    else openMenu();
  });

  // Handle link clicks
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const sectionId = link.getAttribute("data-section");
      const targetSection = document.getElementById(sectionId);

      // Close menu first
      closeMenu();

      // Scroll to section after menu closes
      setTimeout(() => {
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 600);
    });
  });

  // ESC key to close
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) {
      closeMenu();
    }
  });

  // Add nav elements to cursor hover targets
  const cursorTargets = [menuBtn, ...navLinks, ...navSocialLinks];
  cursorTargets.forEach(el => {
    if (el) {
      el.addEventListener("mouseenter", () => {
        const trail = document.querySelector(".cursor-trail");
        if (trail) gsap.to(trail, { scale: 3, rotation: 135, duration: 0.25 });
      });
      el.addEventListener("mouseleave", () => {
        const trail = document.querySelector(".cursor-trail");
        if (trail) gsap.to(trail, { scale: 1, rotation: 45, duration: 0.25 });
      });
    }
  });
}


// INIT
window.addEventListener("DOMContentLoaded", () => {
  initLoader();
  initCursor();
  initBackground();
  initHorizontal();
  initVerticalTimeline();
  initWiper();
  initScrollReveals();
  initNavigation();
  initMegaList();
  initNavigationMenu();
});
