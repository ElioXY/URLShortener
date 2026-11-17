(function () {
  var dark = false;
  var stored = null;

  try {
    stored = localStorage.getItem("elioxy_theme");
  } catch (error) {
    /* almacenamiento bloqueado: decide el sistema */
  }

  if (stored === "dark") dark = true;
  else if (stored !== "light") {
    try {
      dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch (error) {
      /* sin matchMedia: se queda en claro */
    }
  }

  if (!dark) return;

  document.documentElement.dataset.theme = "dark";
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", "#131211");
})();
