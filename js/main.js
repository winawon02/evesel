(() => {
  "use strict";

  const header = document.getElementById("header");
  const toggle = document.querySelector(".menu-toggle");
  const drawer = document.getElementById("mobile-menu");
  const marquee = document.getElementById("marquee-track");
  const languageButtons = document.querySelectorAll("[data-lang]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let menuOpen = false;

  function syncHeader() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 40);
  }

  function setMenu(open, restoreFocus = false) {
    if (!header || !drawer || !toggle) return;
    menuOpen = open;
    header.classList.toggle("open", open);
    drawer.classList.toggle("visible", open);
    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
    drawer.setAttribute("aria-hidden", String(!open));
    if ("inert" in drawer) drawer.inert = !open;
    if (open) {
      const first = drawer.querySelector("a");
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
        const items = [toggle, ...drawer.querySelectorAll("a")];
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

  // Duplicate one complete product set for a gapless 42-second CSS marquee.
  if (marquee && marquee.firstElementChild) {
    const copy = marquee.firstElementChild.cloneNode(true);
    copy.setAttribute("aria-hidden", "true");
    copy.querySelectorAll("img").forEach(img => { img.alt = ""; });
    marquee.appendChild(copy);
  }

  if ("IntersectionObserver" in window && !reducedMotion.matches) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("shown");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.07, rootMargin: "0px 0px 60px 0px" });
    document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));
    document.documentElement.classList.add("js-ready");
  }

  window.addEventListener("scroll", syncHeader, { passive: true });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 1023 && menuOpen) setMenu(false);
  }, { passive: true });

  syncHeader();
})();