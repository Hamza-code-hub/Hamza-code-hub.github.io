/* Shared scroll-driven animation for project case-study pages:
   AOS init, animated stat counters (.stat-number[data-count]) and
   animated progress bars (.progress-row[data-value]). */
document.addEventListener("DOMContentLoaded", function () {
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var projectPage = document.querySelector(".project");
  if (projectPage) document.body.classList.add("project-detail-page");

  var caseHero = document.querySelector(".project .container") ? document.querySelector(".cta-section .container") : null;
  if (caseHero && !caseHero.querySelector(".case-hero-visual")) {
    caseHero.classList.add("case-hero-container");
    var projectName = (caseHero.querySelector(".heading") || {}).textContent || "AI System";
    var projectSlug = (window.location.pathname.split("/").pop() || "").replace(/\.html$/i, "");
    var projectFlows = {
      "visionguard-ai": ["VIDEO FEED", "YOLO + TRACK", "RISK ENGINE", "EVENT EVIDENCE"],
      "neuroinsight-ai": ["3D MRI", "BRAIN MODEL", "XAI + RAG", "CLINICAL INSIGHT"],
      "flood-prediction-lightgbm": ["ENVIRONMENT DATA", "FEATURE PIPELINE", "LIGHTGBM", "FLOOD FORECAST"],
      "attendance-management-system": ["USER + SHIFT", "LIVE SYNC", "RULES ENGINE", "HR REPORTS"],
      "drone-flight-simulation": ["MISSION", "A* PLANNER", "PID CONTROL", "FLIGHT TELEMETRY"],
      "ai-virtual-painter": ["HAND LANDMARKS", "GESTURE LOGIC", "BRUSH ENGINE", "LIVE CANVAS"],
      "satellite-image-classification": ["SATELLITE TILE", "PREPROCESS", "VISION MODEL", "LAND CLASS"],
      "aircraft-engine-rul-prediction": ["SENSOR STREAM", "HEALTH FEATURES", "RUL MODEL", "MAINTENANCE"],
      "ai-ticket-scalping-prevention": ["TICKET EVENT", "BEHAVIOR SIGNALS", "RISK SCORE", "FAIR ACCESS"],
      "ai-intrusion-detection": ["NETWORK FLOW", "FEATURE ENGINE", "THREAT MODEL", "SECURITY ALERT"],
      "agentic-rag-support-assistant": ["USER QUERY", "AGENT ROUTER", "RAG RETRIEVAL", "CITED ANSWER"],
      "agentic-cybersecurity-ai-assistant": ["SECURITY EVENT", "AGENT ANALYSIS", "THREAT CONTEXT", "RESPONSE PLAN"],
      "3d-mobibrainnet": ["VOLUMETRIC MRI", "3D CNN", "CLASSIFICATION", "RESEARCH RESULT"],
      "linkedin-automation-bot": ["CONTENT INPUT", "AI PLANNER", "AUTOMATION", "PUBLISH + TRACK"],
      "university-timetable-system": ["COURSE DATA", "CONSTRAINTS", "SCHEDULER", "TIMETABLE"]
    };
    var flow = projectFlows[projectSlug] || ["INPUT", "INTELLIGENCE", "DECISION", "OUTPUT"];
    caseHero.insertAdjacentHTML("beforeend",
      '<div class="case-hero-visual" role="img" aria-label="Animated architecture flow for ' + projectName.replace(/"/g, "") + '">' +
        '<div class="case-flow-grid"></div><span class="case-scan"></span>' +
        '<span class="case-hero-glow glow-one"></span><span class="case-hero-glow glow-two"></span>' +
        '<span class="case-corner corner-one"></span><span class="case-corner corner-two"></span>' +
        '<div class="case-flow-node node-input"><i class="fas fa-database"></i><b>' + flow[0] + '</b><small>source stage</small></div>' +
        '<div class="case-flow-node node-model"><i class="fas fa-brain"></i><b>' + flow[1] + '</b><small>processing stage</small></div>' +
        '<div class="case-flow-node node-decision"><i class="fas fa-project-diagram"></i><b>' + flow[2] + '</b><small>intelligence stage</small></div>' +
        '<div class="case-flow-node node-output"><i class="fas fa-bolt"></i><b>' + flow[3] + '</b><small>delivery stage</small></div>' +
        '<div class="case-flow-line line-one"><i></i></div><div class="case-flow-line line-two"><i></i></div><div class="case-flow-line line-three"><i></i></div>' +
        '<div class="case-flow-status"><span></span> LIVE ARCHITECTURE / ' + projectName.toUpperCase() + '</div>' +
      '</div>');
  }

  /* Turn ordinary screenshots into animated product-view panels without
     requiring bespoke markup in every case-study file. */
  if (projectPage) {
    projectPage.querySelectorAll(".gallery > img").forEach(function (img, index) {
      var shot = document.createElement("figure");
      shot.className = "project-shot";
      shot.style.setProperty("--shot-index", index);
      Array.from(img.attributes).forEach(function (attribute) {
        if (attribute.name.indexOf("data-aos") !== 0) return;
        shot.setAttribute(attribute.name, attribute.value);
        img.removeAttribute(attribute.name);
      });
      img.parentNode.insertBefore(shot, img);
      shot.appendChild(img);
      var label = document.createElement("figcaption");
      label.innerHTML = '<span>PROJECT VIEW</span><b>' + String(index + 1).padStart(2, "0") + '</b>';
      shot.appendChild(label);
    });

    projectPage.querySelectorAll(".project-sections > .project-section").forEach(function (section, index) {
      section.setAttribute("data-section-index", String(index + 1).padStart(2, "0"));
    });

    if (!reduceMotion) {
      projectPage.querySelectorAll(".project-section, .benefit-card, .workflow-step, .case-flow-node").forEach(function (card) {
        card.classList.add("project-reactive");
        card.addEventListener("pointermove", function (event) {
          var rect = card.getBoundingClientRect();
          var x = ((event.clientX - rect.left) / rect.width) * 100;
          var y = ((event.clientY - rect.top) / rect.height) * 100;
          card.style.setProperty("--pointer-x", x + "%");
          card.style.setProperty("--pointer-y", y + "%");
          if (card.classList.contains("benefit-card") || card.classList.contains("workflow-step")) {
            card.style.setProperty("--card-rx", ((50 - y) / 16).toFixed(2) + "deg");
            card.style.setProperty("--card-ry", ((x - 50) / 18).toFixed(2) + "deg");
          }
        });
        card.addEventListener("pointerleave", function () {
          card.style.removeProperty("--card-rx");
          card.style.removeProperty("--card-ry");
        });
      });

      projectPage.querySelectorAll(".project-shot").forEach(function (shot) {
        shot.addEventListener("pointermove", function (event) {
          var rect = shot.getBoundingClientRect();
          var x = (event.clientX - rect.left) / rect.width - 0.5;
          var y = (event.clientY - rect.top) / rect.height - 0.5;
          shot.style.setProperty("--shot-x", (x * 9).toFixed(2) + "px");
          shot.style.setProperty("--shot-y", (y * 7).toFixed(2) + "px");
        });
        shot.addEventListener("pointerleave", function () {
          shot.style.removeProperty("--shot-x");
          shot.style.removeProperty("--shot-y");
        });
      });
    }
  }

  if (!document.querySelector(".scroll-progress")) {
    var pageProgress = document.createElement("div");
    pageProgress.className = "scroll-progress";
    pageProgress.setAttribute("aria-hidden", "true");
    document.body.appendChild(pageProgress);
    var updatePageProgress = function () {
      var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      pageProgress.style.transform = "scaleX(" + (maxScroll ? window.scrollY / maxScroll : 0) + ")";
    };
    window.addEventListener("scroll", updatePageProgress, { passive: true });
    updatePageProgress();
  }

  if (window.AOS) {
    AOS.init({ duration: 700, once: true, offset: 60 });
  }

  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;

        if (el.classList.contains("progress-row")) {
          var val = el.getAttribute("data-value") || "0";
          var bar = el.querySelector(".progress-bar");
          if (bar) bar.style.setProperty("--val", val + "%");
          el.classList.add("in-view");
        }

        if (el.classList.contains("stat-number")) {
          var target = parseFloat(el.getAttribute("data-count"));
          var suffix = el.getAttribute("data-suffix") || "";
          var raw = el.getAttribute("data-count") || "0";
          var decimals = (raw.split(".")[1] || "").length;
          var duration = 1200;
          var start = null;

          function step(ts) {
            if (start === null) start = ts;
            var progress = Math.min((ts - start) / duration, 1);
            el.textContent = (target * progress).toFixed(decimals) + suffix;
            if (progress < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
        }

        revealObserver.unobserve(el);
      });
    },
    { threshold: 0.35 }
  );

  document.querySelectorAll(".progress-row, .stat-number[data-count]").forEach(function (el) {
    revealObserver.observe(el);
  });

  var pageSections = document.querySelectorAll(".project-section, .project-meta, .benefit-card, .workflow-step, .project-hero, .resume-wrapper");
  pageSections.forEach(function (section, index) {
    section.classList.add("motion-reveal");
    section.style.setProperty("--reveal-delay", Math.min(index % 5, 4) * 60 + "ms");
  });

  if (reduceMotion || !("IntersectionObserver" in window)) {
    pageSections.forEach(function (section) { section.classList.add("is-visible"); });
  } else {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        sectionObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -30px" });
    pageSections.forEach(function (section) { sectionObserver.observe(section); });
  }
});
