import React, { useEffect, useRef, useState, Suspense, lazy } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { MdOutlineTakeoutDining, MdTableBar } from "react-icons/md";
import { FaBell, FaBoxes } from "react-icons/fa";
import { getOrders } from "../../https/index";
import { getAvatarName } from "../../utils/index";
import OrderDetailsModal from "../orders/OrderDetailsModal";

// Loaded only when the "Stock" button is actually tapped — keeps the main
// ticket board (the screen kitchen stares at all shift) light and fast.
const StockPanel = lazy(() => import("./StockPanel"));

const KitchenBoard = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isStockOpen, setIsStockOpen] = useState(false);
  const [flashIds, setFlashIds] = useState([]);
  const knownIds = useRef(null); // null until the first fetch settles

  const { data: resData } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    refetchInterval: 4000, // live-ish sync without needing websockets
    placeholderData: (prev) => prev,
  });

  const orders = resData?.data?.data || [];

  // Kitchen only needs orders it still has to act on — newest first, so
  // whatever just came in is always at the top.
  const activeOrders = [...orders]
    .filter((o) => o.orderStatus === "In Progress")
    .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

  useEffect(() => {
    const currentIds = new Set(activeOrders.map((o) => o._id));

    if (knownIds.current === null) {
      // First load — just record what's already on the board, no chime.
      knownIds.current = currentIds;
      return;
    }

    const newlyArrived = activeOrders.filter((o) => !knownIds.current.has(o._id));
    if (newlyArrived.length > 0) {
      setFlashIds(newlyArrived.map((o) => o._id));
      setTimeout(() => setFlashIds([]), 2500);
    }
    knownIds.current = currentIds;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders]);

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 pb-28">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[#F3EEE3] text-xl sm:text-2xl font-bold tracking-wide">
            Kitchen Tickets
          </h1>
          <p className="text-[#7d8797] text-sm mt-1">
            {activeOrders.length} active order{activeOrders.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsStockOpen(true)}
            className="flex items-center gap-2 bg-[#1B222B] px-3 py-3 rounded-xl text-[#BD5D31] font-semibold text-sm hover:bg-[#242c38] transition-colors"
          >
            <FaBoxes size={16} />
            <span className="hidden sm:inline">Stock</span>
          </button>
          <div className="bg-[#1B222B] p-3 rounded-xl text-[#BD5D31]">
            <FaBell size={18} />
          </div>
        </div>
      </div>

      {activeOrders.length === 0 ? (
        <div className="bg-[#1B222B] rounded-xl py-16 text-center">
          <p className="text-[#7d8797]">No active orders right now — kitchen's clear. 🍳</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {activeOrders.map((order) => {
              const isPacking = order.orderType === "Packing" || !order.table;
              const isNew = flashIds.includes(order._id);
              return (
                <motion.button
                  key={order._id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => setSelectedOrder(order)}
                  className={`text-left bg-[#1B222B] rounded-xl p-4 border-2 transition-colors ${
                    isNew
                      ? "border-[#BD5D31] animate-pulse"
                      : "border-transparent hover:border-[#BD5D31]/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="bg-[#BD5D31] text-[#F3EEE3] w-9 h-9 flex items-center justify-center rounded-lg font-bold text-sm shrink-0">
                        {getAvatarName(order.customerDetails.name)}
                      </div>
                      <span className="text-[#F3EEE3] font-semibold truncate">
                        {order.customerDetails.name}
                      </span>
                    </div>
                    <span
                      className={`shrink-0 flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${
                        isPacking
                          ? "bg-[#3a2c1f] text-[#e0a35c]"
                          : "bg-[#1f3a2c] text-[#8FB89C]"
                      }`}
                    >
                      {isPacking ? (
                        <MdOutlineTakeoutDining size={11} />
                      ) : (
                        <MdTableBar size={11} />
                      )}
                      {isPacking ? "Packing" : `Table ${order.table?.tableNo ?? "N/A"}`}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-[#dcdfe4]">{item.name}</span>
                        <span className="text-[#BD5D31] font-bold shrink-0 ml-2">
                          x{item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {isStockOpen && (
          <Suspense fallback={null}>
            <StockPanel onClose={() => setIsStockOpen(false)} />
          </Suspense>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default KitchenBoard;