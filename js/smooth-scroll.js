(function () {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ease = reducedMotion ? 1 : 0.18;
  const maxDelta = 96;
  const instances = new WeakMap();

  function getState(el) {
    if (!instances.has(el)) {
      instances.set(el, { target: el.scrollTop, raf: null });
      bindSync(el);
    }
    return instances.get(el);
  }

  function bindSync(el) {
    if (el.dataset.smoothScrollBound) {
      return;
    }
    el.dataset.smoothScrollBound = "1";
    el.addEventListener(
      "scroll",
      function () {
        const state = instances.get(el);
        if (state && !state.raf) {
          state.target = el.scrollTop;
        }
      },
      { passive: true }
    );
  }

  function clampTarget(el, value) {
    const max = el.scrollHeight - el.clientHeight;
    return Math.max(0, Math.min(max, value));
  }

  function tick(el, state) {
    state.target = clampTarget(el, state.target);
    const diff = state.target - el.scrollTop;

    if (Math.abs(diff) < 0.5) {
      el.scrollTop = state.target;
      state.raf = null;
      return;
    }

    el.scrollTop += diff * ease;
    state.raf = requestAnimationFrame(function () {
      tick(el, state);
    });
  }

  function normalizeDelta(delta) {
    return Math.sign(delta) * Math.min(Math.abs(delta), maxDelta);
  }

  function canScroll(el, delta) {
    if (!el) {
      return false;
    }
    const max = el.scrollHeight - el.clientHeight;
    if (max <= 4) {
      return false;
    }
    const state = instances.get(el);
    const target = state ? state.target : el.scrollTop;
    if (delta > 0) {
      return el.scrollTop < max - 2 || target < max - 2;
    }
    return el.scrollTop > 2 || target > 2;
  }

  function isAtEdge(el, delta) {
    if (!el) {
      return true;
    }
    const max = el.scrollHeight - el.clientHeight;
    if (max <= 4) {
      return true;
    }
    const state = instances.get(el);
    const target = state ? state.target : el.scrollTop;
    if (delta > 0) {
      return el.scrollTop >= max - 2 && target >= max - 2;
    }
    return el.scrollTop <= 2 && target <= 2;
  }

  function scrollBy(el, delta) {
    if (!el) {
      return false;
    }
    const step = normalizeDelta(delta);
    const max = el.scrollHeight - el.clientHeight;
    if (max <= 4) {
      return false;
    }

    const state = getState(el);
    if (!state.raf) {
      state.target = el.scrollTop;
    }

    state.target = clampTarget(el, state.target + step);

    if (reducedMotion) {
      el.scrollTop = state.target;
      return true;
    }

    if (!state.raf) {
      state.raf = requestAnimationFrame(function () {
        tick(el, state);
      });
    }
    return true;
  }

  window.SmoothScroll = {
    scrollBy: scrollBy,
    canScroll: canScroll,
    isAtEdge: isAtEdge,
  };
})();
