/**
 * elioxy links — Cloudflare Worker
 *
 * Serves the API, the GitHub OAuth flow and the short-link redirects.
 * Static files are served from the ASSETS binding (Vite build).
 * No runtime dependencies: Web Crypto + D1 only.
 */

const SESSION_COOKIE = "elioxy_session";
const STATE_COOKIE = "elioxy_oauth_state";
const OWNER_COOKIE = "elioxy_owner";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
const OWNER_TTL_SECONDS = 60 * 60 * 24 * 365;
const ANON_LIMIT_PER_HOUR = 20;

const RESERVED = new Set([
  "api",
  "auth",
  "assets",
  "panel",
  "login",
  "signin",
  "health",
  "qr",
  "privacidad",
  "terminos",
  "docs",
  "favicon.ico",
  "favicon.svg",
  "robots.txt",
  "ads.txt",
  "sitemap.xml",
  "index.html",
  "_headers",
  "_routes.json",
]);

const SLUG_RE = /^[a-zA-Z0-9_-]{2,32}$/;
const SLUG_ALPHABET = "23456789abcdefghijkmnpqrstuvwxyz";
const HISTORY_RANGES = [7, 30, 90];
const SPARKLINE_DAYS = 14;
const VISITOR_RETENTION_DAYS = 100;

// Link previews and crawlers open short links without a human behind them.
const CRAWLER_UA =
  /(?:bot|spider|crawler|crawling|slurp|facebookexternalhit|whatsapp|telegram|slack|discord|linkedin|twitterbot|pinterest|skype|viber|embedly|redditbot|applebot|google-pagespeed|lighthouse|headlesschrome|phantomjs|pingdom|uptime|semrush|ahrefs|petalbot|mj12|yandex|baidu|duckduckbot|curl\/|wget\/|python-requests|python-urllib|axios\/|node-fetch|okhttp|go-http-client|postmanruntime|insomnia|libwww|httpclient)/i;

const anonHits = new Map();
const hmacKeys = new Map();
let schemaPromise = null;

/* ------------------------------------------------------------------ helpers */

const encoder = new TextEncoder();

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...extraHeaders,
    },
  });
}

function fail(code, status = 400) {
  return json({ error: code }, status);
}

function b64urlEncodeBytes(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function b64urlEncodeString(value) {
  return b64urlEncodeBytes(encoder.encode(value));
}

function b64urlDecode(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index < 0) continue;
    const key = part.slice(0, index).trim();
    if (!key) continue;
    const raw = part.slice(index + 1).trim();
    try {
      out[key] = decodeURIComponent(raw);
    } catch {
      out[key] = raw;
    }
  }
  return out;
}

function randomString(length = 24) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let out = "";
  for (const byte of bytes) out += SLUG_ALPHABET[byte % SLUG_ALPHABET.length];
  return out;
}

function randomSlug() {
  return randomString(7);
}

function utcDay(timestamp = Date.now()) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function isPreviewOrBot(request) {
  const headers = request.headers;
  const purpose = headers.get("Sec-Purpose") || headers.get("Purpose") || headers.get("X-Purpose");
  if (purpose && /prefetch|preview|prerender/i.test(purpose)) return true;

  const ua = headers.get("User-Agent");
  if (!ua) return true;
  if (CRAWLER_UA.test(ua)) return true;

  // Real navigations send document/navigate and accept HTML; fetches and previews do not.
  const destination = headers.get("Sec-Fetch-Dest");
  if (destination && destination !== "document") return true;
  const mode = headers.get("Sec-Fetch-Mode");
  if (mode && mode !== "navigate") return true;

  const accept = headers.get("Accept");
  if (accept && !accept.includes("text/html") && !accept.includes("*/*")) return true;
  return false;
}

/** Daily, salted hash of IP + user-agent: no cookie, and it cannot be joined across days. */
async function visitorHash(request, day) {
  const ip =
    (request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For") || "0.0.0.0")
      .split(",")[0]
      .trim() || "0.0.0.0";
  const ua = request.headers.get("User-Agent") || "";
  return sha256Hex(`elioxy-clicks|${day}|${ip}|${ua}`);
}

async function recordClick(env, linkId, request) {
  const day = utcDay();
  const hash = await visitorHash(request, day);
  const inserted = await env.DB.prepare(
    "INSERT OR IGNORE INTO link_visitors (link_id, day, visitor_hash, created_at) VALUES (?, ?, ?, ?)"
  )
    .bind(linkId, day, hash, Date.now())
    .run();
  const unique = Number(inserted?.meta?.changes || 0) > 0 ? 1 : 0;

  await env.DB.batch([
    env.DB.prepare(
      "UPDATE links SET clicks = clicks + 1, unique_clicks = unique_clicks + ?, last_clicked_at = ? WHERE id = ?"
    ).bind(unique, Date.now(), linkId),
    env.DB.prepare(
      `INSERT INTO click_days (link_id, day, clicks) VALUES (?, ?, 1)
       ON CONFLICT(link_id, day) DO UPDATE SET clicks = clicks + 1`
    ).bind(linkId, day),
  ]);
}

function sameOrigin(request, url) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === url.host;
  } catch {
    return false;
  }
}

