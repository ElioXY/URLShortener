import { Background, Nav, SiteFooter } from "./ui.jsx";
import { GUIAS } from "../guides.js";
import { linkTo } from "../router.js";

/**
 * Cascarón común de las guías y de la página «Acerca de». Reutiliza los estilos
 * de `.legal` para que el texto largo tenga la misma tipografía que la política
 * de privacidad y los términos.
 */
export default function Guide({ me, kicker, title, lede, children }) {
  const current =
    typeof window === "undefined" ? "" : window.location.pathname.replace(/\/+$/, "") || "/";
  const related = GUIAS.filter((guia) => guia.path !== current);

  return (
    <>
      <Background />
      <div className="shell">
        <Nav me={me} variant="app" />

        <main>
          <article className="legal guia">
            <p className="legal-kicker">{kicker}</p>
            <h1>{title}</h1>
            <p className="legal-lede">{lede}</p>

            {children}

            <nav className="guia-related" aria-label="Más guías">
              <span className="guia-related-title">Seguir leyendo</span>
              <ul>
                {related.map((guia) => (
                  <li key={guia.path}>
                    <a href={guia.path} onClick={(event) => linkTo(event, guia.path)}>
                      {guia.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

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
