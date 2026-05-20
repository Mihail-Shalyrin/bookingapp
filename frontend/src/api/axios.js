import axios from "axios";

const BASE_URL = "http://localhost:8080";

const api = axios.create({
  baseURL: BASE_URL,
});

// добавляем accessToken к каждому запросу
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// при 401/403 пробуем обновить токен и повторить запрос
let isRefreshing = false;
let queue = [];

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    // защита: не пытаемся рефрешить сам запрос на refresh
    // const isRefreshCall = original?.url?.includes("/api/auth/refresh");
const isAuthCall = original?.url?.includes("/api/auth/");

    // рефреш только при 401 (Spring Security иногда отдаёт 403, поэтому ловим оба)
    // const shouldRefresh = (status === 401 || status === 403)
    //                     && !original._retry
    //                     && !isRefreshCall;
const shouldRefresh = (status === 401 || status === 403)
                    && !original._retry
                    && !isAuthCall
    if (shouldRefresh) {
      original._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      // если уже идёт рефреш — ждём его завершения и повторяем запрос
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({
            resolve: (newToken) => {
              original.headers.Authorization = `Bearer ${newToken}`;
              resolve(api(original));
            },
            reject,
          });
        });
      }

      isRefreshing = true;
      try {
        const { data } = await axios.post(
          `${BASE_URL}/api/auth/refresh`,
          { refreshToken }
        );

        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);

        // выполняем все запросы, которые ждали обновления токена
        queue.forEach((cb) => cb.resolve(data.accessToken));
        queue = [];

        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (e) {
        // рефреш не удался — отклоняем ожидающие запросы и редиректим
        queue.forEach((cb) => cb.reject(e));
        queue = [];
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;