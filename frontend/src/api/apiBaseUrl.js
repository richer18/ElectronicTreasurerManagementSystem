const host =
  typeof window !== "undefined" && window.location?.hostname
    ? window.location.hostname
    : "127.0.0.1";

const fallbackApiBaseUrl = `http://${host}:8001/api/`;

export const API_BASE_URL =
  process.env.REACT_APP_API_URL || fallbackApiBaseUrl;
