# elioxy links

Acortador de enlaces con **código QR** y **panel privado**, con acceso mediante **GitHub**.
Pensado para publicarse en `url.elioxy.us.ci`.

- Enlaces cortos con slug propio (`url.elioxy.us.ci/mi-marca`) o aleatorio.
- QR generado en el navegador y descargable en PNG (1024 px) y SVG.
- Panel con tus enlaces: copiar, abrir, QR, editar, borrar, clics totales e histórico diario.
- Histórico de clics por enlace: sparkline de 14 días en cada fila y gráfico con selector de 7, 30 o 90 días en un modal.
- Edición del destino y del slug, pausa sin perder clics y fecha de caducidad.
- Etiqueta imprimible en SVG a tamaño real (40, 60 o 100 mm), con marcas de corte y QR vectorial. Si el
  enlace tiene fecha de caducidad, la etiqueta imprime debajo «Válido hasta …» para carteles temporales.
- Generador de QR independiente en `/qr`: enlace, red WiFi, texto libre y contacto (vCard), con PNG, SVG y etiqueta.
- Compartir con la hoja nativa del sistema (`navigator.share`) y copia al portapapeles como respaldo; también
  se puede copiar el QR como imagen PNG.
- Enlaces sin cuenta: se gestionan en el mismo navegador y pasan a la cuenta al entrar con GitHub.
- Páginas propias de 404 y 410 para enlaces inexistentes, pausados o caducados.
- Imagen de previsualización para redes (`/og.png`) y metadatos Open Graph. `og:url`, `og:image`,
  `twitter:image` y el canonical se reescriben en el Worker con el host real de cada petición,
  así que preview y dominio propio comparten las mismas etiquetas sin tocar el build.
- Login con GitHub (OAuth Authorization Code) y sesión en cookie firmada.
- Worker sin dependencias: Web Crypto y D1, sin frameworks de servidor.

## Stack

