/* Shared sidebar/header + dark-mode toggle markup.
   Single source of truth so every inner page (Portfolio, Services, Resume,
   Contact, and all project case-study pages) renders an identical nav,
   profile block and working dark-mode switch (bound by js/dark.js to #darkmode). */
(function () {
  var navItems = [
    { href: "index.html", icon: "fa-user", label: "Home" },
    { href: "portfolio.html", icon: "fa-laptop-code", label: "Portfolio" },
    { href: "services.html", icon: "fa-cogs", label: "Services" },
    { href: "resume/index.html", icon: "fa-file-alt", label: "Resume" },
    { href: "gallery.html", icon: "fa-images", label: "Gallery" },
    { href: "contact.html", icon: "fa-envelope-open-text", label: "Contact" }
  ];

  var currentPath = window.location.pathname.replace(/\\/g, "/").toLowerCase();
  var currentPage = /\/resume\//.test(currentPath)
    ? "resume/index.html"
    : (currentPath.split("/").pop() || "index.html");
  var base = /\/(projects|resume)\//.test(currentPath) ? "../" : "";

  var navHtml = navItems.map(function (item) {
    var isActive = currentPage === item.href.toLowerCase();
    return (
      '<li class="nav-item' + (isActive ? " active" : "") + '">' +
        '<a class="nav-link" href="' + base + item.href + '">' +
          '<i class="fas ' + item.icon + ' fa-fw mr-2"></i>' + item.label +
          (isActive ? '<span class="sr-only">(current)</span>' : "") +
        "</a>" +
      "</li>"
    );
  }).join("");

  var html =
    '<header class="header text-center">' +
      '<div class="force-overflow">' +
        '<h1 class="blog-name pt-lg-4 mb-0"><a href="' + base + 'index.html">Muhammad Hamza</a></h1>' +
        '<nav class="navbar navbar-expand-lg navbar-dark">' +
          '<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navigation" aria-controls="navigation" aria-expanded="false" aria-label="Toggle navigation"><span class="navbar-toggler-icon"></span></button>' +
          '<div id="navigation" class="collapse navbar-collapse flex-column">' +
            '<div class="profile-section pt-3 pt-lg-0">' +
              '<img class="profile-image mb-3 rounded-circle mx-auto" src="' + base + 'images/Muhammad_Hamza.png" alt="Muhammad Hamza AI Developer" width="160" height="160" loading="eager">' +
              '<div class="bio mb-3">Hi, I am <strong>Muhammad Hamza.</strong></div>' +
              '<ul class="social-list list-inline py-2 mx-auto">' +
                '<li class="list-inline-item"><a href="https://twitter.com/Muhamma08974837" target="_blank" rel="noopener noreferrer"><i class="fab fa-twitter fa-fw"></i></a></li>' +
                '<li class="list-inline-item"><a href="https://www.linkedin.com/in/hamzzaz" target="_blank" rel="noopener noreferrer"><i class="fab fa-linkedin-in fa-fw"></i></a></li>' +
                '<li class="list-inline-item"><a href="https://github.com/Hamza-code-hub" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><i class="fab fa-github fa-fw"></i></a></li>' +
              "</ul>" +
              "<hr>" +
            "</div>" +
            '<ul class="navbar-nav flex-column text-left sidebar-nav">' + navHtml + "</ul>" +
            '<div class="my-2"><a class="btn btn-primary" href="' + base + 'contact.html" target="_blank"><i class="fas fa-paper-plane mr-2"></i>Hire Me</a></div>' +
            '<div class="dark-mode-toggle text-center w-100">' +
              '<hr class="mb-4">' +
              '<h4 class="toggle-name mb-3"><i class="fas fa-adjust mr-1"></i>Theme</h4>' +
              '<input class="toggle" id="darkmode" type="checkbox">' +
              '<label class="toggle-btn mx-auto mb-0" for="darkmode"></label>' +
            "</div>" +
          "</div>" +
        "</nav>" +
      "</div>" +
    "</header>";

  document.write(html);
})();
