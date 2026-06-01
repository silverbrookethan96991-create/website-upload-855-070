(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.menu-toggle');

  if (header && toggle) {
    toggle.addEventListener('click', function () {
      var open = header.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var hero = document.getElementById('heroCarousel');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('.hero-control.prev');
    var next = hero.querySelector('.hero-control.next');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function run() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        run();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        run();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        run();
      });
    });

    run();
  }

  var keyword = document.getElementById('filterKeyword');
  var category = document.getElementById('filterCategory');
  var year = document.getElementById('filterYear');
  var type = document.getElementById('filterType');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-grid .movie-card'));
  var empty = document.querySelector('.empty-state');

  if (keyword && cards.length) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q) {
      keyword.value = q;
    }

    function norm(value) {
      return (value || '').toString().trim().toLowerCase();
    }

    function matchCard(card) {
      var text = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-type'),
        card.getAttribute('data-category'),
        card.getAttribute('data-tags')
      ].join(' ').toLowerCase();

      var key = norm(keyword.value);
      var cat = category ? norm(category.value) : '';
      var yr = year ? norm(year.value) : '';
      var tp = type ? norm(type.value) : '';

      return (!key || text.indexOf(key) !== -1) &&
        (!cat || norm(card.getAttribute('data-category')) === cat) &&
        (!yr || norm(card.getAttribute('data-year')) === yr) &&
        (!tp || norm(card.getAttribute('data-type')).indexOf(tp) !== -1);
    }

    function applyFilter() {
      var visible = 0;

      cards.forEach(function (card) {
        var ok = matchCard(card);
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [keyword, category, year, type].forEach(function (item) {
      if (item) {
        item.addEventListener('input', applyFilter);
        item.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  }
})();
