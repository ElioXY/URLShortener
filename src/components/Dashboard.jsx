import { useEffect, useMemo, useState } from "react";
import { api, ApiError } from "../api.js";
import {
  Background,
  CopyButton,
  DownloadIcon,
  EditIcon,
  ExternalIcon,
  GitHubIcon,
  Nav,
  avatarSrc,
  CopyImageNotice,
  QrIcon,
  ShareButton,
  TrashIcon,
  formatDate,
  relativeDate,
  useCountUp,
} from "./ui.jsx";
import { QrCard, copyQrPng, downloadLabel, downloadPng, downloadSvg } from "./Qr.jsx";
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
    (acc, link) => ({
      links: acc.links + 1,
      clicks: acc.clicks + Number(link.clicks || 0),
      uniqueClicks: acc.uniqueClicks + Number(link.uniqueClicks || 0),
    }),
    { links: 0, clicks: 0, uniqueClicks: 0 }
  );
}

function isExpired(link) {
  return Boolean(link.expiresAt && Date.now() > link.expiresAt);
}

function uniques(count) {
  const value = Math.round(count || 0);
  return `${value} ${value === 1 ? "único" : "únicos"}`;
}

export default function Dashboard({ me, loadingMe }) {
  const user = me?.user ?? null;
  const [links, setLinks] = useState([]);
  const [totals, setTotals] = useState({ links: 0, clicks: 0, uniqueClicks: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalLink, setModalLink] = useState(null);
  const [historyLink, setHistoryLink] = useState(null);
  const [editLink, setEditLink] = useState(null);
  const [confirming, setConfirming] = useState("");
  const [deleting, setDeleting] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const avatar = avatarSrc(user);
  const [failedAvatar, setFailedAvatar] = useState("");

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
    setRefreshing(true);
    setError("");
    try {
      const data = await api.list();
      setLinks(data.links || []);
      setTotals(data.totals || { links: 0, clicks: 0, uniqueClicks: 0 });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setLinks([]);
        setTotals({ links: 0, clicks: 0, uniqueClicks: 0 });
      } else {
        setError(err instanceof ApiError ? err.message : "No hemos podido cargar tus enlaces.");
      }
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
    setTotals((previous) => ({ ...previous, links: previous.links + 1 }));
  }

  function handleSaved(updated) {
    setLinks((previous) => previous.map((link) => (link.id === updated.id ? { ...link, ...updated } : link)));
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
      if (editLink?.id === id) setEditLink(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No hemos podido borrar el enlace.");
    } finally {
      setDeleting("");
    }
  }

  const linksCount = useCountUp(totals.links);
  const clicksCount = useCountUp(totals.clicks);
  const uniqueCount = useCountUp(totals.uniqueClicks || 0);
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
                {avatar && failedAvatar !== avatar ? (
                  <img src={avatar} alt="" width="30" height="30" onError={() => setFailedAvatar(avatar)} />
                ) : (
                  <span className="avatar-fallback">{(user.name || user.login || "?").slice(0, 1).toUpperCase()}</span>
                )}
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
          ) : (
            <>
              {!user && (
                <div className="claim">
                  <div>
                    <strong>{links.length ? "Estos enlaces están guardados en este navegador" : "Panel sin cuenta"}</strong>
                    <p>
                      Puedes crear y gestionar enlaces aquí mismo. Entra con GitHub para pasarlos a tu cuenta y no
                      perderlos si cambias de dispositivo.
                    </p>
                    {!me?.authReady && (
                      <p className="claim-note">
                        Este despliegue aún no tiene configuradas las credenciales de GitHub. Añade{" "}
                        <code>GITHUB_CLIENT_ID</code> y <code>GITHUB_CLIENT_SECRET</code> a los secretos del proyecto.
                      </p>
                    )}
                  </div>
                  <a className="btn btn-primary btn-sm" href="/auth/github">
                    <GitHubIcon /> Entrar con GitHub
                  </a>
                </div>
              )}

              <div className="stats">
                <div className="stat">
                  <span className="stat-label">Enlaces</span>
                  <strong className="stat-value">{Math.round(linksCount)}</strong>
                  <span className="stat-hint">{user ? "guardados en tu cuenta" : "en este navegador"}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Clics totales</span>
                  <strong className="stat-value">{Math.round(clicksCount)}</strong>
                  <span className="stat-hint">{uniques(uniqueCount)} · sin bots</span>
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
                            {!link.active && <span className="badge">Desactivado</span>}
                            {link.active && isExpired(link) && <span className="badge">Caducado</span>}
                            {link.active && !isExpired(link) && link.expiresAt && (
                              <span className="badge badge-soft">Hasta {formatDate(link.expiresAt)}</span>
                            )}
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
                              <span className="stat-unique"> · {uniques(link.uniqueClicks)}</span>
                            </span>
                          </button>
                          <span className="link-date">
                            {!link.active
                              ? "Pausado"
                              : isExpired(link)
                                ? `Caducado el ${formatDate(link.expiresAt)}`
                                : link.lastClickedAt
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
                              <button
                                type="button"
                                className="icon-btn"
                                onClick={() => setEditLink(link)}
                                aria-label={`Editar ${link.shortUrl}`}
                              >
                                <EditIcon size={15} />
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

                {user && (
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
                )}
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
      {editLink && (
        <EditModal link={editLink} onClose={() => setEditLink(null)} onSaved={handleSaved} />
      )}
    </>
  );
}

