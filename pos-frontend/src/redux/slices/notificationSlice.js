import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // True whenever something happened (new order, order ready, table
  // freed) that the person hasn't looked at Orders for yet.
  hasUnread: false,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    newActivity: (state) => {
      state.hasUnread = true;
    },
    markOrdersRead: (state) => {
      state.hasUnread = false;
    },
  },
});

export const { newActivity, markOrdersRead } = notificationSlice.actions;
export default notificationSlice.reducer;