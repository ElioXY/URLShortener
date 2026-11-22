import { AdSlot, ArrowRightIcon, Background, GitHubIcon, Nav, SiteFooter } from "./ui.jsx";
import Shortener from "./Shortener.jsx";
import { QrCanvas } from "./Qr.jsx";
import { linkTo } from "../router.js";
import { GUIAS } from "../guides.js";

const EXAMPLE = "https://url.elioxy.us.ci/mi-cafe";

export default function Landing({ me }) {
  const user = me?.user ?? null;
  const initialSlug = new URLSearchParams(window.location.search).get("slug") || "";

  return (
    <>
      <Background />
      <div className="shell">
        <Nav me={me} />

        <main>
          <section className="sheet-hero" id="top">
            <div className="hero-rail" aria-hidden="true">
              <span className="rail-stamp">Pliego nº 01 · 2026</span>
              <dl className="rail-specs">
                <div>
                  <dt>Formato</dt>
                  <dd>302</dd>
                </div>
                <div>
                  <dt>Salida</dt>
                  <dd>PNG · SVG</dd>
                </div>
                <div>
                  <dt>Papel</dt>
                  <dd>#F3F3EE</dd>
                </div>
              </dl>
            </div>

            <div className="hero-copy">
              <p className="hero-kicker">Enlaces cortos con QR</p>
              <h1 className="hero-title">
                <span>Acorta el enlace.</span>
                <span className="line-2">
                  Imprime el <span className="mark">QR.</span>
                </span>
              </h1>
              <p className="hero-lede">
                Pega una URL y sale un enlace corto con su código QR. El PNG va a pantalla, el SVG a la imprenta y la
                etiqueta a la pared.
              </p>

              <Shortener user={user} variant="landing" initialSlug={initialSlug} />

              <p className="hero-note">
                Sin cuenta se guarda en este navegador. Con GitHub pasa a tu panel, con sus clics y su QR.
              </p>
            </div>

            <div className="hero-plate">
              <div className="plate-field" aria-hidden="true" />
              <span className="plate-tag" aria-hidden="true">
                60 mm · tinta
              </span>
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
                  <span className="label-caption">Etiqueta de ejemplo. 60 mm, marcas de corte incluidas.</span>
                </figcaption>
              </figure>
              <span className="plate-stamp" aria-hidden="true">
                córtese aquí
              </span>
            </div>
          </section>

          <div className="regla" aria-hidden="true">
            <span style={{ left: "0" }}>0</span>
            <span style={{ left: "50%" }}>60</span>
            <span style={{ right: "0" }}>120 mm</span>
          </div>

          <section className="hoja" id="funciones">
            <header className="hoja-head">
              <span className="folio">
                <span className="folio-num">01 / 03</span>
                Especificaciones
              </span>
              <div>
                <h2>Lo que hay dentro</h2>
                <p className="lede">
                  Cuatro piezas, sin relleno: el código, la cuenta de clics, el nombre del enlace y el panel donde se
                  guardan.
                </p>
              </div>
            </header>

            <div className="pliego">
              <article className="pliego-lead">
                <span className="ficha-idx">01 — Código</span>
                <h3>Cada enlace sale con su QR.</h3>
                <div className="qr-specimen">
                  <div className="qr-mini">
                    <QrCanvas value={EXAMPLE} size={132} />
                  </div>
                  <div>
                    <p>
                      Vectorial para imprimir grande, mapa de bits para pegarlo en un chat. Y si el enlace caduca, la
                      etiqueta lo dice.
                    </p>
                    <div className="spec-tags">
                      <span>PNG</span>
                      <span>SVG</span>
                      <span>40 · 60 · 100 mm</span>
                    </div>
                  </div>
                </div>
                <p className="lead-note">Escala real: 60 mm de lado, marcas de corte en las esquinas.</p>
              </article>

              <div className="pliego-list">
                <article className="ficha">
                  <span className="ficha-idx">02</span>
                  <h3>Clics por día</h3>
                  <p>Histórico de 7, 30 o 90 días. Los bots y las previsualizaciones no suman.</p>
                  <div className="ficha-visual mini-bars" aria-hidden="true">
                    <span style={{ height: "30%" }} />
                    <span style={{ height: "54%" }} />
                    <span style={{ height: "41%" }} />
                    <span style={{ height: "72%" }} />
                    <span style={{ height: "60%" }} />
                    <span style={{ height: "88%" }} />
                    <span style={{ height: "67%" }} />
                  </div>
                </article>

                <article className="ficha">
                  <span className="ficha-idx">03</span>
                  <h3>Slugs que se recuerdan</h3>
                  <p>Elige el final: <b>mi-cafe</b> dice más que una cadena aleatoria.</p>
                  <div className="ficha-visual slug-compare" aria-hidden="true">
                    <span className="slug-line slug-line-dim">x7k2m9p</span>
                    <span className="slug-line">mi-cafe</span>
                  </div>
                </article>

                <article className="ficha">
                  <span className="ficha-idx">04</span>
                  <h3>Panel con GitHub</h3>
                  <p>Tus enlaces siguen ahí al cambiar de dispositivo: copiar, editar, pausar o borrar.</p>
                  <div className="ficha-visual mono-list" aria-hidden="true">
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
              </div>
            </div>
          </section>

          <section className="hoja" id="como-funciona">
            <header className="hoja-head">
              <span className="folio">
                <span className="folio-num">02 / 03</span>
                Orden de trabajo
              </span>
              <div>
                <h2>De la URL al papel</h2>
                <p className="lede">Tres pasos. No hay configuración previa ni cuenta obligatoria.</p>
              </div>
            </header>

            <ol className="orden">
              <li>
                <span className="n">1</span>
                <div>
                  <h3>Pega la URL</h3>
                  <p>Una tienda, un PDF, una ubicación o un vídeo. Cualquier dirección que quieras compartir.</p>
                </div>
                <span className="salida">Entrada</span>
              </li>
              <li>
                <span className="n">2</span>
                <div>
                  <h3>Decide el final</h3>
                  <p>Escríbelo tú o deja que salga uno corto y difícil de adivinar.</p>
                </div>
                <span className="salida">Slug</span>
              </li>
              <li>
                <span className="n">3</span>
                <div>
                  <h3>Llévate el enlace o el QR</h3>
                  <p>PNG para una pantalla, SVG para una imprenta, etiqueta para pegar en la puerta.</p>
                </div>
                <span className="salida">Salida</span>
              </li>
            </ol>
          </section>

          <section className="hoja" id="guias">
            <header className="hoja-head">
              <span className="folio">
                <span className="folio-num">03 / 03</span>
                Guías
              </span>
              <div>
                <h2>Cómo sacarle partido</h2>
                <p className="lede">
                  Cuatro guías cortas sobre lo que de verdad se atasca: el tamaño del QR en papel, el final del
                  enlace, el WiFi y los carteles con fecha de caducidad.
                </p>
              </div>
            </header>

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
          </section>

          <AdSlot />

          <section className="cupon">
            <div>
              <h2>Guarda los enlaces en tu cuenta.</h2>
              <p>
                Entra con GitHub y llévatelos a cualquier dispositivo, con sus clics, su histórico y su QR.
                {user ? " Ya estás dentro." : ""}
              </p>
            </div>
            <div className="cupon-actions">
              {user ? (
                <a className="btn" href="/panel" onClick={(event) => linkTo(event, "/panel")}>
                  Ir a mi panel <ArrowRightIcon />
                </a>
              ) : (
                <a className="btn" href="/auth/github">
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
            <span className="sello" aria-hidden="true">
              Sin cuentas
              <br />
              de analítica
            </span>
          </section>
        </main>

        <SiteFooter />
      </div>
    </>
  );
}
