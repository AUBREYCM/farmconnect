import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Automatically attach token to every request if it exists
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const registerUser = (data) => API.post("/users/register", data);
export const loginUser = (data) => API.post("/users/login", data);
export const getUserProfile = () => API.get("/users/profile");

// Product endpoints
export const getAllProducts = () => API.get("/products");
export const getProductById = (id) => API.get(`/products/${id}`);
export const addProduct = (data) => API.post("/products", data);
export const updateProduct = (id, data) => API.put(`/products/${id}`, data);
export const deleteProduct = (id) => API.delete(`/products/${id}`);

// Order endpoints
export const placeOrder = (data) => API.post("/orders", data);
export const getMyOrders = () => API.get("/orders/my-orders");
export const getFarmerOrders = () => API.get("/orders/farmer-orders");
// Upload image to Cloudinary via backend
export const uploadProductImage = (formData) =>
  API.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export default API;
// Admin endpoints
export const getAllUsers = () => API.get("/users/all");
export const getPlatformStats = () => API.get("/users/stats");
export const getAllOrdersAdmin = () => API.get("/orders");
