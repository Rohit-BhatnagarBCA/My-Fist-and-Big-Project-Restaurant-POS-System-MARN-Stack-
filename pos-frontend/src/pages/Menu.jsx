import React, { useEffect } from "react";
import { motion } from "framer-motion";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import { MdRestaurantMenu } from "react-icons/md";
import MenuContainer from "../components/menu/MenuContainer";
import CustomerInfo from "../components/menu/CustomerInfo";
import CartInfo from "../components/menu/CartInfo";
import Bill from "../components/menu/Bill";
import { useSelector } from "react-redux";
import { getAvatarName } from "../utils";

const Menu = () => {
  useEffect(() => {
    document.title = "POS | Menu";
  }, []);

  const customerData = useSelector((state) => state.customer);

  return (
    <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 lg:px-10 py-4 shrink-0">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-[#f5f5f5] text-xl sm:text-2xl font-bold tracking-wider">
            Menu
          </h1>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3 cursor-pointer bg-[#1a1a1a] px-4 py-2 rounded-xl"
        >
          <div className="bg-yellow-400/10 p-2 rounded-lg">
            <MdRestaurantMenu className="text-yellow-400 text-2xl sm:text-3xl" />
          </div>
          <div className="flex flex-col items-start">
            <h1 className="text-sm sm:text-md text-[#f5f5f5] font-semibold tracking-wide leading-tight">
              {customerData.customerName || "Customer Name"}
            </h1>
            <p className="text-xs text-[#ababab] font-medium">
              {customerData.orderType === "Packing"
                ? "Packing / Takeaway"
                : `Table : ${customerData.table?.tableNo || "N/A"}`}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col lg:flex-row gap-3 px-4 sm:px-6 lg:px-0 lg:pl-10 pb-3 min-h-0 overflow-hidden">
        {/* Left: Menu browsing */}
        <div className="flex-1 lg:flex-[3] min-h-0 overflow-y-auto scrollbar-hide">
          <MenuContainer />
        </div>

        {/* Right: Customer / Cart / Bill panel */}
        <div className="w-full lg:w-[400px] lg:shrink-0 bg-[#1a1a1a] lg:mt-4 lg:mr-3 rounded-xl flex flex-col min-h-0 flex-1 lg:flex-none overflow-y-auto scrollbar-hide">
          <div className="shrink-0">
            <CustomerInfo />
            <hr className="border-[#2a2a2a] border-t-2" />
          </div>

          <div className="shrink-0">
            <CartInfo />
          </div>

          <div className="shrink-0 border-t-2 border-[#2a2a2a] mt-auto">
            <Bill />
          </div>
        </div>
      </div>

      <BottomNav />
    </section>
  );
};

export default Menu;