async function sha256Hex(value) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function ownerCookie(token, url) {
  const secure = url.protocol === "https:" ? "; Secure" : "";
  return `${OWNER_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${OWNER_TTL_SECONDS}${secure}`;
}

async function ownerHashFromRequest(request) {
  const token = parseCookies(request.headers.get("Cookie"))[OWNER_COOKIE];
  return token ? sha256Hex(token) : null;
}

function canManage(row, session, ownerHash) {
  if (session && row.user_id && row.user_id === session.sub) return true;
  if (!row.user_id && ownerHash && row.owner_token_hash === ownerHash) return true;
  return false;
}

async function findManagedLink(env, request, id) {
  const row = await env.DB.prepare(
    `SELECT id, user_id, slug, target, clicks, unique_clicks, created_at, last_clicked_at, active, expires_at, owner_token_hash
     FROM links WHERE id = ?`
  )
    .bind(id)
    .first();
  if (!row) return null;
  const session = await readSession(request, env);
  const ownerHash = session ? null : await ownerHashFromRequest(request);
  if (!canManage(row, session, ownerHash)) return null;
  return row;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
  });
}

function statusPage({ status, kind, slug }, nonce) {
  const safeSlug = escapeHtml(slug || "");
  const date = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  const copy = {
    missing: {
      code: "404",
      title: "Este enlace no existe",
      text: "No hay ningún enlace corto con ese final. Puede que lo hayas escrito mal o que ya se haya borrado.",
      action: `<a class="btn" href="/?slug=${encodeURIComponent(slug || "")}">Crear /${safeSlug}</a>`,
    },
    disabled: {
      code: "410",
      title: "Enlace desactivado",
      text: "El dueño de este enlace lo ha pausado. Vuelve a intentarlo más adelante.",
      action: `<a class="btn" href="/">Ir al acortador</a>`,
    },
    expired: {
      code: "410",
      title: "Enlace caducado",
      text: "Este enlace tenía fecha de caducidad y ya no redirige a ninguna parte.",
      action: `<a class="btn" href="/">Crear uno nuevo</a>`,
    },
  }[kind] || null;

  if (!copy) return fail("not_found", 404);

  const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${copy.code} · ${escapeHtml(copy.title)} | elioxy links</title>
<meta name="robots" content="noindex">
<script src="/theme-boot.js" nonce="${nonce}"></script>
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="stylesheet" href="/status.css">
</head>
<body><div class="wrap">
<a class="brand" href="/"><span class="mark"><svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><rect x="2" y="2" width="8" height="8"/><rect x="14" y="2" width="8" height="8"/><rect x="2" y="14" width="8" height="8"/><rect x="14" y="14" width="4" height="4"/><rect x="18" y="18" width="4" height="4"/></svg></span>elioxy <span class="brand-sub">/ links</span></a>
<p class="code">${copy.code}</p>
<h1>${escapeHtml(copy.title)}</h1>
<p>${escapeHtml(copy.text)}</p>
<p><span class="slug">url/${safeSlug}</span></p>
${copy.action}<a class="home" href="/">Volver al inicio</a>
<hr><p class="foot">url.elioxy.us.ci · enlaces cortos con QR</p>
</div></body></html>`;

  return new Response(html, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex",
    },
  });
}

/* --------------------------------------------------------------- D1 schema */

async function migrateSchema(env) {
  const { results } = await env.DB.prepare("PRAGMA table_info(links)").all();
  const columns = new Set((results || []).map((row) => row.name));
  const statements = [];
  if (!columns.has("active")) {
    statements.push(env.DB.prepare("ALTER TABLE links ADD COLUMN active INTEGER NOT NULL DEFAULT 1"));
  }
  if (!columns.has("expires_at")) {
    statements.push(env.DB.prepare("ALTER TABLE links ADD COLUMN expires_at INTEGER"));
  }
  if (!columns.has("owner_token_hash")) {
    statements.push(env.DB.prepare("ALTER TABLE links ADD COLUMN owner_token_hash TEXT"));
  }
  if (!columns.has("unique_clicks")) {
    statements.push(env.DB.prepare("ALTER TABLE links ADD COLUMN unique_clicks INTEGER NOT NULL DEFAULT 0"));
  }
  if (statements.length) await env.DB.batch(statements);
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_links_owner ON links(owner_token_hash)").run();
  await env.DB.prepare("DELETE FROM link_visitors WHERE day < ?")
    .bind(utcDay(Date.now() - VISITOR_RETENTION_DAYS * 24 * 60 * 60 * 1000))
    .run();
}

function ensureSchema(env) {
  if (!env.DB) return Promise.resolve(false);
  if (!schemaPromise) {
    schemaPromise = env.DB.batch([
      env.DB.prepare(
        `CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          login TEXT NOT NULL,
          name TEXT,
          avatar_url TEXT,
          created_at INTEGER NOT NULL
        )`
      ),
      env.DB.prepare(
        `CREATE TABLE IF NOT EXISTS links (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          slug TEXT NOT NULL UNIQUE,
          target TEXT NOT NULL,
          clicks INTEGER NOT NULL DEFAULT 0,
          unique_clicks INTEGER NOT NULL DEFAULT 0,
          created_at INTEGER NOT NULL,
          last_clicked_at INTEGER
        )`
      ),
      env.DB.prepare(
        `CREATE TABLE IF NOT EXISTS link_visitors (
          link_id TEXT NOT NULL,
          day TEXT NOT NULL,
          visitor_hash TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          PRIMARY KEY (link_id, day, visitor_hash)
        )`
      ),
      env.DB.prepare(
        `CREATE INDEX IF NOT EXISTS idx_visitors_day ON link_visitors(day)`
      ),
      env.DB.prepare(
        `CREATE TABLE IF NOT EXISTS click_days (
          link_id TEXT NOT NULL,
          day TEXT NOT NULL,
          clicks INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (link_id, day)
        )`
      ),
      env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_links_user ON links(user_id, created_at DESC)`),
    ])
      .then(() => migrateSchema(env))
      .then(() => true)
      .catch((error) => {
        schemaPromise = null;
        throw error;
      });
  }
  return schemaPromise;
}

