import { useEffect, useState } from "react";
import Landing from "./components/Landing.jsx";
import Dashboard from "./components/Dashboard.jsx";
import QrStudio from "./components/QrStudio.jsx";
import Privacy from "./components/Privacy.jsx";
import Terms from "./components/Terms.jsx";
import { api } from "./api.js";
import { PAGE_BY_PATH, TITLES } from "./routes.js";

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
    document.title = PAGE_BY_PATH[route]?.title || TITLES[route] || TITLES["/"];
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

  // Guías y «Acerca de»: mismo componente que se pre-renderiza en el build.
  const page = PAGE_BY_PATH[route];
  if (page) {
    return <page.Component me={me} />;
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
