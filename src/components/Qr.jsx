import { useEffect, useRef } from "react";
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

export async function downloadPng(value, filename) {
  const canvas = document.createElement("canvas");
  await QRCode.toCanvas(canvas, value, {
    width: 1024,
    margin: 2,
    errorCorrectionLevel: "M",
    color: COLORS,
  });
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  if (blob) saveBlob(blob, `${filename}.png`);
}

export async function downloadSvg(value, filename) {
  const svg = await QRCode.toString(value, {
    type: "svg",
    margin: 2,
    errorCorrectionLevel: "M",
    color: COLORS,
  });
  saveBlob(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }), `${filename}.svg`);
}

/**
 * Printable label at a real physical size: QR, short URL, brand and crop marks.
 * Built as vector SVG so it prints at the exact requested millimetres.
 */
export async function buildLabelSvg(value, { sizeMm = 60, color = "#131311", caption } = {}) {
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
  <text x="150" y="252" text-anchor="middle" font-family="'IBM Plex Mono', 'DejaVu Sans Mono', monospace" font-size="${fontSize}" fill="#131311">${escapeXml(label)}</text>
  <text x="150" y="278" text-anchor="middle" font-family="Archivo, 'Helvetica Neue', Arial, sans-serif" font-size="7.5" letter-spacing="0.9" fill="#78786f">elioxy links</text>
</svg>`;
}

export async function downloadLabel(value, { slug = "enlace", sizeMm = 60, color = "#131311", caption } = {}) {
  const svg = await buildLabelSvg(value, { sizeMm, color, caption });
  saveBlob(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }), `etiqueta-${slug}-${sizeMm}mm.svg`);
}

/** Copy the QR as a PNG image, so it can be pasted into chat or a document. */
export async function copyQrPng(value) {
  if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) return false;
  try {
    const canvas = document.createElement("canvas");
    await QRCode.toCanvas(canvas, value, { width: 720, margin: 2, errorCorrectionLevel: "M", color: COLORS });
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) return false;
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    return true;
  } catch {
    return false;
  }
}
