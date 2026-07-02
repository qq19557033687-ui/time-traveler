// ============================================
// 时间旅人 — 交互脚本
// ============================================

document.addEventListener("DOMContentLoaded", () => {

  // ---- Reading progress bar ----
  const progressBar = document.querySelector(".progress-bar");
  if (progressBar) {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = pct + "%";
    };
    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
  }

  // ---- Header shrink on scroll ----
  const header = document.querySelector(".site-header");
  if (header) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 40) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    }, { passive: true });
  }

  // ---- Mobile nav toggle ----
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      navToggle.classList.toggle("open");
      navLinks.classList.toggle("open");
    });
    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navToggle.classList.remove("open");
        navLinks.classList.remove("open");
      });
    });
  }

  // ---- Fade-in on scroll ----
  const fadeElements = document.querySelectorAll(".fade-in");
  if (fadeElements.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

    fadeElements.forEach(el => observer.observe(el));
  }

  // ---- Live clock in hero ----
  const clock = document.querySelector("#live-clock");
  if (clock) {
    const updateClock = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      const s = String(now.getSeconds()).padStart(2, "0");
      clock.textContent = `${h}:${m}:${s}`;
    };
    updateClock();
    setInterval(updateClock, 1000);
  }

  // ---- Typewriter effect for hero subtitle ----
  const typewriter = document.querySelector("#typewriter");
  if (typewriter) {
    const text = typewriter.dataset.text || typewriter.textContent;
    typewriter.textContent = "";
    let i = 0;
    const type = () => {
      if (i < text.length) {
        typewriter.textContent += text.charAt(i);
        i++;
        setTimeout(type, 60);
      }
    };
    setTimeout(type, 800);
  }

});
