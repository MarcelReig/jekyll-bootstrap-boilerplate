//scripts
/* Sticky footer */

$(window).bind("load", function() {
  var footer = $("footer");
  var pos = footer.position();
  var height = $(window).height();
  height = height - pos.top;
  height = height - footer.height();
  height -= 136; // padding footer (40 40) + copyright (56)
  if (height > 0) {
    footer.css({
      "margin-top": height + "px"
    });
  }
});

// Disable dropdown on small screens
jQuery(document).ready(function($) {
  $("ul.nav li.dropdown").hover(
    function() {
      if (!$(".navbar-toggler-icon").is(":visible")) {
        $(this)
          .find(".dropdown-menu")
          .stop(true, true)
          .delay(200)
          .fadeIn(500);
      }
    },
    function() {
      if (!$(".navbar-toggler-icon").is(":visible")) {
        $(this)
          .find(".dropdown-menu")
          .stop(true, true)
          .delay(200)
          .fadeOut(500);
      }
    }
  );
});

// Efecto scroll
$(function() {
  $('a.scroll[href^="#"]').click(function(e) {
    var hash = $(this).attr("href"),
      posicionNueva = $(hash).offset().top;
    $("body,html,document").animate(
      { scrollTop: posicionNueva },
      "slow",
      function() {
        window.location.hash = hash;
      }
    );
    e.preventDefault();
  });
});

// Go top button

jQuery(document).ready(function($) {
  // browser window scroll (in pixels) after which the "back to top" link is shown
  var offset = 300,
    //browser window scroll (in pixels) after which the "back to top" link opacity is reduced
    offset_opacity = 1200,
    //duration of the top scrolling animation (in ms)
    scroll_top_duration = 700,
    //grab the "back to top" link
    $back_to_top = $(".cd-top");

  //hide or show the "back to top" link
  $(window).scroll(function() {
    $(this).scrollTop() > offset
      ? $back_to_top.addClass("cd-is-visible")
      : $back_to_top.removeClass("cd-is-visible cd-fade-out");
    if ($(this).scrollTop() > offset_opacity) {
      $back_to_top.addClass("cd-fade-out");
    }
  });

  //smooth scroll to top
  $back_to_top.on("click", function(event) {
    event.preventDefault();
    $("body,html").animate(
      {
        scrollTop: 0
      },
      scroll_top_duration
    );
  });
});
