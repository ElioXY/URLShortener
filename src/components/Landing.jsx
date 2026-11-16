import {
  ArrowRightIcon,
  Background,
  Brand,
  ChartIcon,
  GitHubIcon,
  LinkIcon,
  Nav,
  PanelIcon,
  QrIcon,
  SparkIcon,
  TagIcon,
} from "./ui.jsx";
import Shortener from "./Shortener.jsx";
import { QrCanvas } from "./Qr.jsx";
import { linkTo } from "../router.js";

export default function Landing({ me }) {
  const user = me?.user ?? null;

  return (
    <>
      <Background />
      <div className="shell">
        <Nav me={me} />

        <main>
          <section className="hero">
            <span className="hero-eyebrow">
              <span className="pulse" aria-hidden="true" />
              Enlaces cortos · QR instantáneo · Panel con GitHub
            </span>

            <h1 className="hero-title">
              Acorta el enlace.
              <br />
              <span className="grad">Comparte el QR.</span>
            </h1>

            <p className="hero-lede">
              Convierte cualquier URL en un enlace corto y limpio, con su código QR listo para descargar. Y guarda todo
              en un panel privado al que entras con tu cuenta de GitHub.
            </p>

            <Shortener user={user} variant="landing" />

            <ul className="hero-meta">
              <li>
                <CheckDot /> Sin registro para probar
              </li>
              <li>
                <CheckDot /> QR en PNG y SVG
              </li>
              <li>
                <CheckDot /> Cuenta los clics
              </li>
            </ul>
          </section>

          <section className="section" id="funciones">
            <div className="section-head">
              <p className="eyebrow">
                <SparkIcon size={14} /> Funciones
              </p>
              <h2>Todo lo que un buen enlace necesita</h2>
              <p className="lede">Corto para compartir, QR para imprimir y un panel para no perder la cuenta.</p>
            </div>

            <div className="bento">
              <article className="card card-qr">
                <div className="card-icon">
                  <QrIcon />
                </div>
                <h3>QR en alta resolución</h3>
                <p>
                  Cada enlace genera su código QR al instante. Descárgalo en PNG para pantallas o en SVG para imprimir
                  sin perder nitidez.
                </p>
                <div className="card-visual qr-visual">
                  <div className="qr-mini">
                    <QrCanvas value="https://url.elioxy.us.ci" size={104} />
                  </div>
                  <span className="qr-tag">PNG · SVG</span>
                </div>
              </article>

              <article className="card">
                <div className="card-icon">
                  <ChartIcon />
                </div>
                <h3>Clics de verdad</h3>
                <p>Contamos cada visita y guardamos la última vez que alguien abrió el enlace.</p>
                <div className="card-visual bars" aria-hidden="true">
                  <span style={{ height: "34%" }} />
                  <span style={{ height: "58%" }} />
                  <span style={{ height: "42%" }} />
                  <span style={{ height: "76%" }} />
                  <span style={{ height: "64%" }} />
                  <span style={{ height: "92%" }} />
                </div>
              </article>

              <article className="card">
                <div className="card-icon">
                  <PanelIcon />
                </div>
                <h3>Panel privado</h3>
                <p>Tus enlaces viven bajo tu cuenta de GitHub: copiar, abrir, generar el QR o borrar, todo en un sitio.</p>
                <div className="card-visual rows" aria-hidden="true">
                  <div className="mock-row">
                    <span className="mock-dot" />
                    <span className="mock-bar" style={{ width: "62%" }} />
                    <span className="mock-pill">24</span>
                  </div>
                  <div className="mock-row">
                    <span className="mock-dot" />
                    <span className="mock-bar" style={{ width: "48%" }} />
                    <span className="mock-pill">9</span>
                  </div>
                  <div className="mock-row">
                    <span className="mock-dot" />
                    <span className="mock-bar" style={{ width: "72%" }} />
                    <span className="mock-pill">3</span>
                  </div>
                </div>
              </article>

              <article className="card">
                <div className="card-icon">
                  <TagIcon />
                </div>
                <h3>Slugs con tu marca</h3>
                <p>Elige el final del enlace y comparte algo memorable en lugar de una cadena aleatoria.</p>
                <div className="card-visual slug-compare" aria-hidden="true">
                  <span className="slug-demo slug-demo-dim">
                    <span className="slug-demo-host">url.elioxy.us.ci/</span>
                    <span>x7k2m9p</span>
                  </span>
                  <span className="slug-demo slug-demo-dim">
                    <span className="slug-demo-host">url.elioxy.us.ci/</span>
                    <span>n3p8q1z</span>
                  </span>
                  <span className="slug-demo">
                    <span className="slug-demo-host">url.elioxy.us.ci/</span>
                    <span className="slug-demo-value">mi-marca</span>
                  </span>
                </div>
              </article>
            </div>
          </section>

          <section className="section" id="como-funciona">
            <div className="section-head">
              <p className="eyebrow">Cómo funciona</p>
              <h2>Tres pasos y a compartir</h2>
            </div>

            <ol className="steps">
              <li>
                <span className="step-num">01</span>
                <h3>Pega tu enlace</h3>
                <p>Cualquier URL que quieras compartir: una tienda, un PDF, una ubicación o un vídeo.</p>
              </li>
              <li>
                <span className="step-num">02</span>
                <h3>Elige el slug</h3>
                <p>Personalízalo o deja que generemos uno corto y difícil de adivinar por ti.</p>
              </li>
              <li>
                <span className="step-num">03</span>
                <h3>Copia o descarga el QR</h3>
                <p>Comparte el enlace donde quieras, o pásalo a papel con un QR nítido en un clic.</p>
              </li>
            </ol>
          </section>

          <section className="cta">
            <div className="cta-glow" aria-hidden="true" />
            <span className="cta-icon">
              <LinkIcon size={22} />
            </span>
            <h2>Tu próximo enlace empieza aquí</h2>
            <p>Acorta, descarga el QR y conserva todo ordenado en tu panel con GitHub.</p>
            <div className="cta-actions">
              {user ? (
                <a className="btn btn-primary" href="/panel" onClick={(event) => linkTo(event, "/panel")}>
                  Ir a mi panel <ArrowRightIcon />
                </a>
              ) : (
                <a className="btn btn-primary" href="/auth/github">
                  <GitHubIcon /> Entrar con GitHub
                </a>
              )}
              <a
                className="btn btn-ghost"
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
              <p>Enlaces cortos y códigos QR, sin ruido.</p>
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

function CheckDot() {
  return (
    <span className="check-dot" aria-hidden="true">
      <svg viewBox="0 0 12 12" width="9" height="9" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <path d="M2.5 6.5L5 9l4.5-5.5" />
      </svg>
    </span>
  );
}
