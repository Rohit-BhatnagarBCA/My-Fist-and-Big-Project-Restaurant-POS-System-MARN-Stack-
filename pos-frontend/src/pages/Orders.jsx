import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "../components/shared/BottomNav";
import OrderCard from "../components/orders/OrderCard";
import OrderDetailsModal from "../components/orders/OrderDetailsModal";
import BackButton from "../components/shared/BackButton";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getOrders } from "../https/index";
import { enqueueSnackbar } from "notistack";

const TABS = [
  { id: "all", label: "All" },
  { id: "progress", label: "In Progress" },
  { id: "ready", label: "Ready" },
  { id: "completed", label: "Completed" },
];

const Orders = () => {
  const [status, setStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

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

  // Newest orders first — gives the "stack" effect where the latest
  // order always lands on top.
  const sortedOrders = useMemo(
    () =>
      [...orders].sort(
        (a, b) => new Date(b.orderDate) - new Date(a.orderDate)
      ),
    [orders]
  );

  const filteredOrders = useMemo(() => {
    return sortedOrders.filter((order) => {
      const tableFreed = !order.table || order.table.status === "Available";

      switch (status) {
        case "progress":
          return order.orderStatus === "In Progress";
        case "ready":
          // Ready but table still occupied — still actively being served.
          return order.orderStatus === "Ready" && !tableFreed;
        case "completed":
          // Ready AND table has been freed — the order cycle is fully done.
          return order.orderStatus === "Ready" && tableFreed;
        default:
          return true;
      }
    });
  }, [sortedOrders, status]);

  const countFor = (tabId) => {
    if (tabId === "all") return sortedOrders.length;
    return sortedOrders.filter((order) => {
      const tableFreed = !order.table || order.table.status === "Available";
      if (tabId === "progress") return order.orderStatus === "In Progress";
      if (tabId === "ready") return order.orderStatus === "Ready" && !tableFreed;
      if (tabId === "completed") return order.orderStatus === "Ready" && tableFreed;
      return false;
    }).length;
  };

  return (
    <section className="bg-[#12181F] h-[calc(100vh-5rem)] overflow-hidden flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-10 py-4 shrink-0">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-[#F3EEE3] text-xl sm:text-2xl font-bold tracking-wider">
            Orders
          </h1>
        </div>

        <div className="relative flex bg-[#1B222B] rounded-full p-1 gap-1 flex-wrap">
          {TABS.map((tab) => {
            const active = status === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatus(tab.id)}
                className={`relative px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors z-10 whitespace-nowrap ${
                  active ? "text-[#F3EEE3]" : "text-[#7d8797] hover:text-[#c4cad4]"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="orders-tab-bg"
                    className="absolute inset-0 bg-[#BD5D31] rounded-full -z-10"
                    transition={{ type: "spring", duration: 0.4 }}
                  />
                )}
                {tab.label} <span className="opacity-70">({countFor(tab.id)})</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-4 sm:px-10 py-2 pb-28">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <motion.div
                  key={order._id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25 }}
                >
                  <OrderCard order={order} onClick={() => setSelectedOrder(order)} />
                </motion.div>
              ))
            ) : (
              <p className="col-span-full text-[#7d8797] text-center py-16">
                No orders in this view yet.
              </p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </AnimatePresence>

      <BottomNav />
    </section>
  );
};

export default Orders;