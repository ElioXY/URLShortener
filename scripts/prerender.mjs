/**
 * Pre-renderiza las páginas de contenido a HTML estático.
 *
 * Se ejecuta después de `vite build`: coge el `dist/index.html` ya generado
 * (con los assets con hash), mete el HTML de cada página dentro de `#root` y
 * escribe `dist/<ruta>/index.html`. El Worker sirve esos ficheros para que el
 * rastreador de AdSense lea el texto sin ejecutar JavaScript.
 */
import { build } from "esbuild";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import path from "node:path";

const root = process.cwd();
const outfile = path.join(root, ".prerender/entry.mjs");

await build({
  entryPoints: [path.join(root, "scripts/prerender-entry.jsx")],
  outfile,
  bundle: true,
  format: "esm",
  platform: "node",
  jsx: "automatic",
  target: "node20",
  external: ["react", "react-dom", "react-dom/server", "react/jsx-runtime"],
  logLevel: "warning",
});

const { pages, renderHtml } = await import(pathToFileURL(outfile).href);
const shell = await readFile(path.join(root, "dist/index.html"), "utf8");

if (!shell.includes('<div id="root"></div>')) {
  throw new Error("dist/index.html no tiene el contenedor #root vacío");
}

const escapeHtml = (value) =>
  String(value).replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]);

for (const page of pages) {
  // Las páginas leen la ruta actual para elegir las guías relacionadas.
  globalThis.window = { location: { pathname: page.path } };

  const markup = renderHtml(page.path);
  const html = shell
    .replace('<div id="root"></div>', `<div id="root">${markup}</div>`)
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(page.title)}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
      `<meta name="description" content="${escapeHtml(page.description)}" />`
    );

  const dir = path.join(root, "dist", page.path.replace(/^\//, ""));
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "index.html"), html, "utf8");
  console.log(`  prerender  ${page.path}  (${(markup.length / 1024).toFixed(1)} kB)`);
}

console.log(`Pre-renderizadas ${pages.length} páginas.`);
