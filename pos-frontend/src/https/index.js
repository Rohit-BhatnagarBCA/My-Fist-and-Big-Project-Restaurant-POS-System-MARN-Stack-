import { axiosWrapper } from "./axiosWrapper";

// API Endpoints

// Auth Endpoints
export const login = (data) => axiosWrapper.post("/api/user/login", data);
export const register = (data) => axiosWrapper.post("/api/user/register", data);
export const getUserData = () => axiosWrapper.get("/api/user");
export const logout = () => axiosWrapper.post("/api/user/logout");

// Registration Payment Endpoints (public — no account exists yet)
export const quoteRegistrationPrice = (data) =>
  axiosWrapper.post("/api/registration-payment/quote", data);
export const createRegistrationOrder = (data) =>
  axiosWrapper.post("/api/registration-payment/create-order", data);
export const verifyAndRegister = (data) =>
  axiosWrapper.post("/api/registration-payment/verify-and-register", data);

// Table Endpoints
export const addTable = (data) => axiosWrapper.post("/api/table/", data);
export const getTables = () => axiosWrapper.get("/api/table");
export const updateTable = ({ tableId, ...tableData }) =>
  axiosWrapper.put(`/api/table/${tableId}`, tableData);
export const deleteTable = (tableId) => axiosWrapper.delete(`/api/table/${tableId}`);

// Category Endpoints
export const addCategory = (data) => axiosWrapper.post("/api/category/", data);
export const getCategories = () => axiosWrapper.get("/api/category");
export const updateCategory = ({ categoryId, ...data }) =>
  axiosWrapper.put(`/api/category/${categoryId}`, data);
export const deleteCategory = (categoryId) =>
  axiosWrapper.delete(`/api/category/${categoryId}`);

// Dish Endpoints
export const addDish = (data) => axiosWrapper.post("/api/dish/", data);
export const getDishes = () => axiosWrapper.get("/api/dish");
export const updateDish = ({ dishId, ...data }) =>
  axiosWrapper.put(`/api/dish/${dishId}`, data);
export const deleteDish = (dishId) => axiosWrapper.delete(`/api/dish/${dishId}`);

// Payment Endpoints
export const createOrderRazorpay = (data) =>
  axiosWrapper.post("/api/payment/create-order", data);
export const verifyPaymentRazorpay = (data) =>
  axiosWrapper.post("/api/payment//verify-payment", data);

// Order Endpoints
export const addOrder = (data) => axiosWrapper.post("/api/order/", data);
export const addItemsToOrder = ({ orderId, items }) =>
  axiosWrapper.put(`/api/order/${orderId}/items`, { items });
export const getOrders = () => axiosWrapper.get("/api/order");
export const updateOrderStatus = ({ orderId, orderStatus }) =>
  axiosWrapper.put(`/api/order/${orderId}`, { orderStatus });
export const deleteCompletedOrders = () =>
  axiosWrapper.delete("/api/order/completed");