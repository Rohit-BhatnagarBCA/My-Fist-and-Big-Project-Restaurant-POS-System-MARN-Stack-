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
  axiosWrapper.get(
    "/api/user"
  );

export const logout = () =>
  axiosWrapper.post(
    "/api/user/logout"
  );

// ============================================================
// RESTAURANT
// ============================================================

export const createRestaurant = (
  data
) =>
  axiosWrapper.post(
    "/api/restaurant",
    data
  );

export const getMyRestaurant = () =>
  axiosWrapper.get(
    "/api/restaurant/my"
  );

export const updateMyRestaurant = (
  data
) =>
  axiosWrapper.patch(
    "/api/restaurant/my",
    data
  );

// ============================================================
// RESTAURANT — SUPER ADMIN
// ============================================================

export const getAllRestaurants = () =>
  axiosWrapper.get(
    "/api/restaurant/admin/all"
  );

export const getRestaurantById = (
  restaurantId
) =>
  axiosWrapper.get(
    `/api/restaurant/admin/${restaurantId}`
  );

export const updateRestaurantStatus = ({
  restaurantId,
  status,
}) =>
  axiosWrapper.patch(
    `/api/restaurant/admin/${restaurantId}/status`,
    {
      status,
    }
  );

// ============================================================
// STAFF
// ============================================================

export const createStaff = (
  data
) =>
  axiosWrapper.post(
    "/api/user/staff",
    data
  );

export const getMyStaff = () =>
  axiosWrapper.get(
    "/api/user/staff"
  );

export const updateStaff = ({
  staffId,
  ...data
}) =>
  axiosWrapper.patch(
    `/api/user/staff/${staffId}`,
    data
  );

export const deleteStaff = (
  staffId
) =>
  axiosWrapper.delete(
    `/api/user/staff/${staffId}`
  );

// ============================================================
// SUPER ADMIN — USERS
// ============================================================

export const getAllUsers = () =>
  axiosWrapper.get(
    "/api/user/admin/users"
  );

export const updateUserSubscription = ({
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
// SUBSCRIPTION REQUESTS
// ============================================================

export const createSubscriptionRequest = (
  data
) =>
  axiosWrapper.post(
    "/api/subscription-request",
    data
  );

export const getMySubscriptionRequests =
  () =>
    axiosWrapper.get(
      "/api/subscription-request/my"
    );

export const getAllSubscriptionRequests =
  () =>
    axiosWrapper.get(
      "/api/subscription-request/all"
    );

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
// TABLE
// ============================================================

export const addTable = (
  data
) =>
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

export const deleteTable = (
  tableId
) =>
  axiosWrapper.delete(
    `/api/table/${tableId}`
  );

// ============================================================
// CATEGORY
// ============================================================

export const addCategory = (
  data
) =>
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

export const addDish = (
  data
) =>
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

export const addOrder = (
  data
) =>
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
    {
      items,
    }
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
    {
      orderStatus,
    }
  );

export const deleteCompletedOrders =
  () =>
    axiosWrapper.delete(
      "/api/order/completed"
    );

    // ============================================================
// MY PROFILE
// Works even without subscription.
// ============================================================

export const getMyProfile =
  () =>
    axiosWrapper.get(
      "/api/user/profile"
    );

export const updateMyProfile =
  (data) =>
    axiosWrapper.patch(
      "/api/user/profile",
      data
    );

export const changePassword =
  (data) =>
    axiosWrapper.patch(
      "/api/user/password",
      data
    );