/* ---------------------------------------------------------------- sessions */

async function keyFor(secret) {
  const cached = hmacKeys.get(secret);
  if (cached) return cached;
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
  hmacKeys.set(secret, key);
  return key;
}

function sessionSecret(env) {
  return env.SESSION_SECRET || env.GITHUB_CLIENT_SECRET || null;
}

async function createSessionToken(payload, secret) {
  const body = b64urlEncodeString(JSON.stringify(payload));
  const signature = await crypto.subtle.sign("HMAC", await keyFor(secret), encoder.encode(body));
  return `${body}.${b64urlEncodeBytes(new Uint8Array(signature))}`;
}

async function readSession(request, env) {
  const secret = sessionSecret(env);
  if (!secret) return null;
  const raw = parseCookies(request.headers.get("Cookie"))[SESSION_COOKIE];
  if (!raw || !raw.includes(".")) return null;
  const [body, signature] = raw.split(".");
  if (!body || !signature) return null;
  try {
    const valid = await crypto.subtle.verify("HMAC", await keyFor(secret), b64urlDecode(signature), encoder.encode(body));
    if (!valid) return null;
    const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(body)));
    if (!payload || typeof payload.sub !== "string") return null;
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function sessionCookie(token, url, maxAge = SESSION_TTL_SECONDS) {
  const secure = url.protocol === "https:" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

function clearCookie(name, url) {
  const secure = url.protocol === "https:" ? "; Secure" : "";
  return `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

function publicUser(session) {
  if (!session) return null;
  return {
    id: session.sub,
    login: session.login || "",
    name: session.name || session.login || "",
    avatar: session.avatar || "",
  };
}

/* ------------------------------------------------------------------- links */

function normalizeTarget(raw) {
  if (typeof raw !== "string") return null;
  let value = raw.trim();
  if (!value || value.length > 2048) return null;
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value)) value = `https://${value}`;
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    return null;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
  if (!parsed.hostname || (!parsed.hostname.includes(".") && parsed.hostname !== "localhost")) return null;
  return parsed.toString();
}

function normalizeSlug(raw) {
  if (raw === undefined || raw === null || raw === "") return "";
  if (typeof raw !== "string") return null;
  const slug = raw.trim().toLowerCase().replace(/^\/+|\/+$/g, "");
  if (!slug) return "";
  if (!SLUG_RE.test(slug)) return null;
  if (RESERVED.has(slug)) return null;
  return slug;
}

function rateLimited(request) {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const now = Date.now();
  if (anonHits.size > 4000) anonHits.clear();
  const entry = anonHits.get(ip);
  if (!entry || entry.reset < now) {
    anonHits.set(ip, { count: 1, reset: now + 60 * 60 * 1000 });
    return false;
  }
  if (entry.count >= ANON_LIMIT_PER_HOUR) return true;
  entry.count += 1;
  return false;
}

function serializeLink(row, baseUrl) {
  return {
    id: row.id,
    slug: row.slug,
    target: row.target,
    clicks: row.clicks,
    uniqueClicks: Number(row.unique_clicks || 0),
    createdAt: row.created_at,
    lastClickedAt: row.last_clicked_at || null,
    shortUrl: `${baseUrl}/${row.slug}`,
    active: row.active === undefined || row.active === null ? true : Number(row.active) !== 0,
    expiresAt: row.expires_at || null,
  };
}

function parseExpiry(raw) {
  if (raw === null || raw === undefined || raw === "") return { ok: true, value: null };
  if (raw === "never") return { ok: true, value: null };
  let timestamp = NaN;
  if (typeof raw === "number") timestamp = raw;
  else if (typeof raw === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [year, month, day] = raw.split("-").map(Number);
    timestamp = Date.UTC(year, month - 1, day, 23, 59, 59, 999);
  }
  if (!Number.isFinite(timestamp) || timestamp < Date.UTC(2000, 0, 1)) return { ok: false, value: null };
  return { ok: true, value: timestamp };
}

async function createUniqueSlug(env) {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const slug = randomSlug();
    const existing = await env.DB.prepare("SELECT 1 AS found FROM links WHERE slug = ?").bind(slug).first();
    if (!existing) return slug;
  }
  return `${randomSlug()}${randomString(3)}`;
}

