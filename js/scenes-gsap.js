(function () {
  const STAGE = document.getElementById("stage");
  if (!STAGE || typeof gsap === "undefined") {
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scenes = Array.from(STAGE.querySelectorAll(".scene[data-scene]")).sort(function (a, b) {
    return Number(a.dataset.scene) - Number(b.dataset.scene);
  });

  let masterTween = null;
  let irisEl = null;
  let irisPulse = null;

  const DURATION = reducedMotion ? 0.01 : 0.88;
  const EASE = "power3.inOut";

  function getReveals(scene) {
    if (!scene) {
      return [];
    }
    return scene.querySelectorAll(".scene-reveal:not(.scene-panel)");
  }

  function getPanels(scene) {
    if (!scene) {
      return [];
    }
    return scene.querySelectorAll(".scene-panel");
  }

  function resetReveals(scene) {
    getReveals(scene).forEach(function (el) {
      gsap.set(el, { clearProps: "all" });
    });
    getPanels(scene).forEach(function (panel) {
      gsap.set(panel, { clearProps: "transform,opacity" });
    });
  }

  function resetSceneMotion(scene) {
    if (!scene) {
      return;
    }
    gsap.set(scene, {
      clearProps: "transform,filter,clipPath,opacity",
    });
  }

  function prepareIncomingScene(scene) {
    resetReveals(scene);
    getPanels(scene).forEach(function (panel) {
      gsap.set(panel, { opacity: 1, scale: 1, y: 0 });
    });
    getReveals(scene).forEach(function (el) {
      gsap.set(el, { opacity: 1, y: 0 });
    });
  }

  function getIrisAnchor() {
    const rail = document.querySelector(".scene-rail");
    if (rail && window.getComputedStyle(rail).display !== "none") {
      const rect = rail.getBoundingClientRect();
      return {
        x: ((rect.left + 14) / window.innerWidth) * 100,
        y: ((rect.top + 18) / window.innerHeight) * 100,
        px: rect.left + 14,
        py: rect.top + 18,
      };
    }

    return {
      x: 10,
      y: 20,
      px: window.innerWidth * 0.1,
      py: window.innerHeight * 0.2,
    };
  }

  function circleClip(radius, anchor) {
    return "circle(" + radius + "% at " + anchor.x + "% " + anchor.y + "%)";
  }

  function ensureIrisOverlay() {
    if (irisEl) {
      return;
    }

    irisEl = document.createElement("div");
    irisEl.className = "scene-iris";
    irisEl.setAttribute("aria-hidden", "true");

    irisPulse = document.createElement("span");
    irisPulse.className = "scene-iris__pulse";

    irisEl.appendChild(irisPulse);
    document.body.appendChild(irisEl);
  }

  function positionIrisOverlay(anchor) {
    ensureIrisOverlay();
    irisEl.style.left = anchor.px + "px";
    irisEl.style.top = anchor.py + "px";
  }

  function hideIrisOverlay() {
    if (!irisEl) {
      return;
    }
    gsap.set(irisPulse, { clearProps: "all" });
  }

  function layoutScene(activeIndex) {
    scenes.forEach(function (scene, i) {
      const active = i === activeIndex;
      gsap.set(scene, {
        opacity: active ? 1 : 0,
        yPercent: 0,
        y: 0,
        scale: 1,
        filter: "none",
        clipPath: "none",
        zIndex: active ? 2 : 0,
        visibility: active ? "visible" : "hidden",
      });
    });
  }

  function playReveal(scene, direction) {
    const reveals = getReveals(scene);
    const panels = getPanels(scene);
    if (reducedMotion) {
      return;
    }

    if (panels.length) {
      gsap.fromTo(
        panels,
        { scale: 0.97, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.58,
          ease: "power3.out",
          delay: 0.12,
          clearProps: "transform,opacity",
        }
      );
    }

    if (!reveals.length) {
      return;
    }

    gsap.fromTo(
      reveals,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.45,
        stagger: 0.05,
        ease: "power2.out",
        delay: panels.length ? 0.18 : 0.1,
        clearProps: "opacity",
      }
    );
  }

  function playIrisPulse(anchor) {
    if (reducedMotion) {
      return;
    }

    positionIrisOverlay(anchor);

    gsap.set(irisPulse, { scale: 0.2, opacity: 0 });

    masterTween.to(
      irisPulse,
      {
        scale: 32,
        opacity: 0.42,
        duration: DURATION * 0.72,
        ease: "power2.out",
      },
      0
    );

    masterTween.to(
      irisPulse,
      {
        opacity: 0,
        duration: DURATION * 0.3,
      },
      DURATION * 0.5
    );
  }

  window.ScenesAnimation = {
    snapTo: function (index) {
      layoutScene(index);
    },

    init: function (startIndex) {
      layoutScene(startIndex);
      playReveal(scenes[startIndex], 1);
    },

    transition: function (fromScene, toScene, direction, onComplete) {
      if (!toScene) {
        if (onComplete) {
          onComplete();
        }
        return;
      }

      if (masterTween) {
        masterTween.kill();
      }

      document.body.classList.add("is-scene-locked");

      const anchor = getIrisAnchor();
      const clipStart = circleClip(0, anchor);
      const clipEnd = circleClip(170, anchor);
      const toIndex = Number(toScene.dataset.scene);

      prepareIncomingScene(toScene);

      scenes.forEach(function (scene) {
        const isFrom = scene === fromScene;
        const isTo = scene === toScene;

        if (isFrom || isTo) {
          gsap.set(scene, { visibility: "visible" });
        }

        if (isTo) {
          gsap.set(scene, {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "none",
            clipPath: clipStart,
            zIndex: 4,
          });
        } else if (isFrom) {
          gsap.set(scene, {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "none",
            clipPath: "none",
            zIndex: 3,
          });
        }
      });

      masterTween = gsap.timeline({
        defaults: { duration: DURATION, ease: EASE },
        onComplete: function () {
          layoutScene(toIndex);

          if (fromScene) {
            resetReveals(fromScene);
            resetSceneMotion(fromScene);
          }

          resetSceneMotion(toScene);
          hideIrisOverlay();
          document.body.classList.remove("is-scene-locked");
          masterTween = null;

          if (onComplete) {
            onComplete();
          }
        },
      });

      if (fromScene) {
        masterTween.to(
          fromScene,
          {
            opacity: 0,
            scale: direction > 0 ? 0.97 : 0.98,
            filter: "blur(12px) brightness(0.55)",
            duration: DURATION * 0.82,
            ease: "power2.in",
          },
          0
        );
      }

      masterTween.to(
        toScene,
        {
          clipPath: clipEnd,
          duration: DURATION,
          ease: EASE,
        },
        0
      );

      playIrisPulse(anchor);
    },
  };
})();
