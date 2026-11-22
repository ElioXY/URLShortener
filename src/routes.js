import About from "./components/About.jsx";
import GuiasIndex from "./components/GuiasIndex.jsx";
import QrRealSize from "./components/guias/QrRealSize.jsx";
import SlugGuide from "./components/guias/SlugGuide.jsx";
import WifiGuide from "./components/guias/WifiGuide.jsx";
import ExpiryGuide from "./components/guias/ExpiryGuide.jsx";
import { GUIAS } from "./guides.js";

const GUIA_COMPONENTS = {
  "/guias/qr-tamano-real": QrRealSize,
  "/guias/elegir-slug": SlugGuide,
  "/guias/qr-wifi": WifiGuide,
  "/guias/caducidad-carteles": ExpiryGuide,
};

/**
 * Páginas de contenido que se pre-renderizan a HTML estático en el build.
 *
 * El rastreador de AdSense no ejecuta JavaScript de forma fiable, así que estas
 * rutas se sirven con el texto ya dentro del HTML. El resto del sitio sigue
 * siendo una SPA normal. `scripts/prerender.mjs` genera `dist/<ruta>/index.html`
 * y el Worker las sirve desde el binding ASSETS.
 */
export const PRERENDER_PAGES = [
  {
    path: "/guias",
    Component: GuiasIndex,
    title: "Guías de uso | elioxy links",
    description:
      "Cuatro guías sobre códigos QR y enlaces cortos: tamaño de impresión, cómo elegir el slug, QR para WiFi y carteles con caducidad.",
  },
  {
    path: "/acerca",
    Component: About,
    title: "Acerca de elioxy links",
    description:
      "Quién hace elioxy links, por qué existe, cómo se financia, cómo funciona por dentro y qué límites tiene.",
  },
  ...GUIAS.map((guia) => ({
    path: guia.path,
    Component: GUIA_COMPONENTS[guia.path],
    title: `${guia.title} | elioxy links`,
    description: guia.blurb,
  })),
];

export const PAGE_BY_PATH = Object.fromEntries(PRERENDER_PAGES.map((page) => [page.path, page]));

/** Rutas que siguen montándose solo en el cliente. */
export const TITLES = {
  "/": "elioxy links | enlaces cortos y QR para imprimir",
  "/qr": "Generador de QR | elioxy links",
  "/panel": "Mi panel | elioxy links",
  "/privacidad": "Privacidad | elioxy links",
  "/terminos": "Términos de uso | elioxy links",
};