function EditModal({ link, onClose, onSaved }) {
  const [target, setTarget] = useState(link.target);
  const [slug, setSlug] = useState(link.slug);
  const [active, setActive] = useState(link.active !== false);
  const [expires, setExpires] = useState(
    link.expiresAt ? new Date(link.expiresAt).toISOString().slice(0, 10) : ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const slugChanged = slug.trim().toLowerCase() !== link.slug;

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

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving) return;
    setError("");
    setSaving(true);
    try {
      const data = await api.update(link.id, {
        target: target.trim(),
        slug: slug.trim().toLowerCase(),
        active,
        expiresAt: expires || null,
      });
      onSaved(data.link);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No hemos podido guardar los cambios.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal modal-edit" role="dialog" aria-modal="true" aria-label={`Editar ${link.shortUrl}`}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar">
          ×
        </button>
        <p className="modal-eyebrow">Editar enlace</p>
        <h3 className="modal-title">/{link.slug}</h3>

        <form className="edit-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Destino</span>
            <input
              className="input"
              type="text"
              inputMode="url"
              spellCheck="false"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Final del enlace</span>
            <span className="slug-field">
              <span className="slug-prefix">/</span>
              <input
                className="input"
                type="text"
                maxLength={32}
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                required
              />
            </span>
          </label>
          {slugChanged && <p className="edit-note">El enlace anterior dejará de funcionar en cuanto guardes.</p>}

          <div className="edit-row">
            <label className="check">
              <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />
              <span>Enlace activo</span>
            </label>

            <label className="field field-date">
              <span>Caduca el</span>
              <input
                className="input"
                type="date"
                value={expires}
                onChange={(event) => setExpires(event.target.value)}
              />
            </label>
          </div>

          <p className="hint">
            Sin fecha, el enlace no caduca. Desactivarlo lo pausa sin borrar los clics que ya tiene.
          </p>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <div className="modal-actions">
            <button className="btn btn-primary btn-sm" type="submit" disabled={saving}>
              {saving ? "Guardando…" : "Guardar cambios"}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function QrModal({ link, onClose }) {
  const [labelSize, setLabelSize] = useState("60");
  const [labelColor, setLabelColor] = useState("ink");
  const [copiedQr, setCopiedQr] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  async function handleCopyQr() {
    const ok = await copyQrPng(link.shortUrl, { expiresAt: link.expiresAt });
    if (!ok) {
      setCopyFailed(true);
      return;
    }
    setCopyFailed(false);
    setCopiedQr(true);
    setTimeout(() => setCopiedQr(false), 1700);
  }

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
        <QrCard
          value={link.shortUrl}
          caption={link.shortUrl.replace(/^https?:\/\//, "")}
          expiresAt={link.expiresAt}
          size={280}
          className="qr-card-preview qr-modal-preview"
        />
        <p className="modal-link">{link.shortUrl.replace(/^https?:\/\//, "")}</p>
        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => downloadPng(link.shortUrl, `qr-${link.slug}`, { expiresAt: link.expiresAt })}
          >
            <DownloadIcon /> Descargar PNG
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => downloadSvg(link.shortUrl, `qr-${link.slug}`, { expiresAt: link.expiresAt })}
          >
            SVG
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={handleCopyQr}>
            {copiedQr ? "QR copiado" : "Copiar QR"}
          </button>
          <CopyButton value={link.shortUrl} label="Copiar enlace" className="btn btn-ghost btn-sm" />
          <ShareButton
            title="elioxy links"
            text={link.shortUrl}
            url={link.shortUrl}
            label="Compartir"
            className="btn btn-ghost btn-sm"
          />
        </div>
        {copyFailed && (
          <CopyImageNotice
            onDownload={() => downloadPng(link.shortUrl, `qr-${link.slug}`, { expiresAt: link.expiresAt })}
          />
        )}

        <div className="label-block">
          <p className="label-block-title">Etiqueta imprimible</p>
          <div className="label-tools">
            <label className="select-field">
              <span>Tamaño</span>
              <select className="select" value={labelSize} onChange={(event) => setLabelSize(event.target.value)}>
                <option value="40">40 mm</option>
                <option value="60">60 mm</option>
                <option value="100">100 mm</option>
              </select>
            </label>
            <label className="select-field">
              <span>Color</span>
              <select className="select" value={labelColor} onChange={(event) => setLabelColor(event.target.value)}>
                <option value="ink">Tinta</option>
                <option value="cobalt">Cobalto</option>
              </select>
            </label>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              aria-label="Descargar etiqueta imprimible"
              onClick={() =>
                downloadLabel(link.shortUrl, {
                  slug: link.slug,
                  sizeMm: Number(labelSize),
                  color: labelColor === "cobalt" ? "#1f2ce0" : "#131311",
                  expiresAt: link.expiresAt || null,
                })
              }
            >
              <DownloadIcon /> Etiqueta
            </button>
          </div>
          <p className="hint">SVG a tamaño real, con marcas de corte para imprimir y recortar.</p>
        </div>
      </div>
    </div>
  );
}
