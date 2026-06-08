(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const unityCards = document.querySelectorAll('[data-works-panel="unity"] .works__card');

  function ensureVideoSrc(video) {
    if (window.MediaLoad && typeof window.MediaLoad.ensureVideoSrc === "function") {
      window.MediaLoad.ensureVideoSrc(video);
      return;
    }

    if (!video || video.getAttribute("src") || !video.dataset.src) {
      return;
    }

    video.src = video.dataset.src;
    video.load();
  }

  unityCards.forEach(function (card) {
    const media = card.querySelector(".works__media");
    const video = card.querySelector(".works__video");

    if (!media || !video) {
      return;
    }

    function playPreview() {
      ensureVideoSrc(video);
      media.classList.add("is-playing");
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(function () {
          media.classList.remove("is-playing");
        });
      }
    }

    function stopPreview() {
      media.classList.remove("is-playing");
      video.pause();
      video.currentTime = 0;
    }

    card.addEventListener("mouseenter", playPreview);
    card.addEventListener("mouseleave", stopPreview);
  });
})();