/* ---------------------------------------------------------------------- QR */

// Minimal QR endpoint is not required (the client renders QR codes), but a
// HEAD-friendly alias keeps shared links stable if a slug is "qr".
function redirectTo(location) {
  return new Response(null, { status: 302, headers: { location, "cache-control": "no-store" } });
}

/* ------------------------------------------------------- social preview */

const OG_IMAGE_PATH = "/og.png";

/* ---------------------------------------------------------------- adsense */

// AdSense stopped accepting subdomains as sites in 2023: the account entry is
// the registrable domain (elioxy.us.ci) and the ads run on this subdomain.
// Nothing is served until ADSENSE_CLIENT holds the publisher ID.
function adsenseClient(env) {
  const match = /^(?:ca-)?(pub-\d{10,20})$/.exec(String(env.ADSENSE_CLIENT || "").trim());
  return match ? `ca-${match[1]}` : null;
}

// Los anuncios van solo en la portada: /panel es una pantalla de login sin
// sesión y /privacidad, /terminos y /qr no son contenido que Google permita
// monetizar.
function adsEligible(url) {
  return (url.pathname.replace(/\/+$/, "") || "/") === "/";
}

function adsenseHead(client, nonce) {
  return (
    `<meta name="google-adsense-account" content="${client}">\n` +
    `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}" crossorigin="anonymous" nonce="${nonce}"></script>\n`
  );
}

/* -------------------------------------------------------- security headers */

// Google only supports a nonce-based strict CSP for AdSense, because the ad
// code loads scripts from origins that change over time. Only the directives
// that 'strict-dynamic' does not cover (images, fetches, frames) need origins.
const ADSENSE_ORIGINS = [
  "https://*.googlesyndication.com",
  "https://*.doubleclick.net",
  "https://*.google.com",
  "https://*.gstatic.com",
  "https://*.adtrafficquality.google",
];

function newNonce() {
  return b64urlEncodeBytes(crypto.getRandomValues(new Uint8Array(16)));
}

function contentSecurityPolicy(nonce, client) {
  const ads = client ? ADSENSE_ORIGINS : [];
  const directives = [
    "default-src 'self'",
    // The nonce makes 'unsafe-inline' and every host allowlist in script-src
    // moot, and 'strict-dynamic' trusts whatever the nonced ad code injects.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${client ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    ["img-src 'self' data:", ...ads].join(" "),
    "font-src 'self'",
    ["connect-src 'self'", ...ads].join(" "),
    ...(client ? [["frame-src", ...ads].join(" ")] : []),
    "object-src 'none'",
    "base-uri 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
  ];
  return directives.join("; ");
}

function withSecurityHeaders(response, nonce, client) {
  const type = response.headers.get("content-type") || "";
  if (!type.includes("text/html")) return response;
  // A nonce cannot survive revalidation: a 304 reuses the cached body (old
  // nonce) while this header carries a fresh one, and every script is blocked.
  const secured = new Response(response.body, response);
  secured.headers.delete("content-length");
  secured.headers.delete("etag");
  secured.headers.delete("last-modified");
  secured.headers.set("cache-control", "no-store");
  secured.headers.set("content-security-policy", contentSecurityPolicy(nonce, client));
  return secured;
}

function adsTxt(client) {
  return `google.com, ${client.slice(3)}, DIRECT, f08c47fec0942fa0\n`;
}

