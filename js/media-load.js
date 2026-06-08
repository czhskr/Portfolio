(function () {
  function ensureVideoSrc(video) {
    if (!video || video.getAttribute("src")) {
      return;
    }

    const src = video.dataset.src;
    if (!src) {
      return;
    }

    video.src = src;
    video.load();
  }

  window.MediaLoad = {
    ensureVideoSrc: ensureVideoSrc,
  };
})();
