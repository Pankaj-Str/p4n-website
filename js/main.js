(function ($) {
  "use strict";

  // Preloader (if the #preloader div exists)
  $(window).on('load', function () {
    if ($('#preloader').length) {
      $('#preloader').delay(100).fadeOut('slow', function () {
        $(this).remove();
      });
    }
  });

  // Back to top button
  $(window).scroll(function() {
    if ($(this).scrollTop() > 100) {
      $('.back-to-top').fadeIn('slow');
    } else {
      $('.back-to-top').fadeOut('slow');
    }
  });
  $('.back-to-top').click(function(){
    $('html, body').animate({scrollTop : 0},1500, 'easeInOutExpo');
    return false;
  });

  // Initiate the wowjs animation library
  new WOW().init();

  // Header scroll class
  $(window).scroll(function() {
    if ($(this).scrollTop() > 100) {
      $('#header').addClass('header-scrolled');
    } else {
      $('#header').removeClass('header-scrolled');
    }
  });

  if ($(window).scrollTop() > 100) {
    $('#header').addClass('header-scrolled');
  }

  // Smooth scroll for the navigation and links with .scrollto classes
  $('.main-nav a, .mobile-nav a, .scrollto').on('click', function() {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      if (target.length) {
        var top_space = 0;

        if ($('#header').length) {
          top_space = $('#header').outerHeight();

          if (! $('#header').hasClass('header-scrolled')) {
            top_space = top_space - 40;
          }
        }

        $('html, body').animate({
          scrollTop: target.offset().top - top_space
        }, 1500, 'easeInOutExpo');

        if ($(this).parents('.main-nav, .mobile-nav').length) {
          $('.main-nav .active, .mobile-nav .active').removeClass('active');
          $(this).closest('li').addClass('active');
        }

        if ($('body').hasClass('mobile-nav-active')) {
          $('body').removeClass('mobile-nav-active');
          $('.mobile-nav-toggle i').toggleClass('fa-times fa-bars');
          $('.mobile-nav-overly').fadeOut();
        }
        return false;
      }
    }
  });

  // Navigation active state on scroll
  var nav_sections = $('section');
  var main_nav = $('.main-nav, .mobile-nav');
  var main_nav_height = $('#header').outerHeight();

  $(window).on('scroll', function () {
    var cur_pos = $(this).scrollTop();
  
    nav_sections.each(function() {
      var top = $(this).offset().top - main_nav_height,
          bottom = top + $(this).outerHeight();
  
      if (cur_pos >= top && cur_pos <= bottom) {
        main_nav.find('li').removeClass('active');
        main_nav.find('a[href="#'+$(this).attr('id')+'"]').parent('li').addClass('active');
      }
    });
  });

  // jQuery counterUp (used in Whu Us section)
  $('[data-toggle="counter-up"]').counterUp({
    delay: 10,
    time: 1000
  });

  // Porfolio isotope and filter
  $(window).on('load', function () {
    var portfolioIsotope = $('.portfolio-container').isotope({
      itemSelector: '.portfolio-item'
    });
    $('#portfolio-flters li').on( 'click', function() {
      $("#portfolio-flters li").removeClass('filter-active');
      $(this).addClass('filter-active');
  
      portfolioIsotope.isotope({ filter: $(this).data('filter') });
    });
  });

  // Testimonials carousel (uses the Owl Carousel library)
  $(".testimonials-carousel").owlCarousel({
    autoplay: true,
    dots: true,
    loop: true,
    items: 1
  });

  // Clients carousel (uses the Owl Carousel library)
  $(".clients-carousel").owlCarousel({
    autoplay: true,
    dots: true,
    loop: true,
    responsive: { 0: { items: 2 }, 768: { items: 4 }, 900: { items: 6 }
    }
  });

})(jQuery);


//  button Section
var button = document.querySelector('.fabTrigger');
var wrap = document.querySelector('.fabWidget');
var overlay = document.querySelector('.fabOverlay');

button.onclick = function() {
  button.classList.toggle('active');
  wrap.classList.toggle('active');
  overlay.classList.toggle('active');
}

overlay.onclick = function() {
  button.classList.toggle('active');
  wrap.classList.toggle('active');
  overlay.classList.toggle('active');
}

// PDF JS FILE 

(function () {
  toastr.options.progressBar = true;

  let pdfDoc = null,
      pageNum = 1,
      pageRendering = false,
      pageNumPending = null,
      scale = 1,
      canvas = document.getElementById("canvas-pdf-viewer"),
      ctx = canvas.getContext("2d");

  // Dynamically adjust scale to fit the canvas into the available screen space
  function adjustScale() {
      const containerWidth = canvas.parentElement.offsetWidth;
      const containerHeight = canvas.parentElement.offsetHeight;
      const aspectRatio = canvas.width / canvas.height;

      // Calculate scale based on available width or height
      if (containerWidth / aspectRatio <= containerHeight) {
          scale = containerWidth / canvas.width;
      } else {
          scale = containerHeight / canvas.height;
      }
  }

  // Render a page of the PDF document
  function renderPage(num) {
      pageRendering = true;
      pdfDoc.getPage(num).then(function (page) {
          const viewport = page.getViewport({ scale });
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          adjustScale();

          var renderContext = {
              canvasContext: ctx,
              viewport: viewport
          };

          var renderTask = page.render(renderContext);

          renderTask.promise.then(function () {
              pageRendering = false;
              if (pageNumPending !== null) {
                  renderPage(pageNumPending);
                  pageNumPending = null;
              }
          });
      });

      document.getElementById("currentPage").textContent = num;
  }

  // Queue the rendering of the page
  function queueRenderPage(num) {
      if (pageRendering) {
          pageNumPending = num;
      } else {
          renderPage(num);
      }
  }

  // Load PDF from a local file (use the relative path to the PDF)
  function loadPDF(fileUrl) {
      console.log('Loading PDF from:', fileUrl);  // Debugging log
      pdfjsLib.getDocument(fileUrl).promise.then(function (pdfDoc_) {
          pdfDoc = pdfDoc_;
          document.getElementById("totalPages").textContent = pdfDoc.numPages;
          renderPage(pageNum || 1);
      }).catch(function (error) {
          console.error("Error loading PDF: ", error);
          toastr.error("Error loading PDF. Please check the file path.", "Error");
      });
  }

  // Check if the file exists before loading (debugging)
  loadPDF('Python.pdf'); // Path to your PDF file (since it's in the 'page' folder)

  // Prev and Next button click events
  document.getElementById("prev").addEventListener("click", function () {
      if (pageNum <= 1) {
          return;
      }
      pageNum--;
      queueRenderPage(pageNum);
  });

  document.getElementById("next").addEventListener("click", function () {
      if (pageNum >= pdfDoc.numPages) {
          return;
      }
      pageNum++;
      queueRenderPage(pageNum);
  });

  // Download button event
  document.getElementById("download").addEventListener("click", function () {
      const fileUrl = 'Python.pdf'; // Path to your PDF file

      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = 'Python.pdf'; // Set the file name for download
      document.body.appendChild(link); // Append the link to the body
      link.click(); // Simulate a click on the download link
      document.body.removeChild(link); // Remove the link after clicking
  });
})();



