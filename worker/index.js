/**
 * elioxy links — Cloudflare Worker
 *
 * Serves the API, the GitHub OAuth flow and the short-link redirects.
 * Static files are served from the ASSETS binding (Vite build).
 * No runtime dependencies: Web Crypto + D1 only.
 */

const SESSION_COOKIE = "elioxy_session";
const STATE_COOKIE = "elioxy_oauth_state";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
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
  "docs",
  "favicon.ico",
  "favicon.svg",
  "robots.txt",
  "sitemap.xml",
  "index.html",
  "_headers",
  "_routes.json",
]);

const SLUG_RE = /^[a-zA-Z0-9_-]{2,32}$/;
const SLUG_ALPHABET = "23456789abcdefghijkmnpqrstuvwxyz";
const HISTORY_RANGES = [7, 30, 90];
const SPARKLINE_DAYS = 14;

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

function sameOrigin(request, url) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === url.host;
  } catch {
    return false;
  }
}

/* --------------------------------------------------------------- D1 schema */

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
          created_at INTEGER NOT NULL,
          last_clicked_at INTEGER
        )`
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
    createdAt: row.created_at,
    lastClickedAt: row.last_clicked_at || null,
    shortUrl: `${baseUrl}/${row.slug}`,
  };
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

/* ------------------------------------------------------------------ routing */

async function handle(request, env, ctx) {
  const url = new URL(request.url);
  const { pathname } = url;
  const baseUrl = (env.APP_ORIGIN || url.origin).replace(/\/+$/, "");
  const method = request.method.toUpperCase();

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
        "INSERT INTO links (id, user_id, slug, target, clicks, created_at) VALUES (?, ?, ?, ?, 0, ?)"
      )
        .bind(id, session ? session.sub : null, slug, target, createdAt)
        .run();
    } catch (error) {
      const message = String(error?.message || error);
      if (/UNIQUE/i.test(message)) return fail("slug_taken", 409);
      throw error;
    }

    const row = { id, slug, target, clicks: 0, created_at: createdAt, last_clicked_at: null };
    return json({ link: serializeLink(row, baseUrl) }, 201);
  }

  if (pathname === "/api/links" && method === "GET") {
    if (!env.DB) return fail("db_unavailable", 503);
    await ensureSchema(env);
    const session = await readSession(request, env);
    if (!session) return fail("unauthorized", 401);

    const { results } = await env.DB.prepare(
      "SELECT id, slug, target, clicks, created_at, last_clicked_at FROM links WHERE user_id = ? ORDER BY created_at DESC LIMIT 200"
    )
      .bind(session.sub)
      .all();

    const since = utcDay(Date.now() - (SPARKLINE_DAYS - 1) * 24 * 60 * 60 * 1000);
    const historyResult = await env.DB.prepare(
      `SELECT c.link_id AS link_id, c.day AS day, c.clicks AS clicks
       FROM click_days c JOIN links l ON l.id = c.link_id
       WHERE l.user_id = ? AND c.day >= ?`
    )
      .bind(session.sub, since)
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
      (acc, link) => ({ links: acc.links + 1, clicks: acc.clicks + Number(link.clicks || 0) }),
      { links: 0, clicks: 0 }
    );

    return json({ links, totals });
  }

  if (pathname.startsWith("/api/links/") && pathname.endsWith("/history") && method === "GET") {
    if (!env.DB) return fail("db_unavailable", 503);
    await ensureSchema(env);
    const session = await readSession(request, env);
    if (!session) return fail("unauthorized", 401);

    const id = decodeURIComponent(pathname.slice("/api/links/".length, -"history".length)).replace(/\/+$/, "");
    if (!id || id.length > 80) return fail("not_found", 404);

    const requested = Number.parseInt(url.searchParams.get("days") || "", 10);
    const days = HISTORY_RANGES.includes(requested) ? requested : 30;

    const link = await env.DB.prepare("SELECT id FROM links WHERE id = ? AND user_id = ?")
      .bind(id, session.sub)
      .first();
    if (!link) return fail("not_found", 404);

    const since = utcDay(Date.now() - (days - 1) * 24 * 60 * 60 * 1000);
    const { results } = await env.DB.prepare(
      "SELECT day, clicks FROM click_days WHERE link_id = ? AND day >= ? ORDER BY day"
    )
      .bind(id, since)
      .all();

    const series = (results || []).map((row) => ({ day: row.day, clicks: Number(row.clicks) || 0 }));
    const total = series.reduce((sum, row) => sum + row.clicks, 0);

    return json({ linkId: id, days, series, total });
  }

  if (pathname.startsWith("/api/links/") && method === "DELETE") {
    if (!sameOrigin(request, url)) return fail("bad_origin", 403);
    if (!env.DB) return fail("db_unavailable", 503);
    await ensureSchema(env);
    const session = await readSession(request, env);
    if (!session) return fail("unauthorized", 401);

    const id = decodeURIComponent(pathname.slice("/api/links/".length));
    if (!id || id.length > 80) return fail("not_found", 404);

    const result = await env.DB.prepare("DELETE FROM links WHERE id = ? AND user_id = ?").bind(id, session.sub).run();
    if (!result.meta || result.meta.changes === 0) return fail("not_found", 404);
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

    return new Response(null, {
      status: 302,
      headers: [
        ["location", "/panel"],
        ["set-cookie", sessionCookie(token, url)],
        ["set-cookie", clearCookie(STATE_COOKIE, url)],
        ["cache-control", "no-store"],
      ],
    });
  }

  if (pathname === "/auth/logout" && method === "POST") {
    if (!sameOrigin(request, url)) return fail("bad_origin", 403);
    return new Response(null, {
      status: 204,
      headers: { "set-cookie": clearCookie(SESSION_COOKIE, url), "cache-control": "no-store" },
    });
  }

  if ((method === "GET" || method === "HEAD") && /^\/[a-zA-Z0-9_-]{2,32}\/?$/.test(pathname)) {
    const slug = pathname.slice(1).replace(/\/$/, "");
    if (!RESERVED.has(slug.toLowerCase())) {
      if (!env.DB) return env.ASSETS.fetch(request);
      await ensureSchema(env);
      const row = await env.DB.prepare("SELECT id, target FROM links WHERE slug = ?").bind(slug).first();
      if (row) {
        const clickedAt = Date.now();
        ctx.waitUntil(
          env.DB.batch([
            env.DB.prepare("UPDATE links SET clicks = clicks + 1, last_clicked_at = ? WHERE id = ?").bind(
              clickedAt,
              row.id
            ),
            env.DB.prepare(
              `INSERT INTO click_days (link_id, day, clicks) VALUES (?, ?, 1)
               ON CONFLICT(link_id, day) DO UPDATE SET clicks = clicks + 1`
            ).bind(row.id, utcDay(clickedAt)),
          ]).catch((error) => console.error("click counter failed", error))
        );
        return new Response(null, {
          status: 302,
          headers: {
            location: row.target,
            "cache-control": "no-store",
            "x-robots-tag": "noindex",
          },
        });
      }
    }
  }

  if (pathname.startsWith("/api/") || pathname.startsWith("/auth/")) {
    return fail("not_found", 404);
  }

  return env.ASSETS.fetch(request);
}

export default {
  async fetch(request, env, ctx) {
    try {
      return await handle(request, env, ctx);
    } catch (error) {
      console.error("unhandled worker error", error);
      return json({ error: "internal_error" }, 500);
    }
  },
};
