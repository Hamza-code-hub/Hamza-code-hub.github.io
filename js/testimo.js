$(document).ready(function () {
  $('.testimonial-carousel').each(function () {
    var carousel = this;
    var frame = 0;

    function labelControls() {
      var dots = carousel.querySelectorAll('.owl-dots .owl-dot');
      Array.prototype.forEach.call(dots, function (button, index) {
        button.setAttribute('type', 'button');
        button.setAttribute('aria-label', 'Show testimonials page ' + (index + 1) + ' of ' + dots.length);
        if (button.classList.contains('active')) button.setAttribute('aria-current', 'true');
        else button.removeAttribute('aria-current');
      });
      [['.owl-prev', 'Previous testimonials'], ['.owl-next', 'Next testimonials']].forEach(function (control) {
        var button = carousel.querySelector(control[0]);
        if (!button) return;
        button.setAttribute('type', 'button');
        button.setAttribute('aria-label', control[1]);
        // Owl's presentation role hides the purpose of its native nav buttons.
        if (/^(presentation|none)$/.test(button.getAttribute('role') || '')) button.removeAttribute('role');
      });
    }

    function scheduleLabels() {
      if (frame) return;
      // Owl updates navigation after some carousel event handlers run.
      frame = window.requestAnimationFrame(function () {
        frame = 0;
        labelControls();
      });
    }

    $(carousel).on(
      'initialized.owl.carousel refreshed.owl.carousel translated.owl.carousel changed.owl.carousel ' +
      'added.owl.carousel removed.owl.carousel initialized.owl.navigation refreshed.owl.navigation',
      scheduleLabels
    ).owlCarousel({
      margin: 30,
      nav: false,
      responsive: {
        0: {items: 1},
        768: {items: 2},
        1200: {items: 3}
      }
    });
    labelControls();
  });
});


