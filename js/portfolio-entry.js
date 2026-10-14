/* Lightweight shared spatial entry. The indexable page remains in the HTML below it. */
(function () {
  "use strict";
  var scriptUrl = document.currentScript && document.currentScript.src;
  var siteRootUrl = new URL("../",scriptUrl || location.href);
  var portraitUrl = new URL("../images/muhammad-hamza-entry-portrait.webp",scriptUrl || location.href).href;
  var handoffKey = "portfolio-entry-handoff-v1";
  var hasEntered = false, narrationEnabled = false;
  function pageUrl(input) {
    try {
      var url = new URL(input,location.href);
      if (!url.href.startsWith(siteRootUrl.href) || !/(?:\/|\.html)$/i.test(url.pathname)) return null;
      return url;
    } catch (_) { return null; }
  }
  function navigationType() {
    var record = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
    return record && record.type || (performance.navigation && performance.navigation.type === 1 ? "reload" : "navigate");
  }
  function consumeHandoff() {
    var raw;
    try { raw = sessionStorage.getItem(handoffKey); sessionStorage.removeItem(handoffKey); } catch (_) { return null; }
    if (!raw || navigationType() === "reload") return null;
    try {
      var pending = JSON.parse(raw);
      return pending.expires > Date.now() && pending.target === location.pathname + location.search && pending.source !== location.pathname + location.search ? pending : null;
    } catch (_) { return null; }
  }
  function handoff(input) {
    if (!hasEntered && !(api && api.active)) return false;
    var url = pageUrl(input);
    if (!url || url.pathname + url.search === location.pathname + location.search) return false;
    // A sidebar click during the brief scene is also a valid first entry
    // gesture: open that destination directly and request its page tour.
    if (api.active && !hasEntered) {
      narrationEnabled = true;
      api.autoNarrate = true;
    }
    try {
      sessionStorage.setItem(handoffKey,JSON.stringify({source:location.pathname + location.search,target:url.pathname + url.search,narrate:narrationEnabled,expires:Date.now() + 15000}));
      return true;
    } catch (_) { return false; }
  }
  function markLinkHandoff(event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    var link = event.target.closest && event.target.closest("a[href]");
    if (!link || link.hasAttribute("download") || (link.target && link.target.toLowerCase() !== "_self")) return;
    handoff(link.href);
  }
  function createEntry() {
    var section = document.createElement("section");
    section.className = "portfolio-entry";
    section.id = "portfolio-entry";
    section.setAttribute("aria-labelledby","entry-title");
    section.setAttribute("aria-describedby","entry-description");
    section.hidden = true;
    section.innerHTML = `
      <div class="entry-atmosphere" aria-hidden="true"></div>
      <div class="entry-shell">
        <div class="entry-copy">
          <div class="entry-eyebrow"><span aria-hidden="true"></span><span data-entry-copy="entrySubtitle">AI Engineer</span></div>
          <h2 id="entry-title" data-entry-copy="entryTitle">Muhammad Hamza</h2>
          <p id="entry-description" data-entry-copy="exploreAI">Explore the engineering behind intelligent systems.</p>
        </div>
        <div class="entry-world">
          <div class="entry-world-tilt">
            <div class="entry-orbit" aria-hidden="true"><span></span></div>
            <svg class="entry-links entry-links--compact" viewBox="0 0 1440 450" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M340 128 C435 128 465 179 535 179M340 322 C435 322 465 271 535 271M1100 128 C1005 128 975 179 905 179M1100 322 C1005 322 975 271 905 271"/><circle cx="535" cy="179" r="3"/><circle cx="535" cy="271" r="3"/><circle cx="905" cy="179" r="3"/><circle cx="905" cy="271" r="3"/></svg>
            <svg class="entry-links entry-links--wide" viewBox="0 0 1440 450" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M340 88 C440 88 480 174 545 174M340 268 C440 268 480 265 545 265M1100 88 C1000 88 960 174 895 174M1100 268 C1000 268 960 265 895 265"/><circle cx="545" cy="174" r="3"/><circle cx="545" cy="265" r="3"/><circle cx="895" cy="174" r="3"/><circle cx="895" cy="265" r="3"/></svg>
            <div class="entry-station entry-station--agents"><span class="entry-station-icon" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M16 4 5 23h22L16 4ZM5 23l11-6 11 6M16 4v13"/><circle cx="16" cy="4" r="2"/><circle cx="5" cy="23" r="2"/><circle cx="27" cy="23" r="2"/><circle cx="16" cy="17" r="2"/></svg></span><span class="entry-station-title" data-entry-copy="agents">Agentic AI</span><span class="entry-station-arrow" aria-hidden="true">↗</span></div>
            <div class="entry-station entry-station--vision"><span class="entry-station-icon" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M3 16c4-6 8-9 13-9s9 3 13 9c-4 6-8 9-13 9S7 22 3 16Z"/><circle cx="16" cy="16" r="5"/><circle cx="16" cy="16" r="1"/></svg></span><span class="entry-station-title" data-entry-copy="vision">Computer Vision</span><span class="entry-station-arrow" aria-hidden="true">↗</span></div>
            <div class="entry-station entry-station--generative"><span class="entry-station-icon" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="m16 3 2.5 10.5L29 16l-10.5 2.5L16 29l-2.5-10.5L3 16l10.5-2.5L16 3Z"/><path d="M23 4v5M20.5 6.5h5M7 23v5M4.5 25.5h5"/></svg></span><span class="entry-station-title" data-entry-copy="generative">Generative AI</span><span class="entry-station-arrow" aria-hidden="true">↗</span></div>
            <div class="entry-station entry-station--classical"><span class="entry-station-icon" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M4 27h24M7 23v-7h4v7M14 23V9h4v14M21 23v-11h4v11"/><path d="m6 11 8-5 5 3 7-6"/></svg></span><span class="entry-station-title" data-entry-copy="classicalLabel">Classical ML</span><span class="entry-station-arrow" aria-hidden="true">↗</span></div>
            <button class="entry-core" type="button" data-entry-enter aria-label="Enter Muhammad Hamza's portfolio">
              <span class="entry-portrait-ring" aria-hidden="true"></span>
              <span class="entry-portrait"><img alt="Portrait of Muhammad Hamza" width="768" height="1004" loading="eager" decoding="async" fetchpriority="high"></span>
            </button>
          </div>
        </div>
        <div class="entry-actions">
          <svg class="entry-cue-arrow" viewBox="0 0 110 86" aria-hidden="true" focusable="false"><path d="M104 7C79 4 82 58 17 59m12-11L17 59l13 8"/></svg>
          <button class="entry-enter" type="button" data-entry-enter><span data-entry-copy="enterPortfolio">Enter portfolio</span><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></button>
          <button class="entry-skip" type="button" data-entry-enter data-entry-instant data-entry-copy="skipIntro">Skip introduction</button>
        </div>
      </div>`;
    section.querySelector(".entry-portrait img").src = portraitUrl;
    document.body.insertBefore(section,document.body.firstChild);
    return section;
  }
  var handoffState = consumeHandoff(), suppressed = !!handoffState;
  hasEntered = suppressed;
  narrationEnabled = suppressed && handoffState.narrate !== false;
  var entry = !suppressed && (document.getElementById("portfolio-entry") || (document.querySelector(".main-wrapper") && createEntry()));
  var api = { active:false, skipped:false, automatic:false, suppressed:suppressed, autoNarrate:narrationEnabled, enter:enter, handoff:handoff };
  window.PortfolioEntry = api;
  document.addEventListener("click",markLinkHandoff);
  if (!entry) return;

  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  var tilt = entry.querySelector(".entry-world-tilt");
  var world = entry.querySelector(".entry-world");
  var frame = 0, exitTimer = 0, revealTimer = 0, readyTimer = 0, autoTimer = 0, entering = false, enterReady = !!window.PortfolioGuide, pointerX = 0, pointerY = 0;
  var focusAfterEntry = false;
  var fallbacks = {
    entryTitle:"Muhammad Hamza", entrySubtitle:"AI Engineer",
    exploreAI:"Explore the engineering behind intelligent systems.",
    agents:"Agentic AI", vision:"Computer Vision", generative:"Generative AI", classicalLabel:"Classical ML",
    enterPortfolio:"Enter portfolio", skipIntro:"Skip introduction"
  };
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
  function updateVisibility() {
    entry.classList.toggle("is-paused",document.hidden);
  }
  function unlockActions() {
    clearTimeout(readyTimer);
    readyTimer = 0;
    enterReady = true;
    entry.querySelectorAll(".entry-enter,.entry-core").forEach(function (button) { button.disabled = false; });
    document.removeEventListener("portfolio:guide-ready",unlockActions);
  }
  function complete() {
    if (!api.active) return;
    clearTimeout(exitTimer);
    clearTimeout(revealTimer);
    clearTimeout(readyTimer);
    clearTimeout(autoTimer);
    api.active = false;
    hasEntered = true;
    entry.hidden = true;
    entry.classList.remove("is-revealing","is-entering");
    document.body.classList.remove("portfolio-entry-active","portfolio-entry-transition");
    document.documentElement.classList.remove("portfolio-entry-active");
    document.removeEventListener("keydown",keyboard);
    document.removeEventListener("portfolio:language",translate);
    document.removeEventListener("visibilitychange",updateVisibility);
    document.removeEventListener("portfolio:guide-ready",unlockActions);
    document.removeEventListener("pointermove",move);
    entry.removeEventListener("pointerleave",resetTilt);
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    var hashId = "";
    try { hashId = decodeURIComponent(location.hash.slice(1)); } catch (_) { hashId = location.hash.slice(1); }
    var anchor = hashId && document.getElementById(hashId);
    if (anchor && entry.contains(anchor)) anchor = null;
    var focusTarget = anchor || document.querySelector(".main-wrapper h1,.main-wrapper [role='heading'][aria-level='1'],.main-wrapper");
    if (focusTarget && focusAfterEntry) {
      if (!focusTarget.hasAttribute("tabindex")) focusTarget.setAttribute("tabindex","-1");
      focusTarget.focus({preventScroll:true});
    }
    if (anchor) anchor.scrollIntoView({behavior:"auto",block:"start"});
    document.dispatchEvent(new CustomEvent("portfolio:entered",{detail:{source:"entry"}}));
  }
  function enter(options) {
    if (!api.active || entering) return;
    if (!(options && (options.skipNarration || options.automatic)) && !enterReady) return;
    entering = true;
    hasEntered = true;
    focusAfterEntry = !(options && options.automatic) || entry.contains(document.activeElement);
    clearTimeout(autoTimer);
    clearTimeout(revealTimer); entry.classList.remove("is-revealing");
    api.automatic = !!(options && options.automatic);
    api.skipped = !!(options && options.skipNarration);
    // Home's automatic entry is silent, but a later sidebar click may request
    // the destination page's first tour. An explicit Skip stays silent.
    narrationEnabled = !api.skipped || !!(options && options.automatic);
    api.autoNarrate = narrationEnabled;
    // A manual Enter retains its user gesture for sound; autoplay cannot.
    document.dispatchEvent(new CustomEvent("portfolio:entering",{detail:{source:"entry",automatic:!!(options && options.automatic),skipNarration:api.skipped}}));
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    if (!motionAllowed() || (options && options.instant)) { complete(); return; }
    entry.classList.add("is-entering");
    document.body.classList.add("portfolio-entry-transition");
    exitTimer = window.setTimeout(complete,550);
  }
  function keyboard(event) {
    if (entering) return;
    // Language search owns its Escape, Enter and Tab behavior while open.
    if (event.defaultPrevented || (event.target.closest && event.target.closest(".portfolio-language-picker,.portfolio-language-menu"))) return;
    if (event.key === "Escape") { event.preventDefault(); enter({instant:true,skipNarration:true}); return; }
  }

  api.active = true;
  entry.hidden = false;
  if (motionAllowed()) {
    entry.classList.add("is-revealing");
    revealTimer = window.setTimeout(function () { entry.classList.remove("is-revealing"); },1250);
  }
  document.body.classList.add("portfolio-entry-active");
  document.documentElement.classList.add("portfolio-entry-active");
  translate();
  if (!enterReady) {
    entry.querySelectorAll(".entry-enter,.entry-core").forEach(function (button) { button.disabled = true; });
    document.addEventListener("portfolio:guide-ready",unlockActions);
    // Keep the portfolio accessible if a voice asset or the guide fails to load.
    readyTimer = window.setTimeout(unlockActions,4000);
  }
  entry.querySelectorAll("[data-entry-enter]").forEach(function (button) {
    button.addEventListener("click",function () { var skip = button.hasAttribute("data-entry-instant"); enter({instant:skip,skipNarration:skip}); });
  });
  document.addEventListener("keydown",keyboard);
  document.addEventListener("portfolio:language",translate);
  document.addEventListener("visibilitychange",updateVisibility);
  document.addEventListener("pointermove",move,{passive:true});
  entry.addEventListener("pointerleave",resetTilt,{passive:true});
  window.addEventListener("pageshow",function (event) { if (event.persisted && entering) complete(); });
  updateVisibility();
  // Let visitors see the brief 3D reveal, then expose the actual page without
  // requiring a click. Reduced-motion visitors reach the page immediately.
  function autoEnter() {
    var languageMenu = document.querySelector(".portfolio-language-menu");
    if (languageMenu && !languageMenu.hidden) {
      autoTimer = window.setTimeout(autoEnter,250);
      return;
    }
    enter({automatic:true,skipNarration:document.body.classList.contains("home-page"),instant:!motionAllowed()});
  }
  autoTimer = window.setTimeout(autoEnter,motionAllowed() ? 1200 : 0);
}());
