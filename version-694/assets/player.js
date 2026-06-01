(function () {
  function mount(config) {
    var video = document.querySelector(config.video);
    var cover = document.querySelector(config.cover);
    var buttons = Array.prototype.slice.call(
      document.querySelectorAll(config.buttons),
    );
    var ready = false;
    var hls = null;

    if (!video || !cover || !config.source) {
      return;
    }

    function attach() {
      if (ready) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(config.source);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = config.source;
      }

      ready = true;
    }

    function begin() {
      attach();
      cover.classList.add("is-hidden");
      video.controls = true;

      var request = video.play();

      if (request && typeof request.catch === "function") {
        request.catch(function () {});
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", begin);
    });

    cover.addEventListener("click", begin);

    video.addEventListener("click", function () {
      if (video.paused) {
        begin();
      }
    });

    video.addEventListener("play", function () {
      cover.classList.add("is-hidden");
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.MoviePlayer = {
    mount: mount,
  };
})();