| Pieza | Tecnología |
| --- | --- |
| Frontend | Vite + React 19, CSS propio (sin framework de UI) |
| QR | [`qrcode`](https://www.npmjs.com/package/qrcode) en el cliente |
| Backend | Cloudflare Worker (`worker/index.js`), sin dependencias |
| Datos | Cloudflare D1 (SQLite) |
| Sesión | Cookie HttpOnly firmada con HMAC-SHA256 |

## Estructura

```
worker/index.js          API, OAuth de GitHub, redirecciones y esquema D1
src/
  components/
    Landing.jsx          portada: hero, funciones, pasos, CTA
    Shortener.jsx        formulario de acortado y panel de resultado con QR
    Dashboard.jsx        panel: métricas, alta de enlaces y lista
    History.jsx          sparkline, gráfico e histórico por enlace
    QrStudio.jsx         generador de QR (enlace, WiFi, texto, contacto)
    Qr.jsx               render de QR, descargas PNG/SVG, etiqueta y copia de imagen
    ui.jsx               iconos, marca, navegación, botón de copiar, fechas
  api.js                 cliente HTTP y mensajes de error en español
  router.js              navegación SPA mínima
  styles.css             sistema de diseño y responsive
deploy.json              manifiesto de despliegue (Worker + assets + SPA)
wrangler.jsonc           configuración para desarrollo local con Wrangler
```

## Requisitos

- Node.js 20.19+ o 22.12+ (Vite 7).
- Una cuenta de Cloudflare con D1, o un proyecto de Freebuff Sites.
- Una OAuth App de GitHub (solo para el login).

## Puesta en marcha

```bash
npm ci            # instala desde el lockfile (o npm install)
npm run build     # compila el frontend en dist/
npm run preview   # Worker + assets en http://localhost:8787
```

La primera petición crea el esquema de D1 en local de forma idempotente, así que no hay
que ejecutar migraciones. Los datos locales viven en `.wrangler/state`.

### Desarrollo con recarga

En una terminal, el Worker; en otra, Vite con HMR:

```bash
npx wrangler dev --port 8787
npm run dev        # http://localhost:5173, con proxy de /api y /auth al 8787
```

El `redirect_uri` de OAuth se calcula desde el origen de la petición. Si pruebas el login
por el servidor de Vite, GitHub debe tener registrada esa callback
(`http://localhost:5173/auth/github/callback`). Para probar el acceso lo más simple es
entrar por `http://localhost:8787`, con el Worker sirviendo el build.

### Probar el login en local

Crea un archivo `.dev.vars` (ignorado por Git, nunca lo subas):

```ini
GITHUB_CLIENT_ID=tu_client_id
GITHUB_CLIENT_SECRET=tu_client_secret
# SESSION_SECRET=una_cadena_larga_y_aleatoria
```

Y añade a la OAuth App la callback `http://localhost:8787/auth/github/callback`.
GitHub admite **una sola** callback URL por OAuth App: si pruebas en dos orígenes, tendrás
que ir cambiándola.

## OAuth de GitHub

1. Entra en **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**.
2. Rellena:
   - **Application name**: `elioxy links`
   - **Homepage URL**: `https://url.elioxy.us.ci`
   - **Authorization callback URL**: `https://url.elioxy.us.ci/auth/github/callback`
3. Pulsa **Register application**, copia el **Client ID** y genera un **Client secret**.
4. Guarda ambos como secretos en el destino de despliegue (siguiente apartado).

El scope que se pide es `read:user`: solo se leen el id, el login, el nombre y el avatar
públicos. No se pide acceso a repositorios ni al email.

`GET /api/me` devuelve `authReady: false` mientras falten las credenciales; en ese estado el
acortador y los QR funcionan y el panel solo muestra el aviso de configuración.

## Secretos y variables

| Variable | Obligatoria | Para qué |
| --- | --- | --- |
| `GITHUB_CLIENT_ID` | Sí | Identificador de la OAuth App |
| `GITHUB_CLIENT_SECRET` | Sí | Secreto de la OAuth App; también firma la sesión si no hay `SESSION_SECRET` |
| `SESSION_SECRET` | No | Clave independiente para firmar cookies; recomendable para rotar credenciales sin cerrar sesiones. Si cambia, se invalidan todas las sesiones (la duración de la sesión, 30 días, está fijada en el Worker) |
| `APP_ORIGIN` | No | Fuerza el origen base de los enlaces y del callback, por ejemplo `https://url.elioxy.us.ci` si hay un proxy delante |

No pongas estos valores en el repositorio: no hay ningún `.env` versionado y `.gitignore`
excluye `.dev.vars` y `.env*`.

**En Freebuff Sites**: panel del proyecto → **Secrets**, con los nombres exactos de la tabla.
Los secretos se aplican al Worker desplegado sin volver a compilar.

**En tu propia cuenta de Cloudflare**:

```bash
npx wrangler secret put GITHUB_CLIENT_ID
npx wrangler secret put GITHUB_CLIENT_SECRET
npx wrangler secret put SESSION_SECRET    # opcional
```

## Despliegue

### Freebuff Sites (configuración de este repo)

`deploy.json` describe el paquete: el Worker `worker/index.js` como módulo ES, los assets de
`./dist` y fallback de SPA.

1. `npm run build`.
2. Crea el proyecto de sitio y añade una base de datos D1 con binding **`DB`**.
3. Despliega con el manifiesto `deploy.json` y publica el entorno.
4. Añade el dominio personalizado `url.elioxy.us.ci` en el panel del sitio y crea el registro
   CNAME que indique tu proveedor de DNS. El callback de GitHub debe coincidir con ese dominio.

### Cloudflare con Wrangler

```bash
npx wrangler d1 create elioxy-links
# copia el database_id devuelto en wrangler.jsonc (sustituye el UUID de ejemplo)
npm run build
npx wrangler deploy
```

`wrangler.jsonc` ya declara el binding `DB`, los assets en `./dist` con fallback de SPA y la
fecha de compatibilidad. Para el dominio propio, añade la ruta o el dominio personalizado en
el panel de Cloudflare y ajusta la callback de GitHub.

## Datos

El esquema se crea al vuelo desde `ensureSchema()` con DDL idempotente:

```sql
users      (id, login, name, avatar_url, created_at)   -- id = id de GitHub
links         (id, user_id, slug, target, clicks, unique_clicks, created_at,
               last_clicked_at, active, expires_at, owner_token_hash)
click_days    (link_id, day, clicks)                    -- una fila por enlace y día
link_visitors (link_id, day, visitor_hash, created_at)  -- un visitante único por día
```

`ensureSchema()` crea las tablas con `CREATE TABLE IF NOT EXISTS` y después ejecuta
`migrateSchema()`, que añade con `ALTER TABLE` las columnas que falten (`active`, `expires_at`,
`owner_token_hash`, `unique_clicks`) y su índice. Así una base creada con una versión anterior se actualiza sola
en la primera petición; no hace falta borrar datos.

Notas sobre los clics:

- El total (`links.clicks`), el día (`click_days`) y el visitante único (`link_visitors`) se
  escriben juntos al visitar un enlace.
- Los días se agrupan en **UTC**, no en hora local.
- **No cuentan los bots ni las previsualizaciones.** Se descartan las peticiones con
  `Sec-Purpose`/`Purpose` de `prefetch`, `preview` o `prerender`, las de `Sec-Fetch-Mode`
  distinto de `navigate` o `Sec-Fetch-Dest` distinto de `document`, las que no aceptan
  `text/html`, las que no traen `User-Agent` y los agentes conocidos (WhatsApp,
  `facebookexternalhit`, Slack, Telegram, Discord, LinkedIn, Twitter, Googlebot, Bingbot,
  Applebot, Ahrefs, Semrush, `curl`, `python-requests`, …).
- **Clics únicos**: por cada visita se calcula `SHA-256("elioxy-clicks" | día | IP | User-Agent)`
  con la IP de `CF-Connecting-IP`. Ese hash es la única clave que se guarda (`link_visitors`); no
  hay cookies, no se almacena la IP ni el user-agent, y como el día entra en el hash, los hashes
  de días distintos no se pueden enlazar entre sí. Una visita nueva para ese enlace y día suma en
  `unique_clicks`; repetir en el mismo día no.
- `link_visitors` se poda a 100 días (el histórico visible es de 90 como máximo).
- El histórico y los clics únicos empiezan a registrarse con el despliegue: un enlace con clics
  anteriores puede mostrar un total mayor que la suma del gráfico, y esos clics antiguos no
  tienen reparto de únicos (aparecen con 0).

## API

Todas las respuestas de la API son JSON y `no-store`.

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/health` | Estado del Worker y de la base de datos |
| `GET` | `/api/me` | `{ user, authReady }`; `user` es `null` sin sesión |
| `GET` | `/api/links` | Enlaces propios con `history` (14 días, para el sparkline). Con sesión: los de la cuenta; sin sesión: los del navegador (cookie de propiedad) |
| `GET` | `/api/links/:id/history?days=7\|30\|90` | Serie diaria (`clicks` y `uniques`) del enlace para el rango pedido (30 por defecto), con `total` y `unique` |
| `POST` | `/api/links` | `{ target, slug? }` → crea el enlace. Sin sesión, límite de 20/hora por IP |
| `PATCH` | `/api/links/:id` | `{ target?, slug?, active?, expiresAt? }` → edita, pausa o caduca el enlace |
| `DELETE` | `/api/links/:id` | Borra el enlace, sus `click_days` y sus `link_visitors` |
| `GET` | `/auth/github` | Inicia el OAuth (302 a GitHub) |
| `GET` | `/auth/github/callback` | Canjea el código, crea la sesión y redirige a `/panel` |
| `POST` | `/auth/logout` | Borra la cookie de sesión (204) |
| `GET` | `/:slug` | Redirige al destino (302) y suma el clic; 404 si no existe, 410 si está pausado o caducado |

Las rutas de detalle (`GET /history`, `PATCH`, `DELETE`) autorizan por sesión o por la cookie de
propiedad del navegador que creó el enlace; nunca por un id enviado por el cliente.

Códigos de error: `invalid_url`, `invalid_body`, `invalid_expiry`, `slug_invalid`, `slug_taken`,
`rate_limited`, `unauthorized`, `not_found`, `bad_origin`, `db_unavailable`, `internal_error`.

Reglas de validación:

- El destino debe ser `http` o `https` (si falta el esquema se añade `https://`) y tener como
  máximo 2048 caracteres. Un destino sin punto en el host se rechaza.
- Slug: 2–32 caracteres `[a-z0-9_-]`, en minúsculas y sin colisionar con rutas reservadas
  (`api`, `auth`, `panel`, `qr`, `login`, `health`, …).

## Seguridad

- Sesión en cookie `elioxy_session`: HttpOnly, `SameSite=Lax`, `Secure` sobre https y 30 días
  de validez. El contenido va firmado con HMAC-SHA256; no se guarda nada en el navegador.
- OAuth con parámetro `state` en cookie de 10 minutos para evitar CSRF en el callback.
- Las mutaciones (`POST`, `PATCH`, `DELETE`, `POST /auth/logout`) comprueban que el `Origin`
  coincide con el host de la petición.
- Las consultas a D1 van siempre parametrizadas, y el panel filtra por el `sub` de la sesión o
  por el hash del token de propiedad; nunca por un id enviado por el cliente.
- Los enlaces creados sin sesión quedan ligados a una cookie `elioxy_owner` (HttpOnly, SameSite=Lax)
  cuyo SHA-256 se guarda en la fila. Al entrar con GitHub se reclaman para la cuenta y la cookie
  se borra. Sin esa cookie no se pueden listar, editar ni borrar.
- Borrar un enlace elimina también sus filas de `click_days` y `link_visitors`.
- El conteo de clics no usa cookies ni guarda IPs: solo un hash SHA-256 diario de IP +
  user-agent, imposible de cruzar entre días. Los bots y previews se filtran antes de escribir.
- El límite de 20 enlaces por hora e IP vive en memoria del isolate: frena el abuso básico,
  pero no es un cupo exacto entre reinicios ni entre instancias.

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Vite en modo desarrollo (proxy de `/api` y `/auth` al Worker en `:8787`) |
| `npm run build` | Compila el frontend en `dist/` |
| `npm run preview` / `npm run serve` | Wrangler dev sirviendo el Worker y `dist/` en `:8787` |

## Comprobación rápida

Con el Worker local en marcha:

```bash
curl -s localhost:8787/api/health
curl -s -X POST localhost:8787/api/links \
  -H 'content-type: application/json' -H 'origin: http://localhost:8787' \
  --data '{"target":"https://example.com","slug":"demo"}'
curl -s -o /dev/null -w '%{http_code}\n' localhost:8787/demo   # 302
```
