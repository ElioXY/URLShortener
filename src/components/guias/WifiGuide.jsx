import Guide from "../Guide.jsx";

export default function WifiGuide({ me }) {
  return (
    <Guide
      me={me}
      kicker="Guía 03 · QR"
      title="QR para WiFi: el formato y los errores que lo rompen"
      lede="Un QR de red es lo más cómodo que se puede pegar en una pared: el invitado apunta con la cámara y entra sin teclear una contraseña de veinte caracteres. También es el que más falla, porque una sola coma mal puesta invalida el código entero y el móvil no avisa de por qué."
    >
      <section>
        <h2>El formato, campo a campo</h2>
        <p>
          Un QR de WiFi no es un enlace: es una cadena de texto con campos separados por punto y coma. Se
          escribe así:
        </p>
        <p>
          <code>WIFI:T:WPA;S:MiRed;P:mi-contrasena;H:false;;</code>
        </p>
        <ul>
          <li>
            <code>T</code>: el tipo de seguridad. <code>WPA</code> cubre WPA, WPA2 y WPA3; <code>WEP</code> para
            redes antiguas; <code>nopass</code> para una red abierta, en la que no se envía contraseña.
          </li>
          <li>
            <code>S</code>: el nombre de la red (SSID), tal cual, con mayúsculas y espacios.
          </li>
          <li>
            <code>P</code>: la contraseña. Se omite si la red es abierta.
          </li>
          <li>
            <code>H</code>: <code>true</code> si la red está oculta. Si no lo está, se puede omitir.
          </li>
        </ul>
        <p>
          La cadena termina con dos puntos y coma: uno cierra el último campo y el otro cierra la lista. Los
          lectores toleran que falte el segundo; ninguno tolera que falte el primero.
        </p>
      </section>

      <section>
        <h2>Los caracteres que rompen todo</h2>
        <p>
          El punto y coma separa campos, así que una contraseña con <code>;</code> dentro parte el código en
          dos y el móvil lee una contraseña corta. Lo mismo pasa con la coma, los dos puntos, la barra
          invertida y las comillas dobles. Se escapan poniendo una barra invertida delante:{" "}
          <code>clave\;rara</code>.
        </p>
        <p>
          El generador de esta web escapa esos cinco caracteres por ti, tanto en el nombre de la red como en la
          contraseña. Si montas el QR a mano, hazlo tú: es el error número uno.
        </p>
      </section>

      <section>
        <h2>Quién lo lee sin instalar nada</h2>
        <p>
          En iPhone, la cámara reconoce el código desde iOS 11 y ofrece unirse a la red con un toque. En Android
          depende de la versión y del fabricante: desde Android 10 lo resuelven la cámara y los ajustes
          rápidos; en versiones anteriores hace falta una aplicación de lector. Un cartel que funciona en tu
          móvil puede no funcionar en el de un cliente con un teléfono de hace seis años.
        </p>
      </section>

      <section>
        <h2>Por qué el tuyo no conecta</h2>
        <ul>
          <li>La red está oculta y el código no lleva <code>H:true</code>.</li>
          <li>La contraseña tiene un carácter especial sin escapar.</li>
          <li>
            El router usa solo WPA3 y el móvil es antiguo, o al contrario: el móvil es nuevo y el router está en
            un modo mixto que no negocia bien.
          </li>
          <li>
            La red es un portal cautivo: el QR une a la red, pero no acepta los términos por el invitado. Eso
            hay que hacerlo en una página web, no en el código.
          </li>
          <li>
            El nombre de la red lleva emoji o acentos. Van en UTF-8 y casi todo lo lee bien, pero un lector
            antiguo puede mostrarlo distinto y no encontrar la red.
          </li>
          <li>Está fuera de cobertura: el QR ahorra teclear, no amplía la señal.</li>
        </ul>
      </section>

      <section>
        <h2>La contraseña va en claro</h2>
        <p>
          Un QR de WiFi no cifra nada: quien lo ve, lo lee, y con una aplicación cualquiera saca la clave en un
          segundo. No lo pongas en la calle si no quieres que entre cualquiera. Si lo necesitas público, crea
          una red de invitados separada de la tuya, con aislamiento de clientes y un límite de velocidad, y
          cámbiale la contraseña de vez en cuando: el cartel viejo deja de servir sin que tengas que
          recogerlo.
        </p>
      </section>

      <section>
        <h2>Dónde pegarlo</h2>
        <p>
          A la altura de los ojos, sobre una superficie mate y con luz que no dé de frente. En un bar, junto a
          la barra y no en el cristal del escaparate. En un piso turístico, dentro y no en la puerta. Si se va a
          leer de pie a medio metro, imprímelo a 60 mm o más y deja el margen blanco alrededor.
        </p>
      </section>

      <section>
        <h2>La prueba con dos teléfonos</h2>
        <p>
          Antes de imprimir cincuenta, pruébalo con un iPhone y con un Android, con la red recién reiniciada y
          con el móvil de alguien que no seas tú. Y comprueba lo que casi nadie comprueba: que el invitado
          tiene internet de verdad, no solo conexión a la red.
        </p>
      </section>
    </Guide>
  );
}
