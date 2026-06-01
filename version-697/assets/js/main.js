(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("open");
      });
    }

    var hero = document.querySelector("[data-hero-carousel]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function show(index) {
        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function move(step) {
        show(current + step);
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          move(1);
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
          move(-1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          move(1);
          start();
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
          start();
        });
      });

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      start();
    }

    var filterForm = document.querySelector("[data-filter-form]");
    var noResults = document.querySelector("[data-no-results]");

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function applyFilters() {
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));

      if (!filterForm || cards.length === 0) {
        return;
      }

      var query = normalize((filterForm.querySelector("[name='query']") || {}).value);
      var year = normalize((filterForm.querySelector("[name='year']") || {}).value);
      var type = normalize((filterForm.querySelector("[name='type']") || {}).value);
      var visibleCount = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var cardType = normalize(card.getAttribute("data-type"));
        var matched = true;

        if (query && text.indexOf(query) === -1) {
          matched = false;
        }

        if (year && cardYear !== year) {
          matched = false;
        }

        if (type && cardType.indexOf(type) === -1) {
          matched = false;
        }

        card.style.display = matched ? "" : "none";

        if (matched) {
          visibleCount += 1;
        }
      });

      if (noResults) {
        noResults.style.display = visibleCount === 0 ? "block" : "none";
      }
    }

    if (filterForm) {
      Array.prototype.slice.call(filterForm.elements).forEach(function (element) {
        element.addEventListener("input", applyFilters);
        element.addEventListener("change", applyFilters);
      });

      filterForm.addEventListener("submit", function (event) {
        event.preventDefault();
        applyFilters();
      });

      var params = new URLSearchParams(window.location.search);
      var queryValue = params.get("q");

      if (queryValue) {
        var input = filterForm.querySelector("[name='query']");

        if (input) {
          input.value = queryValue;
        }
      }

      applyFilters();
    }
  });
})();
