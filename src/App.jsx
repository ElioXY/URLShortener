import { useEffect, useState } from "react";
import Landing from "./components/Landing.jsx";
import Dashboard from "./components/Dashboard.jsx";
import { api } from "./api.js";

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
  const [me, setMe] = useState(null);
  const [loadingMe, setLoadingMe] = useState(true);

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

  if (path.startsWith("/panel")) {
    return <Dashboard me={me} loadingMe={loadingMe} />;
  }

  return <Landing me={me} />;
}
