(function () {
  function toText(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function setupMobileMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(
      hero.querySelectorAll("[data-hero-slide]"),
    );
    var dots = Array.prototype.slice.call(
      hero.querySelectorAll("[data-hero-dot]"),
    );
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function play(step) {
      show(active + step);
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        play(1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        play(-1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        play(1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var cards = Array.prototype.slice.call(
      document.querySelectorAll("[data-filter-card]"),
    );

    if (!cards.length) {
      return;
    }

    var input = document.querySelector("[data-filter-input]");
    var region = document.querySelector("[data-filter-region]");
    var type = document.querySelector("[data-filter-type]");
    var year = document.querySelector("[data-filter-year]");
    var reset = document.querySelector("[data-filter-reset]");
    var counter = document.querySelector("[data-filter-count]");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");

    if (input && query) {
      input.value = query;
    }

    function matches(card) {
      var words = toText(input && input.value);
      var regionValue = region ? region.value : "";
      var typeValue = type ? type.value : "";
      var yearValue = year ? year.value : "";
      var haystack = toText(card.getAttribute("data-filter-text"));
      var ok = true;

      if (words) {
        ok = haystack.indexOf(words) !== -1;
      }

      if (ok && regionValue) {
        ok = card.getAttribute("data-region") === regionValue;
      }

      if (ok && typeValue) {
        ok = card.getAttribute("data-type") === typeValue;
      }

      if (ok && yearValue) {
        ok = card.getAttribute("data-year") === yearValue;
      }

      return ok;
    }

    function update() {
      var visible = 0;

      cards.forEach(function (card) {
        var ok = matches(card);
        card.hidden = !ok;

        if (ok) {
          visible += 1;
        }
      });

      if (counter) {
        var activeFilter = Boolean(
          toText(input && input.value) ||
          (region && region.value) ||
          (type && type.value) ||
          (year && year.value),
        );

        if (!activeFilter) {
          counter.textContent = "可按片名、地区、类型和年份筛选";
        } else {
          counter.textContent = visible
            ? "当前匹配 " + visible + " 部"
            : "未找到匹配影片";
        }
      }
    }

    [input, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", update);
        control.addEventListener("change", update);
      }
    });

    if (reset) {
      reset.addEventListener("click", function () {
        if (input) {
          input.value = "";
        }

        if (region) {
          region.value = "";
        }

        if (type) {
          type.value = "";
        }

        if (year) {
          year.value = "";
        }

        update();
      });
    }

    update();
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
  });
})();
