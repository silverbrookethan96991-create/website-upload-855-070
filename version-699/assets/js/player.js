(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (box) {
        var video = box.querySelector('video');
        var button = box.querySelector('[data-play-button]');
        var ready = false;
        var hlsInstance = null;

        if (!video || !button) {
            return;
        }

        var stream = video.getAttribute('data-stream');

        function attach() {
            if (ready || !stream) {
                return Promise.resolve();
            }

            ready = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                video.load();
                return Promise.resolve();
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 60
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
                return new Promise(function (resolve) {
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        resolve();
                    });
                });
            }

            video.src = stream;
            video.load();
            return Promise.resolve();
        }

        function play() {
            attach().then(function () {
                button.classList.add('is-hidden');
                var result = video.play();
                if (result && typeof result.catch === 'function') {
                    result.catch(function () {
                        button.classList.remove('is-hidden');
                    });
                }
            });
        }

        button.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (!ready || video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            button.classList.add('is-hidden');
        });
        video.addEventListener('pause', function () {
            if (video.currentTime === 0 || video.ended) {
                button.classList.remove('is-hidden');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
