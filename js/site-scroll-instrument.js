(function () {
  "use strict";

  function initialize() {
    if (document.querySelector(".site-scroll-instrument")) return;
    var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
    var instrument = document.createElement("div");
    instrument.className = "site-scroll-instrument";
    instrument.setAttribute("aria-hidden", "true");
    instrument.innerHTML = '<svg viewBox="0 0 100 100" focusable="false" fill="none" stroke="currentColor">' +
      '<g class="site-scroll-instrument__rotor"><circle class="site-scroll-instrument__ticks" cx="50" cy="50" r="45"/>' +
      '<path class="site-scroll-instrument__spokes" d="M50 3v9m0 76v9M3 50h9m76 0h9M17 17l6.4 6.4m53.2 53.2L83 83M83 17l-6.4 6.4M23.4 76.6 17 83"/></g>' +
      '<circle class="site-scroll-instrument__track" cx="50" cy="50" r="36"/>' +
      '<circle class="site-scroll-instrument__progress" cx="50" cy="50" r="36"/>' +
      '<g class="site-scroll-instrument__inner"><circle cx="50" cy="50" r="25"/><circle cx="50" cy="50" r="19"/>' +
      '<path d="M50 25v9m0 32v9M25 50h9m32 0h9M32.3 32.3l6.4 6.4m22.6 22.6 6.4 6.4m0-35.4-6.4 6.4M38.7 61.3l-6.4 6.4"/></g>' +
      '<circle class="site-scroll-instrument__core" cx="50" cy="50" r="5"/></svg>';
    document.body.appendChild(instrument);

    var frame = 0;
    var railWidth = -1;
    var railHeight = -1;
    var railStart = 0;
    var railEnd = 0;
    function measureRail(viewport) {
      var compact = window.innerWidth < 768;
      var radius = compact ? 29 : window.innerWidth <= 1100 ? 38 : 47;
      var start = compact ? 135 : 120;
      document.querySelectorAll(".mobile-theme-toggle, .portfolio-language-control").forEach(function (control) {
        if (control.getClientRects().length) start = Math.max(start, control.getBoundingClientRect().bottom + radius + 12);
      });
      railStart = start;
      railEnd = Math.max(start, viewport - (compact ? 220 : 275));
      railWidth = window.innerWidth;
      railHeight = viewport;
    }
    function render() {
      var root = document.scrollingElement || document.documentElement;
      var viewport = root.clientHeight || window.innerHeight;
      var scrollRange = Math.max(0, root.scrollHeight - viewport);
      var progress = scrollRange ? Math.max(0, Math.min(1, root.scrollTop / scrollRange)) : 0;
      if (railHeight !== viewport || railWidth !== window.innerWidth) measureRail(viewport);

      // The center, ring and gears all use the same document-wide scroll ratio.
      // No timed animation or CSS easing can drift from the scrollbar.
      instrument.style.setProperty("--site-scroll-progress", progress.toFixed(5));
      instrument.style.setProperty("--site-scroll-y", (railStart + (railEnd - railStart) * progress).toFixed(2) + "px");
      instrument.style.setProperty("--site-scroll-angle", (1440 * progress).toFixed(3) + "deg");
      instrument.style.setProperty("--site-scroll-angle-inner", (-720 * progress).toFixed(3) + "deg");
      instrument.style.setProperty("--site-scroll-offset", (226.195 * (1 - progress)).toFixed(3));
      instrument.classList.toggle("is-visible", scrollRange > 1 && !(reducedMotion && reducedMotion.matches));
    }
    function queue() {
      if (!frame) frame = window.requestAnimationFrame(function () { frame = 0; render(); });
    }
    function renderOnScroll() {
      if (frame) { window.cancelAnimationFrame(frame); frame = 0; }
      render();
    }
    function resize() {
      railHeight = -1;
      queue();
    }

    window.addEventListener("scroll", renderOnScroll, { passive:true });
    window.addEventListener("resize", resize, { passive:true });
    window.addEventListener("orientationchange", resize, { passive:true });
    window.addEventListener("load", queue, { once:true });
    window.addEventListener("pageshow", queue);
    document.addEventListener("visibilitychange", queue);
    if (reducedMotion && reducedMotion.addEventListener) reducedMotion.addEventListener("change", queue);
    if ("ResizeObserver" in window) {
      var observer = new ResizeObserver(queue);
      observer.observe(document.body);
    }
    if (window.visualViewport) window.visualViewport.addEventListener("resize", resize, { passive:true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(queue);
    queue();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once:true });
  else initialize();
})();
