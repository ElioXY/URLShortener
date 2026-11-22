import { Background, Nav, SiteFooter } from "./ui.jsx";
import { linkTo } from "../router.js";

const UPDATED = "22 de noviembre de 2026";

// Ponlo en true cuando el mensaje de consentimiento de Google esté encendido
// (AdSense → Privacidad y mensajería → Regulaciones europeas). Mientras sea
// false, esta página describe el estado real y el aviso de «pendiente» sigue
// visible: sin mensaje no hay publicidad personalizada en el EEE, el Reino
// Unido ni Suiza.
const CONSENT_MESSAGE_ACTIVE = false;

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
              <p>
                Las cookies propias son HttpOnly, SameSite=Lax y Secure, y solo hacen lo que dice la tabla. Las de
                publicidad no las pone este sitio: las escribe el código de Google que sirve el anuncio.
              </p>
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
              <p>
                Anuncios: al cargarse un anuncio en la portada, Google y sus socios pueden escribir cookies
                publicitarias como <code>__gads</code>, <code>__gpi</code>, <code>IDE</code> o <code>NID</code>, con
                una duración de entre unas horas y algo más de un año. En el Espacio Económico Europeo, el Reino Unido
                y Suiza esas cookies solo se usan para personalizar la publicidad cuando el mensaje de consentimiento
                está activo y lo aceptas; mientras no lo esté, los anuncios que se sirven ahí no se basan en tu
                historial de navegación.
              </p>
            </section>

            <section>
              <h2>Anuncios de Google</h2>
              <ul>
                <li>
                  Terceros, incluido Google, usan cookies para servir anuncios a partir de tus visitas anteriores a este
                  sitio o a otros sitios de internet.
                </li>
                <li>
                  El uso que Google hace de las cookies de publicidad permite a Google y a sus socios servirte anuncios
                  basados en tu visita a este sitio o a otros sitios de internet.
                </li>
                <li>
                  Puedes desactivar la publicidad personalizada en{" "}
                  <a href="https://www.google.com/settings/ads" target="_blank" rel="noreferrer">
                    Configuración de anuncios de Google
                  </a>
                  , o desactivar las cookies de personalización de terceros en{" "}
                  <a href="https://www.aboutads.info/choices/" target="_blank" rel="noreferrer">
                    aboutads.info
                  </a>{" "}
                  y, en España, en{" "}
                  <a href="https://www.youronlinechoices.com/es/" target="_blank" rel="noreferrer">
                    youronlinechoices.com
                  </a>
                  .
                </li>
                <li>
                  En el Espacio Económico Europeo, el Reino Unido y Suiza, Google solo puede usar cookies de publicidad
                  personalizada con tu consentimiento previo, y ese consentimiento se recoge con su plataforma
                  certificada de gestión del consentimiento (la que exige su política de consentimiento de usuarios de
                  la UE). Cuando ese mensaje está activo, aparece antes de cargar los anuncios y desde él puedes
                  aceptar, rechazar o cambiar las preferencias, además de volver a abrirlo con el enlace «Privacidad y
                  cookies» del propio anuncio.{" "}
                  {CONSENT_MESSAGE_ACTIVE
                    ? "En este sitio el mensaje está activo."
                    : "En este sitio el mensaje aún no está activo, así que ahora mismo no se sirve publicidad personalizada en esas regiones."}
                </li>
                <li>
                  Los anuncios solo se muestran en la portada. Las redirecciones de los enlaces cortos, el panel, el
                  generador de QR, las páginas legales y las páginas de error no llevan publicidad.
                </li>
              </ul>
              {!CONSENT_MESSAGE_ACTIVE && (
                <p className="legal-note">
                  <strong>Pendiente de activar.</strong> El mensaje de consentimiento de Google se enciende en el panel
                  de AdSense, en Privacidad y mensajería → Regulaciones europeas. Hasta que se active, en el Espacio
                  Económico Europeo, el Reino Unido y Suiza solo se sirven anuncios no personalizados, y esta página
                  seguirá diciéndolo así.
                </p>
              )}
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
                  <strong>Google</strong> sirve los anuncios de la portada. Puede usar cookies e identificadores
                  propios; la publicidad personalizada depende del consentimiento que recoge su mensaje (ver «Anuncios
                  de Google»). Su política está en{" "}
                  <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noreferrer">
                    policies.google.com/technologies/ads
                  </a>{" "}
                  y la de los sitios que muestran sus anuncios, en{" "}
                  <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noreferrer">
                    policies.google.com/technologies/partner-sites
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
                <li>Analítica de terceros: no hay Google Analytics, ni píxeles de analítica, ni perfiles de navegación.</li>
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

        <SiteFooter />
      </div>
    </>
  );
}
