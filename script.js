gsap.registerPlugin(ScrollTrigger);

// ÄÄÄ CONFIG ÄÄÄ
const BG_IMAGES = [
  "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1920",
  "https://images.unsplash.com/photo-1466611653911-95282fc365d5?auto=format&fit=crop&q=80&w=1920",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1920",
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1920"
];

function preloadImages(urls) {
  urls.forEach(url => {
    const img = new Image();
    img.src = url;
  });
}
preloadImages(BG_IMAGES);

// ÄÄÄ LOADER ÄÄÄ
// Uses sessionStorage so the intro animation only plays ONCE per browser session.
// Navigating back from a company sub-page skips the loader entirely.
function initLoader() {
  const hasLoaded = sessionStorage.getItem('filpride_loaded');

  if (hasLoaded) {
    // ÄÄ SKIP: instant reveal for return visits ÄÄ
    const loader = document.querySelector(".loader-wrapper");
    const leftPanel = document.querySelector(".curtain-panel.left");
    const rightPanel = document.querySelector(".curtain-panel.right");

    if (loader) loader.style.display = "none";
    if (leftPanel) leftPanel.style.transform = "translateX(-100%)";
    if (rightPanel) rightPanel.style.transform = "translateX(100%)";

    document.body.classList.remove("no-scroll");

    // Still animate hero text in smoothly
    gsap.from(".hero-title .line", {
      y: 60, opacity: 0, stagger: 0.12, duration: 1, ease: "power3.out", delay: 0.1
    });
    gsap.from(".hero-eyebrow, .hero-subtitle, .scroll-indicator, .glass-nav", {
      opacity: 0, y: 15, stagger: 0.08, duration: 0.7, delay: 0.3
    });
    return;
  }

  // ÄÄ FIRST VISIT: full cinematic loader ÄÄ
  sessionStorage.setItem('filpride_loaded', 'true');

  window.scrollTo(0, 0);
  const tl = gsap.timeline();
  let count = { val: 0 };

  tl.to(count, {
    val: 100,
    duration: 2.5,
    ease: "power2.inOut",
    onUpdate: () => {
      document.querySelector(".loader-num").textContent =
        Math.floor(count.val).toString().padStart(2, '0');
      document.querySelector(".loader-bar-inner").style.width = `${count.val}%`;
    }
  });

  tl.to(".loader-wrapper", {
    opacity: 0,
    duration: 0.6,
    onComplete: () => {
      document.querySelector(".loader-wrapper").style.display = "none";
      document.body.classList.remove("no-scroll");
    }
  });

  tl.fromTo(".r1", { y: -800, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)" }, "-=0.2");
  tl.fromTo(".r2", { y: 800, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)" }, "-=0.6");
  tl.fromTo(".r3", { x: -800, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)" }, "-=0.6");
  tl.fromTo(".r4", { x: 800, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)" }, "-=0.6");
  tl.to(".rhombus-core", { scale: 1, opacity: 1, duration: 0.4 }, "-=0.2");

  tl.to(".rhombus", {
    x: (i) => (i % 2 ? 1500 : -1500),
    y: (i) => (i < 2 ? -1000 : 1000),
    rotation: 180, opacity: 0, duration: 1, ease: "power4.in"
  }, "+=0.2");
  tl.to(".rhombus-core", { scale: 8, opacity: 0, duration: 0.8, ease: "power4.in" }, "-=1");
  tl.to(".curtain-panel.left", { xPercent: -100, duration: 1.2, ease: "expo.inOut" }, "-=0.8");
  tl.to(".curtain-panel.right", { xPercent: 100, duration: 1.2, ease: "expo.inOut" }, "-=1.2");

  tl.from(".hero-title .line", {
    y: 80, opacity: 0, stagger: 0.15, duration: 1.2, ease: "power4.out"
  }, "-=0.6");
  tl.from(".hero-eyebrow, .hero-subtitle, .scroll-indicator, .glass-nav", {
    opacity: 0, y: 20, stagger: 0.1, duration: 0.8
  }, "-=0.4");
}

// ÄÄÄ CURSOR ÄÄÄ
function initCursor() {
  const trail = document.querySelector(".cursor-trail");
  if (!trail) return;

  const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const mouse = { x: pos.x, y: pos.y };
  const speed = 0.15;

  const xSet = gsap.quickSetter(trail, "x", "px");
  const ySet = gsap.quickSetter(trail, "y", "px");

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    gsap.to(trail, { opacity: 1, duration: 0.5 });
  });

  gsap.ticker.add(() => {
    const dt = 1.0 - Math.pow(1.0 - speed, gsap.ticker.deltaRatio());
    pos.x += (mouse.x - pos.x) * dt;
    pos.y += (mouse.y - pos.y) * dt;
    xSet(pos.x);
    ySet(pos.y);
  });

  const triggers = document.querySelectorAll(".bg-trigger, a, .cta-link, .loc-card, .milestone-card, .group-card");
  triggers.forEach(el => {
    el.addEventListener("mouseenter", () => gsap.to(trail, { scale: 3, rotation: 135, duration: 0.3 }));
    el.addEventListener("mouseleave", () => gsap.to(trail, { scale: 1, rotation: 45, duration: 0.3 }));
  });
}

// ÄÄÄ BACKGROUND HOVER & SLIDESHOW ÄÄÄ
function initBackground() {
  const s1 = document.querySelector(".s1");
  const s2 = document.querySelector(".s2");
  const wrapper = document.querySelector(".bg-wrapper");
  let currentIndex = 0;
  let isSlideshowSection = false;
  let isHovering = false;
  let interval;

  const setBg = (url, duration = 1.5) => {
    const active = document.querySelector(".bg-slide.active");
    const next = active === s1 ? s2 : s1;
    const img = new Image();
    img.src = url;
    img.onload = () => {
      next.style.backgroundImage = `url('${url}')`;
      gsap.to(wrapper, { opacity: 1, duration });
      next.classList.add("active");
      if (active) active.classList.remove("active");
    };
  };

  const nextSlide = () => {
    if (!isSlideshowSection || isHovering) return;
    currentIndex = (currentIndex + 1) % BG_IMAGES.length;
    setBg(BG_IMAGES[currentIndex]);
  };

  setBg(BG_IMAGES[0]);

  const setupSectionBackground = (trigger, slideshow, image = null) => {
    ScrollTrigger.create({
      trigger,
      start: "top center",
      end: "bottom center",
      onEnter: () => {
        isSlideshowSection = slideshow;
        clearInterval(interval);
        if (slideshow) {
          gsap.to(wrapper, { opacity: 1, duration: 1.5 });
          interval = setInterval(nextSlide, 6000);
        } else {
          if (!isHovering) gsap.to(wrapper, { opacity: 0, duration: 1.5 });
        }
        if (image && !slideshow) setBg(image);
      },
      onLeave: () => {
        if (!slideshow && !isHovering) gsap.to(wrapper, { opacity: 0, duration: 1.5 });
      },
      onEnterBack: () => {
        isSlideshowSection = slideshow;
        clearInterval(interval);
        if (slideshow) {
          gsap.to(wrapper, { opacity: 1, duration: 1.5 });
          interval = setInterval(nextSlide, 6000);
        } else {
          if (!isHovering) gsap.to(wrapper, { opacity: 0, duration: 1.5 });
        }
        if (image && !slideshow) setBg(image);
      },
      onLeaveBack: () => {
        if (!slideshow && !isHovering) gsap.to(wrapper, { opacity: 0, duration: 1.5 });
      }
    });
  };

  setupSectionBackground("#hero", true);
  setupSectionBackground("#about", false);
  setupSectionBackground("#group", false);
  setupSectionBackground("#brand", false);
  setupSectionBackground("#history", false);
  setupSectionBackground("#green", true,
    "https://images.unsplash.com/photo-1466611653911-95282fc365d5?auto=format&fit=crop&q=80&w=1920"
  );
  setupSectionBackground("#contact", true);

  ScrollTrigger.create({
    trigger: "#history",
    start: "top 50%", end: "bottom 50%",
    onEnter: () => document.body.classList.add("light-mode"),
    onLeave: () => document.body.classList.remove("light-mode"),
    onEnterBack: () => document.body.classList.add("light-mode"),
    onLeaveBack: () => document.body.classList.remove("light-mode"),
  });

  document.querySelectorAll(".bg-trigger").forEach(el => {
    el.addEventListener("mouseenter", () => {
      isHovering = true;
      setBg(el.getAttribute("data-bg"));
    });
    el.addEventListener("mouseleave", () => {
      isHovering = false;
      if (!isSlideshowSection) gsap.to(wrapper, { opacity: 0, duration: 1.5 });
    });
  });
}

// ÄÄÄ HORIZONTAL SCROLL ÄÄÄ
function initHorizontal() {
  document.querySelectorAll(".horizontal-panel").forEach(section => {
    const wrapper = section.querySelector(".horizontal-wrapper");
    const scrollWidth = wrapper.scrollWidth - window.innerWidth + window.innerWidth * 0.1;

    gsap.to(wrapper, {
      x: -scrollWidth,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        pin: true,
        scrub: 1,
        end: () => "+=" + scrollWidth,
        invalidateOnRefresh: true
      }
    });

    const cards = section.querySelectorAll(".group-card");
    cards.forEach(card => {
      card.addEventListener("mouseenter", () => {
        gsap.to(cards, { opacity: 0.4, duration: 0.3 });
        gsap.to(card, { opacity: 1, duration: 0.3 });
      });
      card.addEventListener("mouseleave", () => {
        gsap.to(cards, { opacity: 1, duration: 0.3 });
      });
    });
  });
}

// ÄÄÄ CIRCULAR WIPER REVEAL ÄÄÄ
function initWiper() {
  gsap.fromTo(".wiper-overlay",
    { rotate: 0 },
    {
      rotate: -120,
      ease: "power2.inOut",
      scrollTrigger: {
        trigger: "#brand",
        start: "top bottom",
        end: "top 10%",
        scrub: 1.5
      }
    }
  );
}

// ÄÄÄ SCROLL REVEALS ÄÄÄ
function initScroll() {
  gsap.to(".scroll-progress", {
    width: "100%",
    ease: "none",
    scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: true }
  });

  const panels = gsap.utils.toArray(".panel:not(.horizontal-panel)");
  panels.forEach((panel) => {
    if (panel.classList.contains("light")) {
      ScrollTrigger.create({
        trigger: panel,
        start: "top 50%", end: "bottom 50%",
        onEnter: () => document.body.classList.add("light-mode"),
        onLeave: () => document.body.classList.remove("light-mode"),
        onEnterBack: () => document.body.classList.add("light-mode"),
        onLeaveBack: () => document.body.classList.remove("light-mode"),
      });
    }

    const animText = panel.querySelectorAll(".animate-text");
    if (animText.length) {
      gsap.from(animText, {
        scrollTrigger: { trigger: panel, start: "top 75%", toggleActions: "play none none reverse" },
        y: 50, opacity: 0, stagger: 0.1, duration: 1, ease: "power2.out"
      });
    }
  });

  gsap.to(".leaf-shape", {
    y: -30, rotation: 15, duration: 4,
    repeat: -1, yoyo: true, ease: "sine.inOut", stagger: 0.5
  });
}

// ÄÄÄ VIEW TRANSITION API - COMPANY CARD NAVIGATION ÄÄÄ
// Each .group-card with a data-href navigates to a company sub-page.
// If the browser supports View Transitions, the card morphs into the new page.
// Falls back to a standard navigation if not supported.
function initCompanyNavigation() {
  document.querySelectorAll(".group-card[data-href]").forEach(card => {
    card.addEventListener("click", (e) => {
      e.preventDefault();
      const href = card.getAttribute("data-href");
      const company = card.getAttribute("data-company");

      // Give this specific card a named view-transition so it morphs into the page hero
      card.style.viewTransitionName = "company-hero";

      if (!document.startViewTransition) {
        // Fallback: no View Transition support
        window.location.href = href;
        return;
      }

      // Forward transition: card expands into new page
      const transition = document.startViewTransition(() => {
        window.location.href = href;
      });

      // Clean up the name after the transition is captured
      transition.ready.catch(() => {
        card.style.viewTransitionName = "";
      });
    });
  });
}

// ÄÄÄ INIT ÄÄÄ
window.addEventListener("DOMContentLoaded", () => {
  initLoader();
  initCursor();
  initBackground();
  initHorizontal();
  initWiper();
  initScroll();
  initCompanyNavigation();
});
