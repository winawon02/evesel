(() => {
  "use strict";

  const header = document.getElementById("header");
  const toggle = document.querySelector(".menu-toggle");
  const drawer = document.getElementById("mobile-menu");
  const marquee = document.getElementById("marquee-track");
  const languageButtons = document.querySelectorAll("[data-lang]");
  const desktopNav = document.querySelector(".desktop-nav");
  const submenuGroups = [...document.querySelectorAll(".desktop-nav .has-submenu")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let menuOpen = false;
  let activeSubmenu = null;

  function setDesktopSubmenu(group) {
    const next = window.innerWidth > 1023 ? group : null;
    activeSubmenu = next;
    submenuGroups.forEach(item => {
      const active = item === next;
      item.classList.toggle("is-open", active);
      item.querySelector(":scope > a")?.setAttribute("aria-expanded", String(active));
    });
    header?.classList.toggle("nav-active", Boolean(next));
  }

  function syncHeader() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 40);
  }

  function setMenu(open, restoreFocus = false) {
    if (!header || !drawer || !toggle) return;
    menuOpen = open;
    if (open) setDesktopSubmenu(null);
    header.classList.toggle("open", open);
    drawer.classList.toggle("visible", open);
    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
    drawer.setAttribute("aria-hidden", String(!open));
    if ("inert" in drawer) drawer.inert = !open;
    if (open) {
      const first = drawer.querySelector("summary, a");
      if (first) first.focus({ preventScroll: true });
    } else if (restoreFocus) {
      toggle.focus({ preventScroll: true });
    }
  }

  if (drawer && toggle) {
    if ("inert" in drawer) drawer.inert = true;
    toggle.addEventListener("click", () => setMenu(!menuOpen));

    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && menuOpen) {
        event.preventDefault();
        setMenu(false, true);
      }
      if (event.key === "Tab" && menuOpen) {
        const items = [toggle, ...drawer.querySelectorAll("summary, details[open] a")];
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    document.addEventListener("click", event => {
      if (menuOpen && !drawer.contains(event.target) && !header.contains(event.target)) setMenu(false);
    });
  }

  if (drawer) {
    drawer.querySelectorAll(".mobile-nav-group").forEach(group => {
      group.addEventListener("toggle", () => {
        if (group.open) drawer.querySelectorAll(".mobile-nav-group").forEach(other => {
          if (other !== group) other.open = false;
        });
      });
    });
  }

  if (desktopNav && submenuGroups.length) {
    submenuGroups.forEach(group => {
      group.addEventListener("pointerenter", event => {
        if (event.pointerType !== "touch") setDesktopSubmenu(group);
      });
      group.addEventListener("pointerleave", event => {
        if (event.pointerType !== "touch" && activeSubmenu === group) setDesktopSubmenu(null);
      });
      group.addEventListener("focusin", () => setDesktopSubmenu(group));
      group.addEventListener("focusout", () => {
        requestAnimationFrame(() => {
          if (activeSubmenu === group && !group.contains(document.activeElement)) setDesktopSubmenu(null);
        });
      });
    });
    desktopNav.addEventListener("click", event => {
      if (event.target.closest("a")) setDesktopSubmenu(null);
    });
    document.addEventListener("keydown", event => {
      if (event.key !== "Escape" || !activeSubmenu) return;
      event.preventDefault();
      activeSubmenu.querySelector(":scope > a")?.focus({ preventScroll: true });
      setDesktopSubmenu(null);
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", event => {
      const id = link.getAttribute("href").slice(1);
      const section = document.getElementById(id);
      if (!section) return;
      event.preventDefault();
      if (menuOpen) setMenu(false);
      section.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "start" });
      if (history.replaceState) history.replaceState(null, "", "#" + id);
    });
  });

  function setLanguage(lang) {
    if (lang !== "ko" && lang !== "en") return;
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-ko][data-en]").forEach(el => {
      const content = el.getAttribute("data-" + lang);
      if (content !== null) el.innerHTML = content;
    });
    languageButtons.forEach(button => {
      const selected = button.dataset.lang === lang;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  }

  languageButtons.forEach(button => {
    button.addEventListener("click", () => setLanguage(button.dataset.lang));
  });

  // Duplicate the complete product set for a seamless CSS marquee.
  if (marquee && marquee.firstElementChild) {
    const copy = marquee.firstElementChild.cloneNode(true);
    copy.setAttribute("aria-hidden", "true");
    copy.querySelectorAll("img").forEach(img => { img.alt = ""; });
    marquee.appendChild(copy);
  }

  // Section entrance effects are coordinated by experience.js using the viewport center band.
  // Header and footer remain static; do not start an early reveal observer here.

  window.addEventListener("scroll", syncHeader, { passive: true });
  window.addEventListener("resize", () => {
    setDesktopSubmenu(null);
    if (window.innerWidth > 1023 && menuOpen) setMenu(false);
  }, { passive: true });


  // Portfolio films: desktop plays on hover; responsive mobile cards loop while visible.
  // Sources stay lazy so offscreen cards do not download videos unnecessarily.
  const portfolioCards = [...document.querySelectorAll(".portfolio-card")];
  const hoverPointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const mobilePortfolio = window.matchMedia("(max-width: 1023px)");
  const saveData = Boolean(navigator.connection?.saveData);
  const visiblePortfolioCards = new Set();
  let activePortfolioVideo = null;

  const stopPortfolioVideo = (video, reset = false) => {
    if (!video) return;
    video.pause();
    video.closest(".portfolio-card")?.classList.remove("is-playing");
    if (reset) {
      try { video.currentTime = 0; } catch (_) { /* Media may not be seekable yet. */ }
    }
    if (activePortfolioVideo === video) activePortfolioVideo = null;
  };

  const startPortfolioVideo = (card, onMobile = false) => {
    if (reducedMotion.matches || saveData || document.hidden) return;
    if (onMobile ? !mobilePortfolio.matches : (!hoverPointer.matches || mobilePortfolio.matches)) return;
    const video = card.querySelector(".portfolio-video");
    if (!video) return;
    if (onMobile && !visiblePortfolioCards.has(card)) return;
    if (!onMobile && activePortfolioVideo && activePortfolioVideo !== video) {
      stopPortfolioVideo(activePortfolioVideo, true);
    }
    const source = video.querySelector("source[data-src]");
    if (source && !source.getAttribute("src")) {
      source.src = source.dataset.src;
      video.load();
    }
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    if (!onMobile) activePortfolioVideo = video;
    const playAttempt = video.play();
    playAttempt?.catch?.(() => stopPortfolioVideo(video));
  };

  const stopAllPortfolioVideos = () => {
    portfolioCards.forEach(card => stopPortfolioVideo(card.querySelector(".portfolio-video")));
  };

  const playVisibleMobileCards = () => {
    if (!mobilePortfolio.matches || document.hidden || reducedMotion.matches || saveData) return;
    visiblePortfolioCards.forEach(card => startPortfolioVideo(card, true));
  };

  portfolioCards.forEach(card => {
    const image = card.querySelector(".portfolio-poster");
    const posterUrl = image?.dataset.videoPoster;
    if (image && posterUrl) {
      const poster = new Image();
      poster.onload = () => { image.src = posterUrl; };
      poster.src = posterUrl;
    }

    const video = card.querySelector(".portfolio-video");
    if (!video) return;
    video.addEventListener("playing", () => {
      const mobileActive = mobilePortfolio.matches && visiblePortfolioCards.has(card);
      if ((mobileActive || activePortfolioVideo === video) && !document.hidden) {
        card.classList.add("is-playing");
      } else {
        stopPortfolioVideo(video);
      }
    });
    video.addEventListener("error", () => stopPortfolioVideo(video));
    video.addEventListener("pointerdown", event => event.preventDefault());
    card.addEventListener("pointerenter", event => {
      if (!mobilePortfolio.matches && (event.pointerType === "mouse" || event.pointerType === "pen")) {
        startPortfolioVideo(card);
      }
    });
    card.addEventListener("pointerleave", () => {
      if (!mobilePortfolio.matches) stopPortfolioVideo(video, true);
    });
    card.addEventListener("focusin", () => {
      if (!mobilePortfolio.matches) startPortfolioVideo(card);
    });
    card.addEventListener("focusout", () => {
      requestAnimationFrame(() => {
        if (!mobilePortfolio.matches && !card.contains(document.activeElement)) {
          stopPortfolioVideo(video, true);
        }
      });
    });
  });

  // Auto-play each visible card on mobile, with sound off and inline playback on iOS.
  if ("IntersectionObserver" in window) {
    const cardObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const card = entry.target;
        if (entry.isIntersecting) {
          visiblePortfolioCards.add(card);
          if (mobilePortfolio.matches) startPortfolioVideo(card, true);
        } else {
          visiblePortfolioCards.delete(card);
          stopPortfolioVideo(card.querySelector(".portfolio-video"));
        }
      });
    }, { threshold: 0.01 });
    portfolioCards.forEach(card => cardObserver.observe(card));
  } else {
    const checkVisibleCards = () => {
      if (!mobilePortfolio.matches) return;
      portfolioCards.forEach(card => {
        const box = card.getBoundingClientRect();
        const visible = box.bottom > 0 && box.top < window.innerHeight;
        if (visible) {
          visiblePortfolioCards.add(card);
          startPortfolioVideo(card, true);
        } else {
          visiblePortfolioCards.delete(card);
          stopPortfolioVideo(card.querySelector(".portfolio-video"));
        }
      });
    };
    window.addEventListener("scroll", checkVisibleCards, { passive: true });
    window.addEventListener("resize", checkVisibleCards, { passive: true });
    checkVisibleCards();
  }

  // Restore mobile playback when returning to the page or switching breakpoints.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAllPortfolioVideos();
    else playVisibleMobileCards();
  });
  reducedMotion.addEventListener?.("change", () => {
    if (reducedMotion.matches) stopAllPortfolioVideos();
    else playVisibleMobileCards();
  });
  mobilePortfolio.addEventListener?.("change", () => {
    stopAllPortfolioVideos();
    playVisibleMobileCards();
  });

  syncHeader();
})();