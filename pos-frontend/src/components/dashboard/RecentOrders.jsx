import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GrUpdate } from "react-icons/gr";
import { FaFileExcel } from "react-icons/fa";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import * as XLSX from "xlsx";
import {
  getOrders,
  updateOrderStatus,
  updateTable,
  deleteCompletedOrders,
} from "../../https/index";
import { formatDateAndTime } from "../../utils";

const labelFont = "font-['Space_Mono',_monospace]";

const COMPLETED_ORDER_THRESHOLD = 10;
const MAX_REMINDERS_PER_DAY = 4;
const LS_LAST_GENERATED = "cleanup_last_generated_date";
const LS_BASELINE_COUNT = "cleanup_baseline_count";
const LS_SHOWN_META = "cleanup_shown_meta";

const todayStr = () => new Date().toISOString().slice(0, 10);

const getMondayOfThisWeek = () => {
  const date = new Date();
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

const exportOrdersToExcel = (orders) => {
  const rows = orders.map((o) => ({
    "Order ID": `#${Math.floor(new Date(o.orderDate).getTime())}`,
    Customer: o.customerDetails.name,
    Status: o.orderStatus,
    "Date & Time": formatDateAndTime(o.orderDate),
    Items: o.items.length,
    "Table No": o.table?.tableNo ?? "N/A",
    "Total (₹)": o.bills.totalWithTax,
    "Payment Method": o.paymentMethod,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
  XLSX.writeFile(workbook, `orders-backup-${todayStr()}.xlsx`);
};

/* ---------------- Popups ---------------- */
const GeneratePopup = ({ onGenerate, onClose, isAuto }) => (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[70] px-4">
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 10 }}
      className="bg-[#F3EEE3] p-6 rounded-2xl shadow-xl w-full max-w-sm text-center"
    >
      <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-[#BD5D31]/15 flex items-center justify-center text-[#BD5D31]">
        <FaFileExcel size={24} />
      </div>
      <p className={`${labelFont} text-[10px] tracking-widest text-[#BD5D31] mb-2`}>
        {isAuto ? "WEEKLY REMINDER" : "EXPORT & CLEAN UP"}
      </p>
      <h3 className="text-[#2A241D] text-lg font-semibold mb-2">
        Generate Excel Report
      </h3>
      <p className="text-[#6b6252] text-sm mb-6">
        This will download a backup of all current orders as an Excel file
        before anything is deleted.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-[#6b6252] hover:text-[#2A241D] border border-[#d8cfbd] transition-colors"
        >
          Not Now
        </button>
        <button
          onClick={onGenerate}
          className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-[#BD5D31] text-[#F3EEE3] hover:bg-[#a34f27] transition-colors"
        >
          Generate
        </button>
      </div>
    </motion.div>
  </div>
);

const CleanupChoicePopup = ({ onDelete, onLater, isLoading }) => (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[70] px-4">
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 10 }}
      className="bg-[#F3EEE3] p-6 rounded-2xl shadow-xl w-full max-w-sm text-center"
    >
      <h3 className="text-[#2A241D] text-lg font-semibold mb-2">
        Backup ready! ✅
      </h3>
      <p className="text-[#6b6252] text-sm mb-6">
        Your Excel file has been downloaded. Want to clear completed orders
        from the database now for better performance?
      </p>
      <div className="flex flex-col gap-3">
        <button
          onClick={onDelete}
          disabled={isLoading}
          className={`py-2.5 rounded-lg text-sm font-bold transition-colors ${
            isLoading
              ? "bg-[#d8cfbd] text-[#8a806c] cursor-not-allowed"
              : "bg-[#BD5D31] text-[#F3EEE3] hover:bg-[#a34f27]"
          }`}
        >
          {isLoading ? "Deleting..." : "Delete Completed Orders"}
        </button>
        <button
          onClick={onLater}
          disabled={isLoading}
          className="py-2.5 rounded-lg text-sm font-semibold text-[#6b6252] hover:text-[#2A241D] border border-[#d8cfbd] transition-colors"
        >
          Delete Later
        </button>
      </div>
    </motion.div>
  </div>
);

const RecentOrders = () => {
  const queryClient = useQueryClient();
  const [showGenerate, setShowGenerate] = useState(false);
  const [showCleanupChoice, setShowCleanupChoice] = useState(false);
  const [isAutoReminder, setIsAutoReminder] = useState(false);

  const handleStatusChange = ({ orderId, orderStatus }) => {
    orderStatusUpdateMutation.mutate({ orderId, orderStatus });
  };

  const orderStatusUpdateMutation = useMutation({
    mutationFn: ({ orderId, orderStatus }) => updateOrderStatus({ orderId, orderStatus }),
    onSuccess: () => {
      enqueueSnackbar("Order status updated successfully!", { variant: "success" });
      queryClient.invalidateQueries(["orders"]);
    },
    onError: () => {
      enqueueSnackbar("Failed to update order status!", { variant: "error" });
    },
  });

  const freeTableMutation = useMutation({
    mutationFn: (tableId) =>
      updateTable({ tableId, status: "Available", orderId: null }),
    onSuccess: () => {
      enqueueSnackbar("Table marked as available!", { variant: "success" });
      queryClient.invalidateQueries(["orders"]);
      queryClient.invalidateQueries(["tables"]);
    },
    onError: (error) => {
      enqueueSnackbar(
        error?.response?.data?.message || "Failed to update table status!",
        { variant: "error" }
      );
    },
  });

  const deleteCompletedMutation = useMutation({
    mutationFn: () => deleteCompletedOrders(),
    onSuccess: (res) => {
      enqueueSnackbar(res.data.message, { variant: "success" });
      queryClient.invalidateQueries(["orders"]);
      setShowCleanupChoice(false);
    },
    onError: (error) => {
      enqueueSnackbar(
        error?.response?.data?.message || "Failed to delete completed orders!",
        { variant: "error" }
      );
      setShowCleanupChoice(false);
    },
  });

  const { data: resData, isError } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      return await getOrders();
    },
    placeholderData: keepPreviousData,
  });

  if (isError) {
    enqueueSnackbar("Something went wrong!", { variant: "error" });
  }

  const orders = resData?.data.data || [];

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)),
    [orders]
  );

  const completedOrders = useMemo(
    () =>
      sortedOrders.filter(
        (o) => o.orderStatus === "Ready" && (!o.table || o.table.status === "Available")
      ),
    [sortedOrders]
  );

  useEffect(() => {
    if (!resData) return;

    const shownMeta = JSON.parse(localStorage.getItem(LS_SHOWN_META) || "{}");
    const shownToday = shownMeta.date === todayStr() ? shownMeta.count : 0;
    if (shownToday >= MAX_REMINDERS_PER_DAY) return;

    const lastGenerated = localStorage.getItem(LS_LAST_GENERATED);
    const baseline = Number(localStorage.getItem(LS_BASELINE_COUNT) || 0);

    const isMonday = new Date().getDay() === 1;
    const weeklyDone = lastGenerated && new Date(lastGenerated) >= getMondayOfThisWeek();
    const thresholdReached =
      completedOrders.length - baseline >= COMPLETED_ORDER_THRESHOLD;

    if ((isMonday && !weeklyDone) || thresholdReached) {
      setIsAutoReminder(true);
      setShowGenerate(true);
      localStorage.setItem(
        LS_SHOWN_META,
        JSON.stringify({ date: todayStr(), count: shownToday + 1 })
      );
    }
  }, [resData]);

  const handleOpenManual = () => {
    setIsAutoReminder(false);
    setShowGenerate(true);
  };

  const handleGenerate = () => {
    exportOrdersToExcel(sortedOrders);
    localStorage.setItem(LS_LAST_GENERATED, new Date().toISOString());
    localStorage.setItem(LS_BASELINE_COUNT, String(completedOrders.length));
    setShowGenerate(false);
    setShowCleanupChoice(true);
  };

  return (
    <div className="container mx-auto bg-[#262626] p-4 sm:p-6 rounded-xl shadow-md">
      
      {/* Responsive Header block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-[#f5f5f5] text-lg sm:text-xl font-semibold order-2 sm:order-1">
          Recent Orders
        </h2>
        <button
          onClick={handleOpenManual}
          title="Export & Clean Up"
          className="flex items-center justify-center gap-2 bg-[#1a1a1a] hover:bg-[#333] text-[#ababab] hover:text-[#f5f5f5] px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors shrink-0 order-1 sm:order-2 w-full sm:w-auto"
        >
          <FaFileExcel className="text-base" />
          <span>Export & Clean Up</span>
        </button>
      </div>

      {/* 
        1. MOBILE VIEW (Visible under 768px): Renders as beautiful vertical card items 
      */}
      <div className="block md:hidden space-y-4 max-h-[500px] overflow-y-auto pr-1">
        {sortedOrders.map((order, index) => {
          const tableStatus = order.table?.status || "Booked";
          const isBooked = tableStatus === "Booked";
          const hasTable = Boolean(order.table);

          return (
            <div 
              key={index} 
              className="bg-[#1f1f1f] p-4 rounded-xl border border-gray-800 space-y-3"
            >
              <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                <div>
                  <p className="text-xs text-[#ababab]">Order ID</p>
                  <p className="text-sm font-bold text-white">
                    #{Math.floor(new Date(order.orderDate).getTime()).toString().slice(-6)}...
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#ababab]">Total Price</p>
                  <p className="text-sm font-bold text-green-400">₹{order.bills.totalWithTax}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-[#ababab]">Customer</p>
                  <p className="font-semibold text-[#f5f5f5]">{order.customerDetails.name}</p>
                </div>
                <div>
                  <p className="text-[#ababab]">Table Details</p>
                  <p className="font-semibold text-[#f5f5f5]">
                    {hasTable ? `Table - ${order.table.tableNo}` : "N/A"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <p className="text-[#ababab]">Date & Time</p>
                  <p className="text-[#f5f5f5]">{formatDateAndTime(order.orderDate)}</p>
                </div>
                <div>
                  <p className="text-[#ababab]">Payment / Items</p>
                  <p className="text-[#f5f5f5]">{order.paymentMethod} • {order.items.length} Items</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#ababab]">Status:</span>
                  <select
                    className={`bg-[#1a1a1a] text-[#f5f5f5] border border-gray-700 py-1.5 px-2.5 rounded-lg text-xs focus:outline-none ${
                      order.orderStatus === "Ready" ? "text-green-500" : "text-yellow-500"
                    }`}
                    value={order.orderStatus}
                    onChange={(e) =>
                      handleStatusChange({
                        orderId: order._id,
                        orderStatus: e.target.value,
                      })
                    }
                  >
                    <option className="text-yellow-500" value="In Progress">In Progress</option>
                    <option className="text-green-500" value="Ready">Ready</option>
                  </select>
                </div>

                {hasTable && (
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isBooked
                          ? "bg-red-500/15 text-red-400"
                          : "bg-green-500/15 text-green-400"
                      }`}
                    >
                      {tableStatus}
                    </span>
                    {isBooked && (
                      <button
                        onClick={() => freeTableMutation.mutate(order.table._id)}
                        disabled={freeTableMutation.isPending}
                        className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-[#3a3a3a] text-[#f5f5f5] hover:border-yellow-400 hover:text-yellow-400 transition-colors"
                      >
                        <GrUpdate size={8} />
                        Free
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 
        2. DESKTOP VIEW (Visible on screens larger than md: 768px)
      */}
      <div className="hidden md:block overflow-x-auto overflow-y-scroll h-[420px] scrollbar-hide">
        <table className="w-full text-left text-[#f5f5f5]">
          <thead className="bg-[#333] text-[#ababab] sticky top-0 z-10">
            <tr>
              <th className="p-3 text-sm">Order ID</th>
              <th className="p-3 text-sm">Customer</th>
              <th className="p-3 text-sm">Status</th>
              <th className="p-3 text-sm">Date & Time</th>
              <th className="p-3 text-sm">Items</th>
              <th className="p-3 text-sm">Table No</th>
              <th className="p-3 text-sm">Table Status</th>
              <th className="p-3 text-sm">Total</th>
              <th className="p-3 text-sm text-center">Payment Method</th>
            </tr>
          </thead>
          <tbody>
            {sortedOrders.map((order, index) => {
              const tableStatus = order.table?.status || "Booked";
              const isBooked = tableStatus === "Booked";
              const hasTable = Boolean(order.table);

              return (
                <tr key={index} className="border-b border-gray-700/50 hover:bg-[#333]/40 transition-colors">
                  <td className="p-4 text-sm">
                    #{Math.floor(new Date(order.orderDate).getTime())}
                  </td>
                  <td className="p-4 text-sm">{order.customerDetails.name}</td>
                  <td className="p-4 text-sm">
                    <select
                      className={`bg-[#1a1a1a] text-[#f5f5f5] border border-gray-600 p-2 rounded-lg focus:outline-none text-sm ${
                        order.orderStatus === "Ready" ? "text-green-500" : "text-yellow-500"
                      }`}
                      value={order.orderStatus}
                      onChange={(e) =>
                        handleStatusChange({
                          orderId: order._id,
                          orderStatus: e.target.value,
                        })
                      }
                    >
                      <option className="text-yellow-500" value="In Progress">
                        In Progress
                      </option>
                      <option className="text-green-500" value="Ready">
                        Ready
                      </option>
                    </select>
                  </td>
                  <td className="p-4 text-sm">{formatDateAndTime(order.orderDate)}</td>
                  <td className="p-4 text-sm">{order.items.length} Items</td>
                  <td className="p-4 text-sm">
                    {hasTable ? `Table - ${order.table.tableNo}` : "N/A"}
                  </td>
                  <td className="p-4 text-sm">
                    {hasTable ? (
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            isBooked
                              ? "bg-red-500/15 text-red-400"
                              : "bg-green-500/15 text-green-400"
                          }`}
                        >
                          {tableStatus}
                        </span>
                        {isBooked && (
                          <button
                            onClick={() => freeTableMutation.mutate(order.table._id)}
                            disabled={freeTableMutation.isPending}
                            title="Mark table as available"
                            className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                              freeTableMutation.isPending
                                ? "text-[#8a8a8a] border-[#3a3a3a] cursor-not-allowed"
                                : "text-[#f5f5f5] border-[#3a3a3a] hover:border-yellow-400 hover:text-yellow-400"
                            }`}
                          >
                            <GrUpdate size={11} />
                            Free Table
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-[#6a6a6a]">Table deleted</span>
                    )}
                  </td>
                  <td className="p-4 text-sm font-semibold">₹{order.bills.totalWithTax}</td>
                  <td className="p-4 text-sm text-center">{order.paymentMethod}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showGenerate && (
          <GeneratePopup
            isAuto={isAutoReminder}
            onGenerate={handleGenerate}
            onClose={() => setShowGenerate(false)}
          />
        )}
        {showCleanupChoice && (
          <CleanupChoicePopup
            isLoading={deleteCompletedMutation.isPending}
            onDelete={() => deleteCompletedMutation.mutate()}
            onLater={() => setShowCleanupChoice(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecentOrders;