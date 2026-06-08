(function () {
  if (window.matchMedia("(max-width: 768px)").matches) {
    return;
  }

  const PADDING = 16;
  const CURSOR_GAP = 44;
  const CARD_GAP = 28;
  const items = document.querySelectorAll(".works__item");
  const controllers = [];

  items.forEach(function (item) {
    const card = item.querySelector(".works__card");
    const panel = item.querySelector(".works__challenge-panel");

    if (!panel || !card) {
      return;
    }

    let rafId = null;
    let lastX = 0;
    let lastY = 0;

    function canShowPanel() {
      return (
        item.classList.contains("is-center") &&
        item.classList.contains("is-settled") &&
        !item.classList.contains("is-animating")
      );
    }

    function mountPanel() {
      if (panel.parentElement !== document.body) {
        document.body.appendChild(panel);
      }
    }

    function restorePanel() {
      if (panel.parentElement === document.body) {
        card.appendChild(panel);
      }
    }

    function clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }

    function cursorOnCard(clientX, clientY, cardRect) {
      return (
        clientX >= cardRect.left &&
        clientX <= cardRect.right &&
        clientY >= cardRect.top &&
        clientY <= cardRect.bottom
      );
    }

    function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
      return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
    }

    function fitsViewport(x, y, panelW, panelH, minX, minY, maxX, maxY) {
      return x >= minX && y >= minY && x + panelW <= maxX && y + panelH <= maxY;
    }

    function hitsCard(x, y, panelW, panelH, cardRect) {
      return rectsOverlap(
        x,
        y,
        panelW,
        panelH,
        cardRect.left,
        cardRect.top,
        cardRect.width,
        cardRect.height
      );
    }

    function placeBesideCard(cardRect, panelW, panelH, clientY, minX, minY, maxX, maxY) {
      const anchorY = clamp(clientY - panelH * 0.2, minY, maxY - panelH);
      const rightX = cardRect.right + CARD_GAP;
      const leftX = cardRect.left - panelW - CARD_GAP;

      if (rightX + panelW <= maxX) {
        return { x: rightX, y: anchorY };
      }

      if (leftX >= minX) {
        return { x: leftX, y: anchorY };
      }

      return {
        x: clamp(rightX, minX, maxX - panelW),
        y: anchorY,
      };
    }

    function placeAtCursor(clientX, clientY, panelW, panelH, minX, minY, maxX, maxY) {
      let x = clientX + CURSOR_GAP;
      let y = clientY + CURSOR_GAP;

      if (x + panelW > maxX) {
        x = clientX - panelW - CURSOR_GAP;
      }

      if (y + panelH > maxY) {
        y = clientY - panelH - CURSOR_GAP;
      }

      return {
        x: clamp(x, minX, maxX - panelW),
        y: clamp(y, minY, maxY - panelH),
      };
    }

    function placePanel(clientX, clientY) {
      if (!canShowPanel()) {
        hidePanel();
        return;
      }

      mountPanel();
      panel.classList.add("is-open");
      item.classList.add("is-panel-open");

      panel.style.visibility = "hidden";
      panel.style.left = "-9999px";
      panel.style.top = "0";

      const panelW = panel.offsetWidth;
      const panelH = panel.offsetHeight;
      const minX = PADDING;
      const minY = PADDING;
      const maxX = window.innerWidth - PADDING;
      const maxY = window.innerHeight - PADDING;
      const cardRect = card.getBoundingClientRect();
      const onCard = cursorOnCard(clientX, clientY, cardRect);

      let position = onCard
        ? placeBesideCard(cardRect, panelW, panelH, clientY, minX, minY, maxX, maxY)
        : placeAtCursor(clientX, clientY, panelW, panelH, minX, minY, maxX, maxY);

      if (hitsCard(position.x, position.y, panelW, panelH, cardRect)) {
        position = placeBesideCard(cardRect, panelW, panelH, clientY, minX, minY, maxX, maxY);
      }

      if (!fitsViewport(position.x, position.y, panelW, panelH, minX, minY, maxX, maxY)) {
        position = placeAtCursor(clientX, clientY, panelW, panelH, minX, minY, maxX, maxY);
      }

      panel.style.left = Math.round(position.x) + "px";
      panel.style.top = Math.round(position.y) + "px";
      panel.style.visibility = "";
    }

    function schedulePlace(clientX, clientY) {
      lastX = clientX;
      lastY = clientY;

      if (rafId !== null) {
        return;
      }

      rafId = requestAnimationFrame(function () {
        rafId = null;
        if (!canShowPanel()) {
          hidePanel();
          return;
        }
        placePanel(lastX, lastY);
      });
    }

    function showAtPointer(event) {
      if (!canShowPanel()) {
        return;
      }
      schedulePlace(event.clientX, event.clientY);
    }

    function showAtCardCenter() {
      if (!canShowPanel()) {
        hidePanel();
        return;
      }
      const rect = card.getBoundingClientRect();
      schedulePlace(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }

    function hidePanel() {
      panel.classList.remove("is-open");
      item.classList.remove("is-panel-open");
      panel.style.left = "";
      panel.style.top = "";
      panel.style.visibility = "";
      restorePanel();

      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    card.addEventListener("mouseenter", showAtPointer);
    card.addEventListener("mousemove", showAtPointer);
    card.addEventListener("mouseleave", function () {
      hidePanel();
    });

    item.addEventListener("focusin", showAtCardCenter);

    item.addEventListener("focusout", function (event) {
      if (!item.contains(event.relatedTarget)) {
        hidePanel();
      }
    });

    controllers.push({
      hide: hidePanel,
      isOpen: function () {
        return panel.classList.contains("is-open");
      },
      reposition: function () {
        if (panel.classList.contains("is-open")) {
          placePanel(lastX, lastY);
        }
      },
    });
  });

  function hideAllPanels() {
    controllers.forEach(function (controller) {
      controller.hide();
    });
  }

  window.WorksChallenges = {
    hideAll: hideAllPanels,
  };

  function repositionOpenPanels() {
    controllers.forEach(function (controller) {
      if (controller.isOpen()) {
        controller.reposition();
      }
    });
  }

  window.addEventListener("scroll", repositionOpenPanels, { passive: true });
  window.addEventListener("resize", repositionOpenPanels, { passive: true });
})();
