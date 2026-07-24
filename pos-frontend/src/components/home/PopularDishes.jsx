import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { popularDishes } from "../../constants";

const labelFont = "font-['Space_Mono',_monospace]";

const rankStyles = {
  1: "text-[#BD5D31]",
  2: "text-[#8FB89C]",
  3: "text-[#e0a35c]",
};

const PopularDishes = () => {
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
          {popularDishes.map((dish, index) => (
            <motion.div
              key={dish.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: index * 0.04 }}
              whileHover={{ x: 2 }}
              className="flex items-center gap-4 bg-[#242c38] rounded-xl px-5 py-3.5"
            >
              <h1
                className={`${labelFont} font-bold text-lg w-7 shrink-0 ${
                  rankStyles[dish.id] || "text-[#7d8797]"
                }`}
              >
                {dish.id < 10 ? `0${dish.id}` : dish.id}
              </h1>
              <img
                src={dish.image}
                alt={dish.name}
                className="w-11 h-11 rounded-full object-cover shrink-0"
              />
              <div className="min-w-0">
                <h1 className="text-[#F3EEE3] font-semibold tracking-wide truncate">
                  {dish.name}
                </h1>
                <p className="text-[#F3EEE3] text-sm font-semibold mt-0.5">
                  <span className="text-[#7d8797] font-normal">Orders: </span>
                  {dish.numberOfOrders}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PopularDishes;