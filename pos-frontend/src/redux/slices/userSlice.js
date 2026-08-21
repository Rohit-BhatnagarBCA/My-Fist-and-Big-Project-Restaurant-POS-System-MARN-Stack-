import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  _id: "",
  name: "",
  email: "",
  phone: "",
  role: "",

  restaurantId: null,
  restaurant: null,

  subscription: null,

  isAuth: false,
};

const userSlice =
  createSlice({
    name: "user",

    initialState,

    reducers: {
      setUser: (
        state,
        action
      ) => {
        const {
          _id,
          name,
          phone,
          email,
          role,

          restaurantId,
          restaurant,

          subscription,
        } = action.payload;

        state._id =
          _id;

        state.name =
          name;

        state.phone =
          phone;

        state.email =
          email;

        state.role =
          role;

        state.restaurantId =
          restaurantId ||
          restaurant?._id ||
          null;

        state.restaurant =
          restaurant ||
          null;

        state.subscription =
          subscription ||
          null;

        state.isAuth =
          true;
      },

      removeUser: (
        state
      ) => {
        state._id = "";
        state.email = "";
        state.name = "";
        state.phone = "";
        state.role = "";

        state.restaurantId =
          null;

        state.restaurant =
          null;

        state.subscription =
          null;

        state.isAuth =
          false;
      },
    },
  });

export const {
  setUser,
  removeUser,
} =
  userSlice.actions;

export default userSlice.reducer;