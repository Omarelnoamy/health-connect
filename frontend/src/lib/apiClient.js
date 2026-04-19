import env from "../config/env";

/** Base URL from `process.env.REACT_APP_API_BASE_URL` (see `src/config/env.js` for dev fallback). */
export const API_BASE_URL = env.apiBaseUrl || "";

let warnedSameOriginPort = false;

export const getApiBaseUrl = () => {
  if (
    !warnedSameOriginPort &&
    typeof window !== "undefined" &&
    process.env.NODE_ENV !== "production" &&
    API_BASE_URL
  ) {
    try {
      const baseUrl = new URL(API_BASE_URL);
      const loc = window.location;
      if (baseUrl.hostname === loc.hostname) {
        const basePort = baseUrl.port || (baseUrl.protocol === "https:" ? "443" : "80");
        const pagePort = loc.port || (loc.protocol === "https:" ? "443" : "80");
        if (String(basePort) === String(pagePort)) {
          warnedSameOriginPort = true;
          console.warn(
            "[apiClient] REACT_APP_API_BASE_URL uses the same host:port as this React app. " +
              "Requests will hit the dev server (404 / HTML), not the Express API. " +
              "Use a different PORT for CRA (e.g. PORT=3003 in frontend/.env) and keep the API on 3002, " +
              "or run the API on another port."
          );
        }
      }
    } catch (_e) {
      /* ignore invalid API_BASE_URL */
    }
  }
  return API_BASE_URL;
};

export const toApiUrl = (path) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const baseUrl = getApiBaseUrl();
  return baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath;
};

/**
 * Parse JSON from a fetch Response. Avoids SyntaxError when the server returns HTML (wrong port / 404 page).
 */
export async function parseJsonResponse(res, label = "API") {
  const text = await res.text();
  const snippet = text.slice(0, 240);
  if (!res.ok) {
    console.error(`[${label}] HTTP ${res.status}`, snippet);
    throw new Error(`${label}: HTTP ${res.status}`);
  }
  const trimmed = text.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
    console.error(
      `[${label}] expected JSON, got ${res.headers.get("content-type") || "unknown content-type"}`,
      snippet
    );
    throw new Error(`${label}: response was not JSON`);
  }
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error(`[${label}] JSON.parse failed`, snippet);
    throw err;
  }
}

export async function fetchJson(path, init) {
  const res = await fetch(toApiUrl(path), init);
  return parseJsonResponse(res, path);
}
