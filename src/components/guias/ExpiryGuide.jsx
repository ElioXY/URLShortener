import Guide from "../Guide.jsx";

export default function ExpiryGuide({ me }) {
  return (
    <Guide
      me={me}
      kicker="Guía 04 · Carteles"
      title="Carteles con fecha de caducidad"
      lede="Un QR impreso no se puede editar. Cuando el cartel ya está pegado en una puerta, la única forma de apagarlo es que el servidor deje de redirigir. Aquí está cómo funciona esa fecha, dónde está la trampa del uso horario y cuándo conviene un enlace que no caduque nunca."
    >
      <section>
        <h2>El problema</h2>
        <p>
          Una promoción termina el domingo, el menú cambia en enero, el piso turístico cierra en octubre. El
          cartel sigue en la pared y el QR sigue funcionando, apuntando a algo que ya no existe o que ya no
          debería estar ahí. Recoger el papel es lo único que lo apaga de verdad, y casi nunca se hace a
          tiempo.
        </p>
      </section>

      <section>
        <h2>Qué hace la caducidad aquí</h2>
        <p>
          Al crear o editar un enlace puedes ponerle una fecha. El enlace funciona hasta el final de ese día y
          después deja de redirigir: quien lo abra verá una página 410 que explica que caducó y le ofrece crear
          uno nuevo. No se borra el enlace, ni sus clics, ni su histórico, y puedes quitar la fecha cuando
          quieras para volver a activarlo.
        </p>
      </section>

      <section>
        <h2>La trampa del uso horario</h2>
        <p>
          Las fechas se guardan en UTC, y los clics también se agrupan por día UTC. En España peninsular, el
          final del 30 de junio en UTC son las 01:59 del 1 de julio en horario de verano, y las 00:59 en
          invierno. Un cartel que dice «hasta el 30» sigue vivo casi dos horas más de lo que sugiere.
        </p>
        <p>
          Si el evento termina a medianoche, pon la fecha del día siguiente. Si el cartel se va a leer en
          Canarias, hay una hora más de diferencia con la península que también conviene tener en cuenta.
        </p>
      </section>

      <section>
        <h2>Pausar no es caducar</h2>
        <p>
          Pausar un enlace es un interruptor reversible: deja de redirigir al instante y vuelve cuando lo
          activas. La caducidad está pensada para fechas que ya conoces de antemano. Si dudas de si vas a
          necesitarlo otra vez, pausa: no hay que rehacer nada.
        </p>
      </section>

      <section>
        <h2>El enlace carcelero</h2>
        <p>
          Si ya has impreso, no caduques: cambia el destino. Un enlace corto estable que apunta al sitio de este
          mes, y que editas cuando toca, es mejor que un cartel que hay que retirar cada temporada. El QR no
          cambia nunca; lo que hay detrás, sí. Es la misma idea que un número de teléfono fijo: la extensión se
          cambia sin cambiar el número.
        </p>
      </section>

      <section>
        <h2>Un plan de retirada</h2>
        <ul>
          <li>Anota la fecha de caducidad en el calendario el día anterior, no el mismo día.</li>
          <li>Revisa los carteles físicos: la caducidad apaga el enlace, no recoge el papel.</li>
          <li>Si el destino deja de tener sentido antes de la fecha, pausa el enlace: es inmediato.</li>
          <li>
            La página de caducidad ya ofrece volver al inicio, para que quien llegue tarde no se quede en una
            pared.
          </li>
        </ul>
      </section>

      <section>
        <h2>Cuándo no hace falta caducidad</h2>
        <p>
          Para un menú que cambia cada temporada, el enlace carcelero gana: los QR de las mesas siguen
          sirviendo. La caducidad tiene sentido en promociones con fecha legal, eventos de un día y carteles que
          no vas a poder recoger.
        </p>
      </section>
    </Guide>
  );
}
