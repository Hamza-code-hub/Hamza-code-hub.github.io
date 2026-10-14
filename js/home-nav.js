(function () {
  "use strict";

  function initialiseHomeNavigation() {
    var nav = document.querySelector(".home-nav");
    if (!nav) return;

    var links = Array.prototype.slice.call(nav.querySelectorAll(".nav-link"));
    var homeLink = links.filter(function (link) { return !link.hash; })[0];
    var sectionLinks = links.filter(function (link) { return link.hash; });

    function select(link) {
      if (!link) return;
      links.forEach(function (item) {
        var active = item === link;
        item.parentElement.classList.toggle("active", active);
        if (active) item.setAttribute("aria-current", "page");
        else item.removeAttribute("aria-current");
      });
    }

    function selectFromHash() {
      var matching = sectionLinks.filter(function (link) { return link.hash === window.location.hash; })[0];
      select(matching || homeLink);
    }

    links.forEach(function (link) {
      link.addEventListener("click", function () {
        select(link);
      });
    });

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(function (entries) {
        var visible = entries.filter(function (entry) { return entry.isIntersecting; })
          .sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; })[0];
        if (!visible) return;
        var matching = sectionLinks.filter(function (link) { return link.hash === "#" + visible.target.id; })[0];
        if (matching) select(matching);
      }, { rootMargin: "-18% 0px -68% 0px", threshold: [0.08, 0.2, 0.45] });

      sectionLinks.forEach(function (link) {
        var section = document.getElementById(link.hash.slice(1));
        if (section) observer.observe(section);
      });
    }

    window.addEventListener("scroll", function () {
      if (window.scrollY < window.innerHeight * 0.28) select(homeLink);
    }, { passive: true });
    window.addEventListener("hashchange", selectFromHash);
    selectFromHash();
  }

  function initialiseHomeDepth() {
    if (!document.body.classList.contains("home-page") || !window.matchMedia) return;

    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var desktop = window.matchMedia("(min-width: 768px)");
    var dial = document.querySelector(".home-kinetic-dial__plane");
    var scrollInstrument = document.querySelector(".home-scroll-instrument");
    var hero = document.querySelector(".ai-hero");
    if (dial && hero && "IntersectionObserver" in window) {
      var dialObserver = new IntersectionObserver(function (entries) {
        dial.parentElement.classList.toggle("is-offscreen", !entries[0].isIntersecting);
      });
      dialObserver.observe(hero);
    }
    var stages = [
      { section: document.querySelector(".ai-hero"), target: document.querySelector(".ai-portrait-stage"), kind: "portrait" },
      { section: document.querySelector("#aboutme"), target: document.querySelector(".home-about-photo"), kind: "about" },
      { section: document.querySelector("#projects"), target: document.querySelector("#projects"), kind: "projects" },
      { section: document.querySelector("#experience"), target: document.querySelector(".work-experience-panel__core"), kind: "experience" }
    ].filter(function (stage) { return stage.section && stage.target; });
    if (!stages.length) return;

    var frame = 0;
    function render() {
      frame = 0;
      if (document.hidden || reducedMotion.matches) {
        if (scrollInstrument) scrollInstrument.classList.remove("is-visible");
        return;
      }
      var viewport = window.innerHeight;
      if (dial && hero) {
        var heroRect = hero.getBoundingClientRect();
        var heroTop = heroRect.top + window.scrollY;
        var travel = Math.max(0, Math.min(heroRect.height + viewport, window.scrollY - heroTop));
        var tilt = Math.max(-1, Math.min(1, (viewport / 2 - (heroRect.top + heroRect.height / 2)) / (viewport / 2 + heroRect.height / 2)));
        dial.style.setProperty("--dial-scroll-angle", (travel * .28).toFixed(1) + "deg");
        dial.style.setProperty("--dial-scroll-tilt", (tilt * 6).toFixed(2) + "deg");
      }
      if (scrollInstrument) {
        var scrollRange = Math.max(1, document.documentElement.scrollHeight - viewport);
        var progress = Math.max(0, Math.min(1, window.scrollY / scrollRange));
        scrollInstrument.style.setProperty("--home-progress-offset", (226.2 * (1 - progress)).toFixed(2));
        scrollInstrument.style.setProperty("--home-scroll-angle", (window.scrollY * .22).toFixed(1) + "deg");
        scrollInstrument.classList.toggle("is-visible", desktop.matches && hero && hero.getBoundingClientRect().bottom < viewport * .58);
      }
      if (!desktop.matches) return;
      stages.forEach(function (stage) {
        var rect = stage.section.getBoundingClientRect();
        if (rect.bottom < -100 || rect.top > viewport + 100) return;
        var distance = (viewport / 2 - (rect.top + rect.height / 2)) / (viewport / 2 + rect.height / 2);
        var depth = Math.max(-1, Math.min(1, distance));
        if (stage.kind === "portrait") {
          stage.target.style.setProperty("--home-depth-y", (depth * -16).toFixed(1) + "px");
          stage.target.style.setProperty("--home-depth-ry", (depth * 3).toFixed(2) + "deg");
        } else if (stage.kind === "about") {
          stage.target.style.setProperty("--home-depth-y", (depth * -12).toFixed(1) + "px");
          stage.target.style.setProperty("--home-depth-ry", (depth * 2).toFixed(2) + "deg");
        } else if (stage.kind === "projects") {
          stage.target.style.setProperty("--home-depth-y", (depth * -6).toFixed(1) + "px");
          stage.target.style.setProperty("--home-depth-ry", (depth * 1.5).toFixed(2) + "deg");
        } else {
          stage.target.style.setProperty("--home-depth-y", (depth * -10).toFixed(1) + "px");
          stage.target.style.setProperty("--home-depth-ry", (-15 + depth * 9).toFixed(2) + "deg");
        }
      });
    }
    function queue() {
      if (!frame) frame = window.requestAnimationFrame(render);
    }
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue, { passive: true });
    window.addEventListener("load", queue, { once: true });
    document.addEventListener("visibilitychange", queue);
    if (reducedMotion.addEventListener) reducedMotion.addEventListener("change", queue);
    if (desktop.addEventListener) desktop.addEventListener("change", queue);
    queue();
  }

  function initialise() {
    initialiseHomeNavigation();
    initialiseHomeDepth();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialise);
  else initialise();
})();
