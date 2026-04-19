export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // Asegurarse de que headers sea un objeto
  const headers = new Headers(options.headers || {});

  // Extraer el token de localStorage
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  // Realizar el fetch normal
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Si da 401 (Unauthorized) o 403 (Forbidden), limpiar sesión y redirigir
  if ((response.status === 401 || response.status === 403) && typeof window !== "undefined") {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/auth/login";
  }

  return response;
}
