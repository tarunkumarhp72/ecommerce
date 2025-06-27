import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);

          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register/', userData),
  login: (credentials) => api.post('/auth/login/', credentials),
  getCurrentUser: () => api.get('/auth/profile/'),
  updateProfile: (userData) => api.patch('/auth/profile/', userData),
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};

// Products API
export const productsAPI = {
  getProducts: (params = {}) => api.get('/api/products/', { params }),
  getProduct: (id) => api.get(`/api/products/${id}/`),
  getCategories: () => api.get('/api/categories/'),
};

// Cart API
export const cartAPI = {
  getCart: () => api.get('/api/cart/current/'),
  addItem: (productId, quantity = 1) =>
    api.post('/api/cart/add_item/', { product_id: productId, quantity }),
  updateItem: (itemId, quantity) =>
    api.patch('/api/cart/update_item/', { item_id: itemId, quantity }),
  removeItem: (itemId) =>
    api.delete('/api/cart/remove_item/', { data: { item_id: itemId } }),
  clearCart: () => api.delete('/api/cart/clear/'),
};

// Orders API
export const ordersAPI = {
  getOrders: () => api.get('/api/orders/'),
  getOrder: (id) => api.get(`/api/orders/${id}/`),
  createOrder: (orderData) => api.post('/api/orders/create_order/', orderData),
  confirmPayment: (orderId, paymentIntentId) =>
    api.post(`/api/orders/${orderId}/confirm_payment/`, {
      payment_intent_id: paymentIntentId,
    }),
};

export default api;
