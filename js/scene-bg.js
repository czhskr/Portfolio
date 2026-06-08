(function () {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const bindings = [
    { el: document.querySelector("[data-works-bg-video]"), sceneIndex: 2 },
    { el: document.querySelector("[data-skills-bg-video]"), sceneIndex: 3 },
  ].filter(function (binding) {
    return Boolean(binding.el);
  });

  if (!bindings.length) {
    return;
  }

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

  function sync(activeIndex) {
    if (reducedMotion) {
      return;
    }

    bindings.forEach(function (binding) {
      if (activeIndex === binding.sceneIndex) {
        ensureVideoSrc(binding.el);
        binding.el.play().catch(function () {
          /* autoplay may be blocked */
        });
      } else {
        binding.el.pause();
      }
    });
  }

  document.addEventListener("scenes:change", function (event) {
    sync(event.detail.index);
  });

  sync(Number(document.body.dataset.scene) || 0);
})();
