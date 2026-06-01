(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    var filterPanel = document.querySelector('[data-filter-panel]');
    var list = document.querySelector('[data-card-list]');
    if (filterPanel && list) {
        var keywordInput = filterPanel.querySelector('[data-filter-keyword]');
        var yearSelect = filterPanel.querySelector('[data-filter-year]');
        var typeSelect = filterPanel.querySelector('[data-filter-type]');
        var clearButton = filterPanel.querySelector('[data-filter-clear]');
        var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
        var emptyState = document.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q') || '';

        if (keywordInput && q) {
            keywordInput.value = q;
        }

        function value(el) {
            return el ? String(el.value || '').trim().toLowerCase() : '';
        }

        function textOf(card) {
            return [
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-year'),
                card.getAttribute('data-type'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-category')
            ].join(' ').toLowerCase();
        }

        function applyFilter() {
            var keyword = value(keywordInput);
            var year = value(yearSelect);
            var type = value(typeSelect);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = textOf(card);
                var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchesYear = !year || String(card.getAttribute('data-year') || '').toLowerCase() === year;
                var matchesType = !type || String(card.getAttribute('data-type') || '').toLowerCase().indexOf(type) !== -1;
                var isVisible = matchesKeyword && matchesYear && matchesType;
                card.style.display = isVisible ? '' : 'none';
                if (isVisible) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('is-visible', visible === 0);
            }
        }

        [keywordInput, yearSelect, typeSelect].forEach(function (el) {
            if (el) {
                el.addEventListener('input', applyFilter);
                el.addEventListener('change', applyFilter);
            }
        });

        if (clearButton) {
            clearButton.addEventListener('click', function () {
                if (keywordInput) {
                    keywordInput.value = '';
                }
                if (yearSelect) {
                    yearSelect.value = '';
                }
                if (typeSelect) {
                    typeSelect.value = '';
                }
                applyFilter();
            });
        }

        applyFilter();
    }
})();
