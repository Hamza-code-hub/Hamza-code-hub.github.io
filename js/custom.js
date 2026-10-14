/* Portfolio filters. CSS Grid owns card placement so late visuals and fonts
   cannot leave stale, absolute Isotope coordinates after navigation. */
(function () {
  "use strict";

  function initialize() {
    var grid = document.querySelector(".project-cards");
    var filterList = document.getElementById("filters");
    if (!grid || !filterList) return;

    var cards = Array.prototype.slice.call(grid.querySelectorAll(".isotope-item"));
    var filters = Array.prototype.slice.call(filterList.querySelectorAll(".type[data-filter]"));

    function filterFromHash() {
      var target = document.getElementById(location.hash.slice(1));
      return target && filterList.contains(target) && target.matches(".type[data-filter]") ? target : null;
    }

    function refreshRevealPositions() {
      if (!window.AOS || typeof window.AOS.refreshHard !== "function") return;
      requestAnimationFrame(function () { window.AOS.refreshHard(); });
    }

    function selectFilter(element, updateUrl) {
      if (!element) return;
      var selector = element.getAttribute("data-filter") || "*";
      filters.forEach(function (filter) {
        var active = filter === element;
        filter.classList.toggle("active", active);
        filter.setAttribute("aria-pressed", String(active));
      });
      cards.forEach(function (card) {
        card.hidden = selector !== "*" && !card.matches(selector);
      });
      refreshRevealPositions();
      if (updateUrl) {
        var next = element.id ? "#" + element.id : location.pathname + location.search;
        try { history.replaceState(history.state, "", next); }
        catch (_) { /* Filtering still works when file:// history is restricted. */ }
      }
    }

    function translateDomainFilters() {
      if (!window.PortfolioLocale) return;
      filters.forEach(function (filter) {
        if (filter.dataset.localeKey) filter.textContent = window.PortfolioLocale.t(filter.dataset.localeKey);
      });
    }

    filters.forEach(function (filter) {
      filter.setAttribute("role", "button");
      filter.setAttribute("tabindex", "0");
      filter.setAttribute("aria-pressed", "false");
    });
    selectFilter(filterFromHash() || filters[0], false);
    translateDomainFilters();
    document.addEventListener("portfolio:language", translateDomainFilters);
    document.addEventListener("portfolio:pagetranslated", translateDomainFilters);
    filterList.addEventListener("click", function (event) {
      var filter = event.target.closest(".type[data-filter]");
      if (filter && filterList.contains(filter)) selectFilter(filter, true);
    });
    filterList.addEventListener("keydown", function (event) {
      if (event.key !== "Enter" && event.key !== " ") return;
      var filter = event.target.closest(".type[data-filter]");
      if (!filter || !filterList.contains(filter)) return;
      event.preventDefault();
      selectFilter(filter, true);
    });
    window.addEventListener("hashchange", function () {
      var filter = filterFromHash();
      if (filter) selectFilter(filter, false);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, {once:true});
  else initialize();
}());
