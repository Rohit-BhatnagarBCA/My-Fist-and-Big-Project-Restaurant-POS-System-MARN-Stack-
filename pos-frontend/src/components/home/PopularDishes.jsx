import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getOrders } from "../../https";
import { getAvatarName } from "../../utils/index";

const labelFont = "font-['Space_Mono',_monospace]";

const rankStyles = {
  1: "text-[#BD5D31]",
  2: "text-[#8FB89C]",
  3: "text-[#e0a35c]",
};

const rankBg = {
  1: "bg-[#BD5D31]",
  2: "bg-[#8FB89C]",
  3: "bg-[#e0a35c]",
};

const PopularDishes = () => {
  const { data: resData, isError } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => await getOrders(),
    placeholderData: (prev) => prev,
  });

  // Real popularity, computed straight from every dish actually sold across
  // all orders — same "quantity sold" logic the Dashboard metrics use.
  const topDishes = useMemo(() => {
    const orders = resData?.data?.data || [];
    const dishMap = {};

    orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        if (!dishMap[item.name]) {
          dishMap[item.name] = { name: item.name, quantity: 0 };
        }
        dishMap[item.name].quantity += item.quantity;
      });
    });

    return Object.values(dishMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [resData]);

  return (
    <div className="px-4 sm:px-0 sm:pr-6 mt-6">
      <div className="bg-[#1B222B] w-full rounded-xl">
        <div className="flex justify-between items-center px-5 sm:px-6 py-4">
          <h1 className="text-[#F3EEE3] text-lg font-semibold tracking-wide">
            Popular Dishes
          </h1>
          <Link
            to="/menu"
            className="text-[#BD5D31] text-sm font-semibold hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="px-5 sm:px-6 pb-5 space-y-3 max-h-[520px] lg:max-h-none overflow-y-auto scrollbar-hide">
          {isError && (
            <p className="text-[#7d8797] text-sm px-1 py-3">
              Couldn't load order data right now.
            </p>
          )}

          {!isError && topDishes.length === 0 && (
            <p className="text-[#7d8797] text-sm px-1 py-3">
              No dishes sold yet — once orders come in, your best-sellers will show up here.
            </p>
          )}

          {topDishes.map((dish, index) => {
            const rank = index + 1;
            return (
              <motion.div
                key={dish.name}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
                whileHover={{ x: 2 }}
                className="flex items-center gap-4 bg-[#242c38] rounded-xl px-5 py-3.5"
              >
                <h1
                  className={`${labelFont} font-bold text-lg w-7 shrink-0 ${
                    rankStyles[rank] || "text-[#7d8797]"
                  }`}
                >
                  {rank < 10 ? `0${rank}` : rank}
                </h1>
                <div
                  className={`w-11 h-11 rounded-full shrink-0 flex items-center justify-center font-bold text-sm text-[#F3EEE3] ${
                    rankBg[rank] || "bg-[#3a4353]"
                  }`}
                >
                  {getAvatarName(dish.name)}
                </div>
                <div className="min-w-0">
                  <h1 className="text-[#F3EEE3] font-semibold tracking-wide truncate">
                    {dish.name}
                  </h1>
                  <p className="text-[#F3EEE3] text-sm font-semibold mt-0.5">
                    <span className="text-[#7d8797] font-normal">Sold: </span>
                    {dish.quantity}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PopularDishes;