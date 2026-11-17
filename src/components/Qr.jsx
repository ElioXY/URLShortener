import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

const COLORS = { dark: "#07080f", light: "#ffffff" };

export function QrCanvas({ value, size = 180, className = "qr-canvas" }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    QRCode.toCanvas(canvas, value, {
      width: Math.max(320, size * 2),
      margin: 1,
      errorCorrectionLevel: "M",
      color: COLORS,
    })
      .then(() => {
        // The renderer writes inline pixel sizes; let CSS keep the code square.
        canvas.style.width = "100%";
        canvas.style.height = "auto";
      })
      .catch((error) => console.error("qr render failed", error));
  }, [value, size]);

  return (
    <canvas
      ref={ref}
      className={className}
      role="img"
      aria-label={`Código QR de ${value}`}
      style={{ maxWidth: size }}
    />
  );
}

/** Previsualización vectorial de la tarjeta: mismo SVG que la descarga. */
export function QrCard({ value, caption, eyebrow, expiresAt, size = 240, className = "qr-card-preview" }) {
  const [svg, setSvg] = useState("");

  useEffect(() => {
    let alive = true;
    buildQrCardSvg(value, { caption, eyebrow, expiresAt })
      .then((markup) => {
        if (alive) setSvg(markup);
      })
      .catch((error) => console.error("qr card render failed", error));
    return () => {
      alive = false;
    };
  }, [value, caption, eyebrow, expiresAt]);

  return (
    <div
      className={className}
      style={{ maxWidth: size }}
      role="img"
      aria-label={`Código QR de ${value}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
  });
}

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/* ------------------------------------------------------------------ tarjeta */

const CARD = { ink: "#131311", cobalt: "#1f2ce0", paper: "#f3f3ee", soft: "#78786f" };
const MONO = "'IBM Plex Mono', 'DejaVu Sans Mono', Menlo, Consolas, monospace";
const SANS = "Archivo, 'Helvetica Neue', Arial, sans-serif";

function defaultCaption(value) {
  const text = String(value || "");
  return /^https?:\/\//i.test(text) ? text.replace(/^https?:\/\//i, "") : "";
}

const CARD_FONTS = [
  { family: "Archivo", file: "archivo-latin.woff2", weight: "300 900", stretch: "75% 125%" },
  { family: "IBM Plex Mono", file: "plex-mono-400.woff2", weight: "400" },
  { family: "IBM Plex Mono", file: "plex-mono-500.woff2", weight: "500" },
];

let cardFontCssPromise = null;

/**
 * Tipografías reales dentro del SVG: un SVG cargado como imagen no ve las
 * fuentes de la página, así que las incrustamos en base64 solo al rasterizar.
 */
function cardFontCss() {
  if (!cardFontCssPromise) {
    cardFontCssPromise = Promise.all(
      CARD_FONTS.map(async (font) => {
        const response = await fetch(`/fonts/${font.file}`);
        if (!response.ok) throw new Error(`font ${font.file}`);
        const bytes = new Uint8Array(await response.arrayBuffer());
        let binary = "";
        for (let index = 0; index < bytes.length; index += 0x8000) {
          binary += String.fromCharCode.apply(null, bytes.subarray(index, index + 0x8000));
        }
        const stretch = font.stretch ? `font-stretch:${font.stretch};` : "";
        return `@font-face{font-family:'${font.family}';font-style:normal;font-weight:${font.weight};${stretch}font-display:block;src:url(data:font/woff2;base64,${btoa(binary)}) format('woff2');}`;
      })
    )
      .then((faces) => faces.join(""))
      .catch(() => "");
  }
  return cardFontCssPromise;
}

/**
 * Shareable QR card: paper, keylines, brand and the short URL, so the exported
 * PNG/SVG looks like the rest of the site instead of a bare code.
 */
export async function buildQrCardSvg(value, { caption, eyebrow = "ENLACE CORTO", expiresAt, embedFonts = false } = {}) {
  const payload = String(value);
  const fontCss = embedFonts ? await cardFontCss() : "";
  const qr = await QRCode.toString(payload, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: CARD.ink, light: "#ffffff" },
  });

  const viewBox = /viewBox="([^"]+)"/.exec(qr)?.[1] || "0 0 33 33";
  const modules = Number(viewBox.split(/\s+/)[2]) || 33;
  const inner = qr.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").trim();

  // Placa blanca con zona de silencio de 4 módulos por lado.
  const plate = 700;
  const moduleSize = plate / (modules + 8);
  const quiet = moduleSize * 4;
  const codeSize = plate - quiet * 2;
  const plateX = (1200 - plate) / 2;
  const plateY = 196;

  const rawCaption = caption != null ? String(caption) : defaultCaption(payload);
  const label = rawCaption.length > 46 ? `${rawCaption.slice(0, 45)}…` : rawCaption;
  const labelSize = label ? Math.min(40, Math.floor(1000 / (label.length * 0.62))) : 0;

  const expiryDate = expiresAt ? new Date(Number(expiresAt)) : null;
  const expiryText =
    expiryDate && !Number.isNaN(expiryDate.getTime())
      ? `Válido hasta ${new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" })
          .format(expiryDate)
          .replace(/\./g, "")}`
      : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200" role="img" aria-label="Código QR de ${escapeXml(payload)}">${fontCss ? `<defs><style type="text/css">${fontCss}</style></defs>` : ""}
  <rect width="1200" height="1200" fill="${CARD.paper}" />
  <g stroke="${CARD.ink}" stroke-width="1.6" fill="none">
    <path d="M46 80V46h34" />
    <path d="M1120 46h34v34" />
    <path d="M1154 1120v34h-34" />
    <path d="M80 1154H46v-34" />
  </g>
  <g transform="translate(96 88)">
    <rect width="36" height="36" fill="${CARD.cobalt}" />
    <g fill="#ffffff" transform="scale(1.5)">
      <rect x="2" y="2" width="8" height="8" />
      <rect x="14" y="2" width="8" height="8" />
      <rect x="2" y="14" width="8" height="8" />
      <rect x="14" y="14" width="4" height="4" />
      <rect x="18" y="18" width="4" height="4" />
    </g>
  </g>
  <text x="146" y="119" font-family="${SANS}" font-size="28" font-weight="800" letter-spacing="-0.8" fill="${CARD.ink}">elioxy <tspan font-family="${MONO}" font-size="15" font-weight="400" letter-spacing="0.6" fill="${CARD.soft}">links</tspan></text>
  <text x="1104" y="116" text-anchor="end" font-family="${MONO}" font-size="14" letter-spacing="2.6" fill="${CARD.soft}">${escapeXml(eyebrow)}</text>
  <path d="M96 166h1008" stroke="${CARD.ink}" stroke-width="1.6" />
  <rect x="${plateX}" y="${plateY}" width="${plate}" height="${plate}" fill="#ffffff" />
  <g transform="translate(${(plateX + quiet).toFixed(2)} ${(plateY + quiet).toFixed(2)}) scale(${(codeSize / modules).toFixed(4)})" shape-rendering="crispEdges">${inner}</g>
  ${label ? `<text x="600" y="952" text-anchor="middle" font-family="${MONO}" font-size="${labelSize}" fill="${CARD.ink}">${escapeXml(label)}</text>` : ""}
  ${expiryText ? `<text x="600" y="986" text-anchor="middle" font-family="${MONO}" font-size="19" letter-spacing="0.8" fill="${CARD.cobalt}">${escapeXml(expiryText)}</text>` : ""}
  <path d="M96 1024h1008" stroke="${CARD.ink}" stroke-opacity="0.28" stroke-width="1.4" />
  <text x="96" y="1064" font-family="${MONO}" font-size="17" letter-spacing="0.8" fill="${CARD.soft}">url.elioxy.us.ci</text>
  <text x="1104" y="1064" text-anchor="end" font-family="${MONO}" font-size="17" letter-spacing="0.8" fill="${CARD.soft}">enlaces cortos con QR</text>
</svg>`;
}

async function svgToPngBlob(svg, size) {
  // data: en vez de blob:, porque una CSP con img-src 'self' data: bloquea blob:.
  const image = new Image();
  image.decoding = "sync";
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, 0, 0, size, size);
  return await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

export async function qrCardPng(value, options = {}) {
  const svg = await buildQrCardSvg(value, { ...options, embedFonts: true });
  return svgToPngBlob(svg, options.pixels || 2400);
}

export async function downloadPng(value, filename, options) {
  const blob = await qrCardPng(value, options);
  if (blob) saveBlob(blob, `${filename}.png`);
}

export async function downloadSvg(value, filename, options) {
  const svg = await buildQrCardSvg(value, options);
  saveBlob(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }), `${filename}.svg`);
}

