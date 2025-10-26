import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true, // send cookies automatically
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    // You can attach additional headers here if needed
    // Example: config.headers["Authorization"] = `Bearer ${token}`
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      // Optional: handle logout or refresh token
      console.warn('User unauthorized. Might need refresh or logout');
    }

    return Promise.reject(error);
  },
);
