(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll(".video-shell")).forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector(".play-overlay");
      var stream = shell.getAttribute("data-stream");
      var started = false;
      var hls = null;

      function beginPlayback() {
        if (!video || !stream) {
          return;
        }

        if (started) {
          video.play().catch(function () {});
          return;
        }

        started = true;

        if (button) {
          button.classList.add("is-hidden");
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          video.play().catch(function () {});
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal && hls) {
              hls.destroy();
              hls = null;
              video.src = stream;
              video.play().catch(function () {});
            }
          });
          return;
        }

        video.src = stream;
        video.play().catch(function () {});
      }

      if (button) {
        button.addEventListener("click", beginPlayback);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (!started) {
            beginPlayback();
          }
        });
      }
    });
  });
})();