/**
 * Printable label at a real physical size: QR, short URL, brand and crop marks.
 * Built as vector SVG so it prints at the exact requested millimetres.
 */
export async function buildLabelSvg(value, { sizeMm = 60, color = "#131311", caption, expiresAt } = {}) {
  const qr = await QRCode.toString(value, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: color, light: "#ffffff" },
  });

  const viewBox = /viewBox="([^"]+)"/.exec(qr)?.[1] || "0 0 33 33";
  const modules = Number(viewBox.split(/\s+/)[2]) || 33;
  const inner = qr.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  const scale = 188 / modules;

  const shortUrl = String(value).replace(/^https?:\/\//, "");
  const raw = caption ? String(caption) : shortUrl;
  const label = raw.length > 34 ? `${raw.slice(0, 33)}…` : raw;
  const fontSize = label.length > 28 ? 8.4 : label.length > 22 ? 9.8 : 11;

  // Temporary posters need the deadline on the label itself.
  const expiryDate = expiresAt ? new Date(Number(expiresAt)) : null;
  const expiryText =
    expiryDate && !Number.isNaN(expiryDate.getTime())
      ? `Válido hasta ${new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" })
          .format(expiryDate)
          .replace(/\./g, "")}`
      : "";
  const metaSize = sizeMm <= 40 ? 6.4 : 7;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${sizeMm}mm" height="${sizeMm}mm" viewBox="0 0 300 300" role="img" aria-label="Etiqueta con el código QR de ${escapeXml(value)}">
  <rect width="300" height="300" fill="#ffffff" />
  <g stroke="#131311" stroke-width="0.9" fill="none">
    <path d="M2 14V2h12" />
    <path d="M286 2h12v12" />
    <path d="M298 286v12h-12" />
    <path d="M14 298H2v-12" />
  </g>
  <rect x="6" y="6" width="288" height="288" fill="none" stroke="#131311" stroke-width="2" />
  <g transform="translate(56 34) scale(${scale.toFixed(4)})" shape-rendering="crispEdges">${inner}</g>
  <text x="150" y="${expiryText ? 246 : 252}" text-anchor="middle" font-family="'IBM Plex Mono', 'DejaVu Sans Mono', monospace" font-size="${fontSize}" fill="#131311">${escapeXml(label)}</text>${
    expiryText
      ? `\n  <text x="150" y="265" text-anchor="middle" font-family="'IBM Plex Mono', 'DejaVu Sans Mono', monospace" font-size="${metaSize}" letter-spacing="0.5" fill="${color}">${escapeXml(expiryText)}</text>`
      : ""
  }
  <text x="150" y="${expiryText ? 285 : 278}" text-anchor="middle" font-family="Archivo, 'Helvetica Neue', Arial, sans-serif" font-size="7.5" letter-spacing="0.9" fill="#78786f">elioxy links</text>
</svg>`;
}

export async function downloadLabel(value, { slug = "enlace", sizeMm = 60, color = "#131311", caption, expiresAt } = {}) {
  const svg = await buildLabelSvg(value, { sizeMm, color, caption, expiresAt });
  saveBlob(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }), `etiqueta-${slug}-${sizeMm}mm.svg`);
}

/** Copy the QR as a PNG image, so it can be pasted into chat or a document. */
export async function copyQrPng(value, options = {}) {
  if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) return false;
  try {
    const blob = await qrCardPng(value, { ...options, pixels: 1200 });
    if (!blob) return false;
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    return true;
  } catch {
    return false;
  }
}
