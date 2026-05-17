// Dynamically determine the backend URL based on the current hostname
// This allows seamless local network testing (e.g. 192.168.x.x)

const hostname = window.location.hostname;
const PORT = 5001;

export const SERVER_URL = hostname === 'localhost' 
  ? `http://localhost:${PORT}` 
  : `http://${hostname}:${PORT}`;

export const API_BASE_URL = `${SERVER_URL}/api`;
