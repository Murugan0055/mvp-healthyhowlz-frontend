import axios from "axios";

// Create an axios instance with base configuration
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "https://mvp-healthyhowlz-backend.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add token to all requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("token");

    if (token) {
      // Add Authorization header with Bearer token
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle auth errors globally
api.interceptors.response.use(
  (response) => {
    // If response is successful, just return it
    return response;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      const { status, data } = error.response;

      // Handle 401 Unauthorized errors
      if (status === 401) {
        // Token expired or invalid
        console.error("Authentication failed:", data.error);

        // Clear localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Redirect to login page
        window.location.href = "/login";
      }

      // Handle 403 Forbidden errors
      if (status === 403) {
        console.error("Access forbidden:", data.error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
