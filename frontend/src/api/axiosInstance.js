import axios from "axios";
import { API_BASE_URL } from "./apiBaseUrl";
import { clearAuthStorage } from "../auth/authStorage";

const APP_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

function getCookieValue(name) {
  if (typeof document === "undefined") {
    return null;
  }

  const prefix = `${name}=`;
  const entry = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));

  if (!entry) {
    return null;
  }

  return decodeURIComponent(entry.slice(prefix.length));
}

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

export function ensureCsrfCookie() {
  return axios.get(`${APP_BASE_URL}/sanctum/csrf-cookie`, {
    withCredentials: true,
    withXSRFToken: true,
  });
}

axiosInstance.interceptors.request.use((config) => {
  const method = String(config.method || "get").toLowerCase();
  const csrfToken = getCookieValue("XSRF-TOKEN");

  config.headers = config.headers || {};
  config.headers["X-Requested-With"] = "XMLHttpRequest";

  if (csrfToken && ["post", "put", "patch", "delete"].includes(method)) {
    config.headers["X-XSRF-TOKEN"] = csrfToken;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = String(error?.config?.url || "");
    const normalizedUrl = requestUrl.replace(/^https?:\/\/[^/]+\//, "");
    const isAuthSessionRequest =
      normalizedUrl === "api/user" ||
      normalizedUrl === "user" ||
      normalizedUrl === "api/logout" ||
      normalizedUrl === "logout";

    if (status === 401 && isAuthSessionRequest) {
      clearAuthStorage();

      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/login"
      ) {
        window.location.assign("/login");
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
