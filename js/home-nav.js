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

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialiseHomeNavigation);
  else initialiseHomeNavigation();
})();
