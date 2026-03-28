gsap.registerPlugin(ScrollTrigger);

// ─── CONFIG ───
const BG_IMAGES = [
  "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1920", // General energy
  "https://images.unsplash.com/photo-1466611653911-95282fc365d5?auto=format&fit=crop&q=80&w=1920", // Green energy
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1920", // Industry
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1920" // Fuel station
];

function preloadImages(urls) {
  urls.forEach(url => {
    const img = new Image();
    img.src = url;
  });
}
preloadImages(BG_IMAGES);

// ─── LOADER ───
function initLoader() {
  window.scrollTo(0, 0);
  const tl = gsap.timeline();
  let count = { val: 0 };

  tl.to(count, {
    val: 100,
    duration: 2.5,
    ease: "power2.inOut",
    onUpdate: () => {
      document.querySelector(".loader-num").textContent = Math.floor(count.val).toString().padStart(2, '0');
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

  tl.to(".rhombus", { x: (i) => (i % 2 ? 1500 : -1500), y: (i) => (i < 2 ? -1000 : 1000), rotation: 180, opacity: 0, duration: 1, ease: "power4.in" }, "+=0.2");
  tl.to(".rhombus-core", { scale: 8, opacity: 0, duration: 0.8, ease: "power4.in" }, "-=1");
  tl.to(".curtain-panel.left", { xPercent: -100, duration: 1.2, ease: "expo.inOut" }, "-=0.8");
  tl.to(".curtain-panel.right", { xPercent: 100, duration: 1.2, ease: "expo.inOut" }, "-=1.2");

  tl.from(".hero-title .line", { y: 80, opacity: 0, stagger: 0.15, duration: 1.2, ease: "power4.out" }, "-=0.6");
  tl.from(".hero-eyebrow, .hero-subtitle, .scroll-indicator, .glass-nav", { opacity: 0, y: 20, stagger: 0.1, duration: 0.8 }, "-=0.4");
}

// ─── CURSOR ───
function initCursor() {
  const trail = document.querySelector(".cursor-trail");
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

  const triggers = document.querySelectorAll(".bg-trigger, a, .cta-link, .loc-card, .milestone-card");
  triggers.forEach(el => {
    el.addEventListener("mouseenter", () => gsap.to(trail, { scale: 3, rotation: 135, duration: 0.3 }));
    el.addEventListener("mouseleave", () => gsap.to(trail, { scale: 1, rotation: 45, duration: 0.3 }));
  });
}

// ─── BACKGROUND HOVER & SLIDESHOW ───
function initBackground() {
  const s1 = document.querySelector(".s1");
  const s2 = document.querySelector(".s2");
  const wrapper = document.querySelector(".bg-wrapper");
  let currentIndex = 0;
  let isSlideshowSection = false; // Initial state for wrapper opacity
  let isHovering = false;
  let interval;

  const setBg = (url, duration = 1.5) => {
    const active = document.querySelector(".bg-slide.active");
    const next = active === s1 ? s2 : s1;
    const img = new Image();
    img.src = url;
    img.onload = () => {
      next.style.backgroundImage = `url('${url}')`;
      gsap.to(wrapper, { opacity: 1, duration: duration });
      next.classList.add("active");
      if (active) active.classList.remove("active");
    };
  };

  const nextSlide = () => {
    if (!isSlideshowSection || isHovering) return;
    currentIndex = (currentIndex + 1) % BG_IMAGES.length;
    setBg(BG_IMAGES[currentIndex]);
  };

  // Set initial background for Hero section
  setBg(BG_IMAGES[0]);

  // Section Tracking for Slideshow/Hover behavior
  const setupSectionBackground = (trigger, slideshow, image = null) => {
    ScrollTrigger.create({
      trigger: trigger,
      start: "top center",
      end: "bottom center",
      onEnter: () => {
        isSlideshowSection = slideshow;
        clearInterval(interval); // Clear any existing interval

        if (slideshow) {
          gsap.to(wrapper, { opacity: 1, duration: 1.5 });
          interval = setInterval(nextSlide, 6000);
        } else {
          // For non-slideshow sections, if no specific hover bg, turn off wrapper
          if (!isHovering) {
            gsap.to(wrapper, { opacity: 0, duration: 1.5 });
          }
        }

        if (image && !slideshow) { // Set specific image for non-slideshow sections if provided
          setBg(image);
        }
      },
      onLeave: () => {
        if (!slideshow && !isHovering) {
          gsap.to(wrapper, { opacity: 0, duration: 1.5 });
        }
      },
      onEnterBack: () => {
        isSlideshowSection = slideshow;
        clearInterval(interval);
        if (slideshow) {
          gsap.to(wrapper, { opacity: 1, duration: 1.5 });
          interval = setInterval(nextSlide, 6000);
        } else {
          if (!isHovering) {
            gsap.to(wrapper, { opacity: 0, duration: 1.5 });
          }
        }
        if (image && !slideshow) {
          setBg(image);
        }
      },
      onLeaveBack: () => {
        if (!slideshow && !isHovering) {
          gsap.to(wrapper, { opacity: 0, duration: 1.5 });
        }
      }
    });
  };

  // Configure sections: (trigger, isSlideshow, specificImageForNonSlideshow)
  setupSectionBackground("#hero", true);
  setupSectionBackground("#about", false);
  setupSectionBackground("#group", false);
  setupSectionBackground("#brand", false);
  setupSectionBackground("#history", false);
  setupSectionBackground("#green", true, "https://images.unsplash.com/photo-1466611653911-95282fc365d5?auto=format&fit=crop&q=80&w=1920"); // Green Energy with specific bg
  setupSectionBackground("#contact", true);

  // History section light/dark mode toggle
  ScrollTrigger.create({
    trigger: "#history",
    start: "top 50%",
    end: "bottom 50%",
    onEnter: () => document.body.classList.add('light-mode'),
    onLeave: () => document.body.classList.remove('light-mode'),
    onEnterBack: () => document.body.classList.add('light-mode'),
    onLeaveBack: () => document.body.classList.remove('light-mode'),
  });

  // Hover Triggers for general elements
  document.querySelectorAll(".bg-trigger").forEach(el => {
    el.addEventListener("mouseenter", () => {
      isHovering = true;
      setBg(el.getAttribute("data-bg"));
    });
    el.addEventListener("mouseleave", () => {
      isHovering = false;
      // If not in a slideshow section, fade out global background
      if (!isSlideshowSection) gsap.to(wrapper, { opacity: 0, duration: 1.5 });
    });
  });
}

// ─── HORIZONTAL SCROLL ───
function initHorizontal() {
  const horizontalSections = document.querySelectorAll(".horizontal-panel");

  horizontalSections.forEach(section => {
    const wrapper = section.querySelector(".horizontal-wrapper");
    const scrollWidth = wrapper.scrollWidth - window.innerWidth + window.innerWidth * 0.1; // Add some buffer

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

    // Reduce opacity of non-hovered group cards
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

// ─── CIRCULAR WIPER REVEAL ───
function initWiper() {
  gsap.fromTo(".wiper-overlay",
    { rotate: 0 }, // Starts fully covering
    {
      rotate: -120, // Wipes to -120 degrees
      ease: "power2.inOut",
      scrollTrigger: {
        trigger: "#brand",
        start: "top bottom",
        end: "top 10%",
        scrub: 1.5,
        // onUpdate: self => console.log("Wiper progress: ", self.progress) // Debugging
      }
    }
  );
}

// ─── SCROLL REVEALS ───
function initScroll() {
  const panels = gsap.utils.toArray(".panel:not(.horizontal-panel)");

  panels.forEach((panel) => {
    gsap.to(".scroll-progress", {
      width: "100%",
      ease: "none",
      scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: true }
    });

    if (panel.classList.contains('light')) {
      ScrollTrigger.create({
        trigger: panel,
        start: "top 50%",
        end: "bottom 50%",
        onEnter: () => document.body.classList.add('light-mode'),
        onLeave: () => document.body.classList.remove('light-mode'),
        onEnterBack: () => document.body.classList.add('light-mode'),
        onLeaveBack: () => document.body.classList.remove('light-mode'),
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

  gsap.to(".leaf-shape", { y: -30, rotation: 15, duration: 4, repeat: -1, yoyo: true, ease: "sine.inOut", stagger: 0.5 });
}

// ─── INIT ───
window.addEventListener("DOMContentLoaded", () => {
  initLoader();
  initCursor();
  initBackground();
  initHorizontal();
  initWiper();
  initScroll();
});
