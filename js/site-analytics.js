/* Reporting is opt-in through site-config.json; no tracking runs without a real ID. */
(function () {
  "use strict";
  var script = document.currentScript;
  if (!script || !/^https?:$/.test(location.protocol)) return;
  var configUrl = new URL("../site-config.json", script.src);
  function source(referrer, sourceTag) {
    var value = (sourceTag || "").toLowerCase();
    var host = "";
    try { host = new URL(referrer).hostname.toLowerCase(); } catch (_) {}
    var providers = [
      ["chatgpt", /(^|\.)(chatgpt\.com|chat\.openai\.com)$/],
      ["perplexity", /(^|\.)perplexity\.ai$/],
      ["copilot", /(^|\.)copilot\.microsoft\.com$/],
      ["claude", /(^|\.)claude\.ai$/],
      ["gemini", /(^|\.)gemini\.google\.com$/],
      ["meta_ai", /(^|\.)meta\.ai$/]
    ];
    for (var i = 0; i < providers.length; i++) {
      if (providers[i][1].test(host) || value === providers[i][0] || value === providers[i][0] + ".com") return providers[i][0];
    }
    return "unattributed";
  }
  fetch(configUrl.href, {credentials:"same-origin"}).then(function (response) {
    if (!response.ok) throw new Error("Reporting configuration unavailable");
    return response.json();
  }).then(function (config) {
    var id = config.ga4MeasurementId || "";
    // Keep the mirror and local previews out of primary-site reporting.
    if (!/^G-[A-Z0-9]+$/.test(id) || location.origin !== config.primaryOrigin) return;
    if (navigator.doNotTrack === "1" || navigator.globalPrivacyControl === true) return;
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = window.gtag || gtag;
    var url = new URL(location.href);
    var provider = source(document.referrer, url.searchParams.get("utm_source"));
    var referralKey = "portfolio-ai-referral-v1";
    try {
      if (provider !== "unattributed") sessionStorage.setItem(referralKey, provider);
      else {
        var previous = sessionStorage.getItem(referralKey);
        if (/^(chatgpt|perplexity|copilot|claude|gemini|meta_ai)$/.test(previous || "")) provider = previous;
      }
    } catch (_) {}
    var referrer = "";
    try { var parsedReferrer = new URL(document.referrer); referrer = parsedReferrer.origin + parsedReferrer.pathname; } catch (_) {}
    gtag("js", new Date());
    // Do not forward arbitrary query strings or form field values to analytics.
    gtag("config", id, {page_location:location.origin + location.pathname, page_referrer:referrer, ai_referral_source:provider});
    var tag = document.createElement("script"); tag.async = true;
    tag.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
    document.head.appendChild(tag);
    document.addEventListener("click", function (event) {
      var link = event.target.closest && event.target.closest("a[href]");
      if (!link) return;
      var href = link.getAttribute("href") || "";
      if (/^(mailto:|tel:|https:\/\/wa\.me\/)/i.test(href)) gtag("event", "contact_click", {contact_method:/^https:\/\/wa\.me\//i.test(href) ? "whatsapp" : href.split(":")[0], ai_referral_source:provider});
      if (/Muhammad-Hamza-Resume\.pdf(?:[?#]|$)/.test(href)) gtag("event", "resume_download", {ai_referral_source:provider});
    });
    // A return hash is not evidence that an enquiry was delivered.
    // Form confirmations and qualified leads belong in the account's reporting.
  }).catch(function () { /* Reporting never blocks the portfolio. */ });
})();
