(function () {
  const heroScene = document.querySelector(".scene--hero");
  const backdrop = document.querySelector("[data-hero-parallax]");
  if (!heroScene || !backdrop) {
    return;
  }

  const bgLayer = backdrop.querySelector('[data-hero-layer="bg"]');
  const meLayer = backdrop.querySelector('[data-hero-layer="me"]');
  if (!bgLayer || !meLayer) {
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobileHero = window.matchMedia("(max-width: 768px)");

  function isMobileHero() {
    return mobileHero.matches;
  }
  const BG_STRENGTH = { x: 14, y: 10 };
  const ME_STRENGTH = { x: 26, y: 14 };
  const ME_BASE_Y = 34;
  const ME_MAX_UP = 10;
  const BASE_SHIFT_X = -32;
  const BG_SCALE = 1.08;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let rafId = null;

  function isHeroActive() {
    return heroScene.classList.contains("is-active");
  }

  function getMeOffsetY() {
    const motionY = currentY * ME_STRENGTH.y;
    const upward = Math.min(motionY, 0);
    const clampedUp = Math.max(upward, -ME_MAX_UP);
    return ME_BASE_Y + (motionY > 0 ? motionY : clampedUp);
  }

  function setStaticLayers() {
    bgLayer.style.transform =
      "translate3d(" + BASE_SHIFT_X + "px, 0, 0) scale(" + BG_SCALE + ")";
    meLayer.style.transform =
      "translate3d(" + BASE_SHIFT_X + "px, " + ME_BASE_Y + "px, 0)";
  }

  function onPointerMove(event) {
    if (!isHeroActive()) {
      return;
    }

    const rect = heroScene.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return;
    }

    targetX = (event.clientX - rect.left) / rect.width - 0.5;
    targetY = (event.clientY - rect.top) / rect.height - 0.5;
  }

  function onPointerLeave() {
    targetX = 0;
    targetY = 0;
  }

  function tick() {
    currentX += (targetX - currentX) * 0.09;
    currentY += (targetY - currentY) * 0.09;

    const bgX = currentX * -BG_STRENGTH.x;
    const bgY = currentY * -BG_STRENGTH.y;
    const meX = currentX * ME_STRENGTH.x;
    const meY = getMeOffsetY();

    bgLayer.style.transform =
      "translate3d(" + (BASE_SHIFT_X + bgX) + "px, " + bgY + "px, 0) scale(" + BG_SCALE + ")";
    meLayer.style.transform =
      "translate3d(" + (BASE_SHIFT_X + meX) + "px, " + meY + "px, 0)";

    rafId = requestAnimationFrame(tick);
  }

  function start() {
    if (reducedMotion || isMobileHero() || rafId) {
      return;
    }
    setStaticLayers();
    rafId = requestAnimationFrame(tick);
  }

  function stop() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    targetX = 0;
    targetY = 0;
    currentX = 0;
    currentY = 0;
    setStaticLayers();
  }

  function shouldAnimate() {
    return !reducedMotion && !isMobileHero();
  }

  if (!shouldAnimate()) {
    setStaticLayers();
  }

  mobileHero.addEventListener("change", function () {
    if (!shouldAnimate()) {
      stop();
      return;
    }
    if (isHeroActive()) {
      start();
    }
  });

  heroScene.addEventListener("mousemove", onPointerMove);
  heroScene.addEventListener("mouseleave", onPointerLeave);
  heroScene.addEventListener(
    "touchmove",
    function (event) {
      if (event.touches[0]) {
        onPointerMove(event.touches[0]);
      }
    },
    { passive: true }
  );
  heroScene.addEventListener("touchend", onPointerLeave);
  document.addEventListener("scenes:change", function (event) {
    if (event.detail.index === 0) {
      start();
    } else {
      stop();
    }
  });

  if (isHeroActive() && shouldAnimate()) {
    start();
  }
})();
