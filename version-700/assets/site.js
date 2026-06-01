(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(text) {
        return String(text || "").toLowerCase().trim();
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-menu]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 6200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                window.clearInterval(timer);
                start();
            });
        });

        show(0);
        start();
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var scope = document.querySelector(panel.getAttribute("data-target") || "");
            if (!scope) {
                scope = document;
            }

            var searchInput = panel.querySelector("[data-filter-search]");
            var yearSelect = panel.querySelector("[data-filter-year]");
            var typeSelect = panel.querySelector("[data-filter-type]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
            var noResults = scope.querySelector("[data-no-results]");

            function apply() {
                var q = normalize(searchInput ? searchInput.value : "");
                var year = yearSelect ? yearSelect.value : "";
                var type = typeSelect ? typeSelect.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute("data-search"));
                    var cardYear = card.getAttribute("data-year") || "";
                    var cardType = card.getAttribute("data-type") || "";
                    var matchSearch = !q || haystack.indexOf(q) !== -1;
                    var matchYear = !year || cardYear === year;
                    var matchType = !type || cardType.indexOf(type) !== -1;

                    if (matchSearch && matchYear && matchType) {
                        card.style.display = "";
                        visible += 1;
                    } else {
                        card.style.display = "none";
                    }
                });

                if (noResults) {
                    noResults.classList.toggle("is-visible", visible === 0);
                }
            }

            if (searchInput) {
                searchInput.addEventListener("input", apply);
            }
            if (yearSelect) {
                yearSelect.addEventListener("change", apply);
            }
            if (typeSelect) {
                typeSelect.addEventListener("change", apply);
            }

            apply();
        });
    }

    function initSearchQuery() {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (!query) {
            return;
        }
        var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-search]"));
        searchInputs.forEach(function (input) {
            input.value = query;
            input.dispatchEvent(new Event("input", { bubbles: true }));
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll(".video-shell"));
        players.forEach(function (shell) {
            var video = shell.querySelector("video");
            var button = shell.querySelector(".video-start");
            var streamUrl = shell.getAttribute("data-url");
            var hlsInstance = null;

            if (!video || !streamUrl) {
                return;
            }

            function attachStream() {
                if (video.getAttribute("data-ready") === "1") {
                    return;
                }

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = streamUrl;
                }

                video.setAttribute("data-ready", "1");
            }

            function playVideo() {
                attachStream();
                shell.classList.add("is-playing");
                video.setAttribute("controls", "controls");
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {});
                }
            }

            if (button) {
                button.addEventListener("click", playVideo);
            }

            video.addEventListener("click", function () {
                if (video.paused) {
                    playVideo();
                }
            });

            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initSearchQuery();
        initPlayers();
    });
})();
