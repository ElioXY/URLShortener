const MESSAGES = {
  invalid_url: "Ese enlace no parece válido. Prueba con algo como https://ejemplo.com",
  invalid_body: "No hemos podido leer los datos del formulario.",
  slug_invalid: "El slug debe tener entre 2 y 32 caracteres: letras, números, guiones o guiones bajos.",
  slug_taken: "Ese slug ya está en uso. Prueba con otro.",
  rate_limited: "Has creado muchos enlaces seguidos. Inténtalo de nuevo más tarde.",
  db_unavailable: "La base de datos no está disponible en este momento.",
  unauthorized: "Necesitas iniciar sesión con GitHub.",
  not_found: "No hemos encontrado ese enlace.",
  bad_origin: "La petición no venía de este sitio.",
  internal_error: "Algo ha fallado en el servidor. Inténtalo de nuevo.",
};

export class ApiError extends Error {
  constructor(code, status) {
    super(MESSAGES[code] || "Algo ha fallado. Inténtalo de nuevo.");
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

async function request(path, options = {}) {
  const response = await fetch(path, {
    credentials: "same-origin",
    ...options,
    headers: {
      ...(options.body ? { "content-type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });

  const type = response.headers.get("content-type") || "";
  const data = type.includes("application/json") ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    throw new ApiError(data?.error || "internal_error", response.status);
  }

  return data;
}

export const api = {
  me: () => request("/api/me"),
  list: () => request("/api/links"),
  create: (payload) => request("/api/links", { method: "POST", body: JSON.stringify(payload) }),
  history: (id, days) => request(`/api/links/${encodeURIComponent(id)}/history?days=${days}`),
  remove: (id) => request(`/api/links/${encodeURIComponent(id)}`, { method: "DELETE" }),
  logout: () => request("/auth/logout", { method: "POST" }),
};
