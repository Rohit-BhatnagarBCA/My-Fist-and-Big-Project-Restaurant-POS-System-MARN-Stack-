import React from "react";
import { FaCheckDouble, FaLongArrowAltRight } from "react-icons/fa";
import { FaCircle } from "react-icons/fa";
import { getAvatarName } from "../../utils/index";

const OrderList = ({ order }) => {
  const isReady = order.orderStatus === "Ready";
  const isPacking = order.orderType === "Packing" || !order.table;

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <button className="bg-[#BD5D31] text-[#F3EEE3] w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-sm sm:text-lg font-bold rounded-lg shrink-0">
        {getAvatarName(order.customerDetails.name)}
      </button>

      <div className="flex-1 min-w-0">
        {/* Row 1: name + live status — only ever 2 things, never wraps awkwardly */}
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-[#F3EEE3] text-sm sm:text-lg font-semibold tracking-wide truncate">
            {order.customerDetails.name}
          </h1>
          {isReady ? (
            <p className="text-[#8FB89C] bg-[#25392c] px-2 py-0.5 rounded-lg text-[10px] sm:text-sm shrink-0 flex items-center gap-1 whitespace-nowrap">
              <FaCheckDouble size={9} /> Ready
            </p>
          ) : (
            <p className="text-[#e0a35c] bg-[#3a2c1f] px-2 py-0.5 rounded-lg text-[10px] sm:text-sm shrink-0 flex items-center gap-1 whitespace-nowrap">
              <FaCircle size={7} /> In Progress
            </p>
          )}
        </div>

        {/* Row 2: item count + order type/table, stacked underneath */}
        <div className="flex items-center justify-between gap-2 mt-1">
          <p className="text-[#7d8797] text-xs sm:text-sm shrink-0">
            {order.items.length} Items
          </p>
          <span
            className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-lg shrink-0 flex items-center gap-1 whitespace-nowrap border ${
              isPacking
                ? "text-[#e0a35c] border-[#e0a35c]/40"
                : "text-[#BD5D31] border-[#BD5D31]/50"
            }`}
          >
            {isPacking ? (
              "Packing"
            ) : (
              <>
                Table
                <FaLongArrowAltRight className="text-[#7d8797]" size={10} />
                {order.table?.tableNo ?? "N/A"}
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrderList;