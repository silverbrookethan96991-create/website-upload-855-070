(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function (player) {
      var video = player.querySelector("video");
      var cover = player.querySelector(".player-cover");
      var button = player.querySelector(".play-button");
      var stream = player.getAttribute("data-m3u8");
      var attached = false;
      var hls = null;

      function attach() {
        if (attached || !video || !stream) {
          return;
        }

        attached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          return;
        }

        video.src = stream;
      }

      function start() {
        attach();

        if (cover) {
          cover.classList.add("is-hidden");
        }

        if (video) {
          video.controls = true;
          var attempt = video.play();

          if (attempt && typeof attempt.catch === "function") {
            attempt.catch(function () {});
          }
        }
      }

      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          start();
        });
      }

      if (cover) {
        cover.addEventListener("click", start);
      }

      if (video) {
        video.addEventListener("play", function () {
          if (cover) {
            cover.classList.add("is-hidden");
          }
        });
      }

      window.addEventListener("pagehide", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  });
})();
