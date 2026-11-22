import { Background, Nav, SiteFooter } from "./ui.jsx";
import { linkTo } from "../router.js";

const UPDATED = "21 de noviembre de 2026";

export default function Terms({ me }) {
  return (
    <>
      <Background />
      <div className="shell">
        <Nav me={me} variant="app" />

        <main>
          <article className="legal">
            <p className="legal-kicker">Términos de uso · pliego nº 03</p>
            <h1>Las reglas del acortador</h1>
            <p className="legal-lede">
              Este servicio acorta enlaces y genera sus códigos QR sin pedirte cuenta. A cambio solo pide una cosa: que
              lo uses para compartir lo que compartirías en cualquier otro sitio. Aquí está lo que se puede, lo que no,
              cuántos enlaces puedes crear sin cuenta y qué pasa cuando quieres borrar uno.
            </p>

            <section>
              <h2>Qué es este servicio</h2>
              <ul>
                <li>Un acortador de URLs con QR, gratuito y sin registro obligatorio.</li>
                <li>
                  Sin cuenta, tus enlaces viven en este navegador; si entras con GitHub pasan a tu panel, con sus clics
                  y su histórico.
                </li>
                <li>Se financia con los anuncios que ves en la página. No hay planes de pago ni funciones de pago.</li>
              </ul>
            </section>

            <section>
              <h2>Uso aceptable</h2>
              <p>Está bien acortar enlaces propios, de tu trabajo, de tus redes o de lo que quieras compartir. No está bien:</p>
              <ul>
                <li>Enviar spam ni usar el acortador para saltarte filtros de correo o de mensajería.</li>
                <li>Enlazar a malware, phishing, estafas, contenido ilegal o material que vulnere derechos de autor.</li>
                <li>Esconder el destino para engañar: el enlace corto no puede disfrazar a dónde lleva de verdad.</li>
                <li>Crear enlaces de forma automatizada o masiva, ni con scripts que machaquen la API.</li>
                <li>Acortar contenido que no tienes derecho a distribuir.</li>
                <li>Pulsar tus propios anuncios o pedir a otros que lo hagan.</li>
              </ul>
              <p>
                Los enlaces que incumplan esto se pueden desactivar o borrar sin aviso, y el acceso se puede cortar a
                quien insista.
              </p>
            </section>

            <section>
              <h2>El límite sin cuenta</h2>
              <ul>
                <li>
                  Sin sesión puedes crear <strong>20 enlaces por hora</strong> desde la misma conexión. Al pasarte, la
                  API responde con un error de límite y esperas a la hora siguiente.
                </li>
                <li>El contador vive en memoria y no se guarda en la base de datos.</li>
                <li>Con GitHub iniciado no hay ese límite, porque los enlaces quedan asociados a tu cuenta.</li>
              </ul>
            </section>

            <section>
              <h2>Tus enlaces se pueden borrar</h2>
              <ul>
                <li>Puedes borrar o desactivar cualquier enlace desde el panel o desde el navegador donde lo creaste.</li>
                <li>
                  Al borrarlo desaparecen también sus contadores, su histórico diario y los hashes de sus visitantes. No
                  queda copia.
                </li>
                <li>
                  Un enlace desactivado o caducado deja de redirigir al instante y muestra una página de aviso en su
                  lugar.
                </li>
                <li>
                  No hay copias de seguridad ni promesa de permanencia: si un enlace es importante, guarda el destino
                  original.
                </li>
              </ul>
            </section>

            <section>
              <h2>El destino no es nuestro</h2>
              <p>
                El acortador no revisa ni aloja el contenido al que apuntan los enlaces. La responsabilidad de ese
                contenido es de quien lo publica, no de este servicio.
              </p>
            </section>

            <section>
              <h2>Anuncios</h2>
              <p>
                La página muestra anuncios servidos por Google, y eso no cambia nada de lo anterior: ni el acortador
                vende tus datos ni el anunciante recibe tus enlaces. Lo único que se pide es no generar clics falsos.
              </p>
            </section>

            <section>
              <h2>Cambios y contacto</h2>
              <p>
                Si estas reglas cambian, se actualiza esta página y la fecha de abajo. Para cualquier duda, escribe por
                GitHub:{" "}
                <a href="https://github.com/ElioXY" target="_blank" rel="noreferrer">
                  github.com/ElioXY
                </a>
                . Última actualización: {UPDATED}.
              </p>
            </section>

            <p className="legal-foot">
              <span>elioxy links · términos</span>
              <a href="/privacidad" onClick={(event) => linkTo(event, "/privacidad")}>
                Privacidad
              </a>
            </p>
          </article>
        </main>

        <SiteFooter />
      </div>
    </>
  );
}
