import { Background, Brand, Nav } from "./ui.jsx";
import { linkTo } from "../router.js";

const UPDATED = "21 de noviembre de 2026";

export default function Privacy({ me }) {
  return (
    <>
      <Background />
      <div className="shell">
        <Nav me={me} variant="app" />

        <main>
          <article className="legal">
            <p className="legal-kicker">Privacidad · pliego nº 02</p>
            <h1>Qué guarda el acortador y qué no</h1>
            <p className="legal-lede">
              Este sitio acorta enlaces y cuenta cuántas veces se abren. Para eso guarda lo mínimo, y aquí está contado
              entero: qué queda en la base de datos, qué no llega a escribirse nunca y qué hacen los terceros que
              intervienen al servir la página.
            </p>

            <section>
              <h2>Cuando acortas un enlace</h2>
              <ul>
                <li>La URL de destino y el final que elijas, por ejemplo <code>url.elioxy.us.ci/mi-cafe</code>.</li>
                <li>
                  La fecha de creación, si el enlace está activo y, si le pusiste caducidad, la fecha en que deja de
                  funcionar.
                </li>
                <li>Los contadores de clics y de visitantes distintos.</li>
                <li>
                  Si no has entrado con GitHub, una cookie propia (<code>elioxy_owner</code>) con un valor aleatorio. En
                  la base de datos se guarda solo un hash SHA-256 de ese valor, que es lo que permite enseñarte tus
                  enlaces en este navegador. Ni tu IP ni nada que te identifique.
                </li>
                <li>
                  Si entras con GitHub, además: el identificador numérico de tu cuenta, tu nombre de usuario, tu nombre
                  público y la URL de tu avatar. Solo eso; no se piden permisos sobre repositorios ni acceso al correo.
                </li>
              </ul>
            </section>

            <section>
              <h2>Cuando alguien abre un enlace</h2>
              <ul>
                <li>Se suma un clic al enlace y otro al día en curso.</li>
                <li>
                  Para saber si la visita es nueva, el servidor calcula en memoria un hash SHA-256 de «día + IP +
                  navegador» y guarda únicamente el hash. La IP y el user-agent no se escriben en ningún sitio.
                </li>
                <li>
                  El día forma parte del hash, así que la misma persona produce un valor distinto cada día: no se puede
                  seguir a nadie de un día para otro, y el hash no se puede deshacer para recuperar la IP.
                </li>
                <li>Esos hashes se borran a los 100 días.</li>
                <li>Los bots, las previsualizaciones de enlaces y los rastreadores no cuentan como clic.</li>
              </ul>
            </section>

            <section>
              <h2>Cookies</h2>
              <p>Son todas propias, HttpOnly, SameSite=Lax y Secure. No hay cookies de publicidad servidas por este sitio.</p>
              <table className="legal-table">
                <thead>
                  <tr>
                    <th scope="col">Cookie</th>
                    <th scope="col">Para qué</th>
                    <th scope="col">Duración</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <code>elioxy_owner</code>
                    </td>
                    <td>Recordar tus enlaces cuando no has entrado con GitHub.</td>
                    <td>1 año</td>
                  </tr>
                  <tr>
                    <td>
                      <code>elioxy_session</code>
                    </td>
                    <td>Mantener tu sesión de GitHub iniciada.</td>
                    <td>30 días</td>
                  </tr>
                  <tr>
                    <td>
                      <code>elioxy_oauth_state</code>
                    </td>
                    <td>Proteger el paso por GitHub mientras entras.</td>
                    <td>10 minutos</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section>
              <h2>Terceros</h2>
              <ul>
                <li>
                  <strong>Cloudflare</strong> aloja y sirve el sitio. Como cualquier servidor, ve la IP y las cabeceras
                  de la petición para entregar la página, y añade un script propio de seguridad.
                </li>
                <li>
                  <strong>GitHub</strong> solo interviene si decides entrar: gestiona la autorización y devuelve tu
                  perfil público.
                </li>
                <li>
                  <strong>Google</strong> sirve los anuncios que puedas ver en esta página. Puede usar cookies e
                  identificadores propios y mostrarte anuncios personalizados; si estás en el Espacio Económico
                  Europeo, muestra un mensaje de consentimiento desde el que puedes cambiar tus preferencias. Su
                  política está en{" "}
                  <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noreferrer">
                    policies.google.com/technologies/ads
                  </a>
                  .
                </li>
                <li>
                  Los avatares de GitHub se piden a través de este mismo dominio (<code>/avatar/…</code>), no
                  directamente desde tu navegador a un tercero.
                </li>
              </ul>
            </section>

            <section>
              <h2>Lo que no se guarda</h2>
              <ul>
                <li>Direcciones IP ni user-agents completos.</li>
                <li>Analítica de terceros: no hay Google Analytics, ni píxeles, ni perfiles de navegación.</li>
                <li>
                  El contenido de tus códigos QR no sale de tu equipo: el código y el PNG o SVG se generan en el
                  navegador.
                </li>
                <li>Contraseñas: no existen, el acceso es con GitHub.</li>
                <li>
                  El límite de creación sin cuenta (20 enlaces por hora) se cuenta en memoria y no se escribe en la base
                  de datos.
                </li>
              </ul>
            </section>

            <section>
              <h2>Tus derechos</h2>
              <ul>
                <li>
                  Puedes borrar cualquier enlace desde el panel o desde este navegador: al borrarlo se van también sus
                  contadores y sus hashes de visitantes.
                </li>
                <li>
                  Para acceder, corregir u oponerte al resto, escribe por GitHub:{" "}
                  <a href="https://github.com/ElioXY" target="_blank" rel="noreferrer">
                    github.com/ElioXY
                  </a>
                  .
                </li>
                <li>
                  Si crees que no se ha atendido bien, puedes reclamar ante la Agencia Española de Protección de Datos:{" "}
                  <a href="https://www.aepd.es" target="_blank" rel="noreferrer">
                    aepd.es
                  </a>
                  .
                </li>
              </ul>
            </section>

            <section>
              <h2>Cambios</h2>
              <p>
                Si esto cambia, se actualiza esta página y la fecha de abajo. Última actualización: {UPDATED}.
              </p>
            </section>

            <p className="legal-foot">
              <span>elioxy links · privacidad</span>
              <a href="/" onClick={(event) => linkTo(event, "/")}>
                Volver al inicio
              </a>
            </p>
          </article>
        </main>

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
              <a href="https://github.com/ElioXY" target="_blank" rel="noreferrer">
                GitHub
              </a>
            </div>
          </div>
          <div className="colofon-bottom">
            <span>Colofón · Archivo + IBM Plex Mono</span>
            <span>tinta #131311 · cobalto #1F2CE0 · amarillo #FFD23F · papel #F3F3EE</span>
            <span>url.elioxy.us.ci</span>
          </div>
        </footer>
      </div>
    </>
  );
}
