import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { FaCheckDouble } from "react-icons/fa";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { updateOrderStatus, updateTable } from "../../https/index";
import { formatDateAndTime, getAvatarName } from "../../utils/index";

const labelFont = "font-['Space_Mono',_monospace]";

const ConfirmDialog = ({ title, message, onConfirm, onCancel, isLoading }) => (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[70] px-4">
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 8 }}
      transition={{ duration: 0.2 }}
      className="bg-[#1B222B] p-6 rounded-2xl shadow-xl w-full max-w-sm"
    >
      <h3 className="text-[#F3EEE3] text-lg font-semibold mb-2">{title}</h3>
      <p className="text-[#7d8797] text-sm mb-6">{message}</p>
      <div className="flex items-center gap-3">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-[#7d8797] hover:text-[#F3EEE3] border border-[#2a323d] hover:border-[#3a4350] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors ${
            isLoading
              ? "bg-[#3a3f47] text-[#7d8797] cursor-not-allowed"
              : "bg-[#BD5D31] text-[#F3EEE3] hover:bg-[#a34f27]"
          }`}
        >
          {isLoading ? "Freeing..." : "Free Table"}
        </button>
      </div>
    </motion.div>
  </div>
);

const OrderDetailsModal = ({ order, onClose }) => {
  const queryClient = useQueryClient();
  const [confirmFree, setConfirmFree] = useState(false);

  const isReady = order.orderStatus === "Ready";
  const hasTable = Boolean(order.table);
  const tableIsBooked = hasTable && order.table.status !== "Available";

  const statusMutation = useMutation({
    mutationFn: (orderStatus) =>
      updateOrderStatus({ orderId: order._id, orderStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      enqueueSnackbar("Order marked as Ready!", { variant: "success" });
    },
    onError: () => {
      enqueueSnackbar("Failed to update order status!", { variant: "error" });
    },
  });

  const freeTableMutation = useMutation({
    mutationFn: (tableId) =>
      updateTable({ tableId, status: "Available", orderId: null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      enqueueSnackbar("Table marked as available!", { variant: "success" });
      setConfirmFree(false);
    },
    onError: (error) => {
      enqueueSnackbar(
        error?.response?.data?.message || "Failed to free the table!",
        { variant: "error" }
      );
      setConfirmFree(false);
    },
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 16 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="w-full max-w-md max-h-[88vh] overflow-y-auto scrollbar-hide"
      >
        {/* torn top edge */}
        <div
          className="h-2"
          style={{
            backgroundImage:
              "linear-gradient(135deg, transparent 50%, #F3EEE3 50%), linear-gradient(-135deg, transparent 50%, #F3EEE3 50%)",
            backgroundPosition: "top left",
            backgroundSize: "16px 16px",
            backgroundRepeat: "repeat-x",
          }}
        />

        <div className="bg-[#F3EEE3] px-6 sm:px-8 py-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className={`${labelFont} text-[10px] tracking-widest text-[#BD5D31] mb-1`}>
                ORDER RECEIPT
              </p>
              <h2 className="text-xl font-bold text-[#2A241D]">
                #{Math.floor(new Date(order.orderDate).getTime())}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-[#8a806c] hover:text-[#BD5D31] transition-colors"
            >
              <IoMdClose size={22} />
            </button>
          </div>

          <p className="text-xs text-[#8a806c] mb-4">
            {formatDateAndTime(order.orderDate)}
          </p>

          {/* dashed divider */}
          <div
            className="h-px w-full mb-4"
            style={{
              backgroundImage:
                "linear-gradient(to right, #C9BFAC 50%, transparent 0%)",
              backgroundSize: "8px 1px",
              backgroundRepeat: "repeat-x",
            }}
          />

          {/* Customer + table */}
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-[#BD5D31] text-[#F3EEE3] w-10 h-10 flex items-center justify-center rounded-lg font-bold shrink-0">
              {getAvatarName(order.customerDetails.name)}
            </div>
            <div className="min-w-0">
              <p className="text-[#2A241D] font-semibold truncate">
                {order.customerDetails.name}
              </p>
              <p className="text-xs text-[#8a806c]">
                Table {order.table?.tableNo ?? "N/A"} · Dine in
              </p>
            </div>
          </div>

          {/* Items list, receipt style with dotted leaders */}
          <p className={`${labelFont} text-[10px] tracking-widest text-[#8a806c] mb-2`}>
            ITEMS
          </p>
          <div className="space-y-2 mb-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-baseline gap-2">
                <span className="text-sm text-[#2A241D] shrink-0">
                  {item.name} <span className="text-[#8a806c]">x{item.quantity}</span>
                </span>
                <span className="flex-1 border-b border-dotted border-[#c9bfac] mb-1" />
                <span className="text-sm font-semibold text-[#2A241D] shrink-0">
                  ₹{item.price}
                </span>
              </div>
            ))}
          </div>

          <div
            className="h-px w-full mb-4"
            style={{
              backgroundImage:
                "linear-gradient(to right, #C9BFAC 50%, transparent 0%)",
              backgroundSize: "8px 1px",
              backgroundRepeat: "repeat-x",
            }}
          />

          {/* Bills */}
          <div className="space-y-1.5 mb-2">
            <div className="flex justify-between text-sm text-[#6b6252]">
              <span>Subtotal</span>
              <span>₹{order.bills.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-[#6b6252]">
              <span>Tax</span>
              <span>₹{order.bills.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-[#2A241D] pt-1">
              <span>Total</span>
              <span>₹{order.bills.totalWithTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-[#8a806c] pt-1">
              <span>Payment method</span>
              <span>{order.paymentMethod}</span>
            </div>
          </div>

          <div
            className="h-px w-full my-4"
            style={{
              backgroundImage:
                "linear-gradient(to right, #C9BFAC 50%, transparent 0%)",
              backgroundSize: "8px 1px",
              backgroundRepeat: "repeat-x",
            }}
          />

          {/* Status + actions */}
          {isReady ? (
            <div className="bg-[#e6efe8] text-[#3d5a45] rounded-lg px-4 py-3 flex items-center gap-2 text-sm font-semibold mb-3">
              <FaCheckDouble /> Order Ready
            </div>
          ) : (
            <motion.button
              whileHover={!statusMutation.isPending ? { scale: 1.015 } : {}}
              whileTap={!statusMutation.isPending ? { scale: 0.97 } : {}}
              onClick={() => statusMutation.mutate("Ready")}
              disabled={statusMutation.isPending}
              className={`w-full rounded-md py-3 text-sm font-bold tracking-widest ${labelFont} mb-3 transition-colors ${
                statusMutation.isPending
                  ? "bg-[#d8cfbd] text-[#8a806c] cursor-not-allowed"
                  : "bg-[#BD5D31] text-[#F3EEE3] hover:bg-[#a34f27]"
              }`}
            >
              {statusMutation.isPending ? "UPDATING..." : "MARK AS READY"}
            </motion.button>
          )}

          {hasTable && tableIsBooked && (
            <motion.button
              whileHover={isReady ? { scale: 1.015 } : {}}
              whileTap={isReady ? { scale: 0.97 } : {}}
              onClick={() => isReady && setConfirmFree(true)}
              disabled={!isReady}
              title={!isReady ? "Table can only be freed once the order is Ready" : ""}
              className={`w-full rounded-md py-3 text-sm font-bold tracking-widest ${labelFont} border transition-colors ${
                isReady
                  ? "border-[#BD5D31] text-[#BD5D31] hover:bg-[#BD5D31]/10"
                  : "border-[#d8cfbd] text-[#a89e8b] cursor-not-allowed"
              }`}
            >
              FREE TABLE
            </motion.button>
          )}

          {!isReady && hasTable && tableIsBooked && (
            <p className="text-[10px] text-[#a89e8b] text-center mt-2">
              Table can be freed once this order is marked Ready.
            </p>
          )}
        </div>

        {/* torn bottom edge */}
        <div
          className="h-2"
          style={{
            backgroundImage:
              "linear-gradient(45deg, transparent 50%, #F3EEE3 50%), linear-gradient(-45deg, transparent 50%, #F3EEE3 50%)",
            backgroundPosition: "bottom left",
            backgroundSize: "16px 16px",
            backgroundRepeat: "repeat-x",
          }}
        />
      </motion.div>

      <AnimatePresence>
        {confirmFree && (
          <ConfirmDialog
            title="Free this table?"
            message={`Table ${order.table?.tableNo} will be marked available for new customers.`}
            isLoading={freeTableMutation.isPending}
            onCancel={() => setConfirmFree(false)}
            onConfirm={() => freeTableMutation.mutate(order.table._id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderDetailsModal;