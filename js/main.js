/* ============================================
   时间旅人 · 交互脚本
   1:1 复刻自 React 源码
   - Reveal 滚动动画 (IntersectionObserver)
   - slideUp 标题动画
   - 自定义光标 & 磁吸效果
   ============================================ */

(function () {
  'use strict';

  // ---------- Custom Cursor ----------
  const cursorDot = document.createElement('div');
  cursorDot.className = 'cursor-dot';
  document.body.appendChild(cursorDot);

  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;

  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.2;
    cursorY += (mouseY - cursorY) * 0.2;
    cursorDot.style.transform = 'translate(' + cursorX + 'px, ' + cursorY + 'px) translate(-50%, -50%)';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Expand cursor on hoverable elements
  document.addEventListener('mouseover', function (e) {
    if (e.target.closest('a, button, [data-magnetic], [role="button"]')) {
      cursorDot.classList.add('expanded');
    }
  });
  document.addEventListener('mouseout', function (e) {
    if (e.target.closest('a, button, [data-magnetic], [role="button"]')) {
      cursorDot.classList.remove('expanded');
    }
  });

  // ---------- Magnetic Effect ----------
  document.querySelectorAll('[data-magnetic]').forEach(function (el) {
    el.addEventListener('mousemove', function (e) {
      var rect = el.getBoundingClientRect();
      var x = e.clientX - rect.left - rect.width / 2;
      var y = e.clientY - rect.top - rect.height / 2;
      var strength = 0.15;
      el.style.transform = 'translate(' + (x * strength) + 'px, ' + (y * strength) + 'px)';
    });
    el.addEventListener('mouseleave', function () {
      el.style.transform = 'translate(0, 0)';
      el.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
    });
    el.addEventListener('mouseenter', function () {
      el.style.transition = 'none';
    });
  });

  // ---------- Reveal Scroll Animation ----------
  function initReveal() {
    var reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    if (!('IntersectionObserver' in window)) {
      reveals.forEach(function (el) { el.classList.add('revealed'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var delay = entry.target.getAttribute('data-delay') || 0;
          setTimeout(function () {
            entry.target.classList.add('revealed');
          }, parseInt(delay, 10));
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -60px 0px'
    });

    reveals.forEach(function (el) { observer.observe(el); });
  }

  // ---------- slideUp Animation (Hero Title) ----------
  function initSlideUp() {
    var slideEls = document.querySelectorAll('.slide-up-inner');
    slideEls.forEach(function (el, index) {
      var delay = el.getAttribute('data-slide-delay') || (index * 200 + 200);
      setTimeout(function () {
        el.classList.add('animated');
      }, parseInt(delay, 10));
    });
  }

  // ---------- Header Scroll State ----------
  function initHeaderScroll() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    // Header is always visible with mix-blend-difference
    // No additional scroll state needed for this design
  }

  // ---------- Init on DOM Ready ----------
  function init() {
    initReveal();
    initSlideUp();
    initHeaderScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
