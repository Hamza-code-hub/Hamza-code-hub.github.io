(function () {
  "use strict";
  var storageKey = "portfolio-theme";
  var root = document.documentElement;

  function storedTheme() {
    try { return window.localStorage.getItem(storageKey); } catch (error) { return null; }
  }

  function preferredTheme() {
    var saved = storedTheme();
    if (saved === "light" || saved === "dark") return saved;
    return "light";
  }

  function applyTheme(theme, persist) {
    var dark = theme === "dark";
    root.dataset.theme = theme;
    document.body.classList.toggle("dark-mode", dark);
    var toggle = document.getElementById("darkmode");
    if (toggle) {
      toggle.checked = dark;
      toggle.setAttribute("aria-checked", String(dark));
    }
    var label = document.querySelector(".toggle-name");
    if (label) label.innerHTML = '<i class="fas fa-adjust mr-1"></i>' + (dark ? "Dark theme" : "Light theme");
    if (persist) {
      try { window.localStorage.setItem(storageKey, theme); } catch (error) { /* Storage may be disabled. */ }
    }
    window.dispatchEvent(new CustomEvent("portfolio:theme", { detail: { theme: theme } }));
  }

  function addMobileFloatingToggle() {
    if (document.querySelector(".mobile-theme-toggle")) return;

    var button = document.createElement("button");
    button.type = "button";
    button.className = "mobile-theme-toggle";
    button.setAttribute("aria-pressed", "false");
    document.body.appendChild(button);

    function syncIcon() {
      var isDark = document.body.classList.contains("dark-mode");
      button.innerHTML = '<i class="fas fa-' + (isDark ? "sun" : "moon") + '" aria-hidden="true"></i>';
      button.setAttribute("aria-pressed", String(isDark));
      button.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    }

    syncIcon();
    button.addEventListener("click", function () {
      applyTheme(document.body.classList.contains("dark-mode") ? "light" : "dark", true);
    });
    window.addEventListener("portfolio:theme", syncIcon);
  }

  function bindToggle() {
    applyTheme(preferredTheme(), false);
    addMobileFloatingToggle();
    var toggle = document.getElementById("darkmode");
    if (!toggle || toggle.dataset.themeBound) return;
    toggle.dataset.themeBound = "true";
    toggle.setAttribute("role", "switch");
    toggle.addEventListener("change", function () { applyTheme(toggle.checked ? "dark" : "light", true); });
  }

  root.dataset.theme = preferredTheme();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bindToggle);
  else bindToggle();
})();
