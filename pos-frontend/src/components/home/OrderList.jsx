import React from "react";
import { FaCheckDouble, FaLongArrowAltRight } from "react-icons/fa";
import { FaCircle } from "react-icons/fa";
import { getAvatarName } from "../../utils/index";

const OrderList = ({ order }) => {
  const isReady = order.orderStatus === "Ready";

  return (
    <div className="flex items-center gap-4 sm:gap-5 mb-3 flex-wrap sm:flex-nowrap">
      <button className="bg-[#BD5D31] text-[#F3EEE3] p-3 text-lg font-bold rounded-lg shrink-0">
        {getAvatarName(order.customerDetails.name)}
      </button>

      <div className="flex items-center justify-between w-full gap-3 flex-wrap sm:flex-nowrap">
        <div className="flex flex-col items-start gap-1 min-w-0">
          <h1 className="text-[#F3EEE3] text-base sm:text-lg font-semibold tracking-wide truncate">
            {order.customerDetails.name}
          </h1>
          <p className="text-[#7d8797] text-sm">{order.items.length} Items</p>
        </div>

        <h1 className="text-[#BD5D31] text-sm font-semibold border border-[#BD5D31]/50 rounded-lg px-2 py-1 shrink-0">
          Table <FaLongArrowAltRight className="text-[#7d8797] ml-1 inline" size={12} />{" "}
          {order.table?.tableNo ?? "N/A"}
        </h1>

        <div className="flex flex-col items-end gap-2 shrink-0">
          {isReady ? (
            <p className="text-[#8FB89C] bg-[#25392c] px-2 py-1 rounded-lg text-sm">
              <FaCheckDouble className="inline mr-2" /> {order.orderStatus}
            </p>
          ) : (
            <p className="text-[#e0a35c] bg-[#3a2c1f] px-2 py-1 rounded-lg text-sm">
              <FaCircle className="inline mr-2" size={9} /> {order.orderStatus}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderList;