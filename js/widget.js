(function () {
  /*
   * 연락 채널 설정 — 사용할 항목만 값을 채우세요.
   *
   * 추천 대안 (WhatsApp 대신):
   * 1. email    — 가장 무난, 포트폴리오·채용 문의에 적합 (기본)
   * 2. github   — 개발자 포트폴리오에 잘 어울림
   * 3. telegram — t.me/@username 형태, 해외·개발자 커뮤니티에 많이 씀
   * 4. kakao    — open.kakao.com 오픈채팅 URL, 국내 사용자에게 익숙
   * 5. discord  — 디스코드 초대 링크, 게임·팀 협업 문의에 적합
   * 6. linkedin — 취업·네트워킹용 프로필 URL
   * 7. instagram — 프로필 링크 (DM은 앱/웹에서 직접)
   */
  const CONTACT = {
    email: "lhs0576@sillain.ac.kr",
    github: "https://github.com/czhskr",
    telegram: "",
    kakao: "",
    discord: "",
    linkedin: "",
    instagram: "la.bcrr",
  };

  const SEND_VIA = "email";

  const widget = document.getElementById("widget");
  const widgetToggle = document.getElementById("widget-toggle");
  const widgetClose = document.querySelector(".widget__close");
  const widgetInput = document.getElementById("widget-input");
  const widgetSend = document.querySelector(".widget__send");
  const widgetChannels = document.getElementById("widget-channels");
  const backToTop = document.getElementById("back-to-top");

  function buildChannelLinks() {
    const channels = [];

    if (CONTACT.email) {
      channels.push({
        label: "Email",
        href: "mailto:" + CONTACT.email,
      });
    }

    if (CONTACT.github) {
      channels.push({
        label: "GitHub",
        href: CONTACT.github,
        external: true,
      });
    }

    if (CONTACT.telegram) {
      const handle = CONTACT.telegram.replace(/^@/, "");
      channels.push({
        label: "Telegram",
        href: "https://t.me/" + handle,
        external: true,
      });
    }

    if (CONTACT.kakao) {
      channels.push({
        label: "Kakao",
        href: CONTACT.kakao,
        external: true,
      });
    }

    if (CONTACT.discord) {
      channels.push({
        label: "Discord",
        href: CONTACT.discord,
        external: true,
      });
    }

    if (CONTACT.linkedin) {
      channels.push({
        label: "LinkedIn",
        href: CONTACT.linkedin,
        external: true,
      });
    }

    if (CONTACT.instagram) {
      const ig = CONTACT.instagram.trim();
      const igHref = ig.startsWith("http")
        ? ig
        : "https://instagram.com/" + ig.replace(/^@/, "");
      channels.push({
        label: "Instagram",
        href: igHref,
        external: true,
      });
    }

    widgetChannels.innerHTML = channels
      .map(function (ch) {
        const attrs = ch.external
          ? ' target="_blank" rel="noopener noreferrer"'
          : "";
        return (
          '<li><a class="widget__channel" href="' +
          ch.href +
          '"' +
          attrs +
          ">" +
          ch.label +
          "</a></li>"
        );
      })
      .join("");
  }

  function setWidgetOpen(isOpen) {
    widget.classList.toggle("is-open", isOpen);
    widget.setAttribute("aria-hidden", String(!isOpen));
    widgetToggle.setAttribute("aria-expanded", String(isOpen));
    widgetToggle.setAttribute("aria-label", isOpen ? "문의창 닫기" : "문의창 열기");
    widgetToggle.classList.toggle("is-active", isOpen);

    if (isOpen) {
      widgetInput.focus();
    }
  }

  function sendMessage() {
    const text = widgetInput.value.trim();
    const defaultMessage = "안녕하세요, 포트폴리오를 보고 연락드립니다.";
    const message = text || defaultMessage;

    if (SEND_VIA === "telegram" && CONTACT.telegram) {
      const handle = CONTACT.telegram.replace(/^@/, "");
      window.open(
        "https://t.me/" + handle + "?text=" + encodeURIComponent(message),
        "_blank",
        "noopener,noreferrer"
      );
    } else if (SEND_VIA === "kakao" && CONTACT.kakao) {
      window.open(CONTACT.kakao, "_blank", "noopener,noreferrer");
    } else if (CONTACT.email) {
      window.location.href =
        "mailto:" +
        CONTACT.email +
        "?subject=" +
        encodeURIComponent("Portfolio 문의") +
        "&body=" +
        encodeURIComponent(message);
    }

    widgetInput.value = "";
  }

  buildChannelLinks();

  widgetToggle.addEventListener("click", function () {
    setWidgetOpen(!widget.classList.contains("is-open"));
  });

  widgetClose.addEventListener("click", function () {
    setWidgetOpen(false);
  });

  widgetSend.addEventListener("click", sendMessage);

  widgetInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && widget.classList.contains("is-open")) {
      setWidgetOpen(false);
    }
  });

  function updateBackToTop() {
    if (!backToTop) {
      return;
    }

    const onHero = document.body.dataset.scene === "0";
    backToTop.classList.toggle("is-visible", !onHero);
    backToTop.hidden = onHero;
  }

  if (backToTop) {
    backToTop.addEventListener("click", function () {
      if (window.Scenes && typeof window.Scenes.goTo === "function") {
        window.Scenes.goTo(0);
      }
    });

    document.addEventListener("scenes:change", updateBackToTop);
    updateBackToTop();
  }

})();
