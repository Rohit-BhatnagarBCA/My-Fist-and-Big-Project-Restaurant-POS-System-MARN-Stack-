import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";
import OrderList from "./OrderList";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { getOrders } from "../../https/index";

const RecentOrders = () => {
  const [search, setSearch] = useState("");

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
  const filteredOrders = orders.filter((order) =>
    order.customerDetails.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full flex flex-col h-full select-none">
      {/* Header Section */}
      <div className="flex justify-between items-center px-4 sm:px-6 py-4">
        <h1 className="text-[#F3EEE3] text-base sm:text-lg font-semibold tracking-wide">
          Recent Orders
        </h1>
        <Link
          to="/orders"
          className="text-[#BD5D31] text-xs sm:text-sm font-semibold hover:underline"
        >
          View all
        </Link>
      </div>

      {/* Modern Compact Search Bar */}
      <div className="flex items-center gap-2.5 bg-[#242c38]/80 border border-[#2e3949]/30 rounded-xl px-4 py-2.5 mx-4 sm:mx-6 transition-all focus-within:border-[#BD5D31]/50">
        <FaSearch className="text-[#7d8797] shrink-0" size={12} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search recent orders..."
          className="bg-transparent outline-none text-[#F3EEE3] placeholder:text-[#7d8797] text-xs sm:text-sm w-full"
        />
      </div>

      {/* Clean Dynamic Order List Area */}
      <div className="mt-4 px-4 sm:px-6 pb-4 overflow-y-auto max-h-[300px] lg:max-h-[350px] scrollbar-hide flex-1">
        <AnimatePresence initial={false}>
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <motion.div
                key={order._id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="mb-2 last:mb-0"
              >
                <OrderList order={order} />
              </motion.div>
            ))
          ) : (
            <p className="text-[#7d8797] text-xs sm:text-sm py-12 text-center border border-dashed border-[#26323f]/50 rounded-xl mt-2">
              {search ? "No matching orders found." : "No orders available"}
            </p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RecentOrders;