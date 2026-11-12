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


  // Main portfolio: show an extracted poster at rest and play only on desktop hover.
  // Lazy source assignment avoids downloading four films during initial page load.
  const portfolioCards = [...document.querySelectorAll(".portfolio-card")];
  const hoverPointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const saveData = Boolean(navigator.connection?.saveData);
  let activePortfolioVideo = null;

  const stopPortfolioVideo = video => {
    if (!video) return;
    video.pause();
    video.closest(".portfolio-card")?.classList.remove("is-playing");
    try { video.currentTime = 0; } catch (_) { /* Not seekable before metadata. */ }
    if (activePortfolioVideo === video) activePortfolioVideo = null;
  };

  const startPortfolioVideo = card => {
    if (!hoverPointer.matches || reducedMotion.matches || saveData || document.hidden) return;
    const video = card.querySelector(".portfolio-video");
    if (!video) return;
    if (activePortfolioVideo && activePortfolioVideo !== video) stopPortfolioVideo(activePortfolioVideo);
    const source = video.querySelector("source[data-src]");
    if (source && !source.src) {
      source.src = source.dataset.src;
      video.load();
    }
    activePortfolioVideo = video;
    const playAttempt = video.play();
    playAttempt?.catch?.(() => stopPortfolioVideo(video));
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
      if (activePortfolioVideo === video) card.classList.add("is-playing");
      else video.pause();
    });
    video.addEventListener("error", () => stopPortfolioVideo(video));
    video.addEventListener("pointerdown", event => event.preventDefault());
    card.addEventListener("pointerenter", event => {
      if (event.pointerType === "mouse" || event.pointerType === "pen") startPortfolioVideo(card);
    });
    card.addEventListener("pointerleave", () => stopPortfolioVideo(video));
    card.addEventListener("focusin", () => startPortfolioVideo(card));
    card.addEventListener("focusout", () => {
      requestAnimationFrame(() => {
        if (!card.contains(document.activeElement)) stopPortfolioVideo(video);
      });
    });
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopPortfolioVideo(activePortfolioVideo);
  });
  reducedMotion.addEventListener?.("change", () => {
    if (reducedMotion.matches) stopPortfolioVideo(activePortfolioVideo);
  });
  if ("IntersectionObserver" in window) {
    const cardObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) stopPortfolioVideo(entry.target.querySelector(".portfolio-video"));
      }
    }, { threshold: 0.01 });
    portfolioCards.forEach(card => cardObserver.observe(card));
  }

  syncHeader();
})();