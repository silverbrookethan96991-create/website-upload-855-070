(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var navPanel = document.querySelector(".nav-panel");

    if (menuButton && navPanel) {
      menuButton.addEventListener("click", function () {
        navPanel.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          start();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          start();
        });
      }

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    }

    Array.prototype.slice.call(document.querySelectorAll(".filter-scope")).forEach(function (scope) {
      var searchInput = scope.querySelector("[data-search-input]");
      var categorySelect = scope.querySelector("[data-filter-category]");
      var yearSelect = scope.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));

      function filterCards() {
        var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
        var category = categorySelect ? categorySelect.value : "";
        var year = yearSelect ? yearSelect.value : "";

        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-meta") || ""
          ].join(" ").toLowerCase();
          var cardCategory = card.getAttribute("data-category") || "";
          var cardYear = card.getAttribute("data-year") || "";
          var visible = true;

          if (query && text.indexOf(query) === -1) {
            visible = false;
          }

          if (category && cardCategory !== category) {
            visible = false;
          }

          if (year && cardYear !== year) {
            visible = false;
          }

          card.hidden = !visible;
        });
      }

      if (searchInput) {
        searchInput.addEventListener("input", filterCards);
      }

      if (categorySelect) {
        categorySelect.addEventListener("change", filterCards);
      }

      if (yearSelect) {
        yearSelect.addEventListener("change", filterCards);
      }
    });
  });
})();
