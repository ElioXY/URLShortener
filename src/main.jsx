import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

const container = document.getElementById("root");

// Las páginas de contenido llegan pre-renderizadas desde el build. Se vacía el
// contenedor antes de montar para no hidratar un árbol que no coincide (el
// usuario de la sesión todavía no se conoce) y evitar los avisos de React.
container.replaceChildren();

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);
