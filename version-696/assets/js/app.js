(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function normalize(text) {
    return String(text || "").toLowerCase().trim();
  }

  function submitSearch(form) {
    var input = form.querySelector("input[name='q'], input[type='search']");
    var query = input ? input.value.trim() : "";
    var root = form.getAttribute("data-root") || "./";
    if (!query) {
      window.location.href = root + "search.html";
      return;
    }
    window.location.href = root + "search.html?q=" + encodeURIComponent(query);
  }

  function initHeader() {
    var header = document.querySelector(".site-header");
    if (!header) {
      return;
    }

    var searchToggle = header.querySelector(".js-search-toggle");
    var menuToggle = header.querySelector(".mobile-menu-button");

    if (searchToggle) {
      searchToggle.addEventListener("click", function () {
        header.classList.toggle("search-open");
        var input = header.querySelector(".header-search-panel input");
        if (header.classList.contains("search-open") && input) {
          input.focus();
        }
      });
    }

    if (menuToggle) {
      menuToggle.addEventListener("click", function () {
        header.classList.toggle("menu-open");
        document.body.classList.toggle("menu-open", header.classList.contains("menu-open"));
      });
    }
  }

  function initSearchForms() {
    document.querySelectorAll(".site-search-form").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        submitSearch(form);
      });
    });
  }

  function initHero() {
    var hero = document.querySelector(".hero");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === active);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(active + 1);
      }, 5600);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        restart();
      });
    }

    if (slides.length > 1) {
      restart();
    }
  }

  function initCategoryFilters() {
    var grid = document.querySelector(".category-movie-grid");
    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    var input = document.querySelector(".category-filter-input");
    var pills = Array.prototype.slice.call(document.querySelectorAll(".filter-pill"));
    var activeFilter = "全部";

    function applyFilter() {
      var query = normalize(input ? input.value : "");
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-year")
        ].join(" "));
        var matchesQuery = !query || text.indexOf(query) !== -1;
        var matchesFilter = activeFilter === "全部" || text.indexOf(normalize(activeFilter)) !== -1;
        card.style.display = matchesQuery && matchesFilter ? "" : "none";
      });
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }

    pills.forEach(function (pill) {
      pill.addEventListener("click", function () {
        pills.forEach(function (other) {
          other.classList.remove("active");
        });
        pill.classList.add("active");
        activeFilter = pill.getAttribute("data-filter") || "全部";
        applyFilter();
      });
    });
  }

  function createResultCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return [
      "<article class="movie-card">",
      "<a class="poster-wrap" href="" + item.url + "" aria-label="观看" + escapeHtml(item.title) + "">",
      "<img src="" + item.cover + "" alt="" + escapeHtml(item.title) + "" loading="lazy">",
      "<span class="poster-overlay"><span class="play-dot">▶</span></span>",
      "<span class="year-badge">" + escapeHtml(item.year) + "</span>",
      "</a>",
      "<div class="movie-card-body">",
      "<h3><a href="" + item.url + "">" + escapeHtml(item.title) + "</a></h3>",
      "<div class="movie-meta-line"><span>" + escapeHtml(item.type) + "</span><span>" + escapeHtml(item.region) + "</span></div>",
      "<p class="card-summary">" + escapeHtml(item.oneLine) + "</p>",
      "<div class="tag-row">" + tags + "</div>",
      "</div>",
      "</article>"
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"]/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        """: "&quot;"
      }[character];
    });
  }

  function initSearchPage() {
    if (!window.MOVIE_SEARCH_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var input = document.getElementById("search-page-input");
    var title = document.getElementById("search-title");
    var count = document.getElementById("search-count");
    var results = document.getElementById("search-results");
    var form = document.querySelector(".search-page-form");

    if (input) {
      input.value = query;
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var nextQuery = input ? input.value.trim() : "";
        window.location.href = "./search.html" + (nextQuery ? "?q=" + encodeURIComponent(nextQuery) : "");
      });
    }

    if (!results) {
      return;
    }

    if (!query) {
      return;
    }

    var normalizedQuery = normalize(query);
    var matches = window.MOVIE_SEARCH_INDEX.filter(function (item) {
      var text = normalize([
        item.title,
        item.region,
        item.type,
        item.year,
        item.genre,
        (item.tags || []).join(" "),
        item.oneLine
      ].join(" "));
      return text.indexOf(normalizedQuery) !== -1;
    });

    if (title) {
      title.textContent = "搜索结果";
    }

    if (count) {
      count.textContent = "“" + query + "” 找到 " + matches.length + " 部相关影片。";
    }

    results.innerHTML = matches.slice(0, 240).map(createResultCard).join("");
  }

  window.__siteApp = {
    initPlayer: function (source) {
      ready(function () {
        var video = document.querySelector(".movie-player");
        var button = document.querySelector(".player-cover-button");
        var hlsInstance = null;
        var loaded = false;
        var manifestReady = false;
        var playRequested = false;

        if (!video || !source) {
          return;
        }

        function safePlay() {
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
          }
        }

        function load() {
          if (loaded) {
            return;
          }
          loaded = true;
          if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              manifestReady = true;
              if (playRequested) {
                safePlay();
              }
            });
          } else {
            video.src = source;
            manifestReady = true;
          }
        }

        function play() {
          playRequested = true;
          load();
          if (button) {
            button.classList.add("is-hidden");
          }
          if (!hlsInstance || manifestReady) {
            safePlay();
          }
        }

        if (button) {
          button.addEventListener("click", play);
        }

        video.addEventListener("click", function () {
          if (video.paused) {
            play();
          }
        });

        video.addEventListener("play", function () {
          if (button) {
            button.classList.add("is-hidden");
          }
        });

        video.addEventListener("pause", function () {
          if (button && video.currentTime === 0) {
            button.classList.remove("is-hidden");
          }
        });

        window.addEventListener("beforeunload", function () {
          if (hlsInstance) {
            hlsInstance.destroy();
          }
        });
      });
    }
  };

  ready(function () {
    initHeader();
    initSearchForms();
    initHero();
    initCategoryFilters();
    initSearchPage();
  });
})();
