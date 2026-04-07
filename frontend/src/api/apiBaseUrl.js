const runtimeHost =
  typeof window !== "undefined" && window.location?.hostname
    ? window.location.hostname
    : "127.0.0.1";

const fallbackApiBaseUrl = `http://${runtimeHost}:8001/api/`;
const configuredApiBaseUrl = process.env.REACT_APP_API_URL || "";

const shouldUseRuntimeHost =
  runtimeHost === "localhost" || runtimeHost === "127.0.0.1";

export const API_BASE_URL =
  shouldUseRuntimeHost || !configuredApiBaseUrl
    ? fallbackApiBaseUrl
    : configuredApiBaseUrl;
