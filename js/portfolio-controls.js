(function () {
  "use strict";
  var scriptUrl = document.currentScript && document.currentScript.src;
  function initializeControls() {
    var locale = window.PortfolioLocale;
    if (!locale || document.querySelector(".portfolio-language-picker")) return;
    var englishNames = {en:"English",ur:"Urdu",ar:"Arabic",zh:"Chinese Mandarin",hi:"Hindi",es:"Spanish",fr:"French",pt:"Portuguese",bn:"Bengali",ru:"Russian",id:"Indonesian",de:"German",ja:"Japanese",tr:"Turkish",vi:"Vietnamese",ko:"Korean",th:"Thai",fa:"Persian Farsi",ta:"Tamil",te:"Telugu"};
    var picker = document.createElement("div");
    picker.className = "portfolio-language-picker"; picker.hidden = true;
    picker.innerHTML = '<button class="portfolio-language-control" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="portfolio-language-menu"><svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true" focusable="false"><circle cx="10" cy="10" r="7.5"/><ellipse cx="10" cy="10" rx="3.2" ry="7.5"/><path d="M2.5 10h15"/></svg><span class="portfolio-language-current" dir="auto"></span><svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true" focusable="false"><path d="m3 4 3 3 3-3"/></svg></button><div class="portfolio-language-menu" id="portfolio-language-menu" role="dialog" hidden><label class="portfolio-language-search"><svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true" focusable="false"><circle cx="8.5" cy="8.5" r="5.5"/><path d="m13 13 4 4"/></svg><input id="portfolio-language-search" type="search" autocomplete="off" spellcheck="false" aria-controls="portfolio-language-options" aria-autocomplete="list" role="combobox" aria-expanded="true"></label><div id="portfolio-language-options" class="portfolio-language-options" role="listbox"></div><p class="portfolio-language-empty" hidden></p></div>';
    var trigger = picker.querySelector(".portfolio-language-control");
    var current = picker.querySelector(".portfolio-language-current");
    var menu = picker.querySelector(".portfolio-language-menu");
    var input = picker.querySelector("input");
    var list = picker.querySelector(".portfolio-language-options");
    var empty = picker.querySelector(".portfolio-language-empty");
    var active = -1;
    var results = [];
    function fitMenu() {
      if (menu.hidden) return;
      var viewport = window.visualViewport;
      var bottom = viewport ? viewport.height + viewport.offsetTop : innerHeight;
      list.style.maxHeight = Math.max(48,Math.min(330,bottom - menu.getBoundingClientRect().top - 74)) + "px";
    }
    function t(key, fallback) { var value = locale.t(key); return value === key ? fallback : value; }
    function normalize(value) { return String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
    function highlight(index) {
      active = Math.max(0, Math.min(results.length - 1, index));
      list.querySelectorAll("button").forEach(function (option, position) { option.classList.toggle("is-focused", position === active); });
      var option = list.children[active];
      if (option) { input.setAttribute("aria-activedescendant",option.id); option.scrollIntoView({block:"nearest",behavior:"instant"}); }
      else input.removeAttribute("aria-activedescendant");
    }
    function close(focus) {
      menu.hidden = true; trigger.setAttribute("aria-expanded","false");
      if (focus) trigger.focus({preventScroll:true});
    }
    function render() {
      var query = normalize(input.value.trim());
      results = locale.languages.filter(function (language) { return !query || normalize(language.name + " " + (language.englishName || englishNames[language.code] || "") + " " + language.code + " " + language.locale).indexOf(query) !== -1; });
      list.replaceChildren();
      results.forEach(function (language) {
        var option = document.createElement("button"); option.type = "button"; option.tabIndex = -1;
        option.id = "portfolio-language-option-" + language.code; option.setAttribute("role","option"); option.setAttribute("aria-selected",String(locale.getLanguage() === language.code)); option.dataset.language = language.code;
        var native = document.createElement("span"); native.className = "portfolio-language-native"; native.dir = "auto"; native.textContent = language.name;
        var name = document.createElement("small"); name.textContent = language.englishName || englishNames[language.code] || language.code;
        var mark = document.createElement("span"); mark.className = "portfolio-language-check"; mark.setAttribute("aria-hidden","true"); mark.textContent = locale.getLanguage() === language.code ? "✓" : "";
        option.append(native,name,mark);
        option.addEventListener("click",function () { locale.setLanguage(language.code); close(true); });
        list.appendChild(option);
      });
      empty.hidden = results.length !== 0; empty.textContent = t("noLanguages","No matching languages");
      active = -1; input.removeAttribute("aria-activedescendant");
    }
    function open() {
      menu.hidden = false; trigger.setAttribute("aria-expanded","true"); input.value = ""; render(); fitMenu(); input.focus({preventScroll:true});
    }
    function sync() {
      var language = locale.languages.filter(function (item) { return item.code === locale.getLanguage(); })[0] || locale.languages[0];
      current.textContent = language.shortName || language.name; trigger.value = language.code;
      trigger.setAttribute("aria-label",t("language","Language") + ": " + language.name); trigger.title = t("language","Language");
      menu.setAttribute("aria-label",t("language","Language")); list.setAttribute("aria-label",t("language","Language"));
      input.placeholder = t("searchLanguagePlaceholder","Search languages…"); input.setAttribute("aria-label",t("searchLanguage","Search languages"));
      if (!menu.hidden) render();
    }
    trigger.addEventListener("click",function () { if (menu.hidden) open(); else close(false); });
    input.addEventListener("input",render);
    input.addEventListener("keydown",function (event) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); highlight(active + (event.key === "ArrowDown" ? 1 : -1)); }
      else if (event.key === "Enter" && results.length) { event.preventDefault(); locale.setLanguage(results[active < 0 ? 0 : active].code); close(true); }
      else if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close(true); }
      else if (event.key === "Tab") close(false);
    });
    document.addEventListener("pointerdown",function (event) { if (!picker.contains(event.target)) close(false); });
    document.addEventListener("portfolio:language",sync);
    window.addEventListener("resize",fitMenu);
    if (window.visualViewport) window.visualViewport.addEventListener("resize",fitMenu);
    document.body.appendChild(picker);
    window.PortfolioControls = {languageSelect:trigger,openLanguagePicker:open,closeLanguagePicker:close}; sync();
    var stylesheet = document.createElement("link"); stylesheet.rel = "stylesheet";
    stylesheet.href = new URL("../css/portfolio-controls.css?v=3",scriptUrl).href;
    stylesheet.onload = function () { picker.hidden = false; }; document.head.appendChild(stylesheet);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",initializeControls,{once:true});
  else initializeControls();
})();
