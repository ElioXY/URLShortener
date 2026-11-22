import { useEffect, useRef, useState } from "react";
import { linkTo } from "../router.js";
import { ACERCA, GUIAS } from "../guides.js";

/* ------------------------------------------------------------------ icons */

function Svg({ children, size = 16, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const LinkIcon = (props) => (
  <Svg {...props}>
    <path d="M10.6 13.4l2.8-2.8" />
    <path d="M9.2 16.2l-1.1 1.1a2.9 2.9 0 1 1-4.1-4.1l2.8-2.8a2.9 2.9 0 0 1 4.1 0" />
    <path d="M14.8 7.8l1.1-1.1a2.9 2.9 0 0 1 4.1 4.1l-2.8 2.8a2.9 2.9 0 0 1-4.1 0" />
  </Svg>
);

export const CopyIcon = (props) => (
  <Svg {...props}>
    <rect x="9" y="9" width="11" height="11" rx="2.5" />
    <path d="M15 5.5A2.5 2.5 0 0 0 12.5 3h-7A2.5 2.5 0 0 0 3 5.5v7A2.5 2.5 0 0 0 5.5 15" />
  </Svg>
);

export const CheckIcon = (props) => (
  <Svg {...props}>
    <path d="M20 6.5L9.5 17 4.5 12" />
  </Svg>
);

export const DownloadIcon = (props) => (
  <Svg {...props}>
    <path d="M12 3v12" />
    <path d="M7.5 10.5L12 15l4.5-4.5" />
    <path d="M4 20h16" />
  </Svg>
);

export const QrIcon = (props) => (
  <Svg {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1.6" />
    <rect x="14" y="3" width="7" height="7" rx="1.6" />
    <rect x="3" y="14" width="7" height="7" rx="1.6" />
    <path d="M14 14h3v3h-3zM20 14v.01M14 20v.01M20 20v.01M20 17v.01M17 20v.01" />
  </Svg>
);

export const ChartIcon = (props) => (
  <Svg {...props}>
    <path d="M4 20V9M10 20V4M16 20v-7M22 20H2" />
  </Svg>
);

export const PanelIcon = (props) => (
  <Svg {...props}>
    <rect x="3" y="4" width="18" height="16" rx="3" />
    <path d="M3 9h18M8 13h8M8 16.5h5" />
  </Svg>
);

export const TagIcon = (props) => (
  <Svg {...props}>
    <path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0l-7.2-7.2a2 2 0 0 1-.6-1.4V5a2 2 0 0 1 2-2h7a2 2 0 0 1 1.4.6l7.4 7.4a2 2 0 0 1 0 2.4z" />
    <circle cx="7.5" cy="7.5" r="1.4" />
  </Svg>
);

export const ArrowRightIcon = (props) => (
  <Svg {...props}>
    <path d="M4 12h15" />
    <path d="M13.5 6.5L20 12l-6.5 5.5" />
  </Svg>
);

export const ExternalIcon = (props) => (
  <Svg {...props}>
    <path d="M14 4h6v6" />
    <path d="M20 4l-8.5 8.5" />
    <path d="M18 14v4.5A1.5 1.5 0 0 1 16.5 20h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10" />
  </Svg>
);

export const ShareIcon = (props) => (
  <Svg {...props}>
    <path d="M12 3v11" />
    <path d="M8 7l4-4 4 4" />
    <path d="M5 13v6.5A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V13" />
  </Svg>
);

export const MoonIcon = (props) => (
  <Svg {...props}>
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />
  </Svg>
);

export const SunIcon = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
  </Svg>
);

export const EditIcon = (props) => (
  <Svg {...props}>
    <path d="M4 20h4l10.7-10.7a2.1 2.1 0 0 0-3-3L5 17v3z" />
    <path d="M13.5 6.5l3 3" />
  </Svg>
);

export const TrashIcon = (props) => (
  <Svg {...props}>
    <path d="M4 7h16" />
    <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
    <path d="M6 7l.8 12A1.5 1.5 0 0 0 8.3 20.5h7.4A1.5 1.5 0 0 0 17.2 19L18 7" />
    <path d="M10.5 11v6M13.5 11v6" />
  </Svg>
);

export const SparkIcon = (props) => (
  <Svg {...props}>
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
  </Svg>
);

export const GitHubIcon = ({ size = 16, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

/* ------------------------------------------------------------------ brand */

export function Brand({ compact = false }) {
  return (
    <span className="brand">
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" focusable="false">
          <rect x="2" y="2" width="8" height="8" />
          <rect x="14" y="2" width="8" height="8" />
          <rect x="2" y="14" width="8" height="8" />
          <rect x="14" y="14" width="4" height="4" />
          <rect x="18" y="18" width="4" height="4" />
        </svg>
      </span>
      <span className="brand-text">elioxy</span>
      {!compact && <span className="brand-pill">links</span>}
    </span>
  );
}

/* --------------------------------------------------------------- backdrop */

export function Background() {
  return <div className="bg" aria-hidden="true" />;
}

/* ------------------------------------------------------------------- theme */

const THEME_KEY = "elioxy_theme";

/** Foto servida por el propio Worker: así no la bloquea una CSP con img-src 'self'. */
export function avatarSrc(user) {
  return user?.login ? `/avatar/${encodeURIComponent(user.login)}` : "";
}

export function ThemeToggle() {
  const [dark, setDark] = useState(
    () => typeof document !== "undefined" && document.documentElement.dataset.theme === "dark"
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    function followSystem(event) {
      try {
        if (localStorage.getItem(THEME_KEY)) return;
      } catch {
        /* sin almacenamiento: manda el sistema */
      }
      const next = event.matches;
      setDark(next);
      if (next) document.documentElement.dataset.theme = "dark";
      else document.documentElement.removeAttribute("data-theme");
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", next ? "#131211" : "#f3f3ee");
    }
    media.addEventListener("change", followSystem);
    return () => media.removeEventListener("change", followSystem);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    if (next) document.documentElement.dataset.theme = "dark";
    else document.documentElement.removeAttribute("data-theme");
    try {
      localStorage.setItem(THEME_KEY, next ? "dark" : "light");
    } catch {
      /* private mode: the theme just won't persist */
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", next ? "#131211" : "#f3f3ee");
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-pressed={dark}
      aria-label={dark ? "Cambiar al tema claro" : "Cambiar al tema oscuro"}
      title={dark ? "Tema claro" : "Tema oscuro"}
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

/* -------------------------------------------------------------------- nav */

export function Nav({ me, variant = "landing" }) {
  const user = me?.user;
  const avatar = avatarSrc(user);
  const [failedAvatar, setFailedAvatar] = useState("");
  const showAvatar = Boolean(avatar) && failedAvatar !== avatar;
  return (
    <header className="nav">
      <div className="nav-inner">
        <a className="brand-link" href="/" onClick={(event) => linkTo(event, "/")} aria-label="elioxy links, inicio">
          <Brand />
        </a>

        {variant === "landing" && (
          <nav className="nav-links" aria-label="Secciones">
            <a href="#funciones">Funciones</a>
            <a href="#como-funciona">Cómo funciona</a>
            <a href="/qr" onClick={(event) => linkTo(event, "/qr")}>
              Generador QR
            </a>
            <a href="/panel" onClick={(event) => linkTo(event, "/panel")}>
              Panel
            </a>
          </nav>
        )}

        <div className="nav-actions">
          <ThemeToggle />
          {user ? (
            <a className="nav-user" href="/panel" onClick={(event) => linkTo(event, "/panel")}>
              {showAvatar ? (
                <img src={avatar} alt="" width="26" height="26" onError={() => setFailedAvatar(avatar)} />
              ) : (
                <span className="avatar-fallback">{(user.name || user.login || "?").slice(0, 1).toUpperCase()}</span>
              )}
              <span className="nav-user-name">Mi panel</span>
            </a>
          ) : (
            <a className="btn btn-ghost btn-sm" href="/auth/github">
              <GitHubIcon /> <span>
                Entrar<span className="nav-btn-long"> con GitHub</span>
              </span>
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------- copy button */

export async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

export function ShareButton({ title, text, url, label = "Compartir", className = "btn btn-ghost btn-sm" }) {
  const [done, setDone] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function handleClick() {
    const payload = { title, text, url };
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share(payload);
        return;
      } catch (error) {
        if (error && error.name === "AbortError") return;
      }
    }
    const ok = await copyText(url || text || "");
    if (!ok) return;
    setDone(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setDone(false), 1700);
  }

  return (
    <button type="button" className={`${className}${done ? " is-copied" : ""}`} onClick={handleClick}>
      {done ? <CheckIcon /> : <ShareIcon />}
      <span>{done ? "Copiado" : label}</span>
    </button>
  );
}

export function CopyButton({ value, label = "Copiar", className = "btn btn-ghost btn-sm" }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function handleClick() {
    const ok = await copyText(value);
    if (!ok) return;
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1700);
  }

  return (
    <button type="button" className={`${className}${copied ? " is-copied" : ""}`} onClick={handleClick}>
      {copied ? <CheckIcon /> : <CopyIcon />}
      <span>{copied ? "Copiado" : label}</span>
    </button>
  );
}

export function CopyImageNotice({ onDownload }) {
  return (
    <p className="copy-notice" role="status">
      <span>Este navegador no deja copiar la imagen del QR.</span>
      <button type="button" className="copy-notice-action" onClick={onDownload}>
        <DownloadIcon /> Descargar PNG
      </button>
    </p>
  );
}

/* ----------------------------------------------------------------- footer */

export function SiteFooter() {
  return (
    <footer className="colofon">
      <div className="colofon-top">
        <div className="colofon-brand">
          <a className="brand-link" href="/" onClick={(event) => linkTo(event, "/")}>
            <Brand />
          </a>
          <p>Enlaces cortos y códigos QR. Nada más.</p>
        </div>
        <div className="colofon-links">
          <a href="/panel" onClick={(event) => linkTo(event, "/panel")}>
            Panel
          </a>
          <a href="/qr" onClick={(event) => linkTo(event, "/qr")}>
            Generador QR
          </a>
          <a href="/privacidad" onClick={(event) => linkTo(event, "/privacidad")}>
            Privacidad
          </a>
          <a href="/terminos" onClick={(event) => linkTo(event, "/terminos")}>
            Términos
          </a>
          <a href="https://github.com/ElioXY" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
      </div>

      <nav className="colofon-guias" aria-label="Guías">
        <a className="colofon-guias-title" href="/guias" onClick={(event) => linkTo(event, "/guias")}>
          Guías
        </a>
        <ul>
          {GUIAS.map((guia) => (
            <li key={guia.path}>
              <a href={guia.path} onClick={(event) => linkTo(event, guia.path)}>
                {guia.title}
              </a>
            </li>
          ))}
          <li>
            <a href={ACERCA.path} onClick={(event) => linkTo(event, ACERCA.path)}>
              {ACERCA.title}
            </a>
          </li>
        </ul>
      </nav>

      <div className="colofon-bottom">
        <span>Colofón · Archivo + IBM Plex Mono</span>
        <span>tinta #131311 · cobalto #1F2CE0 · amarillo #FFD23F · papel #F3F3EE</span>
        <span>url.elioxy.us.ci</span>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------- ads */

function metaContent(name) {
  if (typeof document === "undefined") return "";
  const node = document.querySelector(`meta[name="${name}"]`);
  return node ? (node.getAttribute("content") || "").trim() : "";
}

/**
 * Unidad de anuncio manual. El Worker solo publica las metas `google-adsense-account`
 * y `adsense-slot` en la portada, así que en el resto de rutas esto no pinta nada.
 */
export function AdSlot({ className = "" }) {
  const ins = useRef(null);
  const client = metaContent("google-adsense-account");
  const slot = metaContent("adsense-slot");
  const ready = Boolean(client && slot);

  useEffect(() => {
    const node = ins.current;
    if (!node || node.dataset.adPushed === "1") return;
    node.dataset.adPushed = "1";
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* bloqueador de anuncios o script no disponible */
    }
  }, []);

  if (!ready) return null;

  return (
    <aside className={`ad-slot ${className}`.trim()} aria-label="Publicidad">
      <span className="ad-slot-label">Publicidad</span>
      <ins
        ref={ins}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}

/* ---------------------------------------------------------------- motion */

export function useCountUp(value, duration = 900) {
  const target = Number(value) || 0;
  const [display, setDisplay] = useState(target);
  const current = useRef(target);

  useEffect(() => {
    const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      current.current = target;
      setDisplay(target);
      return undefined;
    }
    const from = current.current;
    const start = performance.now();
    let frame;
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = from + (target - from) * eased;
      current.current = next;
      setDisplay(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return display;
}

/* ------------------------------------------------------------------ dates */

const dateFormatter = new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "numeric" });
const relativeFormatter = new Intl.RelativeTimeFormat("es-ES", { numeric: "auto" });

export function formatDate(timestamp) {
  if (!timestamp) return "—";
  return dateFormatter.format(new Date(timestamp));
}

export function relativeDate(timestamp) {
  if (!timestamp) return "—";
  const diff = Date.now() - timestamp;
  const minutes = Math.round(diff / 60000);
  if (Math.abs(minutes) < 1) return "ahora mismo";
  if (Math.abs(minutes) < 60) return relativeFormatter.format(-minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return relativeFormatter.format(-hours, "hour");
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) return relativeFormatter.format(-days, "day");
  const months = Math.round(days / 30);
  if (Math.abs(months) < 12) return relativeFormatter.format(-months, "month");
  return relativeFormatter.format(-Math.round(months / 12), "year");
}
