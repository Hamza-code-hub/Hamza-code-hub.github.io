$(document).ready(function() {
	
	    
    /* ======= Isotope plugin ======= */
    /* Ref: http://isotope.metafizzy.co/ */
    // init Isotope    
    var $container = $('.isotope');
    var $filters = $('#filters .type');
    var selectedFilter = '*';
    function filterFromHash() {
        var target = document.getElementById(location.hash.slice(1));
        return target && target.closest('#filters') && target.dataset.filter ? target : null;
    }
    function selectFilter(element, updateUrl) {
        if (!element) return;
        selectedFilter = element.getAttribute('data-filter') || '*';
        $filters.removeClass('active').attr('aria-pressed', 'false');
        $(element).addClass('active').attr('aria-pressed', 'true');
        if ($container.data('isotope')) $container.isotope({ filter: selectedFilter });
        if (updateUrl) {
            var next = element.id ? '#' + element.id : location.pathname + location.search;
            history.replaceState(history.state, '', next);
        }
    }
    $filters.attr({role:'button', tabindex:'0', 'aria-pressed':'false'});
    selectFilter(filterFromHash() || $filters[0], false);
    function translateDomainFilters() {
        if (!window.PortfolioLocale) return;
        $filters.filter('[data-locale-key]').each(function () {
            this.textContent = window.PortfolioLocale.t(this.dataset.localeKey);
        });
    }
    document.addEventListener('portfolio:language', translateDomainFilters);
    document.addEventListener('portfolio:pagetranslated', translateDomainFilters);
    translateDomainFilters();
    
    function isMobileLayout() {
        return window.matchMedia && window.matchMedia('(max-width: 767.98px)').matches;
    }

    function layoutOptions() {
        return {
            itemSelector: '.isotope-item',
            filter: selectedFilter,
            layoutMode: isMobileLayout() ? 'vertical' : 'fitRows',
            vertical: { horizontalAlignment: 0.5 }
        };
    }

    // Apply deep-link filters as soon as the page is usable; image decoding
    // can continue without delaying the matching project list.
    $container.isotope(layoutOptions());
    $container.imagesLoaded(function () { $container.isotope('layout'); });

    var mobileLayoutActive = isMobileLayout();
    $(window).on('resize', function () {
        var nextMobileLayout = isMobileLayout();
        if (nextMobileLayout === mobileLayoutActive || !$container.data('isotope')) return;
        mobileLayoutActive = nextMobileLayout;
        $container.isotope({
            layoutMode: nextMobileLayout ? 'vertical' : 'fitRows',
            vertical: { horizontalAlignment: 0.5 }
        });
    });
    
    $('#filters').on('click', '.type', function () { selectFilter(this, true); });
    $('#filters').on('keydown', '.type', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            selectFilter(this, true);
        }
    });
    window.addEventListener('hashchange', function () {
        var target = filterFromHash();
        if (target) selectFilter(target, false);
    });

	  
    

    

});
