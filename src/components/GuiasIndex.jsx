import { ArrowRightIcon, Background, Nav, SiteFooter } from "./ui.jsx";
import { linkTo } from "../router.js";
import { ACERCA, GUIAS } from "../guides.js";

export default function GuiasIndex({ me }) {
  return (
    <>
      <Background />
      <div className="shell">
        <Nav me={me} variant="app" />

        <main>
          <article className="legal guia">
            <p className="legal-kicker">Guías · pliego nº 06</p>
            <h1>Guías de uso</h1>
            <p className="legal-lede">
              Cuatro guías sobre las decisiones que se toman antes de imprimir un QR o de repartir un enlace: cuánto
              tiene que medir el código, qué final conviene, cómo se escribe un QR de WiFi y qué pasa cuando un cartel
              lleva fecha. Están escritas a partir de los fallos que se ven de verdad, no de teoría.
            </p>

            <div className="guias-grid">
              {GUIAS.map((guia) => (
                <article className="guia-card" key={guia.path}>
                  <span className="guia-card-kicker">{guia.kicker}</span>
                  <h3>
                    <a href={guia.path} onClick={(event) => linkTo(event, guia.path)}>
                      {guia.title}
                    </a>
                  </h3>
                  <p>{guia.blurb}</p>
                  <span className="guia-card-more" aria-hidden="true">
                    Leer <ArrowRightIcon size={14} />
                  </span>
                </article>
              ))}
            </div>

            <section>
              <h2>Y si vienes a mirar quién hay detrás</h2>
              <p>
                La página <a href={ACERCA.path} onClick={(event) => linkTo(event, ACERCA.path)}>Acerca de</a> cuenta
                cómo se mantiene el servicio, qué datos se guardan, qué límites tiene y por dónde se reporta un enlace
                abusivo.
              </p>
            </section>

            <p className="legal-foot">
              <span>elioxy links · guías</span>
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
