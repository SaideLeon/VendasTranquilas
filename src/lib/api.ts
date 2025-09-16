import axios from "axios";

const api = axios.create({
  baseURL: "/api",
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

// Interceptador de Resposta para Erros
api.interceptors.response.use(
  (response) => response, // Retorna a resposta em caso de sucesso
  (error) => {
    // Verifica se o erro tem uma resposta da API com a propriedade 'error' no body
    if (error.response && error.response.data && error.response.data.error) {
      // Rejeita a promise com a mensagem de erro específica da API
      return Promise.reject(new Error(error.response.data.error));
    }
    // Para outros tipos de erro, rejeita com o erro original
    return Promise.reject(error);
  }
);

export default api;
