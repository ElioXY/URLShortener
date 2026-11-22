import Guide from "../Guide.jsx";

export default function SlugGuide({ me }) {
  return (
    <Guide
      me={me}
      kicker="Guía 02 · Enlaces"
      title="Cómo elegir el final de un enlace corto"
      lede="El slug es la única parte del enlace que alguien va a recordar, dictar o teclear a mano. Elegirlo bien cuesta diez segundos y evita reimprimir carteles, repetir enlaces por teléfono y tener que explicar qué era «x7k2m9p»."
    >
      <section>
        <h2>Qué es el slug y qué reglas tiene aquí</h2>
        <p>
          En <code>url.elioxy.us.ci/mi-cafe</code>, el slug es <code>mi-cafe</code>. En este acortador tiene
          que tener entre 2 y 32 caracteres, solo minúsculas, números, guiones y guiones bajos. Se pasa a
          minúsculas automáticamente, así que da igual cómo lo escribas. Y no puede coincidir con una ruta del
          propio sitio: <code>panel</code>, <code>qr</code>, <code>api</code>, <code>guias</code> y unas cuantas
          más están reservadas.
        </p>
      </section>

      <section>
        <h2>Tres criterios: corto, dictable, duradero</h2>
        <ul>
          <li>
            <strong>Corto.</strong> Cada carácter se teclea y se copia mal. <code>mi-cafe</code> gana a{" "}
            <code>la-cafeteria-de-la-esquina-del-sol</code>, aunque el segundo diga más.
          </li>
          <li>
            <strong>Dictable.</strong> Por teléfono se confunden la <code>0</code> con la <code>o</code>, la{" "}
            <code>1</code> con la <code>l</code> y el guion con el guion bajo. Evita esas parejas si el enlace
            va a viajar de voz.
          </li>
          <li>
            <strong>Duradero.</strong> Nada de fechas ni versiones: lo que hoy es cierto, en enero es un cartel
            que hay que reimprimir.
          </li>
        </ul>
      </section>

      <section>
        <h2>Lo que envejece mal</h2>
        <table className="legal-table">
          <thead>
            <tr>
              <th scope="col">Slug</th>
              <th scope="col">Mejor</th>
              <th scope="col">Por qué</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>menu-2026</code>
              </td>
              <td>
                <code>menu</code>
              </td>
              <td>En enero hay que reimprimir todos los QR.</td>
            </tr>
            <tr>
              <td>
                <code>oferta-black-friday</code>
              </td>
              <td>
                <code>ofertas</code>
              </td>
              <td>El enlace sirve todo el año y el destino se cambia cuando toca.</td>
            </tr>
            <tr>
              <td>
                <code>cv-v3-final</code>
              </td>
              <td>
                <code>cv</code>
              </td>
              <td>A quien lo abre le da igual la versión; solo quiere el CV.</td>
            </tr>
            <tr>
              <td>
                <code>mi_cafe</code>
              </td>
              <td>
                <code>mi-cafe</code>
              </td>
              <td>El guion se lee mejor en una URL y se dicta igual.</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>Un slug por canal, un solo destino</h2>
        <p>
          Puedes crear varios enlaces que apunten al mismo sitio y repartirlos: <code>cartel</code> en el QR de
          la puerta, <code>instagram</code> en la biografía, <code>whatsapp</code> en los mensajes. En el panel
          verás los clics de cada uno por separado, y sabrás qué canal funciona sin instalar ninguna herramienta
          de analítica. El destino es el mismo; lo que cambia es por dónde llega la gente.
        </p>
      </section>

      <section>
        <h2>Cuándo dejar que salga aleatorio</h2>
        <p>
          Si no vas a dictar el enlace ni a imprimirlo, deja el que sale solo. Son siete caracteres de un
          alfabeto al que le faltan la <code>0</code>, la <code>1</code>, la <code>l</code> y la{" "}
          <code>o</code> justo para que nadie se equivoque al copiarlo. Para compartir una vez y olvidarse, es
          lo más rápido y lo más difícil de adivinar.
        </p>
      </section>

      <section>
        <h2>Renombrar rompe lo que ya está impreso</h2>
        <p>
          Cambiar el slug de un enlace que ya está en un cartel deja el QR apuntando a una dirección que ya no
          existe: quien lo escanee verá un 404. Si el enlace ya está en papel, no lo renombres. Crea uno nuevo y
          deja el viejo, o mejor, cambia el destino del viejo: para eso está.
        </p>
      </section>

      <section>
        <h2>Colisiones y suplantación</h2>
        <p>
          Si el slug ya está ocupado, la API responde <code>slug_taken</code> y no crea nada; prueba otro. Y no
          uses el nombre de una marca que no es tuya ni el de otra persona: esos enlaces se pueden desactivar
          sin aviso, y con razón.
        </p>
      </section>
    </Guide>
  );
}
