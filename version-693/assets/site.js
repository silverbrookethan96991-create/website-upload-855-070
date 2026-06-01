(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : '';
      if (!value) {
        event.preventDefault();
        return;
      }
      event.preventDefault();
      window.location.href = './search.html?q=' + encodeURIComponent(value);
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    showSlide(0);
    window.setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var sortSelect = document.querySelector('[data-sort-select]');
  var catalogGrid = document.querySelector('[data-catalog-grid]');
  var emptyState = document.querySelector('[data-empty-state]');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyCatalogFilter() {
    if (!catalogGrid) {
      return;
    }

    var query = normalize(filterInput ? filterInput.value : '');
    var cards = Array.prototype.slice.call(catalogGrid.querySelectorAll('.movie-card'));
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.dataset.title,
        card.dataset.genre,
        card.dataset.year,
        card.dataset.region,
        card.dataset.tags,
        card.textContent
      ].join(' '));
      var match = !query || haystack.indexOf(query) !== -1;
      card.style.display = match ? '' : 'none';
      if (match) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  function applyCatalogSort() {
    if (!catalogGrid || !sortSelect) {
      return;
    }

    var mode = sortSelect.value;
    var cards = Array.prototype.slice.call(catalogGrid.querySelectorAll('.movie-card'));
    cards.sort(function (a, b) {
      if (mode === 'year') {
        return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
      }
      if (mode === 'title') {
        return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-Hans-CN');
      }
      return Number(a.dataset.order || 0) - Number(b.dataset.order || 0);
    });
    cards.forEach(function (card) {
      catalogGrid.appendChild(card);
    });
    applyCatalogFilter();
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyCatalogFilter);
  }
  if (sortSelect) {
    sortSelect.addEventListener('change', applyCatalogSort);
  }
  if (catalogGrid) {
    Array.prototype.slice.call(catalogGrid.querySelectorAll('.movie-card')).forEach(function (card, cardIndex) {
      card.dataset.order = String(cardIndex);
    });
  }

  var searchRoot = document.querySelector('[data-search-root]');
  if (searchRoot && window.SEARCH_MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    var input = searchRoot.querySelector('[data-search-page-input]');
    var resultGrid = searchRoot.querySelector('[data-search-results]');
    var heading = searchRoot.querySelector('[data-search-heading]');

    if (input) {
      input.value = q;
      input.addEventListener('input', function () {
        renderSearch(input.value);
      });
    }

    function createCard(movie) {
      var tagHtml = movie.tags.slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return [
        '<article class="movie-card">',
        '<a class="poster-link" href="./' + escapeHtml(movie.file) + '" aria-label="观看' + escapeHtml(movie.title) + '">',
        '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '<span class="poster-shade"></span>',
        '<span class="play-pill">播放</span>',
        '<span class="year-badge">' + escapeHtml(movie.year) + '</span>',
        '</a>',
        '<div class="movie-card-body">',
        '<a class="movie-title" href="./' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a>',
        '<p class="movie-line">' + escapeHtml(movie.oneLine) + '</p>',
        '<div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
        '<div class="tag-row">' + tagHtml + '</div>',
        '</div>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function renderSearch(value) {
      var query = normalize(value);
      var items = window.SEARCH_MOVIES.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags.join(' '),
          movie.oneLine
        ].join(' '));
        return !query || haystack.indexOf(query) !== -1;
      }).slice(0, 80);

      if (heading) {
        heading.textContent = query ? '搜索结果' : '片库推荐';
      }
      if (resultGrid) {
        resultGrid.innerHTML = items.map(createCard).join('');
      }
      if (emptyState) {
        emptyState.classList.toggle('is-visible', items.length === 0);
      }
    }

    renderSearch(q);
  }

  var video = document.querySelector('[data-player]');
  var playButton = document.querySelector('[data-play-button]');

  if (video && playButton && window.__VIDEO_URL__) {
    var attached = false;
    var hlsInstance = null;

    function bindVideo() {
      if (attached) {
        return;
      }
      attached = true;
      var source = window.__VIDEO_URL__;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function startVideo() {
      bindVideo();
      playButton.classList.add('is-hidden');
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          video.controls = true;
        });
      }
    }

    playButton.addEventListener('click', startVideo);
    video.addEventListener('play', function () {
      playButton.classList.add('is-hidden');
    });
    video.addEventListener('click', function () {
      if (video.paused) {
        startVideo();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
