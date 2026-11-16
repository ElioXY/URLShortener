import { useEffect, useRef, useState } from "react";
import { linkTo } from "../router.js";

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
        <LinkIcon size={17} />
      </span>
      <span className="brand-text">elioxy</span>
      {!compact && <span className="brand-pill">links</span>}
    </span>
  );
}

/* --------------------------------------------------------------- backdrop */

export function Background() {
  return (
    <div className="bg" aria-hidden="true">
      <div className="bg-grid" />
      <div className="blob blob-a" />
      <div className="blob blob-b" />
      <div className="blob blob-c" />
    </div>
  );
}

/* -------------------------------------------------------------------- nav */

export function Nav({ me, variant = "landing" }) {
  const user = me?.user;
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
            <a href="/panel" onClick={(event) => linkTo(event, "/panel")}>
              Panel
            </a>
          </nav>
        )}

        <div className="nav-actions">
          {user ? (
            <a className="nav-user" href="/panel" onClick={(event) => linkTo(event, "/panel")}>
              {user.avatar ? (
                <img src={user.avatar} alt="" width="26" height="26" />
              ) : (
                <span className="avatar-fallback">{(user.name || user.login || "?").slice(0, 1).toUpperCase()}</span>
              )}
              <span className="nav-user-name">Mi panel</span>
            </a>
          ) : (
            <a className="btn btn-ghost btn-sm" href="/auth/github">
              <GitHubIcon /> Entrar con GitHub
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
