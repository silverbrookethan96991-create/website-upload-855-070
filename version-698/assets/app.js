(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero-slider]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(activeIndex + 1);
      }, 6200);
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function connectFilter(input, cards, emptyState) {
    function run() {
      var keyword = normalize(input.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-keywords'));
        var matched = !keyword || haystack.indexOf(keyword) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    input.addEventListener('input', run);
    run();
  }

  document.querySelectorAll('[data-filter-form]').forEach(function (form) {
    var input = form.querySelector('[data-filter-input]');
    var scope = form.closest('main') || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search-card]'));
    var emptyState = scope.querySelector('[data-empty-state]');

    if (input && cards.length) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
      });
      connectFilter(input, cards, emptyState);
    }
  });

  var searchInput = document.querySelector('[data-search-page-input]');
  var searchResults = document.querySelector('[data-search-results]');

  if (searchInput && searchResults) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var cards = Array.prototype.slice.call(searchResults.querySelectorAll('[data-search-card]'));
    var emptyState = document.querySelector('[data-empty-state]');
    searchInput.value = query;
    connectFilter(searchInput, cards, emptyState);
  }

  document.querySelectorAll('[data-player]').forEach(function (card) {
    var video = card.querySelector('video');
    var button = card.querySelector('.player-overlay');
    var stream = card.getAttribute('data-stream');
    var hlsInstance = null;

    function playVideo() {
      card.classList.add('is-playing');

      if (!video || !stream) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (video.getAttribute('src') !== stream) {
          video.setAttribute('src', stream);
        }
        video.play().catch(function () {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.play().catch(function () {});
        }
        return;
      }

      if (video.getAttribute('src') !== stream) {
        video.setAttribute('src', stream);
      }
      video.play().catch(function () {});
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener('play', function () {
        card.classList.add('is-playing');
      });
    }
  });
})();