function rewriteSocialMeta(response, url, client, nonce) {
  if (response.status !== 200) return response;
  const type = response.headers.get("content-type") || "";
  if (!type.includes("text/html")) return response;

  const origin = url.origin;
  const path = url.pathname === "/" ? "/" : url.pathname.replace(/\/+$/, "");
  const page = `${origin}${path}`;
  const image = `${origin}${OG_IMAGE_PATH}`;

  const rewriter = new HTMLRewriter()
    .on("script", {
      element(element) {
        element.setAttribute("nonce", nonce);
      },
    })
    .on('meta[property="og:url"]', {
      element(element) {
        element.setAttribute("content", page);
      },
    })
    .on('meta[property="og:image"]', {
      element(element) {
        element.setAttribute("content", image);
      },
    })
    .on('meta[name="twitter:image"]', {
      element(element) {
        element.setAttribute("content", image);
      },
    })
    .on('link[rel="canonical"]', {
      element(element) {
        element.setAttribute("href", page);
      },
    });

  if (client) {
    rewriter.on("head", {
      element(element) {
        element.append(adsenseHead(client, nonce), { html: true });
      },
    });
  }

  return rewriter.transform(response);
}

async function serveAssets(env, request, url, nonce) {
  const response = await env.ASSETS.fetch(request);
  if (request.method !== "GET") return response;
  return rewriteSocialMeta(response, url, adsEligible(url) ? adsenseClient(env) : null, nonce);
}

/* ------------------------------------------------------------------ routing */

async function avatarProxy(login, headOnly) {
  let upstream;
  try {
    upstream = await fetch(`https://avatars.githubusercontent.com/${login}?size=96`, {
      headers: { accept: "image/*", "user-agent": "elioxy-links" },
      cf: { cacheEverything: true, cacheTtl: 86400 },
    });
  } catch (error) {
    return new Response(null, { status: 502 });
  }

  const type = upstream.headers.get("content-type") || "";
  if (!upstream.ok || !type.startsWith("image/")) return new Response(null, { status: 404 });

  return new Response(headOnly ? null : upstream.body, {
    status: 200,
    headers: {
      "content-type": type,
      "cache-control": "public, max-age=86400",
      "x-robots-tag": "noindex",
    },
  });
}

