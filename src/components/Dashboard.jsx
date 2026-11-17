import { useEffect, useMemo, useState } from "react";
import { api, ApiError } from "../api.js";
import {
  ArrowRightIcon,
  Background,
  CopyButton,
  DownloadIcon,
  ExternalIcon,
  GitHubIcon,
  Nav,
  QrIcon,
  TrashIcon,
  formatDate,
  relativeDate,
  useCountUp,
} from "./ui.jsx";
import { QrCanvas, downloadPng, downloadSvg } from "./Qr.jsx";
import { HistoryModal, Sparkline } from "./History.jsx";
import Shortener from "./Shortener.jsx";
import { linkTo } from "../router.js";

const AUTH_MESSAGES = {
  unconfigured: "El acceso con GitHub todavía no está configurado en este despliegue.",
  denied: "Has cancelado la autorización de GitHub.",
  state: "La sesión de acceso ha caducado. Inténtalo otra vez.",
  exchange: "GitHub no ha devuelto un token válido.",
  profile: "No hemos podido leer tu perfil de GitHub.",
  db: "La base de datos todavía no está disponible.",
  secret: "Falta la clave con la que se firma la sesión.",
};

function computeTotals(links) {
  return links.reduce(
    (acc, link) => ({ links: acc.links + 1, clicks: acc.clicks + Number(link.clicks || 0) }),
    { links: 0, clicks: 0 }
  );
}

