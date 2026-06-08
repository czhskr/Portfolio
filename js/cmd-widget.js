(function () {
  const cmdWidget = document.getElementById("cmd-widget");
  const cmdToggle = document.getElementById("cmd-toggle");
  const cmdClose = document.querySelector(".cmd-widget__close");
  const cmdOutput = document.getElementById("cmd-output");
  const cmdForm = document.getElementById("cmd-form");
  const cmdInput = document.getElementById("cmd-input");

  if (!cmdWidget || !cmdToggle || !cmdOutput || !cmdForm || !cmdInput) {
    return;
  }

  const SCENE_MAP = {
    home: 0,
    hero: 0,
    about: 1,
    works: 2,
    skills: 3,
    education: 4,
    contact: 5,
  };

  const SECTIONS = ["home", "about", "works", "skills", "education", "contact"];

  let booted = false;
  let commandHistory = [];
  let historyIndex = -1;
  let draftBeforeHistory = "";

  function appendLine(text, type) {
    const line = document.createElement("p");
    line.className = "cmd-widget__line" + (type ? " cmd-widget__line--" + type : "");
    line.textContent = text;
    cmdOutput.appendChild(line);
    cmdOutput.scrollTop = cmdOutput.scrollHeight;
  }

  function printLines(lines, type) {
    lines.forEach(function (line) {
      appendLine(line, type);
    });
  }

  function boot() {
    if (booted) {
      return;
    }
    booted = true;
    printLines(
      [
        "Portfolio CMD v1.0",
        "Type 'help' for available commands.",
        "↑↓ — command history",
        "",
      ],
      "muted"
    );
  }

  function setOpen(isOpen) {
    cmdWidget.classList.toggle("is-open", isOpen);
    cmdWidget.setAttribute("aria-hidden", String(!isOpen));
    cmdToggle.setAttribute("aria-expanded", String(isOpen));
    cmdToggle.setAttribute("aria-label", isOpen ? "터미널 닫기" : "터미널 열기");
    cmdToggle.classList.toggle("is-active", isOpen);

    if (isOpen) {
      boot();
      cmdInput.focus();
    } else {
      historyIndex = -1;
    }
  }

  function pushHistory(command) {
    const trimmed = command.trim();
    if (!trimmed) {
      return;
    }
    if (commandHistory[commandHistory.length - 1] !== trimmed) {
      commandHistory.push(trimmed);
    }
    historyIndex = -1;
  }

  function navigateHistory(direction) {
    if (!commandHistory.length) {
      return;
    }

    if (direction < 0) {
      if (historyIndex === -1) {
        draftBeforeHistory = cmdInput.value;
        historyIndex = commandHistory.length - 1;
      } else if (historyIndex > 0) {
        historyIndex -= 1;
      }
      cmdInput.value = commandHistory[historyIndex];
      return;
    }

    if (historyIndex === -1) {
      return;
    }
    if (historyIndex < commandHistory.length - 1) {
      historyIndex += 1;
      cmdInput.value = commandHistory[historyIndex];
      return;
    }

    historyIndex = -1;
    cmdInput.value = draftBeforeHistory;
  }

  function gotoScene(name) {
    const key = (name || "").toLowerCase();
    if (!Object.prototype.hasOwnProperty.call(SCENE_MAP, key)) {
      return "Unknown section: " + name + ". Try: home, about, works, skills, education, contact";
    }
    if (window.Scenes && typeof window.Scenes.goTo === "function") {
      window.Scenes.goTo(SCENE_MAP[key]);
      return "Navigating to " + key + "...";
    }
    location.hash = key === "home" ? "#hero" : "#" + key;
    return "Navigating to " + key + "...";
  }

  function runCommand(raw) {
    const input = raw.trim();
    if (!input) {
      return;
    }

    pushHistory(raw);

    appendLine("> " + input, "cmd");

    const parts = input.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1).join(" ");

    switch (command) {
      case "help":
        printLines(
          [
            "help                         — show commands",
            "goto <section>               — home, about, works, skills, education, contact",
            "ls                           — list sections",
            "whoami                       — developer info",
            "contact                      — show contact channels",
            "clear                        — clear terminal",
          ],
          "ok"
        );
        break;

      case "clear":
        cmdOutput.innerHTML = "";
        booted = true;
        break;

      case "goto":
        if (!args) {
          appendLine("Usage: goto <section>", "err");
          break;
        }
        appendLine(gotoScene(args), "ok");
        break;

      case "ls":
        printLines(SECTIONS, "ok");
        break;

      case "whoami":
        printLines(
          [
            "이현성 — Web & Unity Client Engineer",
            "스스로 납득할 때까지 타협하지 않는 완성도를 지향합니다.",
          ],
          "ok"
        );
        break;

      case "contact":
        printLines(
          [
            "email: lhs0576@sillain.ac.kr",
            "github: https://github.com/czhskr",
            "instagram: https://instagram.com/la.bcrr",
          ],
          "ok"
        );
        break;

      default:
        appendLine("Unknown command: " + command + ". Type 'help'.", "err");
    }
  }

  cmdToggle.addEventListener("click", function () {
    setOpen(!cmdWidget.classList.contains("is-open"));
  });

  if (cmdClose) {
    cmdClose.addEventListener("click", function () {
      setOpen(false);
    });
  }

  cmdForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const value = cmdInput.value;
    cmdInput.value = "";
    runCommand(value);
  });

  cmdInput.addEventListener("input", function () {
    historyIndex = -1;
  });

  function focusInput() {
    if (document.activeElement !== cmdInput) {
      cmdInput.focus();
    }
  }

  function shouldHandleCmdKeys() {
    const active = document.activeElement;
    if (active && active.closest) {
      if (active.closest(".widget.is-open")) {
        return false;
      }
    }
    return true;
  }

  function onCmdKeyDown(event) {
    if (!cmdWidget.classList.contains("is-open")) {
      return;
    }

    if (event.key === "ArrowUp") {
      if (!shouldHandleCmdKeys()) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      focusInput();
      navigateHistory(-1);
      return;
    }

    if (event.key === "ArrowDown") {
      if (!shouldHandleCmdKeys()) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      focusInput();
      navigateHistory(1);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
    }
  }

  document.addEventListener("keydown", onCmdKeyDown, true);

  function isInsideWidget(fromTarget) {
    return Boolean(fromTarget && fromTarget.closest && fromTarget.closest(".cmd-widget"));
  }

  function consumeWheel(delta, fromTarget) {
    if (!cmdWidget.classList.contains("is-open") || !isInsideWidget(fromTarget)) {
      return false;
    }

    const max = cmdOutput.scrollHeight - cmdOutput.clientHeight;
    if (max > 4) {
      const step = Math.sign(delta) * Math.min(Math.abs(delta), 96);
      if (step > 0 && cmdOutput.scrollTop < max - 2) {
        cmdOutput.scrollTop = Math.min(cmdOutput.scrollTop + step, max);
        return true;
      }
      if (step < 0 && cmdOutput.scrollTop > 2) {
        cmdOutput.scrollTop = Math.max(cmdOutput.scrollTop + step, 0);
        return true;
      }
    }

    return true;
  }

  window.CmdWidget = {
    consumeWheel: consumeWheel,
  };
})();
