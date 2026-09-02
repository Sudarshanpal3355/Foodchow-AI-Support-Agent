import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the FoodChow JWT token to every authenticated request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("foodchow_auth_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle expired/invalid authentication tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || "";

      // Don't interfere with the login request itself
      if (!requestUrl.includes("/auth/login")) {
        localStorage.removeItem("foodchow_auth_token");
        localStorage.removeItem("foodchow_auth_user");

        // Notify the app that authentication has expired
        window.dispatchEvent(new Event("foodchow-auth-expired"));
      }
    }

    return Promise.reject(error);
  }
);

export default api;