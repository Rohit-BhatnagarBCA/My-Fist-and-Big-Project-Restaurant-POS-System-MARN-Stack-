import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    orderId: "",
    customerName: "",
    customerPhone: "",
    guests: 0,
    table: null,
    // "Dine In" or "Packing" — decided when the order flow starts.
    orderType: "Dine In",
    // Set when the customer flow was started from "Add More Items" on an
    // already-placed order. When present, Bill.jsx appends the cart into
    // that order instead of creating a brand new one.
    existingOrderId: null
}


const customerSlice = createSlice({
    name : "customer",
    initialState,
    reducers : {
        setCustomer: (state, action) => {
            const { name, phone, guests, orderType, existingOrderId } = action.payload;
            state.orderId = `${Date.now()}`;
            state.customerName = name;
            state.customerPhone = phone;
            state.guests = guests;
            state.orderType = orderType || "Dine In";
            state.existingOrderId = existingOrderId || null;
        },

        removeCustomer: (state) => {
            state.customerName = "";
            state.customerPhone = "";
            state.guests = 0;
            state.table = null;
            state.orderType = "Dine In";
            state.existingOrderId = null;
        },

        updateTable: (state, action) => {
            state.table = action.payload.table;
        }

    }
})


export const { setCustomer, removeCustomer, updateTable } = customerSlice.actions;
export default customerSlice.reducer;