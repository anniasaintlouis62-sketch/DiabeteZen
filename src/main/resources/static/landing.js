(function () {
  const SPLASH_MS = 2200;
  const SPLASH_FADE_MS = 500;
  const splashScreen = document.getElementById("splashScreen");
  const appRoot = document.getElementById("appRoot");

  const goApp = document.getElementById("dzGoApp");
  if (goApp && localStorage.getItem("dz_token")) {
    goApp.classList.remove("hidden");
  }

  document.body.classList.add("splash-active");

  if (splashScreen && appRoot) {
    window.setTimeout(() => splashScreen.classList.add("splash--exit"), SPLASH_MS);
    window.setTimeout(() => {
      splashScreen.classList.add("hidden");
      document.body.classList.remove("splash-active");
      appRoot.classList.remove("app-root--hidden");
    }, SPLASH_MS + SPLASH_FADE_MS);
  } else if (appRoot) {
    appRoot.classList.remove("app-root--hidden");
  }
})();
