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
