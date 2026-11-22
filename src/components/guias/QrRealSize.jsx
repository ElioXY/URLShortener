import Guide from "../Guide.jsx";

export default function QrRealSize({ me }) {
  return (
    <Guide
      me={me}
      kicker="Guía 01 · QR"
      title="QR a tamaño real: del archivo al papel"
      lede="Un código QR no trae tamaño: lo pone el papel en el que se imprime. Lo que decide si se lee o no es cuánto mide cada cuadro del código y a qué distancia se acerca alguien a mirarlo. Esta guía va de eso: de las cuentas que conviene hacer antes de imprimir y de los errores que solo se ven cuando el cartel ya está pegado."
    >
      <section>
        <h2>El código no tiene tamaño; lo tiene el papel</h2>
        <p>
          Un QR es una rejilla de cuadros pequeños llamados módulos. El mismo código se puede poner en una
          pegatina de 2 cm y en una valla de 2 metros: lo que cambia es el tamaño de cada módulo. Ahí está el
          límite real. Cuando un módulo baja de unos 0,4 mm, las cámaras empiezan a confundir cuadros con
          manchas, sobre todo con poca luz o con el móvil en movimiento.
        </p>
        <p>
          Por eso «tamaño real» no significa nada por sí solo. Significa que el código tiene que medir lo
          suficiente para la distancia a la que se va a leer, y que esa medida tiene que estar impresa, no
          escalada después en un procesador de textos.
        </p>
      </section>

      <section>
        <h2>La regla que evita casi todos los fallos</h2>
        <p>
          Divide la distancia de lectura entre diez. El resultado es el lado mínimo del código, en la misma
          unidad. Un QR que se va a leer a 2 metros no debería bajar de 20 cm de lado. Y por debajo de 2 cm
          ningún código es cómodo, aunque esté a 10 cm de los ojos: el móvil necesita ver la rejilla completa y
          enfocada.
        </p>
        <table className="legal-table">
          <thead>
            <tr>
              <th scope="col">Dónde se lee</th>
              <th scope="col">Distancia</th>
              <th scope="col">Lado mínimo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Móvil en la mano</td>
              <td>20 cm</td>
              <td>2 cm</td>
            </tr>
            <tr>
              <td>Mostrador o mesa</td>
              <td>50 cm</td>
              <td>4 cm</td>
            </tr>
            <tr>
              <td>Pasillo o pared</td>
              <td>1 m</td>
              <td>10 cm</td>
            </tr>
            <tr>
              <td>Escaparate</td>
              <td>3 m</td>
              <td>30 cm</td>
            </tr>
            <tr>
              <td>Cartel de calle</td>
              <td>6 m</td>
              <td>60 cm</td>
            </tr>
          </tbody>
        </table>
        <p>
          Son mínimos, no objetivos. Un cartel de calle que se lee a 6 metros funciona mejor con 80 cm que con
          60, porque la gente no se acerca: apunta desde donde está.
        </p>
      </section>

      <section>
        <h2>Por qué el SVG y no el PNG</h2>
        <p>
          El PNG que descarga esta web mide 1024 píxeles de lado. A 40 mm eso son unos 650 puntos por pulgada;
          a 60 mm, 433; a 100 mm, 260. Todo eso sobra. El problema llega cuando el archivo se estira: a 30 cm
          de lado se queda en 86 puntos por pulgada y los bordes de cada módulo salen grises, que es justo lo
          que la cámara no sabe interpretar.
        </p>
        <p>
          El SVG no tiene píxeles: es una descripción de formas, y la impresora lo dibuja a su resolución. Da
          igual que la etiqueta sea de 4 cm o de un metro. Si el QR va a acabar en papel y lo va a componer una
          imprenta, manda el SVG.
        </p>
      </section>

      <section>
        <h2>La etiqueta del acortador</h2>
        <p>
          Las etiquetas de esta web salen en 40, 60 y 100 mm, con marcas de corte en las esquinas y el código
          en vectorial. Están pensadas para pegar en una puerta, un escaparate o una mesa, no para enviar a una
          imprenta offset, pero sirven para comprobar el tamaño en el sitio real antes de encargar nada. Si el
          enlace tiene fecha de caducidad, la etiqueta imprime debajo «Válido hasta …», que ahorra tener que
          explicarlo con un rotulador.
        </p>
      </section>

      <section>
        <h2>El margen que casi todo el mundo recorta</h2>
        <p>
          Alrededor del código tiene que quedar una zona blanca de al menos cuatro módulos. Es lo que el lector
          usa para saber dónde empieza el código. Si recortas justo por el borde negro, o lo pegas sobre un
          fondo oscuro, el escáner pierde el marco y no arranca.
        </p>
        <p>
          Tampoco lo imprimas en blanco sobre negro ni con colores claros: la mayoría de lectores esperan
          módulos oscuros sobre fondo claro. Un QR azul sobre amarillo puede funcionar; uno amarillo sobre
          blanco, no.
        </p>
      </section>

      <section>
        <h2>Cinco errores que arruinan una tirada</h2>
        <ul>
          <li>Escalar el PNG dentro de Word hasta ocupar media página: se pixela y se ve borroso al imprimir.</li>
          <li>Imprimir sobre papel brillante o plastificar con brillo: el reflejo tapa el código a plena luz.</li>
          <li>Ponerlo detrás de un cristal con el sol de frente, como pasa en la mitad de los escaparates.</li>
          <li>
            Tapar el centro con un logo. La corrección de errores aguanta una parte del código dañado, no un
            tercio del área.
          </li>
          <li>Girar o reflejar el código al montar el PDF: un QR en espejo no se lee nunca.</li>
        </ul>
      </section>

      <section>
        <h2>La prueba de los treinta segundos</h2>
        <p>
          Imprime una sola copia, pégala en el sitio real y escanéala a la distancia a la que la va a leer la
          gente, con la luz que habrá a esa hora y con un móvil que no sea el tuyo. Si falla ahí, fallará en
          las quinientas copias. Es la única comprobación que de verdad predice el resultado, y cuesta medio
          minuto.
        </p>
      </section>
    </Guide>
  );
}
