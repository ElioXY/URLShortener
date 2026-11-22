import Guide from "./Guide.jsx";

export default function About({ me }) {
  return (
    <Guide
      me={me}
      kicker="Acerca de · pliego nº 05"
      title="Quién hace esto y por qué"
      lede="elioxy links es un acortador de enlaces con códigos QR, gratuito y sin registro obligatorio. Detrás hay una persona y no una empresa, y esta página cuenta cómo funciona, con qué se mantiene y qué límites tiene antes de que los descubras tú."
    >
      <section>
        <h2>Qué es</h2>
        <p>
          Una herramienta pequeña con una idea fija: convertir una URL en un enlace corto y en un QR que se
          pueda imprimir, sin pedir una cuenta y sin poner una pantalla intermedia delante de cada visita. El
          acortado y los códigos QR funcionan sin registrarse; el panel con clics, histórico y edición se abre
          con GitHub, y es opcional.
        </p>
      </section>

      <section>
        <h2>Quién lo hace</h2>
        <p>
          Lo mantiene ElioXY como proyecto propio. No hay equipo, ni redacción, ni atención al cliente con
          horario: hay una persona que responde por GitHub cuando puede. El código del sitio y los cambios que
          se van haciendo están en{" "}
          <a href="https://github.com/ElioXY" target="_blank" rel="noreferrer">
            github.com/ElioXY
          </a>
          .
        </p>
      </section>

      <section>
        <h2>Por qué existe</h2>
        <p>
          Los acortadores comerciales tienen un problema de fondo: cobran por la visita, así que ponen una
          pantalla de publicidad entre el enlace y el destino. Eso rompe justo lo que hace útil un enlace corto,
          que es que alguien lo abra y llegue. Aquí no hay página intermedia: el 302 va directo, y el QR se
          genera en tu navegador, así que la URL que codificas no viaja a ningún servidor.
        </p>
      </section>

      <section>
        <h2>Cómo se financia</h2>
        <p>
          Con un anuncio en la portada. No hay plan de pago, ni funciones reservadas, ni venta de datos. Los
          enlaces no se venden, no se comparten con anunciantes y no se usan para perfilar a nadie. Los
          detalles de qué se guarda y qué no están en la{" "}
          <a href="/privacidad">política de privacidad</a>.
        </p>
      </section>

      <section>
        <h2>Cómo funciona</h2>
        <ul>
          <li>
            El servidor es un Worker de Cloudflare, sin frameworks de servidor: enruta, firma la sesión y cuenta
            clics.
          </li>
          <li>Los datos viven en una base D1 (SQLite) con las consultas parametrizadas.</li>
          <li>El QR se genera en el cliente con la librería <code>qrcode</code>: el contenido no sale de tu equipo.</li>
          <li>
            La sesión es una cookie HttpOnly firmada con HMAC-SHA256; no hay base de sesiones ni contraseñas
            guardadas.
          </li>
          <li>
            El conteo de clics no usa cookies: guarda un hash SHA-256 diario de IP y navegador, imposible de
            cruzar entre días.
          </li>
        </ul>
      </section>

      <section>
        <h2>Qué no hace</h2>
        <ul>
          <li>No revisa ni aloja el contenido de los destinos: la responsabilidad es de quien publica el enlace.</li>
          <li>No tiene analítica de terceros ni píxeles de seguimiento.</li>
          <li>No tiene aplicación móvil ni extensión: es una web y funciona igual en el móvil.</li>
          <li>No vende enlaces cortos ni slugs «premium».</li>
        </ul>
      </section>

      <section>
        <h2>Límites conocidos</h2>
        <ul>
          <li>Sin cuenta se pueden crear 20 enlaces por hora desde la misma conexión.</li>
          <li>
            El histórico y los clics únicos empiezan a contarse con el despliegue: un enlace antiguo puede
            mostrar un total mayor que la suma del gráfico.
          </li>
          <li>No hay copias de seguridad ni promesa de permanencia. Si un enlace es importante, guarda el destino.</li>
          <li>Los días se agrupan en UTC, no en tu hora local.</li>
        </ul>
      </section>

      <section>
        <h2>Contacto y enlaces abusivos</h2>
        <p>
          Para dudas, fallos o para reportar un enlace que lleva a spam, malware o suplantación, escribe por
          GitHub:{" "}
          <a href="https://github.com/ElioXY" target="_blank" rel="noreferrer">
            github.com/ElioXY
          </a>
          . Los enlaces que incumplan las reglas se desactivan sin aviso. Las reglas están en los{" "}
          <a href="/terminos">términos de uso</a>.
        </p>
      </section>
    </Guide>
  );
}
