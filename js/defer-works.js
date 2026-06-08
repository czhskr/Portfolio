(function () {
  const WORKS_SCRIPTS = [
    "js/works-scene.js",
    "js/works-challenges.js",
    "js/works-preview.js",
  ];

  let loaded = false;
  let loading = null;

  function shouldLoadSoon() {
    const hash = (location.hash || "#hero").replace(/^#/, "").toLowerCase();
    return hash === "works";
  }

  function loadWorksScripts() {
    if (loaded) {
      return Promise.resolve();
    }

    if (loading) {
      return loading;
    }

    loading = WORKS_SCRIPTS.reduce(function (chain, src) {
      return chain.then(function () {
        return new Promise(function (resolve, reject) {
          const script = document.createElement("script");
          script.src = src;
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      });
    }, Promise.resolve())
      .then(function () {
        loaded = true;
      })
      .catch(function () {
        loading = null;
      });

    return loading;
  }

  if (shouldLoadSoon()) {
    loadWorksScripts();
  } else if ("requestIdleCallback" in window) {
    requestIdleCallback(
      function () {
        loadWorksScripts();
      },
      { timeout: 2500 }
    );
  } else {
    window.setTimeout(loadWorksScripts, 2000);
  }

  document.addEventListener("scenes:change", function (event) {
    if (event.detail.index >= 1) {
      loadWorksScripts();
    }
  });

  window.WorksScripts = {
    load: loadWorksScripts,
    isLoaded: function () {
      return loaded;
    },
  };
})();
