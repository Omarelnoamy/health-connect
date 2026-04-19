const trimTrailingSlash = (value = "") => value.replace(/\/+$/, "");

/** Local dev default when REACT_APP_API_BASE_URL is unset (matches backend default port). */
const devApiBaseFallback =
  process.env.NODE_ENV !== "production" ? "http://localhost:3002" : "";

const env = {
  apiBaseUrl: trimTrailingSlash(
    process.env.REACT_APP_API_BASE_URL || devApiBaseFallback
  ),
  supabaseUrl: process.env.REACT_APP_SUPABASE_URL || "",
  supabaseAnonKey: process.env.REACT_APP_SUPABASE_ANON_KEY || "",
};

export default env;
