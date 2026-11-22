import { useEffect, useState } from "react";
import Landing from "./components/Landing.jsx";
import Dashboard from "./components/Dashboard.jsx";
import QrStudio from "./components/QrStudio.jsx";
import Privacy from "./components/Privacy.jsx";
import Terms from "./components/Terms.jsx";
import About from "./components/About.jsx";
import GuiasIndex from "./components/GuiasIndex.jsx";
import QrRealSize from "./components/guias/QrRealSize.jsx";
import SlugGuide from "./components/guias/SlugGuide.jsx";
import WifiGuide from "./components/guias/WifiGuide.jsx";
import ExpiryGuide from "./components/guias/ExpiryGuide.jsx";
import { api } from "./api.js";
import { GUIAS as GUIAS_INFO } from "./guides.js";

const GUIA_PAGES = {
  "/guias": GuiasIndex,
  "/guias/qr-tamano-real": QrRealSize,
  "/guias/elegir-slug": SlugGuide,
  "/guias/qr-wifi": WifiGuide,
  "/guias/caducidad-carteles": ExpiryGuide,
};

const TITLES = {
  "/": "elioxy links | enlaces cortos y QR para imprimir",
  "/guias": "Guías de uso | elioxy links",
  "/acerca": "Acerca de elioxy links",
  "/qr": "Generador de QR | elioxy links",
  "/panel": "Mi panel | elioxy links",
  "/privacidad": "Privacidad | elioxy links",
  "/terminos": "Términos de uso | elioxy links",
  ...Object.fromEntries(GUIAS_INFO.map((guia) => [guia.path, `${guia.title} | elioxy links`])),
};

function usePath() {
  const [path, setPath] = useState(() => window.location.pathname);
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  return path;
}

export default function App() {
  const path = usePath();
  const route = path.replace(/\/+$/, "") || "/";
  const [me, setMe] = useState(null);
  const [loadingMe, setLoadingMe] = useState(true);

  useEffect(() => {
    document.title = TITLES[route] || TITLES["/"];
  }, [route]);

  useEffect(() => {
    let alive = true;
    api
      .me()
      .then((data) => {
        if (alive) setMe(data || { user: null, authReady: false });
      })
      .catch(() => {
        if (alive) setMe({ user: null, authReady: false });
      })
      .finally(() => {
        if (alive) setLoadingMe(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const GuidePage = GUIA_PAGES[route];
  if (GuidePage) {
    return <GuidePage me={me} />;
  }

  if (route === "/acerca") {
    return <About me={me} />;
  }

  if (path.startsWith("/privacidad")) {
    return <Privacy me={me} />;
  }
  
  if (path.startsWith("/terminos")) {
    return <Terms me={me} />;
  }
  
  if (path.startsWith("/qr")) {
    return <QrStudio me={me} />;
  }

  if (path.startsWith("/panel")) {
    return <Dashboard me={me} loadingMe={loadingMe} />;
  }

  return <Landing me={me} />;
}
