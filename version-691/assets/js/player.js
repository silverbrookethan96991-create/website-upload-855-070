(function () {
  function initPlayer(shell) {
    var video = shell.querySelector('video.stream-player');
    var button = shell.querySelector('.play-layer');

    if (!video || !button) {
      return;
    }

    var streamUrl = video.getAttribute('src') || '';
    var ready = false;
    var engine = null;

    function bind() {
      if (ready) {
        return;
      }

      ready = true;

      if (streamUrl.indexOf('.m3u8') === -1) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        video.removeAttribute('src');
        video.load();
        engine = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        engine.loadSource(streamUrl);
        engine.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function play() {
      bind();
      shell.classList.add('is-playing');
      var action = video.play();

      if (action && typeof action.catch === 'function') {
        action.catch(function () {
          shell.classList.remove('is-playing');
        });
      }
    }

    button.addEventListener('click', play);

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      shell.classList.remove('is-playing');
    });

    video.addEventListener('ended', function () {
      shell.classList.remove('is-playing');
    });

    window.addEventListener('beforeunload', function () {
      if (engine && typeof engine.destroy === 'function') {
        engine.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(initPlayer);
  });
})();
