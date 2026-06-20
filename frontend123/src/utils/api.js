import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://glowup-ai-3.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("glowup_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("glowup_token");
      localStorage.removeItem("glowup_user");
    }

    return Promise.reject(error);
  }
);

export const warmUpBackend = async () => {
  try {
    await fetch(`${API_URL}/health`);
  } catch (err) {
    console.log("Backend warmup failed");
  }
};

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
};

export const faceAPI = {
  analyze: (imageBase64, mediaType = "image/jpeg", extra = {}) =>
    api.post("/face/analyze", {
      imageBase64,
      mediaType,
      ...extra,
    }),
  history: () => api.get("/face/history"),
};

export const fitnessAPI = {
  plan: (data) => api.post("/fitness/plan", data),
  history: () => api.get("/fitness/history"),
};

export const fashionAPI = {
  analyze: (data) => api.post("/fashion/analyze", data),
  history: () => api.get("/fashion/history"),
};

export const skinAPI = {
  analyze: (data) => api.post("/skin/analyze", data),
};

export const chatAPI = {
  message: (message, history = []) =>
    api.post("/chat/message", {
      message,
      history,
    }),
};

export const userAPI = {
  profile: () => api.get("/user/profile"),
  updateProfile: (data) => api.put("/user/profile", data),
};

export const paymentAPI = {
  createOrder: (data) => api.post("/payment/create-order", data),
  verify: (data) => api.post("/payment/verify", data),
};

export default api;