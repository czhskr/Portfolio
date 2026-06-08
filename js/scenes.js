(function () {
  const STAGE = document.getElementById("stage");
  if (!STAGE) {
    return;
  }

  const SCENE_HASHES = ["hero", "about", "works", "skills", "education", "contact"];
  const NAV_MAP = {
    hero: 0,
    about: 1,
    works: 2,
    skills: 3,
    education: 4,
    contact: 5,
    footer: 5,
  };

  const scenes = Array.from(STAGE.querySelectorAll(".scene[data-scene]")).sort(function (a, b) {
    return Number(a.dataset.scene) - Number(b.dataset.scene);
  });

  const sceneCount = scenes.length;
  let currentIndex = 0;
  let isAnimating = false;
  let wheelLocked = false;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const WHEEL_COOLDOWN = reducedMotion ? 200 : 720;

  const SCENE_LABELS = ["Home", "About", "Works", "Skills", "Education", "Contact"];
  const SCENE_NUMERALS = ["i", "ii", "iii", "iv", "v", "vi"];

  const headerNavLinks = document.querySelectorAll(".header__link[data-scene-index]");
  const navLinks = document.querySelectorAll(
    '.header__link[href^="#"], .header__logo[href^="#"]'
  );
  const jumpLinks = document.querySelectorAll("[data-scene-jump]");
  const railList = document.getElementById("scene-rail-list");
  const sceneHint = document.getElementById("scene-hint");

  function clampIndex(index) {
    return Math.max(0, Math.min(sceneCount - 1, index));
  }

  function setAria(scene, active) {
    scene.setAttribute("aria-hidden", String(!active));
  }

  function setAnimating(value) {
    isAnimating = value;
    document.body.classList.toggle("is-scene-locked", value);
  }

  function updateHint(index) {
    if (!sceneHint) {
      return;
    }
    if (index === 2 || index === 5) {
      sceneHint.hidden = true;
      return;
    }
    sceneHint.hidden = false;
    if (index === sceneCount - 1) {
      sceneHint.textContent = "위로 이동";
    } else if (index === 0) {
      sceneHint.textContent = "아래로 이동";
    } else {
      sceneHint.textContent = "휠 · 스와이프";
    }
  }

  function getLinkSceneIndex(link) {
    const dataIndex = link.getAttribute("data-scene-index");
    if (dataIndex !== null && dataIndex !== "") {
      return Number(dataIndex);
    }
    const href = link.getAttribute("href");
    if (!href || href.charAt(0) !== "#") {
      return -1;
    }
    const id = href.slice(1);
    return Object.prototype.hasOwnProperty.call(NAV_MAP, id) ? NAV_MAP[id] : -1;
  }

  function updateNav(index) {
    const hash = SCENE_HASHES[index] || "hero";

    headerNavLinks.forEach(function (link) {
      const linkIndex = getLinkSceneIndex(link);
      link.classList.toggle("is-active", linkIndex === index);
    });

    document.body.dataset.scene = String(index);

    if (railList) {
      railList.querySelectorAll(".scene-rail__btn").forEach(function (btn, i) {
        btn.classList.toggle("is-active", i === index);
        btn.setAttribute("aria-current", i === index ? "true" : "false");
      });
    }

    if (history.replaceState) {
      history.replaceState(null, "", "#" + hash);
    } else {
      location.hash = hash;
    }

    updateHint(index);

    document.dispatchEvent(
      new CustomEvent("scenes:change", {
        detail: { index: index, hash: hash },
      })
    );
  }

  function finishTransition(index, prev) {
    scenes.forEach(function (scene, i) {
      const active = i === index;
      scene.classList.toggle("is-active", active);
      scene.classList.remove("is-leaving", "is-transitioning");
      setAria(scene, active);
    });

    if (prev && prev !== scenes[index]) {
      prev.classList.remove("is-leaving");
    }

    currentIndex = index;
    setAnimating(false);
  }

  function activateScene(index, options) {
    const opts = options || {};
    const target = scenes[index];
    if (!target) {
      return;
    }

    const prev = scenes[currentIndex];
    const direction = index > currentIndex ? 1 : -1;

    if (index !== currentIndex || opts.force) {
      updateNav(index);
    }

    if (prev && prev !== target) {
      prev.classList.add("is-leaving");
      prev.classList.remove("is-active");
      setAria(prev, false);
    }

    target.classList.add("is-transitioning");
    target.classList.remove("is-leaving");
    setAria(target, false);

    if (opts.immediate || !window.ScenesAnimation || !prev || prev === target) {
      if (window.ScenesAnimation) {
        window.ScenesAnimation.snapTo(index);
      }
      finishTransition(index, prev);
      return;
    }

    setAnimating(true);
    window.ScenesAnimation.transition(prev, target, direction, function () {
      finishTransition(index, prev);
    });
  }

  function goTo(index, options) {
    const opts = options || {};
    const next = clampIndex(index);
    if (next === currentIndex && !opts.force) {
      return;
    }
    if (isAnimating && !opts.immediate) {
      return;
    }

    if (next !== 2 && window.WorksScene && typeof window.WorksScene.reset === "function") {
      window.WorksScene.reset();
    }

    activateScene(next, opts);
  }

  function goBy(delta) {
    goTo(currentIndex + delta);
  }

  function indexFromHash() {
    const raw = (location.hash || "#hero").replace("#", "");
    if (Object.prototype.hasOwnProperty.call(NAV_MAP, raw)) {
      return NAV_MAP[raw];
    }
    return 0;
  }

  const SCROLL_SELECTORS =
    ".scene-panel--scroll, [data-works-cylinder], .skills-card__body, .skills-cards__viewport, .contact-footer__body";

  function scrollWithin(el, delta) {
    if (!el || !window.SmoothScroll) {
      return false;
    }
    if (!window.SmoothScroll.canScroll(el, delta)) {
      return false;
    }
    window.SmoothScroll.scrollBy(el, delta);
    return true;
  }

  function findScrollTarget(fromTarget) {
    const activeScene = scenes[currentIndex];
    if (!activeScene) {
      return null;
    }

    if (fromTarget && fromTarget.closest) {
      const nested = fromTarget.closest(SCROLL_SELECTORS);
      if (nested && activeScene.contains(nested)) {
        if (nested.matches("[data-works-cylinder]")) {
          if (currentIndex === 2 || !fromTarget.closest("[data-works-hub]")) {
            return null;
          }
        }
        return nested;
      }
    }

    if (currentIndex === 2) {
      return null;
    }

    return activeScene.querySelector(".scene-panel--scroll, .skills-card__body");
  }

  function tryInternalScroll(delta, fromTarget) {
    if (window.CmdWidget && window.CmdWidget.consumeWheel(delta, fromTarget)) {
      return true;
    }

    if (currentIndex === 2 && window.WorksScene && window.WorksScene.consumeWheel(delta, fromTarget)) {
      return true;
    }

    const scrollEl = findScrollTarget(fromTarget);
    if (scrollWithin(scrollEl, delta)) {
      return true;
    }

    return false;
  }

  function handleWheelDelta(delta) {
    if (delta > 0) {
      goBy(1);
    } else {
      goBy(-1);
    }
  }

  function onWheel(event) {
    if (isAnimating || wheelLocked) {
      event.preventDefault();
      return;
    }

    const delta = event.deltaY;
    if (Math.abs(delta) < 12) {
      return;
    }

    if (tryInternalScroll(delta, event.target)) {
      event.preventDefault();
      return;
    }

    event.preventDefault();

    wheelLocked = true;
    window.setTimeout(function () {
      wheelLocked = false;
    }, WHEEL_COOLDOWN);

    handleWheelDelta(delta);
  }

  let touchStartY = 0;
  let touchStartX = 0;

  function onTouchStart(event) {
    if (event.touches.length !== 1) {
      return;
    }
    touchStartY = event.touches[0].clientY;
    touchStartX = event.touches[0].clientX;
  }

  function onTouchEnd(event) {
    if (isAnimating) {
      return;
    }

    const touch = event.changedTouches[0];
    const dy = touchStartY - touch.clientY;
    const dx = touchStartX - touch.clientX;

    if (Math.abs(dy) < 52 || Math.abs(dy) < Math.abs(dx)) {
      return;
    }

    if (tryInternalScroll(dy, touch.target)) {
      return;
    }

    wheelLocked = true;
    window.setTimeout(function () {
      wheelLocked = false;
    }, WHEEL_COOLDOWN);

    handleWheelDelta(dy);
  }

  function onKeyDown(event) {
    if (isAnimating) {
      return;
    }

    const cmdWidget = document.getElementById("cmd-widget");
    if (cmdWidget && cmdWidget.classList.contains("is-open")) {
      return;
    }

    const tag = (event.target && event.target.tagName) || "";
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) {
      return;
    }
    if (event.target && event.target.isContentEditable) {
      return;
    }

    if (event.key === "ArrowDown" || event.key === "PageDown") {
      event.preventDefault();
      handleWheelDelta(1);
    } else if (event.key === "ArrowUp" || event.key === "PageUp") {
      event.preventDefault();
      handleWheelDelta(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      goTo(0);
    } else if (event.key === "End") {
      event.preventDefault();
      goTo(sceneCount - 1);
    }
  }

  function bindNav() {
    navLinks.forEach(function (link) {
      link.addEventListener("click", function (event) {
        const href = link.getAttribute("href");
        if (!href || href.charAt(0) !== "#") {
          return;
        }
        const sceneIndex = getLinkSceneIndex(link);
        if (sceneIndex < 0) {
          return;
        }
        event.preventDefault();
        goTo(sceneIndex);
      });
    });

    jumpLinks.forEach(function (link) {
      link.addEventListener("click", function (event) {
        const jump = link.getAttribute("data-scene-jump");
        if (jump === null) {
          return;
        }
        event.preventDefault();
        goTo(Number(jump));
      });
    });
  }

  function buildSceneRail() {
    if (!railList) {
      return;
    }
    railList.innerHTML = scenes
      .map(function (_scene, i) {
        const label = SCENE_LABELS[i] || SCENE_HASHES[i];
        const numeral = SCENE_NUMERALS[i] || String(i + 1);
        return (
          '<li class="scene-rail__item">' +
          '<button type="button" class="scene-rail__btn" data-scene-rail="' +
          i +
          '" aria-label="' +
          label +
          '">' +
          '<span class="scene-rail__label">' +
          label +
          "</span>" +
          '<span class="scene-rail__numeral" aria-hidden="true">' +
          numeral +
          "</span>" +
          "</button></li>"
        );
      })
      .join("");

    railList.querySelectorAll(".scene-rail__btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        goTo(Number(btn.getAttribute("data-scene-rail")));
      });
    });
  }

  function preventScroll(event) {
    if (
      event.target.closest(
        ".widget__panel, .cmd-widget, .cmd-widget__output, .works__challenge-panel, .scene-panel--scroll, .works__list, .skills-cards__viewport, .skills-card__body"
      )
    ) {
      return;
    }
    event.preventDefault();
  }

  document.addEventListener("scenes:change", function (event) {
    if (event.detail.index !== 2) {
      document.querySelectorAll(".works__challenge-panel.is-open").forEach(function (panel) {
        panel.classList.remove("is-open");
      });
      document.querySelectorAll("#works-unity .works__video").forEach(function (video) {
        const media = video.closest(".works__media");
        video.pause();
        video.currentTime = 0;
        if (media) {
          media.classList.remove("is-playing");
        }
      });
    }
  });

  document.addEventListener("wheel", onWheel, { passive: false });
  document.addEventListener("touchstart", onTouchStart, { passive: true });
  document.addEventListener("touchend", onTouchEnd, { passive: true });
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("touchmove", preventScroll, { passive: false });

  window.addEventListener("hashchange", function () {
    goTo(indexFromHash(), { force: true, immediate: true });
  });

  buildSceneRail();
  bindNav();

  const startIndex = indexFromHash();
  scenes.forEach(function (scene, i) {
    scene.classList.toggle("is-active", i === startIndex);
    setAria(scene, i === startIndex);
  });
  currentIndex = startIndex;

  if (window.ScenesAnimation) {
    window.ScenesAnimation.init(startIndex);
  }

  updateNav(startIndex);

  window.Scenes = {
    goTo: goTo,
    goBy: goBy,
    getIndex: function () {
      return currentIndex;
    },
    getCount: function () {
      return sceneCount;
    },
    getScenes: function () {
      return scenes;
    },
  };
})();
