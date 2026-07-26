import React from "react";
import { motion } from "framer-motion";
import { FaCheckDouble, FaLongArrowAltRight } from "react-icons/fa";
import { FaCircle } from "react-icons/fa";
import { formatDateAndTime, getAvatarName } from "../../utils/index";

const OrderCard = ({ order, onClick }) => {
  const isReady = order.orderStatus === "Ready";
  const isPacking = order.orderType === "Packing" || !order.table;

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="bg-[#1B222B] p-4 rounded-xl cursor-pointer border border-transparent hover:border-[#BD5D31]/40 transition-colors"
    >
      <div className="flex items-center gap-4">
        <button className="bg-[#BD5D31] text-[#F3EEE3] p-3 text-lg font-bold rounded-lg shrink-0">
          {getAvatarName(order.customerDetails.name)}
        </button>
        <div className="flex items-center justify-between w-full gap-2 min-w-0">
          <div className="flex flex-col items-start gap-1 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="text-[#F3EEE3] text-base font-semibold tracking-wide truncate">
                {order.customerDetails.name}
              </h1>
              {/* Order-type badge — same look as the Available/Booked pill on TableCard */}
              <span
                className={`shrink-0 flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${
                  isPacking
                    ? "bg-[#3a2c1f] text-[#e0a35c]"
                    : "bg-[#1f3a2c] text-[#8FB89C]"
                }`}
              >
                <FaCircle size={6} />
                {isPacking ? "Packing" : "On Table"}
              </span>
            </div>
            <p className="text-[#7d8797] text-xs">
              #{Math.floor(new Date(order.orderDate).getTime())}
            </p>
            {!isPacking && (
              <p className="text-[#7d8797] text-xs">
                Table <FaLongArrowAltRight className="ml-1 inline" size={10} />{" "}
                {order.table?.tableNo ?? "N/A"}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            {isReady ? (
              <>
                <p className="text-[#8FB89C] bg-[#25392c] px-2 py-1 rounded-lg text-xs sm:text-sm">
                  <FaCheckDouble className="inline mr-1.5" /> Ready
                </p>
                <p className="text-[#7d8797] text-xs">
                  <FaCircle className="inline mr-1.5 text-[#8FB89C]" size={8} /> Ready
                  to serve
                </p>
              </>
            ) : (
              <>
                <p className="text-[#e0a35c] bg-[#3a2c1f] px-2 py-1 rounded-lg text-xs sm:text-sm">
                  <FaCircle className="inline mr-1.5" size={8} /> {order.orderStatus}
                </p>
                <p className="text-[#7d8797] text-xs">
                  <FaCircle className="inline mr-1.5 text-[#e0a35c]" size={8} />{" "}
                  Preparing your order
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-4 text-[#7d8797] text-sm">
        <p>{formatDateAndTime(order.orderDate)}</p>
        <p>{order.items.length} Items</p>
      </div>

      <hr className="w-full mt-4 border-t border-[#2a323d]" />

      <div className="flex items-center justify-between mt-4">
        <h1 className="text-[#F3EEE3] text-base font-semibold">Total</h1>
        <p className="text-[#F3EEE3] text-base font-semibold">
          ₹{order.bills.totalWithTax.toFixed(2)}
        </p>
      </div>

      <p className="text-center text-[10px] text-[#4d5561] mt-3 tracking-wide">
        Tap card for full details
      </p>
    </motion.div>
  );
};

export default OrderCard;