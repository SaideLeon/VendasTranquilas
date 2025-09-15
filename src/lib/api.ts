import axios from "axios";

const api = axios.create({
  baseURL: "https://sigef.cognick.qzz.io/api",
  headers: { "Content-Type": "application/json" },
});

// Interceptador: injeta o token JWT armazenado no localStorage
api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
