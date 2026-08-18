import { axiosWrapper } from "./axiosWrapper";

// ============================================================
// AUTH ENDPOINTS
// ============================================================

export const login = (data) =>
  axiosWrapper.post("/api/user/login", data);

export const register = (data) =>
  axiosWrapper.post("/api/user/register", data);

export const getUserData = () =>
  axiosWrapper.get("/api/user");

export const logout = () =>
  axiosWrapper.post("/api/user/logout");


// ============================================================
// REGISTRATION PAYMENT ENDPOINTS
// ============================================================

export const quoteRegistrationPrice = (data) =>
  axiosWrapper.post(
    "/api/registration-payment/quote",
    data
  );

export const createRegistrationOrder = (data) =>
  axiosWrapper.post(
    "/api/registration-payment/create-order",
    data
  );

export const verifyAndRegister = (data) =>
  axiosWrapper.post(
    "/api/registration-payment/verify-and-register",
    data
  );


// ============================================================
// SUBSCRIPTION PAYMENT ENDPOINTS
// ============================================================

// Admin creates Razorpay subscription order
export const createSubscriptionOrder = (data) =>
  axiosWrapper.post(
    "/api/subscription/create-order",
    data
  );

// Verify Razorpay payment and activate subscription
export const verifySubscriptionPayment = (data) =>
  axiosWrapper.post(
    "/api/subscription/verify-payment",
    data
  );


// ============================================================
// SUBSCRIPTION REQUEST ENDPOINTS
// ============================================================

// User submits payment reference after manually paying.
export const createSubscriptionRequest = (data) =>
  axiosWrapper.post(
    "/api/subscription-request",
    data
  );

// User can see his previous requests.
export const getMySubscriptionRequests = () =>
  axiosWrapper.get(
    "/api/subscription-request/my"
  );

// Admin: get all subscription requests.
export const getAllSubscriptionRequests = () =>
  axiosWrapper.get(
    "/api/subscription-request/all"
  );

// Admin: approve / reject a request.
export const reviewSubscriptionRequest = ({
  requestId,
  status,
  rejectionReason = "",
}) =>
  axiosWrapper.patch(
    `/api/subscription-request/${requestId}/review`,
    {
      status,
      rejectionReason,
    }
  );


// ============================================================
// TABLE ENDPOINTS
// ============================================================

export const addTable = (data) =>
  axiosWrapper.post(
    "/api/table/",
    data
  );

export const getTables = () =>
  axiosWrapper.get(
    "/api/table"
  );

export const updateTable = ({
  tableId,
  ...tableData
}) =>
  axiosWrapper.put(
    `/api/table/${tableId}`,
    tableData
  );

export const deleteTable = (tableId) =>
  axiosWrapper.delete(
    `/api/table/${tableId}`
  );


// ============================================================
// CATEGORY ENDPOINTS
// ============================================================

export const addCategory = (data) =>
  axiosWrapper.post(
    "/api/category/",
    data
  );

export const getCategories = () =>
  axiosWrapper.get(
    "/api/category"
  );

export const updateCategory = ({
  categoryId,
  ...data
}) =>
  axiosWrapper.put(
    `/api/category/${categoryId}`,
    data
  );

export const deleteCategory = (categoryId) =>
  axiosWrapper.delete(
    `/api/category/${categoryId}`
  );


// ============================================================
// DISH ENDPOINTS
// ============================================================

export const addDish = (data) =>
  axiosWrapper.post(
    "/api/dish/",
    data
  );

export const getDishes = () =>
  axiosWrapper.get(
    "/api/dish"
  );

export const updateDish = ({
  dishId,
  ...data
}) =>
  axiosWrapper.put(
    `/api/dish/${dishId}`,
    data
  );

export const deleteDish = (dishId) =>
  axiosWrapper.delete(
    `/api/dish/${dishId}`
  );


// ============================================================
// ORDER ENDPOINTS
// ============================================================

export const addOrder = (data) =>
  axiosWrapper.post(
    "/api/order/",
    data
  );

export const addItemsToOrder = ({
  orderId,
  items,
}) =>
  axiosWrapper.put(
    `/api/order/${orderId}/items`,
    { items }
  );

export const getOrders = () =>
  axiosWrapper.get(
    "/api/order"
  );

export const updateOrderStatus = ({
  orderId,
  orderStatus,
}) =>
  axiosWrapper.put(
    `/api/order/${orderId}`,
    { orderStatus }
  );

export const deleteCompletedOrders = () =>
  axiosWrapper.delete(
    "/api/order/completed"
  );