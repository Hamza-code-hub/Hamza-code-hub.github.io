$(document).ready(function() {
	
	    
    /* ======= Isotope plugin ======= */
    /* Ref: http://isotope.metafizzy.co/ */
    // init Isotope    
    var $container = $('.isotope');
    
    function isMobileLayout() {
        return window.matchMedia && window.matchMedia('(max-width: 767.98px)').matches;
    }

    function layoutOptions() {
        return {
            itemSelector: '.isotope-item',
            layoutMode: isMobileLayout() ? 'vertical' : 'fitRows',
            vertical: { horizontalAlignment: 0.5 }
        };
    }

    $container.imagesLoaded(function () {
        $container.isotope(layoutOptions());
    });

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
    
    // filter items on click
    $('#filters').on( 'click', '.type', function() {
      var filterValue = $(this).attr('data-filter');
      $container.isotope({ filter: filterValue });
    });
    
    // change is-checked class on buttons
    $('.filters').each( function( i, typeGroup ) {
        var $typeGroup = $( typeGroup );
        $typeGroup.on( 'click', '.type', function() {
          $typeGroup.find('.active').removeClass('active');
          $( this ).addClass('active');
        });
    });

	  
    

    

});
