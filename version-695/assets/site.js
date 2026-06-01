(function() {
  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function setupMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function() {
      panel.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', panel.classList.contains('is-open'));
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var next = root.querySelector('[data-hero-next]');
    var prev = root.querySelector('[data-hero-prev]');
    var index = 0;
    var timer = null;

    function render(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function(slide, current) {
        slide.classList.toggle('is-active', current === index);
      });
      dots.forEach(function(dot, current) {
        dot.classList.toggle('is-active', current === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function() {
        render(index + 1);
      }, 5200);
    }

    dots.forEach(function(dot, current) {
      dot.addEventListener('click', function() {
        render(current);
        restart();
      });
    });

    if (next) {
      next.addEventListener('click', function() {
        render(index + 1);
        restart();
      });
    }

    if (prev) {
      prev.addEventListener('click', function() {
        render(index - 1);
        restart();
      });
    }

    render(0);
    restart();
  }

  function setupFilters() {
    var roots = Array.prototype.slice.call(document.querySelectorAll('[data-filter-root]'));
    roots.forEach(function(root) {
      var input = root.querySelector('[data-filter-input]');
      var cards = Array.prototype.slice.call(root.querySelectorAll('[data-card]'));
      var selects = Array.prototype.slice.call(root.querySelectorAll('[data-filter-select]'));
      var status = root.querySelector('[data-filter-status]');
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q') || '';

      if (input && query) {
        input.value = query;
      }

      function matchesSelect(card, select) {
        var key = select.getAttribute('data-filter-select');
        var value = normalize(select.value);
        if (!value) {
          return true;
        }
        return normalize(card.getAttribute('data-' + key)).indexOf(value) !== -1;
      }

      function apply() {
        var term = normalize(input ? input.value : '');
        var shown = 0;
        cards.forEach(function(card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-category'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre')
          ].join(' '));
          var ok = !term || haystack.indexOf(term) !== -1;
          selects.forEach(function(select) {
            if (!matchesSelect(card, select)) {
              ok = false;
            }
          });
          card.hidden = !ok;
          if (ok) {
            shown += 1;
          }
        });
        if (status) {
          status.textContent = shown ? '已筛选到相关内容' : '暂无匹配内容';
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      selects.forEach(function(select) {
        select.addEventListener('change', apply);
      });
      apply();
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    setupMobileMenu();
    setupHero();
    setupFilters();
  });
})();
