import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { PRERENDER_PAGES } from "../src/routes.js";

export const pages = PRERENDER_PAGES.map(({ path, title, description }) => ({ path, title, description }));

export function renderHtml(route) {
  const page = PRERENDER_PAGES.find((item) => item.path === route);
  if (!page) throw new Error(`ruta sin página pre-renderizable: ${route}`);
  return renderToString(createElement(page.Component, { me: null }));
}
