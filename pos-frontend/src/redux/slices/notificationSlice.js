import {
  createSlice,
} from "@reduxjs/toolkit";

const initialState = {
  activityCount: 0,
  unreadCount: 0,
  ordersUnread: 0,
};

const notificationSlice =
  createSlice({
    name: "notification",

    initialState,

    reducers: {
      // ========================================================
      // EXISTING ACTIVITY
      // ========================================================

      newActivity: (
        state
      ) => {
        state.activityCount +=
          1;
      },

      clearActivityCount: (
        state
      ) => {
        state.activityCount = 0;
      },

      // ========================================================
      // GENERAL NOTIFICATION COUNT
      // ========================================================

      setUnreadCount: (
        state,
        action
      ) => {
        state.unreadCount =
          Number(
            action.payload
          ) || 0;
      },

      clearUnreadCount: (
        state
      ) => {
        state.unreadCount = 0;
      },

      // ========================================================
      // ORDER NOTIFICATIONS
      // BottomNav.jsx currently expects this action.
      // ========================================================

      markOrdersRead: (
        state
      ) => {
        state.ordersUnread = 0;

        // Keep the old activity counter in sync too.
        state.activityCount = 0;
      },

      setOrdersUnread: (
        state,
        action
      ) => {
        state.ordersUnread =
          Number(
            action.payload
          ) || 0;
      },

      // ========================================================
      // CLEAR EVERYTHING
      // ========================================================

      clearAllNotifications: (
        state
      ) => {
        state.activityCount = 0;
        state.unreadCount = 0;
        state.ordersUnread = 0;
      },
    },
  });

export const {
  newActivity,
  clearActivityCount,

  setUnreadCount,
  clearUnreadCount,

  markOrdersRead,
  setOrdersUnread,

  clearAllNotifications,
} =
  notificationSlice.actions;

export default notificationSlice.reducer;