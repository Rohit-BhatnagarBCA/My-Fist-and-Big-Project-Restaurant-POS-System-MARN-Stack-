import { axiosWrapper } from "./axiosWrapper";

// ============================================================
// AUTH
// ============================================================

export const login = (data) =>
  axiosWrapper.post(
    "/api/user/login",
    data
  );

export const register = (data) =>
  axiosWrapper.post(
    "/api/user/register",
    data
  );

export const getUserData = () =>
  axiosWrapper.get("/api/user");

export const logout = () =>
  axiosWrapper.post(
    "/api/user/logout"
  );

// ============================================================
// SUBSCRIPTION
// ============================================================

export const createSubscriptionRequest =
  (data) =>
    axiosWrapper.post(
      "/api/subscription-request",
      data
    );

export const getMySubscriptionRequests =
  () =>
    axiosWrapper.get(
      "/api/subscription-request/my"
    );

// ============================================================
// SUPER ADMIN
// ============================================================

export const getAllSubscriptionRequests =
  () =>
    axiosWrapper.get(
      "/api/subscription-request/all"
    );

export const reviewSubscriptionRequest =
  ({
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

export const getAllUsers = () =>
  axiosWrapper.get(
    "/api/user/admin/users"
  );

export const updateUserSubscription =
  ({
    userId,
    isActive,
    expiryDate = null,
  }) =>
    axiosWrapper.patch(
      `/api/user/admin/users/${userId}/subscription`,
      {
        isActive,
        expiryDate,
      }
    );

// ============================================================
// TABLE
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
  ...data
}) =>
  axiosWrapper.put(
    `/api/table/${tableId}`,
    data
  );

export const deleteTable = (
  tableId
) =>
  axiosWrapper.delete(
    `/api/table/${tableId}`
  );

// ============================================================
// CATEGORY
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

export const deleteCategory = (
  categoryId
) =>
  axiosWrapper.delete(
    `/api/category/${categoryId}`
  );

// ============================================================
// DISH
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

export const deleteDish = (
  dishId
) =>
  axiosWrapper.delete(
    `/api/dish/${dishId}`
  );

// ============================================================
// ORDERS
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

export const deleteCompletedOrders =
  () =>
    axiosWrapper.delete(
      "/api/order/completed"
    );