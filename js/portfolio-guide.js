(function () {
  "use strict";
  var scriptUrl = document.currentScript && document.currentScript.src;
  function initializeGuide() {
    var locale = window.PortfolioLocale;
    if (!locale || !document.querySelector(".main-wrapper") || document.querySelector(".portfolio-guide")) return;
    var siteUrl = new URL("../",scriptUrl).href;
    var page = /contact\.html$/i.test(location.pathname) ? "contact" : /services\.html$/i.test(location.pathname) ? "services" : /\/resume\//i.test(location.pathname) ? "resume" : /\/portfolio\.html$/i.test(location.pathname) ? "portfolio" : /\/gallery\.html$/i.test(location.pathname) ? "gallery" : /\/projects\/[^/]+\.html$/i.test(location.pathname) ? "project" : document.body.classList.contains("home-page") ? "home" : "other";
    var pageIntroKey = page === "gallery" ? "gallery" : page === "project" ? "project-" + location.pathname.split("/").pop().replace(/\.html$/i,"") : "";
    var pageIntroReady = !pageIntroKey || !!window.PortfolioPageIntros;
    var pageIntroWaiters = [];
    var knowledgeIntroWaiters = [];
    var knowledgeIntroLoading = false;
    var knowledgeIntroFailed = false;
    var knowledgeLocaleWaiters = [];
    var knowledgeLocaleLoading = false;
    var knowledgeLocaleFailed = false;
    var coreIntroReady = !!window.PortfolioCoreIntros;
    var coreIntroLoading = false;
    var coreIntroWaiters = [];
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var synth = window.speechSynthesis;
    var nativeVoice = !!(synth && window.SpeechSynthesisUtterance);
    // A Stop applies to this document only. Persisting it in sessionStorage also
    // muted the next page and every refresh in the same tab, which made the
    // requested automatic introduction appear broken.
    var mutedForPage = false;
    // A page is introduced once per tab. Normalize directory index URLs so
    // / and /index.html (and /resume/ and /resume/index.html) share a visit.
    var visitPath = location.pathname.replace(/\/index\.html$/i,"/").replace(/\/$/,"") || "/";
    var autoVisitKey = "portfolio-guide-auto-visit-v1:" + visitPath.toLowerCase();
    var autoVisitClaimed = false;
    var currentIntroAutomatic = false;
    var currentTourAutomatic = false;
    var currentTourContinuation = false;
    var generation = 0;
    var timers = [];
    var audio = null;
    var utterance = null;
    var ready = false;
    var entering = false;
    var deferredAutomaticHomeIntro = false;
    var restartAfterVisibility = null;
    var lastQuestion = "";
    var history = [];
    var activeTarget = null;
    var activeGesture = null;
    var followFrame = 0;
    var followUntil = 0;
    var followReset = 0;
    var highlights = [];
    var layoutFrame = 0;
    var activeTimeline = null;
    var resumeTour = null;
    var pendingLanguageIntent = null;
    var menuOpenedByGuide = false;
    var handoffInFlight = false;
    var tourStorageKey = "portfolio-guided-tour-v2";
    var continuation = consumeContinuation();
    function t(key,fallback) { var result = locale.t(key); return result === key ? (fallback || key) : result; }
    function language() { return locale.languages.filter(function (item) { return item.code === locale.getLanguage(); })[0] || locale.languages[0]; }
    function muted() { return mutedForPage; }
    function saveMuted(value) { mutedForPage = !!value; }
    function hasAutoVisit() {
      if (autoVisitClaimed) return true;
      try { return sessionStorage.getItem(autoVisitKey) === "1"; } catch (_) { return false; }
    }
    function rememberAutoVisit() {
      autoVisitClaimed = true;
      try { sessionStorage.setItem(autoVisitKey,"1"); } catch (_) { /* This document still remembers its visit. */ }
    }
    function claimAutoVisit() {
      if (hasAutoVisit()) return false;
      rememberAutoVisit();
      return true;
    }
    function pageCopyReady() { return !locale.getPageStatus || locale.getPageStatus().ready; }
    function afterPageCopy(callback) {
      var token = generation, code = locale.getLanguage();
      Promise.resolve(locale.whenReady ? locale.whenReady() : false).then(function () {
        if (token === generation && code === locale.getLanguage() && pageCopyReady() && !document.hidden) callback();
      }).catch(function () { /* Keep narration stopped if page translation failed. */ });
    }
    function afterPageIntro(callback) {
      var token = generation;
      pageIntroWaiters.push(function () { if (token === generation) callback(); });
    }
    function afterCoreIntro(callback) {
      var token = generation;
      coreIntroWaiters.push(function () { if (token === generation) callback(); });
      if (coreIntroLoading) return;
      coreIntroLoading = true;
      var script = document.createElement("script"); script.async = true;
      script.src = new URL("../js/portfolio-core-intros.js?v=1",scriptUrl).href;
      script.onload = script.onerror = function () {
        coreIntroReady = true;
        coreIntroWaiters.splice(0).forEach(function (waiter) { waiter(); });
      };
      document.head.appendChild(script);
    }
    if (!pageIntroReady) {
      var introScript = document.createElement("script"); introScript.async = true;
      introScript.src = new URL("../js/portfolio-page-intros.js?v=1",scriptUrl).href;
      introScript.onload = introScript.onerror = function () {
        pageIntroReady = true;
        pageIntroWaiters.splice(0).forEach(function (callback) { callback(); });
      };
      document.head.appendChild(introScript);
    }
    function ensureKnowledgeIntros(callback) {
      if (window.PortfolioPageIntros || knowledgeIntroFailed) { callback(); return; }
      if (pageIntroKey && !pageIntroReady) { pageIntroWaiters.push(callback); return; }
      knowledgeIntroWaiters.push(callback);
      if (knowledgeIntroLoading) return;
      knowledgeIntroLoading = true;
      var script = document.createElement("script"); script.async = true;
      script.src = new URL("../js/portfolio-page-intros.js?v=1",scriptUrl).href;
      script.onload = script.onerror = function (event) {
        if (event.type === "error") knowledgeIntroFailed = true;
        knowledgeIntroWaiters.splice(0).forEach(function (waiter) { waiter(); });
      };
      document.head.appendChild(script);
    }
    function ensureKnowledgeLocales(callback) {
      if (language().code === "en" || window.PortfolioKnowledgeLocales || knowledgeLocaleFailed) { callback(); return; }
      knowledgeLocaleWaiters.push(callback);
      if (knowledgeLocaleLoading) return;
      knowledgeLocaleLoading = true;
      var script = document.createElement("script"); script.async = true;
      script.src = new URL("../js/portfolio-knowledge-locales.js?v=2",scriptUrl).href;
      script.onload = script.onerror = function (event) {
        if (event.type === "error") knowledgeLocaleFailed = true;
        knowledgeLocaleWaiters.splice(0).forEach(function (waiter) { waiter(); });
      };
      document.head.appendChild(script);
    }
    function ensureKnowledge(callback) {
      var pending = 2;
      function done() { if (--pending === 0) callback(); }
      ensureKnowledgeIntros(done);
      ensureKnowledgeLocales(done);
    }
    function later(callback,delay) { timers.push(window.setTimeout(callback,delay)); }
    function clearTimers() { timers.forEach(window.clearTimeout); timers = []; }
    function clearContinuation() { try { sessionStorage.removeItem(tourStorageKey); } catch (_) {} }
    function consumeContinuation() {
      try {
        var value = JSON.parse(sessionStorage.getItem(tourStorageKey) || "null");
        sessionStorage.removeItem(tourStorageKey);
        if (!value || value.version !== 2 || value.page !== page || value.language !== locale.getLanguage() || value.expires < Date.now() || value.expires > Date.now() + 180000) return null;
        return value;
      } catch (_) { return null; }
    }

    var root = document.createElement("aside");
    root.className = "portfolio-guide"; root.hidden = true; root.dataset.state = "idle"; root.dataset.mode = "compact"; root.dataset.gesture = "rest";
    root.innerHTML = `<div class="portfolio-guide__controls">
      <button type="button" class="portfolio-guide__play"><svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true" focusable="false"><path class="guide-icon-play" d="m6 3 11 7-11 7Z" fill="currentColor"/><rect class="guide-icon-stop" x="4" y="4" width="12" height="12" rx="2" fill="currentColor"/></svg></button>
      <button type="button" class="portfolio-guide__hide"><svg viewBox="0 0 20 20" width="13" height="13" aria-hidden="true" focusable="false"><path d="m5 5 10 10M15 5 5 15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
    </div>
    <button type="button" class="portfolio-guide__avatar" aria-haspopup="dialog" aria-expanded="false" aria-controls="portfolio-assistant-dialog">
      <svg viewBox="0 0 180 184" width="100" height="112" aria-hidden="true" focusable="false">
        <defs><linearGradient id="guide-metal" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#fbf5e8"/><stop offset=".45" stop-color="#d7c9a9"/><stop offset="1" stop-color="#87775a"/></linearGradient><linearGradient id="guide-trim" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f8cb7b"/><stop offset="1" stop-color="#9b6d2e"/></linearGradient><linearGradient id="guide-face" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#303033"/><stop offset="1" stop-color="#0b0d0f"/></linearGradient></defs>
        <ellipse class="guide-avatar__floor" cx="90" cy="173" rx="43" ry="6"/>
        <g class="guide-avatar__body">
          <g class="guide-avatar__legs" fill="url(#guide-trim)"><rect x="76" y="144" width="11" height="20" rx="5"/><rect x="96" y="144" width="11" height="20" rx="5"/><path d="M75 160h13v6H70q-3-3 5-6m20 0h13q8 3 5 6H95Z" fill="url(#guide-metal)"/></g>
          <g class="guide-avatar__arm guide-avatar__arm--left"><path d="m62 102-15 11" class="guide-avatar__limb"/><circle cx="47" cy="113" r="6" fill="url(#guide-trim)"/><g class="guide-avatar__forearm guide-avatar__forearm--left"><path d="m47 113-9 12" class="guide-avatar__limb"/><g transform="translate(30 120) rotate(15)"><rect x="0" y="0" width="16" height="18" rx="7" fill="url(#guide-metal)"/><path d="m2 6-5-4m6-1V-4m4 5V-5m4 7V-4m4 9V1" class="guide-avatar__fingers"/><path d="M4 11h7" class="guide-avatar__detail"/></g></g></g>
          <g class="guide-avatar__arm guide-avatar__arm--right"><path d="m119 102 15 8" class="guide-avatar__limb"/><circle cx="134" cy="110" r="6" fill="url(#guide-trim)"/><g class="guide-avatar__forearm guide-avatar__forearm--right"><path d="m134 110 9-18" class="guide-avatar__limb"/><g class="guide-avatar__hand" transform="translate(136 78)"><rect x="0" y="0" width="16" height="19" rx="7" fill="url(#guide-metal)"/><path class="guide-avatar__open-fingers" d="m2 7-6-3M3 3v-9M7 2V-8m4 10V-7m4 12V-3"/><path class="guide-avatar__point-finger" d="M2 7 0 3m6 0V-12m4 16v-4m4 6V2"/><path d="M4 13h7" class="guide-avatar__detail"/></g></g></g>
          <path d="M72 92h36q16 0 15 17l-5 29q-1 11-15 11H77q-14 0-15-11l-5-29q-1-17 15-17" fill="url(#guide-metal)"/>
          <path d="M76 92h28" stroke="#fffaf0" stroke-width="3" stroke-linecap="round"/>
          <rect x="76" y="107" width="28" height="24" rx="8" fill="url(#guide-face)"/><path d="m81 120 4-5 5 9 6-7 3 3" fill="none" stroke="#f5ba5a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M78 140h24" class="guide-avatar__detail"/>
          <g class="guide-avatar__head"><path d="M90 29V18" stroke="#ad905d" stroke-width="3"/><circle cx="90" cy="15" r="4" fill="#f5ba5a"/><rect x="50" y="50" width="12" height="23" rx="6" fill="url(#guide-trim)"/><rect x="118" y="50" width="12" height="23" rx="6" fill="url(#guide-trim)"/><rect x="57" y="30" width="66" height="59" rx="21" fill="url(#guide-metal)"/><rect x="64" y="40" width="52" height="37" rx="14" fill="url(#guide-face)"/><g fill="#f5ba5a"><rect x="75" y="50" width="7" height="9" rx="3.5"/><rect x="98" y="50" width="7" height="9" rx="3.5"/><rect class="guide-avatar__mouth" x="84" y="67" width="12" height="3" rx="1.5"/></g><path d="M73 36h26" stroke="#fff9e9" stroke-width="2" opacity=".65" stroke-linecap="round"/></g>
        </g>
      </svg><span class="portfolio-guide__notification" aria-hidden="true"></span>
    </button><span class="portfolio-guide__prompt" hidden></span><span class="portfolio-guide__status sr-only" role="status" aria-live="polite" aria-atomic="true"></span>`;
    var avatar = root.querySelector(".portfolio-guide__avatar");
    var play = root.querySelector(".portfolio-guide__play");
    var hide = root.querySelector(".portfolio-guide__hide");
    var status = root.querySelector(".portfolio-guide__status");
    var prompt = root.querySelector(".portfolio-guide__prompt");

    // The assistant is a separate, click-opened window. No assistant section is inserted into any page.
    var dialog = document.createElement("div"); dialog.id = "portfolio-assistant-dialog"; dialog.className = "portfolio-assistant-dialog"; dialog.hidden = true;
    dialog.setAttribute("role","dialog"); dialog.setAttribute("aria-labelledby","portfolio-assistant-title");
    dialog.innerHTML = `<header class="portfolio-assistant__header"><div><span class="portfolio-assistant__kicker">MUHAMMAD HAMZA</span><h2 id="portfolio-assistant-title"></h2></div><div class="portfolio-assistant__actions"><button type="button" class="portfolio-assistant__play"><svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true" focusable="false"><path class="guide-icon-play" d="m6 3 11 7-11 7Z" fill="currentColor"/><rect class="guide-icon-stop" x="4" y="4" width="12" height="12" rx="2" fill="currentColor"/></svg></button><button type="button" class="portfolio-assistant__close"><svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" focusable="false"><path d="m5 5 10 10M15 5 5 15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></div></header>
      <div class="portfolio-assistant__intro"><p class="portfolio-assistant__greeting"></p><p class="portfolio-assistant__note"></p></div>
      <div class="portfolio-assistant__suggestions"><button type="button" data-assistant-topic="rag">RAG</button><button type="button" data-assistant-topic="agentic"></button><button type="button" data-assistant-topic="cv"></button><button type="button" data-assistant-topic="contact"></button></div>
      <div class="portfolio-assistant__conversation" id="portfolio-assistant-conversation" role="log" aria-live="polite" aria-relevant="additions text"></div>
      <form id="portfolio-assistant-form"><label class="sr-only" for="portfolio-assistant-question"></label><input id="portfolio-assistant-question" type="text" maxlength="360" autocomplete="off" required><button class="portfolio-assistant__send" type="submit"><svg viewBox="0 0 20 20" width="17" height="17" aria-hidden="true" focusable="false"><path d="m3 3 15 7-15 7 3-7Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M6 10h8" stroke="currentColor" stroke-width="1.5"/></svg></button></form>
      <footer class="portfolio-assistant__footer"><button type="button" class="portfolio-assistant__tour"></button><button type="button" class="portfolio-assistant__language"><svg viewBox="0 0 20 20" width="13" height="13" aria-hidden="true" focusable="false"><circle cx="10" cy="10" r="7"/><ellipse cx="10" cy="10" rx="3" ry="7"/><path d="M3 10h14"/></svg><span></span></button></footer>`;
    var input = dialog.querySelector("input"); var conversation = dialog.querySelector(".portfolio-assistant__conversation");
    var close = dialog.querySelector(".portfolio-assistant__close");
    var chatPlay = dialog.querySelector(".portfolio-assistant__play");
    var tourButton = dialog.querySelector(".portfolio-assistant__tour");
    function label(button,text) { button.setAttribute("aria-label",text); button.title = text; }
    function fitWindow() {
      if (innerWidth > 575) { dialog.classList.remove("is-keyboard"); dialog.style.removeProperty("--assistant-mobile-top"); dialog.style.removeProperty("--assistant-mobile-height"); return; }
      var viewport = window.visualViewport;
      var height = viewport ? viewport.height : innerHeight;
      var offset = viewport ? viewport.offsetTop : 0;
      var keyboard = height < innerHeight * .8 && (!viewport || viewport.scale < 1.05);
      dialog.classList.toggle("is-keyboard",keyboard);
      dialog.style.setProperty("--assistant-mobile-top",(offset + (keyboard ? 8 : 130)) + "px");
      dialog.style.setProperty("--assistant-mobile-height",Math.max(120,height - (keyboard ? 24 : 144)) + "px");
    }
    function updateToggle(active) {
      root.classList.toggle("is-active",active); dialog.classList.toggle("is-active",active);
      var action = active ? "stop" : root.dataset.sound === "blocked" ? "soundBlockedShort" : "play";
      label(play,t(action)); label(chatPlay,t(action));
    }
    function clearBlockedCue() { delete root.dataset.sound; delete dialog.dataset.sound; prompt.hidden = true; }
    function showBlockedCue() {
      prompt.textContent = t("soundBlockedShort","Tap Play to enable sound");
      prompt.dir = language().dir;
      prompt.hidden = false;
      root.dataset.promptSide = root.getBoundingClientRect().left < 260 ? "right" : "left";
      root.dataset.sound = dialog.dataset.sound = "blocked";
      updateToggle(false);
    }
    function clearHighlights() { highlights.forEach(function (item) { item.classList.remove("portfolio-guide-target"); }); highlights = []; }
    function clearTargetFollow() {
      if (followFrame) cancelAnimationFrame(followFrame);
      if (followReset) clearTimeout(followReset);
      followFrame = followReset = followUntil = 0;
      root.classList.remove("is-tracking");
    }
    function cancel() {
      generation += 1; clearTimers(); clearHighlights(); activeTimeline = null; resumeTour = null;
      currentIntroAutomatic = currentTourAutomatic = currentTourContinuation = false;
      clearBlockedCue();
      clearTargetFollow(); activeTarget = activeGesture = null;
      if (layoutFrame) cancelAnimationFrame(layoutFrame); layoutFrame = 0;
      if (!handoffInFlight) clearContinuation();
      closeGuideMenu(); delete root.dataset.cue; delete root.dataset.chapter;
      root.classList.remove("is-speaking"); updateToggle(false); root.dataset.state = "idle";
      window.scrollTo({top:window.scrollY,left:window.scrollX,behavior:"instant"});
      if (audio) { var previous = audio; audio = null; previous.pause(); previous.removeAttribute("src"); previous.load(); }
      if (utterance && synth) { utterance = null; synth.cancel(); }
    }
    function dock() {
      clearTargetFollow(); root.dataset.mode = root.dataset.mode === "launcher" ? "launcher" : "compact"; root.dataset.gesture = "rest"; root.dataset.facing = "right"; activeTarget = activeGesture = null;
      root.style.removeProperty("--guide-travel");
      var bottom = document.querySelector(".whatsapp-float") ? 90 : 24;
      var contactLauncher = page === "contact" && innerWidth < 576 && root.dataset.mode === "launcher";
      root.style.setProperty("--guide-x",(contactLauncher ? 12 : Math.max(12,innerWidth - (innerWidth < 576 ? 82 : 96))) + "px");
      root.style.setProperty("--guide-y",Math.max(90,innerHeight - (contactLauncher ? 120 : bottom + 93)) + "px");
      dialog.style.setProperty("--assistant-bottom",(bottom + 91) + "px");
    }
    function stop(remember) { if (pendingLanguageIntent) pendingLanguageIntent.interrupted = true; cancel(); if (remember) saveMuted(true); root.dataset.state = "stopped"; status.textContent = t("stopped"); dock(); }
    function hideGuide() { stop(true); closeDialog(false); root.dataset.mode = "launcher"; dock(); label(avatar,t("openAssistant","Open assistant")); }
    function clippedBounds(target) {
      if (!target || !target.isConnected || !target.getClientRects().length) return null;
      var rect = target.getBoundingClientRect();
      var visible = {left:Math.max(0,rect.left),right:Math.min(innerWidth,rect.right),top:Math.max(0,rect.top),bottom:Math.min(innerHeight,rect.bottom)};
      var ancestor = target.parentElement;
      while (ancestor && ancestor !== document.documentElement) {
        var style = getComputedStyle(ancestor);
        if (/(auto|scroll|hidden|clip)/.test(style.overflowX + " " + style.overflowY)) {
          var clip = ancestor.getBoundingClientRect();
          if (style.overflowX !== "visible") { visible.left = Math.max(visible.left,clip.left); visible.right = Math.min(visible.right,clip.right); }
          if (style.overflowY !== "visible") { visible.top = Math.max(visible.top,clip.top); visible.bottom = Math.min(visible.bottom,clip.bottom); }
        }
        ancestor = ancestor.parentElement;
      }
      if (!target.closest(".header") && innerWidth < 992) visible.top = Math.max(visible.top,document.querySelector(".header").getBoundingClientRect().bottom);
      return visible.right - visible.left >= 8 && visible.bottom - visible.top >= 8 ? visible : null;
    }
    function queueTargetFollow() {
      if (!activeTarget || root.hidden || !dialog.hidden || (window.PortfolioEntry && window.PortfolioEntry.active)) return;
      if (!followFrame) followFrame = requestAnimationFrame(function () {
        followFrame = 0;
        if (activeTarget) moveTo(activeTarget,activeGesture);
        if (followUntil > performance.now()) queueTargetFollow();
      });
    }
    function followMovingTarget(duration) {
      followUntil = Math.max(followUntil,performance.now() + duration);
      queueTargetFollow();
    }
    function alignAfterScroll() {
      if (!activeTarget) return;
      root.classList.add("is-tracking");
      if (followReset) clearTimeout(followReset);
      followReset = setTimeout(function () { root.classList.remove("is-tracking"); followReset = 0; },140);
      queueTargetFollow();
    }
    function moveTo(selector,gesture) {
      var target = selector && document.querySelector(selector); activeTarget = selector; activeGesture = gesture || "point";
      if (!target || reducedMotion.matches) { dock(); return; }
      var bounds = target.getBoundingClientRect();
      var visible = clippedBounds(target);
      if (!visible || visible.bottom - visible.top < Math.min(36,bounds.height * .65)) {
        root.dataset.mode = "compact"; root.dataset.gesture = "rest";
        root.style.setProperty("--guide-x",Math.max(12,innerWidth - (innerWidth < 576 ? 82 : 96)) + "px");
        var dockBottom = document.querySelector(".whatsapp-float") ? 90 : 24;
        root.style.setProperty("--guide-y",Math.max(90,innerHeight - dockBottom - 93) + "px");
        return;
      }
      root.dataset.mode = "expanded"; root.dataset.gesture = activeGesture;
      var main = target.closest(".main-wrapper");
      var leftLimit = main && innerWidth >= 992 ? Math.max(12,main.getBoundingClientRect().left + 8) : 12;
      var rightLimit = innerWidth - 112;
      var topClearance = Math.min(innerWidth < 992 ? 156 : 112,Math.max(46,innerHeight - 130));
      var focusY = visible.bottom - visible.top > 160 ? Math.max(visible.top + 20,Math.min(visible.bottom - 20,innerHeight * .45)) : (visible.top + visible.bottom) / 2;
      // Position from the SVG's actual raised fingertip, rather than a guessed
      // avatar-box offset. The arm rotates during speech, so scroll-following
      // recalculates this anchor on every animation frame.
      var hand = root.querySelector(".guide-avatar__hand");
      function tipOffset() {
        var tip = new DOMPoint(6,-12).matrixTransform(hand.getScreenCTM());
        var box = root.getBoundingClientRect();
        return {x:tip.x - box.left,y:tip.y - box.top};
      }
      function atSide(side) {
        root.dataset.facing = side === "right" ? "left" : "right";
        var offset = tipOffset();
        return {x:(side === "right" ? visible.right + 6 : visible.left - 6) - offset.x,offset:offset};
      }
      var side = visible.right + 100 < innerWidth ? "right" : "left";
      var placement = atSide(side);
      if ((side === "right" && placement.x > rightLimit) || (side === "left" && placement.x < leftLimit)) {
        side = side === "right" ? "left" : "right";
        placement = atSide(side);
      }
      var x = Math.max(leftLimit,Math.min(rightLimit,placement.x));
      var y = Math.max(topClearance,Math.min(innerHeight - (innerWidth < 576 ? 102 : 116),focusY - placement.offset.y));
      root.style.setProperty("--guide-x",x + "px"); root.style.setProperty("--guide-y",y + "px");
    }
    var targets = {
      generative:".ai-domain--generative", agents:".ai-domain--agents", vision:".ai-domain--vision", ml:".ai-domain--ml",
      navAbout:'.home-nav a[href$="#aboutme"]', navDelivery:'.home-nav a[href$="#delivery"]', navSkills:'.home-nav a[href$="#skills"]',
      navAchievements:'.home-nav a[href$="#achievements"]', navPublications:'.home-nav a[href$="#publications"]', navPlatforms:'.home-nav a[href$="#platforms"]',
      navTools:'.home-nav a[href$="#whatido"]', navTestimonials:'.home-nav a[href$="#testimonials"]', navFeatured:'.home-nav a[href$="#projects"]',
      navPortfolio:'.sidebar-nav a[href$="portfolio.html"]', navResume:'.sidebar-nav a[href$="resume/index.html"]', navGallery:'.sidebar-nav a[href$="gallery.html"]',
      navServices:'.sidebar-nav a[href$="services.html"], .home-nav a[href$="#services"]', navContact:'.sidebar-nav a[href$="contact.html"]',
      portfolioHero:".cta-section h1", portfolioCards:".project-cards > .isotope-item:first-child .card-title", resumeContent:".resume-wrapper", resumeDownload:"#resume-download-btn",
      serviceHero:".service-hero h1", galleryHero:".cta-section h1", galleryFirst:".photo-grid .photo-tile", projectHero:".cta-section h1",
      serviceLLM:"#llm h3", serviceRAG:"#rag h3", serviceAgents:"#agentic h3", serviceVision:"#cv h3", serviceNLP:"#nlp h3", serviceWeb:"#webdev h3", serviceResearch:"#research h3", serviceData:"#data h3", serviceDevOps:"#devops h3", serviceWhyHire:"#why-hire h2", serviceHowWork:"#how-i-work h2",
      contactName:"#contact-name", contactEmail:"#contact-email", contactSubject:"#contact-subject", contactMessage:"#contact-message", contactSend:'#contact-form button[type="submit"]'
    };
    function ensureGuideMenu() {
      if (innerWidth >= 992) return;
      var menu = document.getElementById("navigation"), button = document.querySelector(".header .navbar-toggler");
      document.body.classList.add("portfolio-guided-navigation");
      if (menu && button && !menu.classList.contains("show")) { menuOpenedByGuide = true; button.click(); }
    }
    function closeGuideMenu() {
      var menu = document.getElementById("navigation"), button = document.querySelector(".header .navbar-toggler");
      if (menuOpenedByGuide && menu && button && menu.classList.contains("show")) button.click();
      menuOpenedByGuide = false; document.body.classList.remove("portfolio-guided-navigation");
    }
    function scrollCueTarget(target,isNavigation,forceMain) {
      var behavior = reducedMotion.matches ? "instant" : "smooth";
      if (isNavigation && innerWidth >= 992) {
        var sidebar = target.closest(".header"), rect = target.getBoundingClientRect(), box = sidebar && sidebar.getBoundingClientRect();
        if (sidebar && sidebar.scrollHeight > sidebar.clientHeight + 1 && box) {
          var padding = Math.min(22,box.height * .08);
          if (rect.top < box.top + padding || rect.bottom > box.bottom - padding) {
            sidebar.scrollTo({top:sidebar.scrollTop + (rect.top + rect.bottom - box.top - box.bottom) / 2,behavior:behavior});
          }
          return;
        }
      }
      if (isNavigation) {
        target.scrollIntoView({block:"nearest",inline:"nearest",behavior:behavior});
      } else if (forceMain || !clippedBounds(target)) {
        target.scrollIntoView({block:target.getBoundingClientRect().height > innerHeight * .7 ? "start" : "center",inline:"nearest",behavior:behavior});
      }
    }
    function pointCue(cue) {
      if (root.hidden || !dialog.hidden || (window.PortfolioEntry && window.PortfolioEntry.active)) return;
      var selector = targets[cue.target], target = selector && document.querySelector(selector);
      if (!target) return;
      var changed = root.dataset.cue !== cue.target;
      if (/^nav/.test(cue.target)) {
        ensureGuideMenu();
        if (changed) scrollCueTarget(target,true,false);
      } else {
        closeGuideMenu();
        if (changed && (root.dataset.state === "tour" || (root.dataset.state === "intro" && page !== "home"))) scrollCueTarget(target,false,true);
      }
      if (changed) { clearHighlights(); target.classList.add("portfolio-guide-target"); highlights = [target]; root.dataset.cue = cue.target; }
      moveTo(selector,cue.gesture || "point");
      if (changed) followMovingTarget(1400);
    }
    function cueTimeline(text,cues,token) {
      var list = (cues || []).filter(function (cue) { return typeof cue.at === "number" && targets[cue.target]; }).slice().sort(function (a,b) { return a.at - b.at; }).map(function (cue,index,ordered) {
        var lead = index ? Math.min(.45,Math.max(0,cue.at - ordered[index - 1].at) * .4) : .45;
        return {at:cue.at,fraction:cue.fraction,target:cue.target,match:cue.match,gesture:cue.gesture,lead:lead,charIndex:typeof cue.charIndex === "number" ? cue.charIndex : cue.match ? text.indexOf(cue.match) : cue.at === 0 ? 0 : -1};
      });
      var current = -1;
      function render(index,travel) { if (token !== generation || index < 0) return; current = index; root.style.setProperty("--guide-travel",(travel || Math.max(.12,list[index].lead)) + "s"); pointCue(list[index]); }
      return {
        time:function (seconds,duration) { if (token !== generation) return; var index = -1; list.forEach(function (cue,i) { var at = cue.fraction && Number.isFinite(duration) && duration > 0 ? cue.fraction * duration : cue.at; if (seconds + cue.lead >= at) index = i; }); if (index >= 0) render(index); },
        boundary:function (offset) { if (token !== generation) return; var index = -1; list.forEach(function (cue,i) { if (cue.charIndex >= 0 && offset >= cue.charIndex) index = i; }); if (index >= 0) render(index,.18); },
        refresh:function () { render(current); }
      };
    }
    function chapter(key) {
      var catalog = window.PortfolioTour;
      return catalog && catalog[language().code] && catalog[language().code][key];
    }
    function narration(key) {
      var catalog = window.PortfolioNarration, entries = catalog && catalog[language().code];
      return entries && entries.filter(function (entry) { return entry.key === key; })[0];
    }
    function welcomeCues(text) {
      var catalog = window.PortfolioTour, value = catalog && catalog.welcomeCues && catalog.welcomeCues[language().code];
      return value && value.text === text ? value.cues : [];
    }
    function welcomeMotion() {
      if (activeTimeline) activeTimeline.refresh();
    }
    function speak(text,token,onEnd,onStart,skipRecording,timelineOptions) {
      if (!pageCopyReady()) { afterPageCopy(function () { if (token === generation) speak(text,token,onEnd,onStart,skipRecording,timelineOptions); }); return; }
      var entries = window.PortfolioNarration && window.PortfolioNarration[language().code];
      var recording = timelineOptions && timelineOptions.recording || (entries && entries.filter(function (entry) { return entry.text === text; })[0]);
      var timeline = cueTimeline(text,(timelineOptions && timelineOptions.cues) || (recording && recording.cues) || [],token);
      activeTimeline = timeline;
      function done() { if (token !== generation) return; clearTimers(); root.classList.remove("is-speaking"); updateToggle(false); audio = null; utterance = null; onEnd(); }
      function unavailable(blocked) {
        if (token !== generation) return;
        clearTimers(); root.classList.remove("is-speaking"); updateToggle(false);
        status.textContent = t(blocked ? "soundBlocked" : "voiceUnavailable");
        if (timelineOptions && timelineOptions.onUnavailable) {
          timelineOptions.onUnavailable(blocked);
          if (blocked && !root.classList.contains("is-active")) showBlockedCue();
          return;
        }
        later(function () { done(); if (blocked && !root.classList.contains("is-active")) showBlockedCue(); },1200);
      }
      if (muted()) { later(done,600); return; }
      updateToggle(true); status.textContent = text;
      if (recording && recording.src && !skipRecording) {
        var player = new Audio(); audio = player; player.preload = "none"; player.src = new URL(recording.src,siteUrl).href;
        function valid() { return token === generation && audio === player; }
        function failed(blocked) {
          if (!valid()) return;
          clearTimers(); audio = null; player.pause(); root.classList.remove("is-speaking");
          if (nativeVoice) { speak(text,token,onEnd,onStart,true,timelineOptions); return; }
          unavailable(blocked);
        }
        var started = false;
        player.onplaying = function () { if (!valid()) return; clearTimers(); root.classList.add("is-speaking"); updateToggle(true); if (!started && onStart) onStart(); started = true; timeline.time(player.currentTime || 0,player.duration); later(function () { failed(false); },Math.max(35000,text.length * 160)); };
        player.ontimeupdate = function () { if (valid()) timeline.time(player.currentTime || 0,player.duration); };
        player.onwaiting = function () { if (valid()) root.classList.remove("is-speaking"); };
        player.onended = function () { if (valid()) done(); };
        player.onerror = function () { failed(false); };
        later(function () { failed(false); },15000);
        try { var result = player.play(); if (result && result.catch) result.catch(function (error) { failed(error.name === "NotAllowedError"); }); }
        catch (error) { failed(error.name === "NotAllowedError"); }
        return;
      }
      if (!nativeVoice) { unavailable(false); return; }
      var voices = synth.getVoices().filter(function (voice) { return voice.lang.toLowerCase().split(/[-_]/)[0] === language().code; });
      voices.sort(function (a,b) { return (/natural|neural|premium/i.test(b.name) ? 10 : 0) - (/natural|neural|premium/i.test(a.name) ? 10 : 0); });
      var request = new window.SpeechSynthesisUtterance(recording && recording.spokenText || text); utterance = request;
      request.lang = voices[0] ? voices[0].lang : language().locale; if (voices[0]) request.voice = voices[0]; request.rate = .98; request.volume = 1;
      function validSpeech() { return token === generation && utterance === request; }
      request.onstart = function () { if (!validSpeech()) return; clearTimers(); root.classList.add("is-speaking"); if (onStart) onStart(); timeline.boundary(0); later(function () { if (validSpeech()) { utterance = null; synth.cancel(); unavailable(false); } },Math.max(25000,text.length * 150)); };
      request.onend = function () { if (validSpeech()) done(); };
      request.onboundary = function (event) { if (validSpeech()) timeline.boundary(event.charIndex || 0); };
      request.onerror = function (event) { if (validSpeech()) { utterance = null; unavailable(event.error === "not-allowed"); } };
      later(function () { if (validSpeech()) { utterance = null; synth.cancel(); unavailable(true); } },3500);
      try { synth.speak(request); } catch (error) { utterance = null; unavailable(false); }
    }
    function intro(manual,automaticVisit) {
      if (automaticVisit) currentIntroAutomatic = true;
      if (pendingLanguageIntent) { if (manual) { saveMuted(false); pendingLanguageIntent.interrupted = false; } if (!pendingLanguageIntent.interrupted) pendingLanguageIntent.wasActive = true; return; }
      if (!pageCopyReady()) { if (manual) saveMuted(false); root.dataset.state = "intro"; afterPageCopy(function () { intro(manual,automaticVisit); }); return; }
      if (!pageIntroReady) { if (manual) saveMuted(false); root.dataset.state = "intro"; afterPageIntro(function () { intro(manual,automaticVisit); }); return; }
      if ((page === "portfolio" || page === "resume") && !chapter(page === "portfolio" ? "portfolioPage" : "resumePage") && !coreIntroReady) {
        if (manual) saveMuted(false); root.dataset.state = "intro"; afterCoreIntro(function () { intro(manual,automaticVisit); }); return;
      }
      if (automaticVisit && !claimAutoVisit()) { currentIntroAutomatic = false; root.dataset.state = "idle"; root.dataset.mode = "launcher"; dock(); return; }
      cancel(); currentIntroAutomatic = !!automaticVisit; if (manual) saveMuted(false); lastQuestion = ""; root.hidden = !ready || (window.PortfolioEntry && window.PortfolioEntry.active); root.dataset.state = "intro"; root.dataset.mode = "compact";
      var token = generation;
      function complete(blocked) { if (token !== generation) return; cancel(); root.dataset.state = "complete"; root.dataset.mode = blocked ? "compact" : "launcher"; dock(); }
      if (page === "services") {
        var serviceHeading = document.querySelector(".service-hero h1");
        root.dataset.chapter = "serviceHero";
        speak(serviceHeading ? serviceHeading.textContent.trim() : t("tourServices"),token,complete,null,false,{cues:[{at:0,target:"serviceHero",gesture:"wave"}],onUnavailable:complete});
        return;
      }
      if (page !== "home") {
        var chapterKey = {portfolio:"portfolioPage",resume:"resumePage",contact:"contactForm"}[page];
        var recording = chapterKey ? chapter(chapterKey) || (window.PortfolioCoreIntros && window.PortfolioCoreIntros[language().code] && window.PortfolioCoreIntros[language().code][page]) : window.PortfolioPageIntros && window.PortfolioPageIntros[pageIntroKey] && window.PortfolioPageIntros[pageIntroKey][language().code];
        var cues = recording && recording.cues || (page === "gallery" ? [{at:0,target:"galleryHero",gesture:"wave"},{at:3.8,target:"galleryFirst",gesture:"point"}] : page === "project" ? [{at:0,target:"projectHero",gesture:"wave"}] : []);
        if (!recording) { recording = narration("welcome"); chapterKey = "welcome"; cues = []; }
        if (!recording) { complete(false); return; }
        root.dataset.chapter = chapterKey || pageIntroKey;
        speak(recording.text,token,complete,null,false,{recording:recording,cues:cues,onUnavailable:complete});
        return;
      }
      function navigationOverview() {
        if (token !== generation) return;
        var overview = chapter("introMap");
        if (!overview) { complete(); return; }
        root.dataset.chapter = "introMap";
        speak(overview.text,token,complete,null,false,{recording:overview,cues:overview.cues,onUnavailable:complete});
      }
      var text = t("tourWelcome"); root.dataset.chapter = "welcome";
      speak(text,token,function () { later(navigationOverview,220); },function () {
        if (!root.hidden && page === "home" && !reducedMotion.matches && dialog.hidden) moveTo(".hero-kicker","wave");
      },false,{cues:welcomeCues(text),onUnavailable:complete});
    }
    function autoStart() {
      if (muted() || document.hidden || root.hidden || root.dataset.state !== "idle") return;
      if (hasAutoVisit()) { root.dataset.mode = "launcher"; dock(); return; }
      if (page === "services") tour({automatic:true});
      else intro(false,true);
    }
    function planForPage() {
      function item(key,fallback,target,nextPage) { return {key:key,recording:chapter(key),text:fallback,target:target,nextPage:nextPage}; }
      if (page === "home") {
        return [item("introMap",null,"navPortfolio"),item("openPortfolio",t("tourProjects"),"navPortfolio","portfolio")];
      }
      if (page === "portfolio") {
        var cards = Array.from(document.querySelectorAll(".project-cards .project-card")).filter(function (card) { return card.getClientRects().length > 0; });
        var projects = cards.map(function (card) {
          var tile = card.closest(".isotope-item"), index = Array.prototype.indexOf.call(tile.parentElement.children,tile);
          var href = card.querySelector(".card-title a[href]"), slug = href && new URL(href.href).pathname.split("/").pop().replace(/\.html$/i,"");
          var key = "projectCard" + index;
          targets[key] = ".project-cards > .isotope-item:nth-child(" + (index + 1) + ") .card-title";
          return {key:"project-" + slug,recording:null,text:card.querySelector(".card-title").textContent.trim(),target:key};
        });
        var title = document.querySelector(targets.portfolioHero);
        return [{key:"portfolioPage",recording:null,text:title ? title.textContent.trim() : t("tourProjects"),target:"portfolioHero"}].concat(projects,[item("sidebarResume",t("tourResume"),"navResume","resume")]);
      }
      if (page === "resume") return chapter("resumePage") ? [item("resumePage",null,"resumeContent","services")] : [item("resumePage",t("tourResume"),"resumeContent"),item("sidebarServices",t("tourServices"),"navServices","services")];
      if (page === "services") {
        var serviceTargets = {llm:"serviceLLM",rag:"serviceRAG",agentic:"serviceAgents",cv:"serviceVision",nlp:"serviceNLP",webdev:"serviceWeb",research:"serviceResearch",data:"serviceData",devops:"serviceDevOps"};
        var heading = document.querySelector(targets.serviceHero);
        var services = [{key:"serviceHero",recording:null,text:heading ? heading.textContent.trim() : t("tourServices"),target:"serviceHero",cues:[{at:0,target:"serviceHero",gesture:"wave"}]}];
        Object.keys(serviceTargets).forEach(function (id) {
          var target = document.querySelector(targets[serviceTargets[id]]);
          services.push({key:"service-" + id,recording:null,text:target ? target.textContent.trim() : id,target:serviceTargets[id]});
        });
        function addSection(sectionId,prefix,headingTarget) {
          var section = document.getElementById(sectionId);
          if (!section) return;
          var heading = section.querySelector("h2");
          if (heading) services.push({key:"service-" + prefix,recording:null,text:heading.textContent.trim() + ".",target:headingTarget});
          Array.from(section.querySelectorAll(".row > .col-12")).forEach(function (column,index) {
            var title = column.querySelector("h5");
            if (!title) return;
            var targetKey = "service" + prefix + (index + 1);
            targets[targetKey] = "#" + sectionId + " .row > .col-12:nth-child(" + (index + 1) + ") h5";
            services.push({key:"service-" + prefix + "-" + (index + 1),recording:null,text:title.textContent.trim(),target:targetKey});
          });
        }
        addSection("why-hire","why-hire","serviceWhyHire");
        addSection("how-i-work","how-i-work","serviceHowWork");
        var contactRecording = narration("tourContact");
        services.push({key:"servicesContact",recording:contactRecording,text:contactRecording ? contactRecording.text : t("tourContact"),target:"navContact",nextPage:"contact"});
        return services;
      }
      if (page === "contact") return [item("contactForm",t("tourContact"),"contactName")];
      return [item("openPortfolio",t("tourProjects"),"navPortfolio","portfolio")];
    }
    function waitForTarget(selector,token,callback) {
      if (reducedMotion.matches || !selector) { callback(); return; }
      var began = performance.now(), previous = null, stable = 0;
      function frame(now) {
        if (token !== generation) return;
        var element = document.querySelector(selector), rect = element && element.getBoundingClientRect();
        var position = rect ? rect.top + rect.left : 0;
        stable = previous !== null && Math.abs(position - previous) < .8 ? stable + 1 : 0; previous = position;
        if ((now - began >= 180 && stable >= 3) || now - began > 1000) { layoutFrame = 0; callback(); }
        else layoutFrame = requestAnimationFrame(frame);
      }
      layoutFrame = requestAnimationFrame(frame);
    }
    function navigateTour(nextPage) {
      var paths = {portfolio:"portfolio.html",resume:"resume/index.html",services:"services.html",contact:"contact.html"};
      if (!paths[nextPage]) return;
      try {
        sessionStorage.setItem(tourStorageKey,JSON.stringify({version:2,page:nextPage,language:locale.getLanguage(),expires:Date.now() + 120000}));
        handoffInFlight = true; window.location.assign(new URL(paths[nextPage],siteUrl).href);
      } catch (_) {
        root.dataset.state = "tour-paused"; updateToggle(false); status.textContent = t("soundBlocked");
        resumeTour = function () { navigateTour(nextPage); };
      }
    }
    function tour(options) {
      options = {automatic:!!(options && options.automatic),continuation:!!(options && options.continuation)};
      if (pendingLanguageIntent) { saveMuted(false); pendingLanguageIntent.wasTour = true; pendingLanguageIntent.wasActive = true; pendingLanguageIntent.interrupted = false; return; }
      currentTourAutomatic = options.automatic; currentTourContinuation = options.continuation;
      if (!pageCopyReady()) { saveMuted(false); root.dataset.state = "tour"; afterPageCopy(function () { tour(options); }); return; }
      if (options.automatic) rememberAutoVisit();
      if (options.continuation) rememberAutoVisit();
      closeDialog(false); cancel(); saveMuted(false); currentTourAutomatic = options.automatic; currentTourContinuation = options.continuation; root.hidden = !ready; root.dataset.state = "tour"; root.dataset.mode = "compact";
      var steps = planForPage().filter(function (step) { return !options.automatic || !step.nextPage; }), token = generation;
      function step(index) {
        if (token !== generation) return;
        if (index >= steps.length) {
          cancel(); root.dataset.state = "complete"; root.dataset.mode = "launcher"; dock(); return;
        }
        var item = steps[index], selector = targets[item.target], target = selector && document.querySelector(selector);
        root.dataset.state = "tour"; root.dataset.chapter = item.key; delete root.dataset.cue; clearHighlights(); updateToggle(true);
        if (/^nav/.test(item.target)) ensureGuideMenu(); else closeGuideMenu();
        if (target) scrollCueTarget(target,/^nav/.test(item.target),true);
        waitForTarget(selector,token,function () {
          if (token !== generation) return;
          moveTo(selector,"wave");
          var recording = item.recording, text = recording ? recording.text : item.text;
          var cues = item.cues || (recording && recording.cues && recording.cues.length ? recording.cues : [{at:0,target:item.target}]);
          speak(text,token,function () {
            if (token !== generation) return;
            if (item.nextPage) { navigateTour(item.nextPage); return; }
            later(function () { step(index + 1); },240);
          },null,false,{recording:recording,cues:cues,onUnavailable:function () {
            if (token !== generation) return;
            root.dataset.state = "tour-paused"; root.classList.remove("is-speaking"); updateToggle(false);
            resumeTour = function () { step(index); };
          }});
        });
      }
      step(0);
    }

    function answerFor(question) { return locale.answer(/^cv$/i.test(question.trim()) ? "computer vision" : question); }
    function renderConversation() {
      conversation.replaceChildren();
      history.forEach(function (item) {
        var user = document.createElement("p"); user.className = "portfolio-assistant__message portfolio-assistant__message--user"; user.dir = "auto"; user.textContent = item.display || item.question;
        var answer = answerFor(item.question); var reply = document.createElement("article"); reply.className = "portfolio-assistant__message portfolio-assistant__message--answer";
        var text = document.createElement("p"); text.textContent = answer.text; reply.appendChild(text);
        if (answer.note) { var note = document.createElement("p"); note.className = "portfolio-assistant__qualification"; note.textContent = answer.note; reply.appendChild(note); }
        var sources = document.createElement("div"); sources.className = "portfolio-assistant__sources";
        (answer.links || []).forEach(function (source) { var link = document.createElement("a"); link.href = new URL(source.href,siteUrl).href; link.textContent = source.label; sources.appendChild(link); });
        reply.appendChild(sources); conversation.append(user,reply);
      });
      conversation.scrollTop = conversation.scrollHeight;
    }
    function answer(question,remember,display) {
      cancel(); if (remember) { history.push({question:question,display:display}); if (history.length > 8) history.shift(); }
      lastQuestion = question; renderConversation(); root.hidden = false; root.dataset.mode = "compact"; root.dataset.state = "answer"; root.dataset.gesture = "wave";
      var response = answerFor(question); var token = generation;
      function complete(blocked) { if (token === generation) { cancel(); root.dataset.state = "complete"; root.dataset.mode = blocked ? "compact" : "launcher"; dock(); } }
      speak(response.text,token,complete,null,false,{onUnavailable:complete});
    }
    function openDialog() {
      stop(false); root.hidden = false; dialog.hidden = false; root.classList.add("is-chat-open"); avatar.setAttribute("aria-expanded","true");
      label(avatar,t("closeAssistant","Close assistant")); fitWindow(); input.focus({preventScroll:true});
      ensureKnowledge(renderConversation);
    }
    function closeDialog(focus) {
      dialog.hidden = true; root.classList.remove("is-chat-open"); avatar.setAttribute("aria-expanded","false"); label(avatar,t("openAssistant","Open assistant")); if (focus) avatar.focus({preventScroll:true});
    }
    function labels() {
      var lang = language(); root.lang = lang.code; root.dir = "ltr"; dialog.lang = lang.code; dialog.dir = lang.dir;
      label(avatar,t(dialog.hidden ? "openAssistant" : "closeAssistant",dialog.hidden ? "Open assistant" : "Close assistant"));
      var playbackLabel = root.classList.contains("is-active") ? "stop" : root.dataset.sound === "blocked" ? "soundBlockedShort" : "play";
      label(play,t(playbackLabel)); label(chatPlay,t(playbackLabel)); label(hide,t("hide")); label(close,t("closeAssistant","Close assistant"));
      if (!prompt.hidden) { prompt.textContent = t("soundBlockedShort","Tap Play to enable sound"); prompt.dir = lang.dir; }
      dialog.querySelector("h2").textContent = t("assistant","Portfolio assistant"); dialog.querySelector(".portfolio-assistant__greeting").textContent = t("help");
      dialog.querySelector(".portfolio-assistant__note").textContent = t("assistantNote"); input.placeholder = t("questionPlaceholder");
      dialog.querySelector('label[for="portfolio-assistant-question"]').textContent = t("questionPlaceholder"); label(dialog.querySelector(".portfolio-assistant__send"),t("send"));
      dialog.querySelector('[data-assistant-topic="agentic"]').textContent = t("agents"); dialog.querySelector('[data-assistant-topic="cv"]').textContent = t("vision"); dialog.querySelector('[data-assistant-topic="contact"]').textContent = t("contact");
      tourButton.textContent = t("showMeAround","Show me around");
      dialog.querySelector(".portfolio-assistant__language span").textContent = lang.name;
      label(dialog.querySelector(".portfolio-assistant__language"),t("language"));
    }
    avatar.addEventListener("click",function () { if (dialog.hidden) openDialog(); else { stop(false); closeDialog(true); } });
    function togglePlayback() { if (root.classList.contains("is-active")) stop(true); else { clearBlockedCue(); saveMuted(false); if (resumeTour) { var resume = resumeTour; resumeTour = null; resume(); } else if (lastQuestion && !dialog.hidden) answer(lastQuestion,false); else intro(true); } }
    play.addEventListener("click",togglePlayback); chatPlay.addEventListener("click",togglePlayback);
    hide.addEventListener("click",hideGuide);
    close.addEventListener("click",function () { stop(false); closeDialog(true); });
    dialog.querySelector("form").addEventListener("submit",function (event) { event.preventDefault(); var question = input.value.trim(); if (!question) return; input.value = ""; ensureKnowledge(function () { answer(question,true); input.focus({preventScroll:true}); }); });
    dialog.querySelectorAll("[data-assistant-topic]").forEach(function (button) { button.addEventListener("click",function () { answer(button.dataset.assistantTopic,true,button.textContent.trim()); }); });
    tourButton.addEventListener("click",tour);
    dialog.querySelector(".portfolio-assistant__language").addEventListener("click",function () { if (window.PortfolioControls) window.PortfolioControls.openLanguagePicker(); });
    document.addEventListener("portfolio:languagechanging",function () {
      if (!pendingLanguageIntent) pendingLanguageIntent = {wasActive:root.classList.contains("is-active") || root.dataset.state === "intro",wasIntroAutomatic:currentIntroAutomatic,wasTour:root.dataset.state === "tour" || root.dataset.state === "tour-paused",wasAutomatic:currentTourAutomatic,wasContinuation:currentTourContinuation,interrupted:false};
      continuation = null; cancel();
    });
    document.addEventListener("portfolio:language",function () {
      var intent = pendingLanguageIntent || {wasActive:root.classList.contains("is-active") || root.dataset.state === "intro",wasIntroAutomatic:currentIntroAutomatic,wasTour:root.dataset.state === "tour" || root.dataset.state === "tour-paused",wasAutomatic:currentTourAutomatic,wasContinuation:currentTourContinuation,interrupted:false};
      pendingLanguageIntent = null; continuation = null; cancel(); labels(); renderConversation();
      if (!dialog.hidden) ensureKnowledge(renderConversation);
      if (window.PortfolioEntry && window.PortfolioEntry.active) return;
      if (intent.interrupted) return;
      if (lastQuestion && !dialog.hidden && !muted()) answer(lastQuestion,false);
      else if (intent.wasTour && !muted()) tour({automatic:intent.wasAutomatic,continuation:intent.wasContinuation});
      else if (intent.wasActive && !muted()) intro(false,intent.wasIntroAutomatic && !hasAutoVisit());
    });
    document.addEventListener("portfolio:pagetranslated",function () {
      if (ready && pageCopyReady() && !pendingLanguageIntent && root.dataset.state === "idle" && !muted() && !document.hidden && !(window.PortfolioEntry && window.PortfolioEntry.active)) autoStart();
    });
    document.addEventListener("portfolio:entering",function (event) {
      entering = true;
      deferredAutomaticHomeIntro = false;
      if (event.detail && event.detail.skipNarration) { stop(false); root.dataset.mode = "launcher"; dock(); }
      else if (page === "home" && event.detail && event.detail.automatic) deferredAutomaticHomeIntro = !hasAutoVisit();
      else if (!muted() && !hasAutoVisit()) intro(true,true);
    });
    document.addEventListener("portfolio:entered",function () {
      root.hidden = !ready;
      if (entering && root.dataset.state === "stopped" && !hasAutoVisit()) rememberAutoVisit();
      if (deferredAutomaticHomeIntro) { deferredAutomaticHomeIntro = false; if (!muted()) autoStart(); }
      else if (entering && root.dataset.state === "intro" && root.classList.contains("is-speaking")) welcomeMotion(generation);
      else if (!entering && !muted()) autoStart();
      else if ((muted() || hasAutoVisit()) && (root.dataset.state === "idle" || root.dataset.state === "stopped")) { root.dataset.mode = "launcher"; dock(); }
      entering = false;
    });
    function manualControl(event) {
      if (root.contains(event.target) || dialog.contains(event.target) || (event.target.closest && event.target.closest(".portfolio-language-picker"))) return;
      if (event.target.closest && event.target.closest(".header .navbar-toggler,.header #navigation,.mobile-menu-backdrop")) menuOpenedByGuide = false;
      if (continuation || root.dataset.state === "intro" || root.dataset.state === "tour" || root.dataset.state === "tour-paused") { continuation = null; stop(true); }
    }
    window.addEventListener("wheel",manualControl,{passive:true}); window.addEventListener("touchstart",manualControl,{passive:true});
    document.addEventListener("pointerdown",function (event) { if (!(window.PortfolioEntry && window.PortfolioEntry.active)) manualControl(event); },{passive:true});
    document.addEventListener("keydown",function (event) {
      if (event.defaultPrevented || (event.target.closest && event.target.closest(".portfolio-language-picker"))) return;
      if (event.key === "Escape" && !dialog.hidden) { stop(false); closeDialog(true); }
      else if (event.key === "Escape" && (root.classList.contains("is-active") || root.dataset.state === "tour-paused")) stop(true);
      else if (["ArrowDown","ArrowUp","PageDown","PageUp","Home","End"," "].indexOf(event.key) >= 0 && !/INPUT|TEXTAREA|BUTTON/.test(event.target.tagName)) manualControl(event);
    });
    document.addEventListener("visibilitychange",function () {
      if (document.hidden) {
        restartAfterVisibility = !muted() && (root.dataset.state === "intro" || root.dataset.state === "tour") ? {type:root.dataset.state,introAutomatic:currentIntroAutomatic,tourAutomatic:currentTourAutomatic,tourContinuation:currentTourContinuation} : null;
        if (restartAfterVisibility) stop(false);
      } else if (!muted() && ready && !root.hidden) {
        var interrupted = restartAfterVisibility;
        restartAfterVisibility = null;
        if (interrupted) later(function () {
          if (document.hidden || muted() || root.hidden) return;
          if (interrupted.type === "tour") tour({automatic:interrupted.tourAutomatic,continuation:interrupted.tourContinuation});
          else intro(false,interrupted.introAutomatic && !hasAutoVisit());
        },250);
        else if (root.dataset.state === "idle") later(autoStart,250);
      }
    });
    window.addEventListener("pagehide",cancel); window.addEventListener("beforeprint",function () { stop(false); closeDialog(false); });
    window.addEventListener("pageshow",function (event) {
      if (!event.persisted) return;
      restartAfterVisibility = null;
      handoffInFlight = false; continuation = null; clearContinuation();
      if (root.dataset.state === "intro" || root.dataset.state === "tour") return;
      cancel(); saveMuted(false);
      root.hidden = !ready || !!(window.PortfolioEntry && window.PortfolioEntry.active);
      if (!root.hidden && !document.hidden) later(autoStart,450);
    });
    window.addEventListener("scroll",alignAfterScroll,{passive:true,capture:true});
    window.addEventListener("resize",function () { if (activeTarget) queueTargetFollow(); else dock(); if (!dialog.hidden) fitWindow(); });
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize",function () { queueTargetFollow(); if (!dialog.hidden) fitWindow(); });
      window.visualViewport.addEventListener("scroll",queueTargetFollow,{passive:true});
    }
    if (reducedMotion.addEventListener) reducedMotion.addEventListener("change",function () { stop(false); });
    labels(); dock(); document.body.append(root,dialog);
    window.PortfolioGuide = {openAssistant:openDialog,startIntro:function () { intro(true); },startTour:tour,stop:function () { stop(true); }};
    var stylesheet = document.createElement("link"); stylesheet.rel = "stylesheet"; stylesheet.href = new URL("../css/portfolio-guide.css?v=14",scriptUrl).href;
    stylesheet.onload = function () {
      ready = true; root.hidden = !!(window.PortfolioEntry && window.PortfolioEntry.active);
      if (continuation) { continuation = null; tour({continuation:true}); }
      else if (!root.hidden && root.dataset.state === "intro" && root.classList.contains("is-speaking")) welcomeMotion(generation);
      else if (!root.hidden && root.dataset.state === "idle" && !muted() && !document.hidden) later(autoStart,450);
      else if (!root.hidden && muted()) { root.dataset.mode = "launcher"; dock(); }
    };
    document.head.appendChild(stylesheet);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",initializeGuide,{once:true});
  else initializeGuide();
})();
