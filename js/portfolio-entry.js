/* Lightweight spatial entry. No rendering loop runs while the portfolio is open. */
(function () {
  "use strict";
  var entry = document.getElementById("portfolio-entry");
  var api = { active:false, enter:enter };
  window.PortfolioEntry = api;
  if (!entry || !document.body.classList.contains("home-page")) return;
  var remembered = false;
  try { remembered = sessionStorage.getItem("portfolio-entered") === "1"; } catch (_) {}
  if (window.location.hash || remembered) return;

  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  var tilt = entry.querySelector(".entry-world-tilt");
  var world = entry.querySelector(".entry-world");
  var backgrounds = Array.prototype.map.call(document.querySelectorAll("body > .header, body > .main-wrapper"),function (element) {
    return { element:element, inert:element.inert };
  });
  var frame = 0, exitTimer = 0, entering = false, pointerX = 0, pointerY = 0;
  var fallbacks = {
    entryTitle:"Muhammad Hamza", entrySubtitle:"AI Engineer",
    exploreAI:"Explore the engineering behind intelligent systems.",
    agents:"Agentic AI", vision:"Computer Vision", generative:"Generative AI", classicalLabel:"Classical ML",
    enterPortfolio:"Enter portfolio", skipIntro:"Skip introduction", entryHint:"Click to enter · Move to explore"
  };
  function ownGlobalControls() {
    if (!api.active) return;
    var controls = document.querySelectorAll(".mobile-theme-toggle,.portfolio-language-picker,.portfolio-language-control");
    var ids = [];
    controls.forEach(function (control,index) {
      if (control.classList.contains("portfolio-language-control") && control.closest(".portfolio-language-picker")) return;
      if (!control.id) {
        var identifier = "portfolio-entry-control-" + index;
        while (document.getElementById(identifier)) identifier += "x";
        control.id = identifier;
      }
      ids.push(control.id);
    });
    if (ids.length) entry.setAttribute("aria-owns",ids.join(" "));
  }
  function translate() {
    var locale = window.PortfolioLocale;
    entry.querySelectorAll("[data-entry-copy]").forEach(function (node) {
      var key = node.dataset.entryCopy;
      var value = locale ? locale.t(key) : key;
      node.textContent = value && value !== key ? value : fallbacks[key];
    });
    var language = locale && locale.getLanguage();
    var info = locale && locale.languages.find(function (item) { return item.code === language; });
    entry.setAttribute("lang",info ? info.locale : "en");
    entry.querySelector(".entry-copy").dir = info ? info.dir : "ltr";
    entry.querySelector(".entry-actions").dir = info ? info.dir : "ltr";
    entry.querySelector(".entry-core").setAttribute("aria-label",entry.querySelector(".entry-enter").textContent.trim());
  }
  function motionAllowed() { return !reduced || !reduced.matches; }
  function renderTilt() {
    frame = 0;
    if (!api.active || entering || !motionAllowed()) return;
    tilt.style.transform = "rotateX(" + (-pointerY * 3).toFixed(2) + "deg) rotateY(" + (pointerX * 5).toFixed(2) + "deg)";
  }
  function move(event) {
    if (entering || event.pointerType === "touch" || !motionAllowed()) return;
    var bounds = world.getBoundingClientRect();
    pointerX = Math.max(-1,Math.min(1,(event.clientX - bounds.left) / bounds.width * 2 - 1));
    pointerY = Math.max(-1,Math.min(1,(event.clientY - bounds.top) / bounds.height * 2 - 1));
    if (!frame) frame = requestAnimationFrame(renderTilt);
  }
  function resetTilt() {
    pointerX = pointerY = 0;
    if (!frame) frame = requestAnimationFrame(renderTilt);
  }
  function updateVisibility() { entry.classList.toggle("is-paused",document.hidden); }
  function complete() {
    if (!api.active) return;
    clearTimeout(exitTimer);
    api.active = false;
    entry.hidden = true;
    entry.removeAttribute("aria-owns");
    document.body.classList.remove("portfolio-entry-active","portfolio-entry-transition");
    document.documentElement.classList.remove("portfolio-entry-active");
    backgrounds.forEach(function (item) { item.element.inert = item.inert; });
    document.removeEventListener("keydown",keyboard);
    document.removeEventListener("portfolio:language",translate);
    document.removeEventListener("visibilitychange",updateVisibility);
    entry.removeEventListener("pointermove",move);
    entry.removeEventListener("pointerleave",resetTilt);
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    var heading = document.querySelector(".ai-hero h1");
    if (heading) {
      heading.setAttribute("tabindex","-1");
      heading.focus({preventScroll:true});
    }
    document.dispatchEvent(new CustomEvent("portfolio:entered",{detail:{source:"entry"}}));
  }
  function enter(options) {
    if (!api.active || entering) return;
    entering = true;
    try { sessionStorage.setItem("portfolio-entered","1"); } catch (_) {}
    // Fired inside the click handler so narration can unlock audio with user activation.
    document.dispatchEvent(new CustomEvent("portfolio:entering",{detail:{source:"entry",skipNarration:!!(options && options.skipNarration)}}));
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    if (!motionAllowed() || (options && options.instant)) { complete(); return; }
    entry.classList.add("is-entering");
    document.body.classList.add("portfolio-entry-transition");
    exitTimer = window.setTimeout(complete,900);
  }
  function keyboard(event) {
    if (entering) return;
    // Language search owns its Escape, Enter and Tab behavior while open.
    if (event.defaultPrevented || (event.target.closest && event.target.closest(".portfolio-language-picker,.portfolio-language-menu"))) return;
    if (event.key === "Escape") { event.preventDefault(); enter({instant:true,skipNarration:true}); return; }
    if ((event.key === "Enter" || event.key === " ") && (event.target === entry || event.target === document.body)) {
      event.preventDefault(); enter(); return;
    }
    if (event.key !== "Tab") return;
    var candidates = entry.querySelectorAll("button");
    var controls = Array.prototype.slice.call(candidates).concat(Array.prototype.slice.call(document.querySelectorAll(".mobile-theme-toggle,.portfolio-language-control,.portfolio-language-button")));
    var visible = controls.filter(function (node) { return !node.disabled && node.getClientRects().length; });
    var index = visible.indexOf(document.activeElement);
    if (index < 0 || (event.shiftKey && index === 0) || (!event.shiftKey && index === visible.length - 1)) {
      event.preventDefault();
      (event.shiftKey ? visible[visible.length - 1] : visible[0]).focus();
    }
  }

  api.active = true;
  entry.hidden = false;
  backgrounds.forEach(function (item) { item.element.inert = true; });
  document.body.classList.add("portfolio-entry-active");
  document.documentElement.classList.add("portfolio-entry-active");
  translate();
  ownGlobalControls();
  if (document.readyState !== "complete") document.addEventListener("DOMContentLoaded",ownGlobalControls,{once:true});
  entry.querySelectorAll("[data-entry-enter]").forEach(function (button) {
    button.addEventListener("click",function () { var skip = button.hasAttribute("data-entry-instant"); enter({instant:skip,skipNarration:skip}); });
  });
  document.addEventListener("keydown",keyboard);
  document.addEventListener("portfolio:language",translate);
  document.addEventListener("visibilitychange",updateVisibility);
  entry.addEventListener("pointermove",move,{passive:true});
  entry.addEventListener("pointerleave",resetTilt,{passive:true});
  window.addEventListener("pageshow",function (event) { if (event.persisted && entering) complete(); });
  entry.querySelector(".entry-enter").focus({preventScroll:true});
}());
