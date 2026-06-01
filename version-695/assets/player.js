(function() {
  var hlsUrl = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
  var hlsPromise = null;

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (hlsPromise) {
      return hlsPromise;
    }
    hlsPromise = new Promise(function(resolve, reject) {
      var script = document.createElement('script');
      script.src = hlsUrl;
      script.async = true;
      script.onload = function() {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return hlsPromise;
  }

  window.bindMoviePlayer = function(options) {
    var video = options && options.video;
    var trigger = options && options.trigger;
    var source = options && options.source;
    var ready = false;
    var loading = null;
    var hls = null;

    if (!video || !source) {
      return;
    }

    function prepare() {
      if (ready) {
        return Promise.resolve();
      }
      if (loading) {
        return loading;
      }
      loading = new Promise(function(resolve) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          ready = true;
          resolve();
          return;
        }
        loadHls().then(function(Hls) {
          if (Hls && Hls.isSupported()) {
            hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function() {
              ready = true;
              resolve();
            });
            hls.on(Hls.Events.ERROR, function() {
              resolve();
            });
          } else {
            video.src = source;
            ready = true;
            resolve();
          }
        }).catch(function() {
          video.src = source;
          ready = true;
          resolve();
        });
      });
      return loading;
    }

    function play() {
      prepare().then(function() {
        if (trigger) {
          trigger.hidden = true;
        }
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function() {});
        }
      });
    }

    if (trigger) {
      trigger.addEventListener('click', play);
    }
    video.addEventListener('click', function() {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function() {
      if (trigger) {
        trigger.hidden = true;
      }
    });
    window.addEventListener('beforeunload', function() {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
