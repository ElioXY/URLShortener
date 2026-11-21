import { useEffect, useMemo, useState } from "react";
import { Background, CopyButton, CopyImageNotice, DownloadIcon, Nav, ShareButton } from "./ui.jsx";
import { QrCard, copyQrPng, downloadLabel, downloadPng, downloadSvg } from "./Qr.jsx";
import { linkTo } from "../router.js";

const TYPES = [
  { id: "url", label: "Enlace" },
  { id: "wifi", label: "WiFi" },
  { id: "texto", label: "Texto" },
  { id: "contacto", label: "Contacto" },
];

const EYEBROWS = { url: "ENLACE CORTO", wifi: "WI-FI", texto: "TEXTO", contacto: "CONTACTO" };

function escapeWifi(value) {
  return String(value).replace(/([\\;,:"])/g, "\\$1");
}

function escapeVcard(value) {
  return String(value).replace(/\r?\n/g, " ").replace(/([\\;,])/g, "\\$1");
}

function normalizeUrl(raw) {
  const value = raw.trim();
  if (!value) return "";
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value)) return value;
  return `https://${value}`;
}

export default function QrStudio({ me }) {
  const [type, setType] = useState("url");
  const [url, setUrl] = useState("");
  const [wifi, setWifi] = useState({ ssid: "", password: "", security: "WPA", hidden: false });
  const [text, setText] = useState("");
  const [contact, setContact] = useState({ name: "", phone: "", email: "", org: "", url: "" });
  const [copiedQr, setCopiedQr] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  const payload = useMemo(() => {
    if (type === "url") return normalizeUrl(url);
    if (type === "wifi") {
      if (!wifi.ssid.trim()) return "";
      const security = wifi.security === "nopass" ? "nopass" : wifi.security;
      const parts = [`WIFI:T:${security};S:${escapeWifi(wifi.ssid)};`];
      if (security !== "nopass" && wifi.password) parts.push(`P:${escapeWifi(wifi.password)};`);
      if (wifi.hidden) parts.push("H:true;");
      parts.push(";");
      return parts.join("");
    }
    if (type === "texto") return text.trim();
    if (type === "contacto") {
      if (!contact.name.trim()) return "";
      const lines = ["BEGIN:VCARD", "VERSION:3.0", `FN:${escapeVcard(contact.name)}`, `N:${escapeVcard(contact.name)};;;;`];
      if (contact.org.trim()) lines.push(`ORG:${escapeVcard(contact.org)}`);
      if (contact.phone.trim()) lines.push(`TEL;TYPE=CELL:${contact.phone.replace(/[^\d+]/g, "")}`);
      if (contact.email.trim()) lines.push(`EMAIL:${contact.email.trim()}`);
      if (contact.url.trim()) lines.push(`URL:${normalizeUrl(contact.url)}`);
      lines.push("END:VCARD");
      return lines.join("\n");
    }
    return "";
  }, [type, url, wifi, text, contact]);

  const caption = useMemo(() => {
    if (type === "url") return normalizeUrl(url).replace(/^https?:\/\//, "");
    if (type === "wifi") return wifi.ssid ? `WiFi: ${wifi.ssid}` : "";
    if (type === "texto") return text.trim();
    if (type === "contacto") return contact.name.trim();
    return "";
  }, [type, url, wifi, text, contact]);

  const shareText = useMemo(() => {
    if (type === "url") return normalizeUrl(url);
    if (type === "wifi") {
      if (!wifi.ssid) return "";
      const extra = wifi.security !== "nopass" && wifi.password ? ` · contraseña: ${wifi.password}` : "";
      return `WiFi: ${wifi.ssid}${extra}`;
    }
    if (type === "texto") return text.trim();
    if (type === "contacto") {
      return [contact.name, contact.phone, contact.email].filter((part) => part && part.trim()).join(" · ");
    }
    return "";
  }, [type, url, wifi, text, contact]);

  useEffect(() => {
    setCopyFailed(false);
  }, [payload]);

  async function handleCopyQr() {
    if (!payload) return;
    const ok = await copyQrPng(payload, { caption, eyebrow: EYEBROWS[type] });
    if (!ok) {
      setCopyFailed(true);
      return;
    }
    setCopyFailed(false);
    setCopiedQr(true);
    setTimeout(() => setCopiedQr(false), 1700);
  }

  return (
    <>
      <Background />
      <div className="shell">
        <Nav me={me} variant="app" />

        <main className="studio">
          <div className="studio-head">
            <h1>Generador de QR</h1>
            <p className="dash-sub">
              Elige qué quieres codificar y llévate el código en PNG, SVG o etiqueta imprimible. No hace falta acortar
              nada.
            </p>
          </div>

          <div className="studio-grid">
            <section className="studio-form">
              <div className="studio-tabs" role="tablist" aria-label="Tipo de QR">
                {TYPES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={type === item.id}
                    className={`studio-tab${type === item.id ? " is-active" : ""}`}
                    onClick={() => setType(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {type === "url" && (
                <label className="field">
                  <span>Dirección</span>
                  <input
                    className="input"
                    type="text"
                    inputMode="url"
                    spellCheck="false"
                    placeholder="https://tu-sitio.com"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                  />
                </label>
              )}

              {type === "wifi" && (
                <div className="studio-fields">
                  <label className="field">
                    <span>Nombre de la red (SSID)</span>
                    <input
                      className="input"
                      type="text"
                      spellCheck="false"
                      placeholder="Cafe-Elioxy"
                      value={wifi.ssid}
                      onChange={(event) => setWifi({ ...wifi, ssid: event.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>Contraseña</span>
                    <input
                      className="input"
                      type="text"
                      spellCheck="false"
                      placeholder="la del router"
                      value={wifi.password}
                      disabled={wifi.security === "nopass"}
                      onChange={(event) => setWifi({ ...wifi, password: event.target.value })}
                    />
                  </label>
                  <div className="studio-row">
                    <label className="field">
                      <span>Seguridad</span>
                      <select
                        className="select"
                        value={wifi.security}
                        onChange={(event) => setWifi({ ...wifi, security: event.target.value })}
                      >
                        <option value="WPA">WPA / WPA2</option>
                        <option value="WEP">WEP</option>
                        <option value="nopass">Abierta</option>
                      </select>
                    </label>
                    <label className="check">
                      <input
                        type="checkbox"
                        checked={wifi.hidden}
                        onChange={(event) => setWifi({ ...wifi, hidden: event.target.checked })}
                      />
                      <span>Red oculta</span>
                    </label>
                  </div>
                  <p className="hint">Se guarda en el QR tal cual: quien lo escanee se conecta sin escribir nada.</p>
                </div>
              )}

              {type === "texto" && (
                <label className="field">
                  <span>Texto</span>
                  <textarea
                    className="input textarea"
                    rows={5}
                    placeholder="Una nota, una instrucción, una dirección…"
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                  />
                </label>
              )}

              {type === "contacto" && (
                <div className="studio-fields">
                  <label className="field">
                    <span>Nombre</span>
                    <input
                      className="input"
                      type="text"
                      placeholder="Elioxy"
                      value={contact.name}
                      onChange={(event) => setContact({ ...contact, name: event.target.value })}
                    />
                  </label>
                  <div className="studio-row">
                    <label className="field">
                      <span>Teléfono</span>
                      <input
                        className="input"
                        type="tel"
                        placeholder="+34 600 000 000"
                        value={contact.phone}
                        onChange={(event) => setContact({ ...contact, phone: event.target.value })}
                      />
                    </label>
                    <label className="field">
                      <span>Email</span>
                      <input
                        className="input"
                        type="email"
                        placeholder="hello@elioxy.us.ci"
                        value={contact.email}
                        onChange={(event) => setContact({ ...contact, email: event.target.value })}
                      />
                    </label>
                  </div>
                  <div className="studio-row">
                    <label className="field">
                      <span>Organización</span>
                      <input
                        className="input"
                        type="text"
                        placeholder="Estudio"
                        value={contact.org}
                        onChange={(event) => setContact({ ...contact, org: event.target.value })}
                      />
                    </label>
                    <label className="field">
                      <span>Web</span>
                      <input
                        className="input"
                        type="text"
                        inputMode="url"
                        placeholder="elioxy.us.ci"
                        value={contact.url}
                        onChange={(event) => setContact({ ...contact, url: event.target.value })}
                      />
                    </label>
                  </div>
                  <p className="hint">Genera una tarjeta vCard: al escanearla se ofrece guardar el contacto.</p>
                </div>
              )}

              <p className="studio-note">
                ¿Prefieres un enlace corto con su QR y sus clics?{" "}
                <a href="/" onClick={(event) => linkTo(event, "/")}>
                  Usa el acortador
                </a>
                .
              </p>
            </section>

            <aside className="studio-preview" aria-live="polite">
              <div className={`qr-sheet${payload ? "" : " is-empty"}`}>
                {payload ? (
                  <QrCard value={payload} caption={caption} eyebrow={EYEBROWS[type]} size={280} />
                ) : (
                  <span>Completa los datos para ver el código</span>
                )}
              </div>
              <p className="studio-caption">{caption || "Sin contenido todavía"}</p>

              {payload && (
                <>
                  <div className="studio-actions">
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => downloadPng(payload, `qr-${type}`, { caption, eyebrow: EYEBROWS[type] })}
                    >
                      <DownloadIcon /> PNG
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => downloadSvg(payload, `qr-${type}`, { caption, eyebrow: EYEBROWS[type] })}
                    >
                      SVG
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => downloadLabel(payload, { slug: type, sizeMm: 60, caption })}
                    >
                      Etiqueta 60 mm
                    </button>
                  </div>
                  <div className="studio-actions">
                    <button type="button" className="btn btn-ghost btn-sm" onClick={handleCopyQr}>
                      {copiedQr ? "QR copiado" : "Copiar QR"}
                    </button>
                    <CopyButton
                      value={type === "wifi" && wifi.security !== "nopass" ? wifi.password : payload}
                      label={type === "wifi" ? "Copiar contraseña" : "Copiar contenido"}
                      className="btn btn-ghost btn-sm"
                    />
                    <ShareButton
                      title="Código QR"
                      text={shareText}
                      url={type === "url" ? normalizeUrl(url) : undefined}
                      className="btn btn-ghost btn-sm"
                    />
                  </div>
                  {copyFailed && (
                    <CopyImageNotice
                      onDownload={() => downloadPng(payload, `qr-${type}`, { caption, eyebrow: EYEBROWS[type] })}
                    />
                  )}
                </>
              )}
            </aside>
          </div>
        </main>

        <footer className="footer footer-dash">
          <div className="footer-inner">
            <p>url.elioxy.us.ci · enlaces cortos y QR</p>
            <a href="/privacidad" onClick={(event) => linkTo(event, "/privacidad")}>
              Privacidad
            </a>
            <a href="/" onClick={(event) => linkTo(event, "/")}>
              Volver al inicio
            </a>
          </div>
        </footer>
      </div>
    </>
  );
}
