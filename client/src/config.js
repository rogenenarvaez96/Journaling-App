// Dynamically determine the backend URL based on the current environment.
// In production, Vite sets import.meta.env.PROD to true.
// By using an empty string in production, Axios will natively send requests to `/api` 
// on the same domain, which NGINX will cleanly reverse-proxy to the backend.

const hostname = window.location.hostname;
const PORT = 5001;

export const SERVER_URL = import.meta.env.PROD 
  ? '' // Production: rely on relative paths and NGINX proxy
  : (hostname === 'localhost' ? `http://localhost:${PORT}` : `http://${hostname}:${PORT}`); // Local network dev

export const API_BASE_URL = `${SERVER_URL}/api`;
