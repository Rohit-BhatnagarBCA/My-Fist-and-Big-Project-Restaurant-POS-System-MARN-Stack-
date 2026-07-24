import React, { useState } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { formatDate, getAvatarName } from "../../utils";

const CustomerInfo = () => {
  const [dateTime] = useState(new Date());
  const customerData = useSelector((state) => state.customer);

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex items-center justify-between px-4 py-3 "
    >
      <div className="flex flex-col items-start min-w-0 ">
        <h1 className="text-md text-[#f5f5f5] font-semibold tracking-wide truncate">
          {customerData.customerName || "Customer Name"}
        </h1>
        <p className="text-xs text-[#ababab] font-medium mt-1">
          #{customerData.orderId || "N/A"} / Dine in
        </p>
        <p className="text-xs text-[#ababab] font-medium mt-2">
          {formatDate(dateTime)}
        </p>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="bg-[#f6b100] p-3 text-xl font-bold rounded-lg shrink-0"
      >
        {getAvatarName(customerData.customerName) || "CN"}
      </motion.button>
    </motion.div>
  );
};

export default CustomerInfo;