async function handle(request, env, ctx, nonce) {
  const url = new URL(request.url);
  const { pathname } = url;
  const baseUrl = (env.APP_ORIGIN || url.origin).replace(/\/+$/, "");
  const method = request.method.toUpperCase();

  const avatarMatch = /^\/avatar\/([A-Za-z0-9-]{1,39})$/.exec(pathname);
  if (avatarMatch && (method === "GET" || method === "HEAD")) {
    return avatarProxy(avatarMatch[1], method === "HEAD");
  }

  if (pathname === "/ads.txt" && (method === "GET" || method === "HEAD")) {
    const client = adsenseClient(env);
    if (!client) {
      return new Response(method === "HEAD" ? null : "", {
        status: 404,
        headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
      });
    }
    return new Response(method === "HEAD" ? null : adsTxt(client), {
      status: 200,
      headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" },
    });
  }

  if (pathname === "/api/health") {
    return json({ ok: true, database: Boolean(env.DB) });
  }

  if (pathname === "/api/me" && method === "GET") {
    const session = await readSession(request, env);
    return json({
      user: publicUser(session),
      authReady: Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET),
    });
  }

  if (pathname === "/api/links" && method === "POST") {
    if (!sameOrigin(request, url)) return fail("bad_origin", 403);
    if (!env.DB) return fail("db_unavailable", 503);
    await ensureSchema(env);

    let body;
    try {
      body = await request.json();
    } catch {
      return fail("invalid_body", 400);
    }

    const target = normalizeTarget(body?.target ?? body?.url);
    if (!target) return fail("invalid_url", 400);

    const requestedSlug = normalizeSlug(body?.slug);
    if (requestedSlug === null) return fail("slug_invalid", 400);

    const session = await readSession(request, env);
    if (!session && rateLimited(request)) return fail("rate_limited", 429);

    const cookies = parseCookies(request.headers.get("Cookie"));
    let ownerToken = session ? null : cookies[OWNER_COOKIE] || null;
    let setOwnerCookie = null;
    if (!session && !ownerToken) {
      ownerToken = randomString(32);
      setOwnerCookie = ownerCookie(ownerToken, url);
    }
    const ownerHash = ownerToken ? await sha256Hex(ownerToken) : null;

    let slug = requestedSlug;
    if (slug) {
      const taken = await env.DB.prepare("SELECT 1 AS found FROM links WHERE slug = ?").bind(slug).first();
      if (taken) return fail("slug_taken", 409);
    } else {
      slug = await createUniqueSlug(env);
    }

    const id = crypto.randomUUID();
    const createdAt = Date.now();

    try {
      await env.DB.prepare(
        `INSERT INTO links (id, user_id, slug, target, clicks, created_at, active, expires_at, owner_token_hash)
         VALUES (?, ?, ?, ?, 0, ?, 1, NULL, ?)`
      )
        .bind(id, session ? session.sub : null, slug, target, createdAt, ownerHash)
        .run();
    } catch (error) {
      const message = String(error?.message || error);
      if (/UNIQUE/i.test(message)) return fail("slug_taken", 409);
      throw error;
    }

    const row = { id, slug, target, clicks: 0, created_at: createdAt, last_clicked_at: null };
    return json({ link: serializeLink(row, baseUrl) }, 201, setOwnerCookie ? { "set-cookie": setOwnerCookie } : {});
  }

  if (pathname === "/api/links" && method === "GET") {
    if (!env.DB) return fail("db_unavailable", 503);
    await ensureSchema(env);
    const session = await readSession(request, env);
    const ownerHash = session ? null : await ownerHashFromRequest(request);

    if (!session && !ownerHash) {
      return json({ links: [], totals: { links: 0, clicks: 0, uniqueClicks: 0 }, anonymous: true });
    }

    const scope = session ? "l.user_id = ?" : "l.owner_token_hash = ? AND l.user_id IS NULL";
    const plainScope = session ? "user_id = ?" : "owner_token_hash = ? AND user_id IS NULL";
    const scopeKey = session ? session.sub : ownerHash;

    const { results } = await env.DB.prepare(
      `SELECT id, slug, target, clicks, unique_clicks, created_at, last_clicked_at, active, expires_at, owner_token_hash
       FROM links WHERE ${plainScope} ORDER BY created_at DESC LIMIT 200`
    )
      .bind(scopeKey)
      .all();

    const since = utcDay(Date.now() - (SPARKLINE_DAYS - 1) * 24 * 60 * 60 * 1000);
    const historyResult = await env.DB.prepare(
      `SELECT c.link_id AS link_id, c.day AS day, c.clicks AS clicks
       FROM click_days c JOIN links l ON l.id = c.link_id
       WHERE ${scope} AND c.day >= ?`
    )
      .bind(scopeKey, since)
      .all();

    const historyByLink = new Map();
    for (const entry of historyResult.results || []) {
      const list = historyByLink.get(entry.link_id) || [];
      list.push({ day: entry.day, clicks: Number(entry.clicks) || 0 });
      historyByLink.set(entry.link_id, list);
    }

    const links = (results || []).map((row) => ({
      ...serializeLink(row, baseUrl),
      history: historyByLink.get(row.id) || [],
    }));
    const totals = links.reduce(
      (acc, link) => ({
        links: acc.links + 1,
        clicks: acc.clicks + Number(link.clicks || 0),
        uniqueClicks: acc.uniqueClicks + Number(link.uniqueClicks || 0),
      }),
      { links: 0, clicks: 0, uniqueClicks: 0 }
    );

    return json({ links, totals, anonymous: !session });
  }

  if (pathname.startsWith("/api/links/") && pathname.endsWith("/history") && method === "GET") {
    if (!env.DB) return fail("db_unavailable", 503);
    await ensureSchema(env);

    const id = decodeURIComponent(pathname.slice("/api/links/".length, -"history".length)).replace(/\/+$/, "");
    if (!id || id.length > 80) return fail("not_found", 404);

    const link = await findManagedLink(env, request, id);
    if (!link) return fail("not_found", 404);

    const requested = Number.parseInt(url.searchParams.get("days") || "", 10);
    const days = HISTORY_RANGES.includes(requested) ? requested : 30;

    const since = utcDay(Date.now() - (days - 1) * 24 * 60 * 60 * 1000);
    const { results } = await env.DB.prepare(
      "SELECT day, clicks FROM click_days WHERE link_id = ? AND day >= ? ORDER BY day"
    )
      .bind(id, since)
      .all();

    const { results: uniqueRows } = await env.DB.prepare(
      "SELECT day, COUNT(*) AS uniques FROM link_visitors WHERE link_id = ? AND day >= ? GROUP BY day"
    )
      .bind(id, since)
      .all();
    const uniqueByDay = new Map((uniqueRows || []).map((row) => [row.day, Number(row.uniques) || 0]));

    const series = (results || []).map((row) => ({
      day: row.day,
      clicks: Number(row.clicks) || 0,
      uniques: uniqueByDay.get(row.day) || 0,
    }));
    const total = series.reduce((sum, row) => sum + row.clicks, 0);
    const unique = series.reduce((sum, row) => sum + row.uniques, 0);

    return json({ linkId: id, days, series, total, unique });
  }

  if (pathname.startsWith("/api/links/") && method === "PATCH") {
    if (!sameOrigin(request, url)) return fail("bad_origin", 403);
    if (!env.DB) return fail("db_unavailable", 503);
    await ensureSchema(env);

    const id = decodeURIComponent(pathname.slice("/api/links/".length)).replace(/\/+$/, "");
    if (!id || id.length > 80 || id.includes("/")) return fail("not_found", 404);

    const link = await findManagedLink(env, request, id);
    if (!link) return fail("not_found", 404);

    let body;
    try {
      body = await request.json();
    } catch {
      return fail("invalid_body", 400);
    }

    const fields = [];
    const values = [];

    if (body && "target" in body) {
      const target = normalizeTarget(body.target);
      if (!target) return fail("invalid_url", 400);
      fields.push("target = ?");
      values.push(target);
    }

    if (body && "slug" in body) {
      const slug = normalizeSlug(body.slug);
      if (!slug) return fail("slug_invalid", 400);
      if (slug !== link.slug) {
        const taken = await env.DB.prepare("SELECT 1 AS found FROM links WHERE slug = ?").bind(slug).first();
        if (taken) return fail("slug_taken", 409);
      }
      fields.push("slug = ?");
      values.push(slug);
    }

    if (body && "active" in body) {
      fields.push("active = ?");
      values.push(body.active ? 1 : 0);
    }

    if (body && "expiresAt" in body) {
      const expiry = parseExpiry(body.expiresAt);
      if (!expiry.ok) return fail("invalid_expiry", 400);
      fields.push("expires_at = ?");
      values.push(expiry.value);
    }

    if (!fields.length) return fail("invalid_body", 400);

    values.push(id);
    await env.DB.prepare(`UPDATE links SET ${fields.join(", ")} WHERE id = ?`)
      .bind(...values)
      .run();

    const updated = await env.DB.prepare(
      `SELECT id, slug, target, clicks, unique_clicks, created_at, last_clicked_at, active, expires_at FROM links WHERE id = ?`
    )
      .bind(id)
      .first();

    return json({ link: serializeLink(updated, baseUrl) });
  }

  if (pathname.startsWith("/api/links/") && method === "DELETE") {
    if (!sameOrigin(request, url)) return fail("bad_origin", 403);
    if (!env.DB) return fail("db_unavailable", 503);
    await ensureSchema(env);

    const id = decodeURIComponent(pathname.slice("/api/links/".length)).replace(/\/+$/, "");
    if (!id || id.length > 80 || id.includes("/")) return fail("not_found", 404);

    const link = await findManagedLink(env, request, id);
    if (!link) return fail("not_found", 404);

    await env.DB.batch([
      env.DB.prepare("DELETE FROM click_days WHERE link_id = ?").bind(id),
      env.DB.prepare("DELETE FROM link_visitors WHERE link_id = ?").bind(id),
      env.DB.prepare("DELETE FROM links WHERE id = ?").bind(id),
    ]);

    return json({ ok: true });
  }

  if (pathname === "/auth/github" && method === "GET") {
    if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) return redirectTo("/panel?auth=unconfigured");
    const state = randomString(32);
    const authorize = new URL("https://github.com/login/oauth/authorize");
    authorize.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
    authorize.searchParams.set("redirect_uri", `${baseUrl}/auth/github/callback`);
    authorize.searchParams.set("scope", "read:user");
    authorize.searchParams.set("state", state);
    authorize.searchParams.set("allow_signup", "true");

    const secure = url.protocol === "https:" ? "; Secure" : "";
    return new Response(null, {
      status: 302,
      headers: {
        location: authorize.toString(),
        "set-cookie": `${STATE_COOKIE}=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600${secure}`,
        "cache-control": "no-store",
      },
    });
  }

  if (pathname === "/auth/github/callback" && method === "GET") {
    if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) return redirectTo("/panel?auth=unconfigured");
    if (!env.DB) return redirectTo("/panel?auth=db");

    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const cookies = parseCookies(request.headers.get("Cookie"));
    if (!code || !state || cookies[STATE_COOKIE] !== state) return redirectTo("/panel?auth=state");

    let accessToken = null;
    try {
      const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/x-www-form-urlencoded",
          "user-agent": "elioxy-links",
        },
        body: new URLSearchParams({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: `${baseUrl}/auth/github/callback`,
        }).toString(),
      });
      const tokenData = await tokenResponse.json();
      accessToken = tokenData?.access_token || null;
    } catch (error) {
      console.error("github token exchange failed", error);
      return redirectTo("/panel?auth=exchange");
    }
    if (!accessToken) return redirectTo("/panel?auth=denied");

    let profile;
    try {
      const profileResponse = await fetch("https://api.github.com/user", {
        headers: {
          accept: "application/vnd.github+json",
          authorization: `Bearer ${accessToken}`,
          "user-agent": "elioxy-links",
        },
      });
      if (!profileResponse.ok) return redirectTo("/panel?auth=profile");
      profile = await profileResponse.json();
    } catch (error) {
      console.error("github profile fetch failed", error);
      return redirectTo("/panel?auth=profile");
    }

    if (!profile?.id) return redirectTo("/panel?auth=profile");

    await ensureSchema(env);
    const userId = String(profile.id);
    const login = String(profile.login || "");
    const name = profile.name ? String(profile.name) : null;
    const avatar = profile.avatar_url ? String(profile.avatar_url) : null;
    const now = Date.now();

    await env.DB.prepare(
      `INSERT INTO users (id, login, name, avatar_url, created_at) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET login = excluded.login, name = excluded.name, avatar_url = excluded.avatar_url`
    )
      .bind(userId, login, name, avatar, now)
      .run();

    const secret = sessionSecret(env);
    if (!secret) return redirectTo("/panel?auth=secret");

    const token = await createSessionToken(
      {
        sub: userId,
        login,
        name: name || login,
        avatar: avatar || "",
        exp: now + SESSION_TTL_SECONDS * 1000,
      },
      secret
    );

    const ownerToken = cookies[OWNER_COOKIE];
    const headers = [
      ["location", "/panel"],
      ["set-cookie", sessionCookie(token, url)],
      ["set-cookie", clearCookie(STATE_COOKIE, url)],
      ["cache-control", "no-store"],
    ];

    if (ownerToken) {
      const ownerHash = await sha256Hex(ownerToken);
      await env.DB.prepare(
        "UPDATE links SET user_id = ?, owner_token_hash = NULL WHERE owner_token_hash = ? AND user_id IS NULL"
      )
        .bind(userId, ownerHash)
        .run();
      headers.push(["set-cookie", clearCookie(OWNER_COOKIE, url)]);
    }

    return new Response(null, { status: 302, headers });
  }

  if (pathname === "/auth/logout" && method === "POST") {
    if (!sameOrigin(request, url)) return fail("bad_origin", 403);
    return new Response(null, {
      status: 204,
      headers: { "set-cookie": clearCookie(SESSION_COOKIE, url), "cache-control": "no-store" },
    });
  }

  if (method === "GET" || method === "HEAD") {
    const slugMatch = /^\/([a-zA-Z0-9_-]{2,32})\/?$/.exec(pathname);
    if (slugMatch && !RESERVED.has(slugMatch[1].toLowerCase())) {
      const slug = slugMatch[1];
      if (!env.DB) return serveAssets(env, request, url, nonce);
      await ensureSchema(env);

      const row = await env.DB.prepare("SELECT id, target, active, expires_at FROM links WHERE slug = ?")
        .bind(slug)
        .first();

      if (!row) return statusPage({ status: 404, kind: "missing", slug }, nonce);
      if (Number(row.active) === 0) return statusPage({ status: 410, kind: "disabled", slug }, nonce);
      if (row.expires_at && Date.now() > Number(row.expires_at)) {
        return statusPage({ status: 410, kind: "expired", slug }, nonce);
      }

      if (method === "GET" && !isPreviewOrBot(request)) {
        ctx.waitUntil(recordClick(env, row.id, request).catch((error) => console.error("click counter failed", error)));
      }

      return new Response(null, {
        status: 302,
        headers: {
          location: row.target,
          "cache-control": "no-store",
          "x-robots-tag": "noindex",
        },
      });
    }

    const isFile = /\.[a-zA-Z0-9]+$/.test(pathname);
    const isSpaRoute =
      pathname === "/" || ["/panel", "/qr", "/privacidad", "/terminos"].includes(pathname.replace(/\/+$/, ""));
    if (!isFile && !isSpaRoute && !pathname.startsWith("/api/") && !pathname.startsWith("/auth/")) {
      const attempted = decodeURIComponent(pathname).replace(/^\/+|\/+$/g, "").slice(0, 60);
      return statusPage({ status: 404, kind: "missing", slug: attempted }, nonce);
    }
  }

  if (pathname.startsWith("/api/") || pathname.startsWith("/auth/")) {
    return fail("not_found", 404);
  }

  return serveAssets(env, request, url, nonce);
}

export default {
  async fetch(request, env, ctx) {
    try {
      const nonce = newNonce();
      const response = await handle(request, env, ctx, nonce);
      return withSecurityHeaders(response, nonce, adsenseClient(env));
    } catch (error) {
      console.error("unhandled worker error", error);
      return json({ error: "internal_error" }, 500);
    }
  },
};