export default function Dashboard({ me, loadingMe }) {
  const user = me?.user ?? null;
  const [links, setLinks] = useState([]);
  const [totals, setTotals] = useState({ links: 0, clicks: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalLink, setModalLink] = useState(null);
  const [historyLink, setHistoryLink] = useState(null);
  const [confirming, setConfirming] = useState("");
  const [deleting, setDeleting] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const authMessage = useMemo(() => {
    const code = new URLSearchParams(window.location.search).get("auth");
    if (!code) return "";
    return AUTH_MESSAGES[code] || "No hemos podido completar el acceso con GitHub.";
  }, []);

  useEffect(() => {
    if (authMessage) {
      const url = new URL(window.location.href);
      url.searchParams.delete("auth");
      window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
    }
  }, [authMessage]);

  async function load() {
    if (!user) {
      setLoading(false);
      return;
    }
    setRefreshing(true);
    setError("");
    try {
      const data = await api.list();
      setLinks(data.links || []);
      setTotals(data.totals || { links: 0, clicks: 0 });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No hemos podido cargar tus enlaces.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  function handleCreated(link) {
    setLinks((previous) => [link, ...previous]);
    setTotals((previous) => ({ links: previous.links + 1, clicks: previous.clicks }));
  }

  async function handleDelete(id) {
    setDeleting(id);
    setError("");
    try {
      await api.remove(id);
      const next = links.filter((link) => link.id !== id);
      setLinks(next);
      setTotals(computeTotals(next));
      setConfirming("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No hemos podido borrar el enlace.");
    } finally {
      setDeleting("");
    }
  }

  const linksCount = useCountUp(totals.links);
  const clicksCount = useCountUp(totals.clicks);
  const averageCount = useCountUp(totals.links ? totals.clicks / totals.links : 0);
  const average = totals.links ? averageCount.toFixed(1) : "0";

  return (
    <>
      <Background />
      <div className="shell">
        <Nav me={me} variant="app" />

        <main className="dash">
          <div className="dash-head">
            <div>
              <h1>Tus enlaces</h1>
              <p className="dash-sub">Copia, comparte o descarga el QR de cada enlace que has creado.</p>
            </div>
            {user && (
              <div className="dash-user">
                {user.avatar ? <img src={user.avatar} alt="" width="34" height="34" /> : null}
                <div>
                  <strong>{user.name || user.login}</strong>
                  <span>@{user.login}</span>
                </div>
              </div>
            )}
          </div>

          {authMessage && (
            <div className="notice" role="status">
              <span className="notice-dot" aria-hidden="true" />
              {authMessage}
            </div>
          )}

          {loadingMe ? (
            <div className="gate-card gate-loading">
              <span className="spinner spinner-dark" aria-hidden="true" />
              <p>Comprobando tu sesión…</p>
            </div>
          ) : !user ? (
            <section className="gate">
              <div className="gate-card">
                <span className="gate-icon">
                  <GitHubIcon size={26} />
                </span>
                <h2>Entra con GitHub para ver tu panel</h2>
                <p>
                  Tus enlaces quedan ligados a tu cuenta: podrás copiarlos, descargar sus QR y ver los clics desde
                  cualquier dispositivo.
                </p>
                <a className="btn btn-primary" href="/auth/github">
                  <GitHubIcon /> Continuar con GitHub
                </a>
                {!me?.authReady && (
                  <p className="gate-note">
                    Este despliegue aún no tiene configuradas las credenciales de GitHub. Añade{" "}
                    <code>GITHUB_CLIENT_ID</code> y <code>GITHUB_CLIENT_SECRET</code> a los secretos del proyecto.
                  </p>
                )}
                <a className="gate-back" href="/" onClick={(event) => linkTo(event, "/")}>
                  Volver al acortador <ArrowRightIcon size={14} />
                </a>
              </div>
            </section>
          ) : (
            <>
              <div className="stats">
                <div className="stat">
                  <span className="stat-label">Enlaces</span>
                  <strong className="stat-value">{Math.round(linksCount)}</strong>
                  <span className="stat-hint">guardados en tu cuenta</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Clics totales</span>
                  <strong className="stat-value">{Math.round(clicksCount)}</strong>
                  <span className="stat-hint">visitas a tus enlaces</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Media por enlace</span>
                  <strong className="stat-value">{average}</strong>
                  <span className="stat-hint">clics de media</span>
                </div>
              </div>

              <section className="create-card">
                <div className="create-head">
                  <h2>Nuevo enlace</h2>
                  <span className="hint-inline">Se guarda automáticamente en tu panel</span>
                </div>
                <Shortener user={user} onCreated={handleCreated} variant="compact" />
              </section>

              <section className="links-section">
                <div className="links-head">
                  <h2>Enlaces guardados</h2>
                  <span className="count-pill">{totals.links}</span>
                  <button className="btn btn-ghost btn-xs refresh" type="button" onClick={load} disabled={refreshing}>
                    {refreshing ? <span className="spinner spinner-dark" aria-hidden="true" /> : null}
                    Actualizar
                  </button>
                </div>

                {error && (
                  <p className="form-error" role="alert">
                    {error}
                  </p>
                )}

                {loading ? (
                  <ul className="link-list">
                    {[0, 1, 2].map((index) => (
                      <li className="link-row skeleton-row" key={index}>
                        <span className="skeleton" style={{ width: "38%" }} />
                        <span className="skeleton" style={{ width: "22%" }} />
                      </li>
                    ))}
                  </ul>
                ) : links.length === 0 ? (
                  <div className="empty">
                    <span className="empty-icon">
                      <QrIcon size={24} />
                    </span>
                    <h3>Aún no hay enlaces</h3>
                    <p>Crea tu primer enlace arriba y aparecerá aquí con su QR y sus clics.</p>
                  </div>
                ) : (
                  <ul className="link-list">
                    {links.map((link, index) => (
                      <li
                        className="link-row"
                        key={link.id}
                        style={{ animationDelay: `${Math.min(index, 10) * 45}ms` }}
                      >
                        <div className="link-main">
                          <div className="link-short">
                            <span className="dot" aria-hidden="true" />
                            <a href={link.shortUrl} target="_blank" rel="noreferrer">
                              {link.shortUrl.replace(/^https?:\/\//, "")}
                            </a>
                          </div>
                          <p className="link-target" title={link.target}>
                            {link.target}
                          </p>
                        </div>

                        <div className="link-stats">
                          <button
                            type="button"
                            className="stat-hist"
                            onClick={() => setHistoryLink(link)}
                            title="Ver el histórico de clics"
                          >
                            <Sparkline history={link.history} />
                            <span className="stat-badge">
                              <strong>{link.clicks}</strong> clics
                            </span>
                          </button>
                          <span className="link-date">
                            {link.lastClickedAt
                              ? `Último clic ${relativeDate(link.lastClickedAt)}`
                              : `Creado el ${formatDate(link.createdAt)}`}
                          </span>
                        </div>

                        <div className="link-actions">
                          {confirming === link.id ? (
                            <div className="confirm">
                              <span>¿Borrar?</span>
                              <button
                                type="button"
                                className="btn btn-danger btn-xs"
                                onClick={() => handleDelete(link.id)}
                                disabled={deleting === link.id}
                              >
                                {deleting === link.id ? "Borrando…" : "Sí, borrar"}
                              </button>
                              <button type="button" className="btn btn-ghost btn-xs" onClick={() => setConfirming("")}>
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <>
                              <CopyButton value={link.shortUrl} label="Copiar" className="btn btn-ghost btn-xs" />
                              <button type="button" className="btn btn-ghost btn-xs" onClick={() => setModalLink(link)}>
                                <QrIcon size={14} /> QR
                              </button>
                              <a
                                className="icon-btn"
                                href={link.shortUrl}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={`Abrir ${link.shortUrl}`}
                              >
                                <ExternalIcon size={15} />
                              </a>
                              <button
                                type="button"
                                className="icon-btn icon-btn-danger"
                                onClick={() => setConfirming(link.id)}
                                aria-label={`Borrar ${link.shortUrl}`}
                              >
                                <TrashIcon size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <button
                  type="button"
                  className="logout"
                  onClick={async () => {
                    try {
                      await api.logout();
                    } catch {
                      /* ignore */
                    }
                    window.location.href = "/";
                  }}
                >
                  Cerrar sesión
                </button>
              </section>
            </>
          )}
        </main>

        <footer className="footer footer-dash">
          <div className="footer-inner">
            <p>url.elioxy.us.ci · enlaces cortos con QR</p>
            <a href="/" onClick={(event) => linkTo(event, "/")}>
              Volver al inicio
            </a>
          </div>
        </footer>
      </div>

      {modalLink && <QrModal link={modalLink} onClose={() => setModalLink(null)} />}
      {historyLink && <HistoryModal link={historyLink} onClose={() => setHistoryLink(null)} />}
    </>
  );
}

function QrModal({ link, onClose }) {
  useEffect(() => {
    function onKey(event) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-label={`Código QR de ${link.shortUrl}`}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar">
          ×
        </button>
        <p className="modal-eyebrow">Código QR</p>
        <h3 className="modal-title">/{link.slug}</h3>
        <div className="qr-frame qr-frame-lg">
          <QrCanvas value={link.shortUrl} size={236} />
        </div>
        <p className="modal-link">{link.shortUrl.replace(/^https?:\/\//, "")}</p>
        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => downloadPng(link.shortUrl, `qr-${link.slug}`)}
          >
            <DownloadIcon /> Descargar PNG
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => downloadSvg(link.shortUrl, `qr-${link.slug}`)}
          >
            SVG
          </button>
          <CopyButton value={link.shortUrl} label="Copiar enlace" className="btn btn-ghost btn-sm" />
        </div>
      </div>
    </div>
  );
}
