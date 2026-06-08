(function () {
  const root = document.querySelector("[data-skills-cards]");
  if (!root) {
    return;
  }

  const stack = root.querySelector("[data-skills-stack]");
  const viewport = root.querySelector(".skills-cards__viewport");
  const cards = stack ? Array.from(stack.querySelectorAll("[data-skill-card]")) : [];
  const bookmarks = Array.from(root.querySelectorAll("[data-skill-bookmark]"));

  if (!stack || !cards.length) {
    return;
  }

  let index = 0;
  const total = cards.length;
  const SWIPE_THRESHOLD = 48;
  let touchStartX = 0;
  let touchStartY = 0;

  function isSkillsScene() {
    return document.body.dataset.scene === "3";
  }

  function clamp(i) {
    const n = i % total;
    return n < 0 ? n + total : n;
  }

  function render() {
    cards.forEach(function (card, i) {
      const offset = clamp(i - index);
      card.style.setProperty("--offset", String(offset));
      card.classList.toggle("is-active", offset === 0);
      card.classList.toggle("is-hidden", offset >= 4);
      card.setAttribute("aria-hidden", offset === 0 ? "false" : "true");
    });

    bookmarks.forEach(function (bookmark, i) {
      const active = i === index;
      const tab = bookmark.querySelector(".skills-bookmark__tab");
      bookmark.classList.toggle("is-active", active);
      bookmark.setAttribute("aria-current", active ? "true" : "false");

      if (!tab) {
        return;
      }

      if (active) {
        const iconCount = bookmark.querySelectorAll(".skills-bookmark__icon").length;
        const minW = 2.4 + iconCount * 0.55 + 0.75;
        tab.style.setProperty("--tab-min-w", minW + "rem");
        tab.style.setProperty("--tab-min-h", "2.55rem");
        tab.style.setProperty("--tab-pad-x", "0.9rem");
        tab.style.setProperty("--tab-pad-y", "0.5rem");
      } else {
        tab.style.removeProperty("--tab-min-w");
        tab.style.removeProperty("--tab-min-h");
        tab.style.removeProperty("--tab-pad-x");
        tab.style.removeProperty("--tab-pad-y");
      }
    });
  }

  function go(delta) {
    index = clamp(index + delta);
    render();
  }

  function goTo(nextIndex) {
    index = clamp(nextIndex);
    render();
  }

  bookmarks.forEach(function (bookmark) {
    bookmark.addEventListener("click", function () {
      goTo(Number(bookmark.getAttribute("data-skill-bookmark")));
    });
  });

  document.addEventListener("keydown", function (event) {
    if (!isSkillsScene()) {
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    }
  });

  stack.addEventListener("click", function (event) {
    const card = event.target && event.target.closest ? event.target.closest("[data-skill-card]") : null;
    if (!card) {
      return;
    }
    const i = cards.indexOf(card);
    if (i < 0) {
      return;
    }
    goTo(i);
  });

  if (viewport) {
    viewport.addEventListener(
      "touchstart",
      function (event) {
        if (!isSkillsScene() || event.touches.length !== 1) {
          return;
        }
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
      },
      { passive: true }
    );

    viewport.addEventListener(
      "touchend",
      function (event) {
        if (!isSkillsScene()) {
          return;
        }

        const touch = event.changedTouches[0];
        const dx = touchStartX - touch.clientX;
        const dy = touchStartY - touch.clientY;

        if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) {
          return;
        }

        go(dx > 0 ? 1 : -1);
      },
      { passive: true }
    );
  }

  render();
})();
