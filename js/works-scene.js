(function () {

  const hub = document.querySelector("[data-works-hub]");

  if (!hub || typeof gsap === "undefined") {

    return;

  }

  const filters = Array.from(hub.querySelectorAll("[data-works-filter]"));

  const panels = Array.from(hub.querySelectorAll("[data-works-panel]"));

  const loopFill = hub.querySelector("[data-works-loop-fill]");

  const panelOrder = ["web", "unity"];

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const mobileQuery = window.matchMedia("(max-width: 768px)");

  const DURATION = reducedMotion ? 0.01 : 0.9;

  const AUTO_MS = 4200;

  const DEG = Math.PI / 180;

  const DRAG_THRESHOLD = 60;

  const DRAG_DEG_PER_PX = 0.16;

  function isMobileLayout() {

    return mobileQuery.matches;

  }

  function updateLayoutMode() {

    hub.classList.toggle("is-flat", isMobileLayout());

  }

  function getSpread() {

    return 38;

  }

  function getRadius() {

    return 780;

  }

  let panelKey = "unity";

  const cylinders = new Map();

  let activeCylinder = null;

  let loopTween = null;

  let cardHoverCount = 0;

  function WorksCylinder(panelEl) {

    this.panel = panelEl;

    this.viewport = panelEl.querySelector("[data-works-viewport]");

    this.stage = panelEl.querySelector("[data-works-stage]");

    this.ring = panelEl.querySelector("[data-works-ring]");

    this.items = this.ring ? Array.from(this.ring.querySelectorAll(".works__item")) : [];

    this.count = this.items.length;

    this.index = 0;

    this.busy = false;

    this.dragDeg = 0;

    this.dragShift = 0;

    this.suppressClick = false;

    this.items.forEach(function (item) {

      gsap.set(item, {

        position: "absolute",

        left: "50%",

        top: "50%",

        xPercent: -50,

        yPercent: -50,

        transformStyle: isMobileLayout() ? "flat" : "preserve-3d",

        force3D: false,

      });

    });

    this.bindDrag();

    this.bindTap();

    this.layout(true);

  }

  WorksCylinder.prototype.getOffset = function (itemIndex) {

    let offset = itemIndex - this.index;

    const half = this.count / 2;

    while (offset > half) {

      offset -= this.count;

    }

    while (offset < -half) {

      offset += this.count;

    }

    return offset;

  };

  WorksCylinder.prototype.getSlideWidth = function () {

    if (!this.viewport) {

      return window.innerWidth;

    }

    const sample = this.items[0];

    const cardWidth = sample ? sample.offsetWidth : this.viewport.clientWidth * 0.92;

    return Math.max(cardWidth + 24, this.viewport.clientWidth * 0.9);

  };

  WorksCylinder.prototype.applyItemMotion = function (item, vars, instant) {

    if (instant) {

      gsap.set(item, vars);

    } else {

      gsap.to(item, vars);

    }

  };

  WorksCylinder.prototype.clearCaptionTransform = function (item) {

    const caption = item.querySelector(".works__caption");

    if (caption) {

      gsap.set(caption, { clearProps: "transform" });

    }

  };

  WorksCylinder.prototype.isCenterIdle = function () {

    return !this.busy && Math.abs(this.dragDeg) < 0.01 && Math.abs(this.dragShift) < 0.5;

  };

  WorksCylinder.prototype.snapIdleCenter = function () {

    if (!this.isCenterIdle()) {

      return;

    }

    const self = this;

    this.items.forEach(function (item, itemIndex) {

      const offset = self.getOffset(itemIndex);

      if (offset !== 0) {

        return;

      }

      item.classList.remove("is-animating");

      item.classList.add("is-settled");

      gsap.set(item, {

        x: 0,

        y: 0,

        z: 0,

        rotationY: 0,

        scale: 1,

        opacity: 1,

        force3D: false,

        transformStyle: "flat",

      });

      self.clearCaptionTransform(item);

    });

  };

  WorksCylinder.prototype.layoutFlat = function (instant) {

    const self = this;

    const slideWidth = this.getSlideWidth();

    this.items.forEach(function (item, itemIndex) {

      const offset = self.getOffset(itemIndex);

      const x = Math.round(offset * slideWidth + self.dragShift);

      const opacity = offset === 0 ? 1 : 0;

      const delay = Math.abs(offset) * 0.05;

      item.classList.toggle("is-center", offset === 0);

      item.classList.toggle("is-animating", !instant && self.busy);

      self.applyItemMotion(

        item,

        {

          x: x,

          y: 0,

          z: 0,

          rotationY: 0,

          scale: 1,

          opacity: opacity,

          zIndex: offset === 0 ? 120 : 80,

          pointerEvents: offset === 0 ? "auto" : "none",

          force3D: false,

          duration: instant ? 0 : DURATION,

          ease: "power3.out",

          delay: instant ? 0 : delay,

          overwrite: "auto",

        },

        instant

      );

      self.clearCaptionTransform(item);

    });

    if (instant) {

      this.snapIdleCenter();

    }

  };

  WorksCylinder.prototype.layoutCylinder = function (instant) {

    const self = this;

    this.items.forEach(function (item, itemIndex) {

      const offset = self.getOffset(itemIndex);

      const spread = getSpread();

      const radius = getRadius();

      const angle = offset * spread + self.dragDeg;

      const rad = angle * DEG;

      const x = Math.round(Math.sin(rad) * radius);

      const centerIdle = offset === 0 && self.isCenterIdle();

      const z = centerIdle ? 0 : Math.cos(rad) * radius - radius;

      const scale = offset === 0 ? 1 : Math.max(0.5, 0.8 - Math.abs(offset) * 0.2);

      const opacity =

        offset === 0 ? 1 : Math.abs(offset) > 1.9 ? 0 : 0.68;

      const rotateY = centerIdle ? 0 : angle;

      const delay = Math.abs(offset) * 0.07;

      const media = item.querySelector(".works__image, .works__video");

      const caption = item.querySelector(".works__caption");

      item.classList.toggle("is-center", offset === 0);

      item.classList.toggle("is-animating", !instant && self.busy);

      if (!centerIdle) {

        item.classList.remove("is-settled");

        if (!isMobileLayout()) {

          gsap.set(item, { transformStyle: "preserve-3d" });

        }

      }

      self.applyItemMotion(

        item,

        {

          x: x,

          z: z,

          rotationY: rotateY,

          scale: scale,

          opacity: opacity,

          zIndex: centerIdle ? 200 : Math.round(120 - Math.abs(offset) * 12),

          pointerEvents: Math.abs(offset) > 1.6 ? "none" : "auto",

          force3D: centerIdle ? false : undefined,

          duration: instant ? 0 : DURATION,

          ease: "power3.out",

          delay: instant ? 0 : delay,

          overwrite: "auto",

        },

        instant

      );

      if (media) {

        gsap.to(media, {

          scale: 1,

          duration: instant ? 0 : DURATION * 0.85,

          ease: "power3.out",

          delay: instant ? 0 : delay,

        });

      }

      if (caption) {

        if (centerIdle) {

          self.clearCaptionTransform(item);

        } else {

          const capVars = {

            rotationY: -rotateY,

            duration: instant ? 0 : DURATION,

            ease: "power3.out",

            delay: instant ? 0 : delay,

            overwrite: "auto",

          };

          if (instant) {

            gsap.set(caption, capVars);

          } else {

            gsap.to(caption, capVars);

          }

        }

      }

    });

    if (instant) {

      this.snapIdleCenter();

    }

  };

  WorksCylinder.prototype.layout = function (instant) {

    if (isMobileLayout()) {

      this.layoutFlat(instant);

    } else {

      this.layoutCylinder(instant);

    }

  };

  WorksCylinder.prototype.step = function (delta) {

    if (this.busy || this.count < 2) {

      return false;

    }

    dismissChallengePanels();

    this.index = (this.index + delta + this.count) % this.count;

    this.busy = true;

    this.items.forEach(function (item) {

      item.classList.remove("is-settled");

    });

    this.layout(false);

    const self = this;

    gsap.delayedCall(DURATION + 0.12, function () {

      self.busy = false;

      self.items.forEach(function (item) {

        item.classList.remove("is-animating");

      });

      self.layout(true);

      self.snapIdleCenter();

    });

    return true;

  };

  WorksCylinder.prototype.reset = function () {

    this.index = 0;

    this.dragDeg = 0;

    this.dragShift = 0;

    this.layout(true);

  };

  WorksCylinder.prototype.bindDrag = function () {

    if (!this.viewport) {

      return;

    }

    const self = this;

    let dragStartX = 0;

    let dragX = 0;

    let isDragging = false;

    this.viewport.addEventListener("pointerdown", function (event) {

      if (event.button !== 0 || self.busy) {

        return;

      }

      if (isInteractiveTarget(event.target)) {

        return;

      }

      isDragging = true;

      self.suppressClick = false;

      dismissChallengePanels();

      self.items.forEach(function (item) {

        item.classList.remove("is-settled");

      });

      dragStartX = event.clientX;

      dragX = 0;

      self.dragDeg = 0;

      self.dragShift = 0;

      self.viewport.setPointerCapture(event.pointerId);

      self.viewport.classList.add("is-dragging");

      pauseLoop();

    });

    this.viewport.addEventListener("pointermove", function (event) {

      if (!isDragging) {

        return;

      }

      dragX = event.clientX - dragStartX;

      if (Math.abs(dragX) > 8) {

        self.suppressClick = true;

      }

      if (isMobileLayout()) {

        self.dragShift = dragX;

        self.dragDeg = 0;

      } else {

        self.dragDeg = dragX * DRAG_DEG_PER_PX;

        self.dragShift = 0;

      }

      self.layout(true);

    });

    function endDrag(event) {

      if (!isDragging) {

        return;

      }

      isDragging = false;

      self.viewport.classList.remove("is-dragging");

      try {

        self.viewport.releasePointerCapture(event.pointerId);

      } catch (error) {

        /* pointer may already be released */

      }

      if (Math.abs(dragX) > DRAG_THRESHOLD) {

        self.dragDeg = 0;

        self.dragShift = 0;

        self.step(dragX < 0 ? 1 : -1);

        startAuto();

      } else {

        self.dragDeg = 0;

        self.dragShift = 0;

        self.layout(false);

        gsap.delayedCall(DURATION + 0.08, function () {

          self.snapIdleCenter();

        });

        if (cardHoverCount > 0) {

          pauseLoop();

        } else {

          resumeLoop();

        }

      }

    }

    this.viewport.addEventListener("pointerup", endDrag);

    this.viewport.addEventListener("pointercancel", endDrag);

  };

  WorksCylinder.prototype.bindTap = function () {

    const self = this;

    this.items.forEach(function (item, itemIndex) {

      item.addEventListener("click", function (event) {

        if (isInteractiveTarget(event.target)) {

          return;

        }

        if (self.suppressClick) {

          event.preventDefault();

          event.stopPropagation();

          self.suppressClick = false;

          return;

        }

        const offset = self.getOffset(itemIndex);

        if (offset < 0) {

          pauseAuto();

          self.step(-1);

          startAuto();

        } else if (offset > 0) {

          pauseAuto();

          self.step(1);

          startAuto();

        }

      });

    });

  };

  panels.forEach(function (panel) {

    cylinders.set(panel.dataset.worksPanel, new WorksCylinder(panel));

  });

  function getActiveCylinder() {

    return cylinders.get(panelKey) || null;

  }

  function isInsideWorks(fromTarget) {

    return Boolean(fromTarget && fromTarget.closest && fromTarget.closest("[data-works-hub]"));

  }

  function isOnCenterCard(fromTarget) {

    return Boolean(

      fromTarget && fromTarget.closest && fromTarget.closest(".works__item.is-center")

    );

  }

  function isInteractiveTarget(fromTarget) {

    return Boolean(

      fromTarget &&

        fromTarget.closest &&

        fromTarget.closest("a, button, .works__action, .works__actions")

    );

  }

  function panelIndex() {

    return panelOrder.indexOf(panelKey);

  }

  function dismissChallengePanels() {

    if (window.WorksChallenges && typeof window.WorksChallenges.hideAll === "function") {

      window.WorksChallenges.hideAll();

    }

  }

  function setPanel(nextKey) {

    if (!panelOrder.includes(nextKey) || nextKey === panelKey) {

      return false;

    }

    dismissChallengePanels();

    panels.forEach(function (panel) {

      const active = panel.dataset.worksPanel === nextKey;

      panel.classList.toggle("is-active", active);

      panel.hidden = !active;

    });

    filters.forEach(function (filter) {

      filter.classList.toggle("is-active", filter.dataset.worksFilter === nextKey);

    });

    panelKey = nextKey;

    activeCylinder = getActiveCylinder();

    if (activeCylinder) {

      activeCylinder.reset();

    }

    return true;

  }

  function stepPanel(delta) {

    const idx = panelIndex() + delta;

    if (idx < 0 || idx >= panelOrder.length) {

      return false;

    }

    return setPanel(panelOrder[idx]);

  }

  function stepCard(delta) {

    const cylinder = getActiveCylinder();

    return cylinder ? cylinder.step(delta) : false;

  }

  function resetLoopGauge() {

    if (loopTween) {

      loopTween.kill();

      loopTween = null;

    }

    if (loopFill) {

      gsap.set(loopFill, { scaleX: 0, transformOrigin: "left center" });

    }

  }

  function startLoopGauge() {

    resetLoopGauge();

    if (reducedMotion || document.body.dataset.scene !== "2" || !loopFill) {

      return;

    }

    loopTween = gsap.to(loopFill, {

      scaleX: 1,

      duration: AUTO_MS / 1000,

      ease: "none",

      onComplete: function () {

        stepCard(1);

        startLoopGauge();

      },

    });

  }

  function stopAuto() {

    resetLoopGauge();

  }

  function startAuto() {

    stopAuto();

    if (reducedMotion || document.body.dataset.scene !== "2") {

      return;

    }

    startLoopGauge();

  }

  function pauseAuto() {

    stopAuto();

  }

  function pauseLoop() {

    if (loopTween) {

      loopTween.pause();

    }

  }

  function resumeLoop() {

    if (reducedMotion || document.body.dataset.scene !== "2") {

      return;

    }

    if (loopTween && loopTween.paused()) {

      loopTween.resume();

    } else if (!loopTween && loopFill) {

      startLoopGauge();

    }

  }

  function consumeWheel(delta, fromTarget) {

    if (!isInsideWorks(fromTarget) || !isOnCenterCard(fromTarget)) {

      return false;

    }

    pauseAuto();

    stepCard(delta > 0 ? 1 : -1);

    startAuto();

    return true;

  }

  filters.forEach(function (filter) {

    filter.addEventListener("click", function () {

      pauseAuto();

      setPanel(filter.dataset.worksFilter);

      startAuto();

    });

  });

  hub.querySelectorAll(".works__card").forEach(function (card) {

    card.addEventListener("mouseenter", function () {

      cardHoverCount += 1;

      if (cardHoverCount === 1) {

        pauseLoop();

      }

    });

    card.addEventListener("mouseleave", function () {

      cardHoverCount = Math.max(0, cardHoverCount - 1);

      if (cardHoverCount === 0 && !hub.querySelector(".works-cylinder__viewport.is-dragging")) {

        resumeLoop();

      }

    });

  });

  document.addEventListener("keydown", function (event) {

    if (document.body.dataset.scene !== "2") {

      return;

    }

    if (event.key === "ArrowLeft") {

      event.preventDefault();

      pauseAuto();

      stepCard(-1);

      startAuto();

    } else if (event.key === "ArrowRight") {

      event.preventDefault();

      pauseAuto();

      stepCard(1);

      startAuto();

    }

  });

  document.addEventListener("scenes:change", function (event) {

    if (event.detail.index === 2) {

      startAuto();

    } else {

      stopAuto();

    }

  });

  function relayoutAll(instant) {

    updateLayoutMode();

    cylinders.forEach(function (cylinder) {

      cylinder.items.forEach(function (item) {

        gsap.set(item, {

          transformStyle: isMobileLayout() ? "flat" : "preserve-3d",

          force3D: false,

        });

      });

      cylinder.dragDeg = 0;

      cylinder.dragShift = 0;

      cylinder.layout(instant);

    });

  }

  updateLayoutMode();

  activeCylinder = getActiveCylinder();

  if (document.body.dataset.scene === "2") {

    startAuto();

  }

  window.addEventListener("resize", function () {

    relayoutAll(true);

  });

  if (mobileQuery.addEventListener) {

    mobileQuery.addEventListener("change", function () {

      relayoutAll(true);

    });

  }

  window.WorksScene = {

    step: stepPanel,

    stepCard: stepCard,

    canLeaveScene: function () {

      return true;

    },

    consumeWheel: consumeWheel,

    reset: function () {

      setPanel("unity");

      cylinders.forEach(function (cylinder) {

        cylinder.reset();

      });

      startAuto();

    },

  };

})();

