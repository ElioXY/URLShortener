import { ArrowRightIcon, Background, Brand, GitHubIcon, Nav } from "./ui.jsx";
import Shortener from "./Shortener.jsx";
import { QrCanvas } from "./Qr.jsx";
import { linkTo } from "../router.js";

const EXAMPLE = "https://url.elioxy.us.ci/mi-cafe";

export default function Landing({ me }) {
  const user = me?.user ?? null;

  return (
    <>
      <Background />
      <div className="shell">
        <Nav me={me} />

        <main>
          <section className="hero">
            <div className="hero-copy">
              <h1 className="hero-title">
                Acorta el enlace.
                <br />
                Imprime el QR.
              </h1>
              <p className="hero-lede">
                Pega una URL y te devolvemos un enlace corto con su código QR en PNG o SVG. Con GitHub, el enlace y sus
                clics se quedan guardados en tu panel.
              </p>

              <Shortener user={user} variant="landing" />

              <p className="hero-note">Sin cuenta puedes acortar. Con GitHub se guarda el enlace y su histórico.</p>
            </div>

            <div className="hero-visual">
              <figure className="label-card">
                <div className="label-head">
                  <span>url.elioxy.us.ci</span>
                  <span>QR 1:1</span>
                </div>
                <div className="label-qr">
                  <QrCanvas value={EXAMPLE} size={214} />
                </div>
                <figcaption className="label-foot">
                  <span className="label-url">
                    url.elioxy.us.ci/<b>mi-cafe</b>
                  </span>
                  <span className="label-caption">Etiqueta de ejemplo. PNG para pantalla, SVG para imprimir.</span>
                </figcaption>
              </figure>
            </div>
          </section>

          <section className="section" id="funciones">
            <div className="section-head">
              <h2>Lo que hace</h2>
              <p className="lede">Acortar, imprimir el QR, contar clics y guardarlo todo. Nada más.</p>
            </div>

            <div className="spec">
              <article className="spec-row">
                <h3>QR en PNG y SVG</h3>
                <p>Cada enlace trae su código. El PNG va bien en pantalla; el SVG aguanta una impresión grande.</p>
                <div className="spec-visual">
                  <div className="qr-mini">
                    <QrCanvas value={EXAMPLE} size={88} />
                  </div>
                </div>
              </article>

              <article className="spec-row">
                <h3>Clics por día</h3>
                <p>Guardamos cada visita con su fecha. En el panel puedes mirar 7, 30 o 90 días de cada enlace.</p>
                <div className="spec-visual mini-bars" aria-hidden="true">
                  <span style={{ height: "30%" }} />
                  <span style={{ height: "54%" }} />
                  <span style={{ height: "41%" }} />
                  <span style={{ height: "72%" }} />
                  <span style={{ height: "60%" }} />
                  <span style={{ height: "88%" }} />
                  <span style={{ height: "67%" }} />
                </div>
              </article>

              <article className="spec-row">
                <h3>Panel con GitHub</h3>
                <p>Entras con tu cuenta y tus enlaces siguen ahí: copiar, abrir, descargar el QR o borrar.</p>
                <div className="spec-visual mono-list" aria-hidden="true">
                  <span>
                    <b>mi-cafe</b> 128
                  </span>
                  <span>
                    <b>menu-2026</b> 42
                  </span>
                  <span>
                    <b>cv</b> 9
                  </span>
                </div>
              </article>

              <article className="spec-row">
                <h3>Slugs que se recuerdan</h3>
                <p>Elige el final del enlace: <b>mi-cafe</b> dice más que una cadena aleatoria.</p>
                <div className="spec-visual slug-compare" aria-hidden="true">
                  <span className="slug-line slug-line-dim">x7k2m9p</span>
                  <span className="slug-line">mi-cafe</span>
                </div>
              </article>
            </div>
          </section>

          <section className="section" id="como-funciona">
            <div className="section-head">
              <h2>De la URL al papel</h2>
              <p className="lede">Tres pasos y el QR está listo para pegar donde haga falta.</p>
            </div>

            <ol className="steps">
              <li>
                <span className="step-num">1</span>
                <h3>Pega la URL</h3>
                <p>Una tienda, un PDF, una ubicación o un vídeo. Cualquier dirección que quieras compartir.</p>
              </li>
              <li>
                <span className="step-num">2</span>
                <h3>Elige el slug</h3>
                <p>Escríbelo tú o deja que generemos uno corto y difícil de adivinar.</p>
              </li>
              <li>
                <span className="step-num">3</span>
                <h3>Copia el enlace o el QR</h3>
                <p>El QR se descarga en PNG o en SVG, según vaya a una pantalla o a una imprenta.</p>
              </li>
            </ol>
          </section>

          <section className="cta-band">
            <div className="cta-copy">
              <h2>Guarda los enlaces y no pierdas la cuenta.</h2>
              <p>Entra con GitHub y tenlos a mano con sus clics y su QR desde cualquier dispositivo.</p>
            </div>
            <div className="cta-actions">
              {user ? (
                <a className="btn btn-yellow" href="/panel" onClick={(event) => linkTo(event, "/panel")}>
                  Ir a mi panel <ArrowRightIcon />
                </a>
              ) : (
                <a className="btn btn-yellow" href="/auth/github">
                  <GitHubIcon /> Entrar con GitHub
                </a>
              )}
              <a
                className="btn btn-outline-light"
                href="#top"
                onClick={(event) => {
                  event.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Crear un enlace
              </a>
            </div>
          </section>
        </main>

        <footer className="footer">
          <div className="footer-inner">
            <div className="footer-brand">
              <a className="brand-link" href="/" onClick={(event) => linkTo(event, "/")}>
                <Brand />
              </a>
              <p>Enlaces cortos y códigos QR, sin más.</p>
            </div>
            <div className="footer-links">
              <a href="/panel" onClick={(event) => linkTo(event, "/panel")}>
                Panel
              </a>
              <a href="https://github.com/ElioXY" target="_blank" rel="noreferrer">
                GitHub
              </a>
              <span className="footer-domain">url.elioxy.us.ci</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
