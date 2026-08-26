document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var progress = document.createElement("div");
  progress.className = "scroll-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.appendChild(progress);

  function updateProgress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = "scaleX(" + (max ? window.scrollY / max : 0) + ")";
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  var projectVisuals = [
    '<div class="project-visual visual-vision" role="img" aria-label="Animated warehouse safety detection interface"><div class="visual-top"><span>VISIONGUARD / LIVE</span><b>RISK 28</b></div><div class="vision-zone"></div><i class="vision-person"></i><i class="vision-forklift"></i><i class="vision-beam"></i><div class="visual-footer"><span>YOLO</span><span>TRACKING</span><span>TTC</span></div></div>',
    '<div class="project-visual visual-neuro" role="img" aria-label="Animated neuroimaging intelligence network"><div class="visual-top"><span>NEURO / MRI</span><b>CASE 042</b></div><div class="brain-core"><i></i><i></i><i></i><i></i><strong>3D</strong></div><div class="neuro-wave"></div><div class="visual-footer"><span>RAG</span><span>XAI</span><span>BIOMARKERS</span></div></div>',
    '<div class="project-visual visual-flood" role="img" aria-label="Animated flood prediction analytics"><div class="visual-top"><span>FLOOD / FORECAST</span><b>LIVE MODEL</b></div><div class="flood-chart"><i></i><i></i><i></i><i></i><i></i><i></i><span></span></div><div class="flood-metric"><strong>0.97</strong><small>MODEL SCORE</small></div><div class="visual-footer"><span>LIGHTGBM</span><span>REGRESSION</span></div></div>',
    '<div class="project-visual visual-attendance" role="img" aria-label="Animated workforce attendance dashboard"><div class="visual-top"><span>WORKFORCE / OPS</span><b>SYNCED</b></div><div class="attendance-ring"><strong>92%</strong><small>PRESENT</small></div><div class="attendance-list"><i></i><i></i><i></i><i></i></div><div class="visual-footer"><span>FLUTTER</span><span>NODE</span><span>HR</span></div></div>',
    '<div class="project-visual visual-drone" role="img" aria-label="Animated autonomous drone route simulation"><div class="visual-top"><span>AERONAV / SIM</span><b>AUTONOMOUS</b></div><div class="drone-map"><span class="route-one"></span><span class="route-two"></span><i class="drone-marker">✦</i><b></b><em></em></div><div class="visual-footer"><span>A*</span><span>PID</span><span>MULTI-UAV</span></div></div>',
    '<div class="project-visual visual-painter" role="img" aria-label="Animated gesture-controlled painting canvas"><div class="visual-top"><span>GESTURE / CANVAS</span><b>TRACKING</b></div><div class="paint-canvas"><span></span><span></span><span></span><i></i></div><div class="gesture-hand"><b></b><b></b><b></b></div><div class="visual-footer"><span>MEDIAPIPE</span><span>OPENCV</span></div></div>',
    '<div class="project-visual visual-rul" role="img" aria-label="Animated turbofan engine health gauge"><div class="visual-top"><span>ENGINE / HEALTH</span><b>UNIT 07</b></div><div class="rul-gauge"><i class="rul-needle"></i><strong>62%</strong><small>RUL EST</small></div><div class="rul-wave"></div><div class="visual-footer"><span>RANDOM FOREST</span><span>XGBOOST</span><span>LIGHTGBM</span></div></div>',
    '<div class="project-visual visual-cybersec" role="img" aria-label="Animated AI security analytics radar and threat shield"><div class="visual-top"><span>SECOPS / AGENT</span><b>ACTIVE</b></div><div class="sec-stage"><div class="sec-radar"><i class="sec-sweep"></i><i class="sec-blip b1"></i><i class="sec-blip b2"></i></div><div class="sec-shield"><strong>AI</strong></div></div><div class="visual-footer"><span>MULTI-AGENT</span><span>RAG</span><span>CVE TRIAGE</span></div></div>',
    '<div class="project-visual visual-rag" role="img" aria-label="Animated retrieval augmented generation knowledge hub"><div class="visual-top"><span>SUPPORT / RAG</span><b>READY</b></div><div class="rag-query">query: resolve technical support ticket</div><div class="rag-hub"><strong>RAG</strong><small>RETRIEVE&#8594;ANSWER</small></div><span class="rag-doc d1">DOCS</span><span class="rag-doc d2">KB</span><span class="rag-doc d3">FAQ</span><i class="rag-link l1"></i><i class="rag-link l2"></i><i class="rag-link l3"></i><i class="rag-packet p1"></i><i class="rag-packet p2"></i><i class="rag-packet p3"></i><div class="visual-footer"><span>LLM</span><span>RETRIEVAL</span><span>CITED</span></div></div>',
    '<div class="project-visual visual-intrusion" role="img" aria-label="Animated network intrusion detection graph"><div class="visual-top"><span>NETWORK / IDS</span><b>ALERT</b></div><div class="net-graph"><i class="net-node g1"></i><i class="net-node g2"></i><i class="net-node g3"></i><i class="net-node g4"></i><span class="net-link k1"></span><span class="net-link k2"></span><span class="net-link k3"></span><em class="net-alert"></em></div><div class="visual-footer"><span>TABNET</span><span>TRANSFORMER</span><span>CIC-IDS</span></div></div>',
    '<div class="project-visual visual-mobibrain" role="img" aria-label="Animated 3D multi-plane MRI brain scan"><div class="visual-top"><span>RESEARCH / 3D-CNN</span><b>97.33%</b></div><div class="brain-planes"><i class="plane p1"></i><i class="plane p2"></i><i class="plane p3"></i></div><div class="visual-footer"><span>AXIAL</span><span>SAGITTAL</span><span>CORONAL</span></div></div>',
    '<div class="project-visual visual-ticket" role="img" aria-label="Animated ticket queue with bot detection blocking"><div class="visual-top"><span>TICKETS / QUEUE</span><b>GUARDED</b></div><div class="ticket-queue"><i class="ticket-row t1"></i><i class="ticket-row t2 blocked"></i><i class="ticket-row t3"></i><i class="ticket-row t4"></i></div><div class="visual-footer"><span>ANOMALY DETECT</span><span>DYNAMIC PRICING</span></div></div>',
    '<div class="project-visual visual-timetable" role="img" aria-label="Animated auto-generated class timetable grid"><div class="visual-top"><span>SCHEDULER / DJANGO</span><b>AUTO-FILL</b></div><div class="timetable-grid"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="visual-footer"><span>CONSTRAINTS</span><span>FACULTY</span><span>ROOMS</span></div></div>',
    '<div class="project-visual visual-agentflow" role="img" aria-label="Animated LinkedIn automation workflow orchestration"><div class="visual-top"><span>AUTOMATION / BOT</span><b>RUNNING</b></div><div class="agent-stage"><span class="agent-node node-input">PROFILE<small>SCRAPE</small></span><span class="agent-node node-plan">FILTER<small>RULES</small></span><span class="agent-node node-memory">QUEUE<small>TARGETS</small></span><span class="agent-node node-action">CONNECT<small>REQUEST</small></span><span class="agent-core">BOT</span><i class="agent-link k1"></i><i class="agent-link k2"></i><i class="agent-link k3"></i><i class="agent-link k4"></i><i class="agent-dot g1"></i><i class="agent-dot g2"></i><i class="agent-dot g3"></i><i class="agent-dot g4"></i></div><div class="visual-footer"><span>SELENIUM</span><span>BEAUTIFULSOUP</span></div></div>',
    '<div class="project-visual visual-agentflow" role="img" aria-label="Animated satellite classification pipeline orchestration"><div class="visual-top"><span>EUROSAT / RESNET18</span><b>CLASSIFYING</b></div><div class="agent-stage"><span class="agent-node node-input">TILE<small>IMAGE</small></span><span class="agent-node node-plan">MODEL<small>RESNET18</small></span><span class="agent-node node-memory">FEATURES<small>MAPS</small></span><span class="agent-node node-action">CLASS<small>LABEL</small></span><span class="agent-core">Agents</span><i class="agent-link k1"></i><i class="agent-link k2"></i><i class="agent-link k3"></i><i class="agent-link k4"></i><i class="agent-dot g1"></i><i class="agent-dot g2"></i><i class="agent-dot g3"></i><i class="agent-dot g4"></i></div><div class="visual-footer"><span>TRANSFER LEARNING</span><span>ROC / CM</span></div></div>'
  ];

  function escapeVisualText(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function buildPortfolioVisual(project, index) {
    var titleNode = project.querySelector(".card-title");
    var techNode = project.querySelector(".card-text small");
    var title = titleNode ? titleNode.textContent.trim() : "AI System";
    var shortTitle = title.toUpperCase().replace(/[^A-Z0-9 ]/g, " ").replace(/\s+/g, " ").slice(0, 22);
    var tags = techNode ? techNode.textContent.split(/\||\//).map(function (tag) { return tag.trim(); }).filter(Boolean).slice(0, 3) : [];
    if (!tags.length) tags = ["AI", "SYSTEM", "LIVE"];
    var footer = tags.map(function (tag) { return "<span>" + escapeVisualText(tag.slice(0, 12)) + "</span>"; }).join("");
    var mode = index % 4;
    var score = 91 + (index % 8);

    return '<div class="project-visual portfolio-live-visual live-mode-' + mode + '" role="img" aria-label="Animated system view for ' + escapeVisualText(title) + '">' +
      '<div class="visual-top"><span>' + escapeVisualText(shortTitle || "AI SYSTEM") + '</span><b>CASE ' + String(index + 1).padStart(2, "0") + '</b></div>' +
      '<div class="portfolio-live-stage"><i></i><i></i><i></i><i></i><i></i><span class="live-path path-a"></span><span class="live-path path-b"></span><strong>' + score + '%</strong><small>SYSTEM READY</small></div>' +
      '<div class="visual-footer">' + footer + '</div></div>';
  }

  // Note: the homepage #projects grid now ships its own hardcoded
  // .live-project-viz markup directly in the HTML, so it no longer needs
  // (and must not receive) the older auto-injected .project-visual here —
  // doing so would overwrite the richer hand-built visuals and prune cards.

  document.querySelectorAll(".projects-list .isotope-item").forEach(function (project, index) {
    project.classList.add("portfolio-system-card");
    project.style.setProperty("--portfolio-index", index + 1);
    var imageHolder = project.querySelector(".card-img-holder");
    if (imageHolder) imageHolder.innerHTML = index < projectVisuals.length ? projectVisuals[index] : buildPortfolioVisual(project, index);
    var card = project.querySelector(".project-card");
    if (card) card.insertAdjacentHTML("afterbegin", '<span class="portfolio-project-no">' + String(index + 1).padStart(2, "0") + '</span>');
  });

  // The hero (first section, always above the fold on load) is excluded from
  // the scroll-reveal system below — it should be visible immediately, not
  // fade in on a delay like content the user has to scroll to reach.
  var heroSection = document.querySelector(".about-me-section");
  if (heroSection) heroSection.classList.add("is-visible");

  var revealTargets = Array.prototype.filter.call(
    document.querySelectorAll("section, .project-card, .service-card, .publication-item, .resume-wrapper, .workflow-step, .benefit-card, .system-node, .systems-map__core"),
    function (el) { return el !== heroSection; }
  );
  revealTargets.forEach(function (target, index) {
    target.classList.add("motion-reveal");
    target.style.setProperty("--reveal-delay", Math.min(index % 6, 5) * 35 + "ms");
  });

  if ("IntersectionObserver" in window && !reduceMotion) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0, rootMargin: "0px 0px 250px" });
    revealTargets.forEach(function (target) { observer.observe(target); });
  } else {
    revealTargets.forEach(function (target) { target.classList.add("is-visible"); });
  }

  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".project-card, .service-card, .platform-card, .publication-item").forEach(function (card) {
      card.classList.add("interactive-card");
      card.addEventListener("pointermove", function (event) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty("--pointer-x", event.clientX - rect.left + "px");
        card.style.setProperty("--pointer-y", event.clientY - rect.top + "px");
        card.style.setProperty("--tilt-x", ((event.clientY - rect.top) / rect.height - 0.5) * -4 + "deg");
        card.style.setProperty("--tilt-y", ((event.clientX - rect.left) / rect.width - 0.5) * 4 + "deg");
      });
      card.addEventListener("pointerleave", function () {
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
      });
    });
  }

  var systemMap = document.querySelector("[data-system-map]");
  if (systemMap) {
    var mapStage = systemMap.querySelector(".systems-map__stage");
    var routeLabel = systemMap.querySelector("[data-route-label]");
    var routeCopy = {
      llm: "Core → retrieval → generation",
      backend: "Client → API → services → AI",
      vision: "Input → detection → inference → API",
      research: "Data → training → evaluation → core"
    };

    if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
      systemMap.addEventListener("pointermove", function (event) {
        var rect = systemMap.getBoundingClientRect();
        var x = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
        var y = ((event.clientY - rect.top) / rect.height - 0.5) * 6;
        systemMap.style.setProperty("--map-x", x.toFixed(2) + "px");
        systemMap.style.setProperty("--map-y", y.toFixed(2) + "px");
      });
      systemMap.addEventListener("pointerleave", function () {
        systemMap.style.setProperty("--map-x", "0px");
        systemMap.style.setProperty("--map-y", "0px");
      });
    }

    systemMap.querySelectorAll("[data-map-route]").forEach(function (node) {
      var route = node.getAttribute("data-map-route");
      node.addEventListener("pointerenter", function () {
        mapStage.classList.add("is-route-focused", "route-" + route);
        node.classList.add("is-active");
        if (routeLabel) routeLabel.textContent = routeCopy[route] || "Core · system active";
      });
      node.addEventListener("pointerleave", function () {
        mapStage.classList.remove("is-route-focused", "route-" + route);
        node.classList.remove("is-active");
        if (routeLabel) routeLabel.textContent = "Core · all systems operational";
      });
    });

    var counters = systemMap.querySelectorAll("[data-map-count]");
    function runMapCounters() {
      counters.forEach(function (counter) {
        var target = Number(counter.getAttribute("data-map-count")) || 0;
        var start = performance.now();
        function tick(now) {
          var progressValue = Math.min((now - start) / 850, 1);
          counter.textContent = String(Math.round(target * progressValue)).padStart(2, "0");
          if (progressValue < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }

    if (reduceMotion || !("IntersectionObserver" in window)) runMapCounters();
    else {
      var mapCounterObserver = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        runMapCounters();
        mapCounterObserver.disconnect();
      }, { threshold: 0.35 });
      mapCounterObserver.observe(systemMap);
    }
  }
});
