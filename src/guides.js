// Registro de guías. Lo leen la portada, el pie y el router: si añades una
// guía aquí, aparece en los tres sitios a la vez.
export const GUIAS = [
  {
    path: "/guias/qr-tamano-real",
    kicker: "Guía 01 · QR",
    title: "QR a tamaño real: del archivo al papel",
    blurb:
      "Cuánto tiene que medir el código para leerse a la distancia a la que lo vas a poner, y por qué el SVG sale mejor que el PNG.",
  },
  {
    path: "/guias/elegir-slug",
    kicker: "Guía 02 · Enlaces",
    title: "Cómo elegir el final de un enlace corto",
    blurb:
      "Reglas del slug, criterios para que se recuerde y se dicte por teléfono, y cuándo conviene dejar que salga uno aleatorio.",
  },
  {
    path: "/guias/qr-wifi",
    kicker: "Guía 03 · QR",
    title: "QR para WiFi: el formato y los errores que lo rompen",
    blurb:
      "Cómo se escribe un QR de red, qué caracteres hay que escapar y por qué el tuyo conecta en un móvil y en otro no.",
  },
  {
    path: "/guias/caducidad-carteles",
    kicker: "Guía 04 · Carteles",
    title: "Carteles con fecha de caducidad",
    blurb:
      "Un QR impreso no se puede apagar: qué hace la caducidad aquí, cómo afecta el uso horario y cuándo conviene un enlace carcelero.",
  },
];

export const ACERCA = { path: "/acerca", title: "Acerca de elioxy links" };
