import { useState } from "react";
import { api, ApiError } from "../api.js";
import { ArrowRightIcon, CheckIcon, CopyButton, DownloadIcon, ExternalIcon, LinkIcon, ShareButton } from "./ui.jsx";
import { QrCard, downloadPng, downloadSvg } from "./Qr.jsx";

const GENERIC_ERROR = "No hemos podido crear el enlace. Inténtalo de nuevo.";

export default function Shortener({ user, onCreated, variant = "landing", initialSlug = "" }) {
  const [target, setTarget] = useState("");
  const [slug, setSlug] = useState(initialSlug || "");
  const [showOptions, setShowOptions] = useState(Boolean(initialSlug));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const host = typeof window !== "undefined" ? window.location.host : "url.elioxy.us.ci";

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const data = await api.create({
        target,
        slug: slug.trim() ? slug.trim().toLowerCase() : undefined,
      });
      setResult(data.link);
      setTarget("");
      setSlug("");
      setShowOptions(false);
      onCreated?.(data.link);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : GENERIC_ERROR);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`shortener shortener--${variant}`}>
      <form className="shortener-form" onSubmit={handleSubmit} noValidate>
        <div className="shortener-main">
          <div className="input-wrap">
            <span className="input-icon" aria-hidden="true">
              <LinkIcon />
            </span>
            <label className="sr-only" htmlFor={`target-${variant}`}>
              Enlace largo
            </label>
            <input
              id={`target-${variant}`}
              className="input input-with-icon"
              type="text"
              inputMode="url"
              autoComplete="off"
              spellCheck="false"
              placeholder="https://tu-sitio.com/una/pagina/muy-larga"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading || !target.trim()}>
            {loading ? <span className="spinner" aria-hidden="true" /> : <ArrowRightIcon />}
            <span>{loading ? "Acortando…" : "Acortar enlace"}</span>
          </button>
        </div>

        <div className="shortener-options">
          <button
            type="button"
            className="link-toggle"
            onClick={() => setShowOptions((value) => !value)}
            aria-expanded={showOptions}
            aria-controls={`slug-row-${variant}`}
          >
            {showOptions ? "Ocultar opciones" : "Personalizar enlace"}
          </button>
          <span className="hint-inline">QR incluido, siempre</span>
        </div>

        {showOptions && (
          <div className="slug-row" id={`slug-row-${variant}`}>
            <label className="slug-label" htmlFor={`slug-${variant}`}>
              Elige el final de tu enlace
            </label>
            <div className="slug-field">
              <span className="slug-prefix">{host}/</span>
              <input
                id={`slug-${variant}`}
                className="input"
                type="text"
                placeholder="mi-marca"
                maxLength={32}
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
              />
            </div>
            <p className="hint">De 2 a 32 caracteres: letras, números, guiones y guiones bajos.</p>
          </div>
        )}

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </form>

      {result && <ResultPanel link={result} user={user} onClose={() => setResult(null)} />}
    </div>
  );
}

function ResultPanel({ link, user, onClose }) {
  return (
    <div className="result" aria-live="polite">
      <button type="button" className="result-close" onClick={onClose} aria-label="Cerrar resultado">
        ×
      </button>
      <span className="result-badge">
        <CheckIcon size={13} /> Enlace creado
      </span>

      <div className="result-grid">
        <div className="result-info">
          <p className="result-label">Tu enlace corto</p>
          <a className="result-link" href={link.shortUrl} target="_blank" rel="noreferrer">
            {link.shortUrl.replace(/^https?:\/\//, "")}
          </a>
          <p className="result-target" title={link.target}>
            → {link.target}
          </p>

          <div className="result-actions">
            <CopyButton value={link.shortUrl} label="Copiar enlace" className="btn btn-primary btn-sm" />
            <ShareButton
              title="elioxy links"
              text={link.shortUrl}
              url={link.shortUrl}
              label="Compartir"
              className="btn btn-ghost btn-sm"
            />
            <a className="btn btn-ghost btn-sm" href={link.shortUrl} target="_blank" rel="noreferrer">
              <ExternalIcon /> Abrir
            </a>
          </div>

          <p className="result-note">
            {user ? (
              <>
                <CheckIcon size={13} /> Guardado en tu panel.
              </>
            ) : (
              <>
                <CheckIcon size={13} /> Guardado en este navegador. <a href="/auth/github">Entra con GitHub</a> para
                llevarlo a tu cuenta.
              </>
            )}
          </p>
        </div>

        <div className="result-qr">
          <QrCard value={link.shortUrl} expiresAt={link.expiresAt} size={190} />
          <div className="qr-actions">
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => downloadPng(link.shortUrl, `qr-${link.slug}`, { expiresAt: link.expiresAt })}
            >
              <DownloadIcon size={14} /> PNG
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => downloadSvg(link.shortUrl, `qr-${link.slug}`, { expiresAt: link.expiresAt })}
            >
              <DownloadIcon size={14} /> SVG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
