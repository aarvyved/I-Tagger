import axios from "axios";

const API_BASE_URL = "http://localhost:3001";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add X-User-Name header dynamically
api.interceptors.request.use((config) => {
  const username = localStorage.getItem("userName");
  if (username) {
    config.headers["X-User-Name"] = username;
  }
  return config;
});

export default api;
