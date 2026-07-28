import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import { MdRestaurantMenu } from "react-icons/md";
import { FaShoppingCart } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
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
  const cartData = useSelector((state) => state.cart);

  // Below `lg`, the cart/bill panel becomes a slide-up drawer instead of a
  // fixed side column — opened via the floating summary bar.
  const [isCartOpen, setIsCartOpen] = useState(false);

  const cartItemCount = cartData.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartData.reduce((sum, item) => sum + item.price, 0);

  return (
    <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden flex flex-col relative">
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
          className="flex items-center gap-3 cursor-pointer bg-[#1a1a1a] px-3 sm:px-4 py-2 rounded-xl"
        >
          <div className="bg-yellow-400/10 p-2 rounded-lg shrink-0">
            <MdRestaurantMenu className="text-yellow-400 text-xl sm:text-3xl" />
          </div>
          <div className="flex flex-col items-start min-w-0">
            <h1 className="text-xs sm:text-md text-[#f5f5f5] font-semibold tracking-wide leading-tight truncate max-w-[38vw] sm:max-w-none">
              {customerData.customerName || "Customer Name"}
            </h1>
            <p className="text-[10px] sm:text-xs text-[#ababab] font-medium truncate">
              {customerData.orderType === "Packing"
                ? "Packing / Takeaway"
                : `Table : ${customerData.table?.tableNo || "N/A"}`}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col lg:flex-row gap-3 px-4 sm:px-6 lg:px-0 lg:pl-10 pb-3 min-h-0 overflow-hidden ">
        {/* Left: Menu browsing — takes the full screen on mobile */}
        <div className="flex-1 lg:flex-[3] min-h-0 overflow-y-auto scrollbar-hide pb-26 lg:pb-0">
          <MenuContainer />
        </div>

        {/* Right: Customer / Cart / Bill panel.
            Desktop (lg+): a static side column, always visible.
            Mobile: a slide-up drawer, toggled by the floating cart bar. */}
        <div
          className={`fixed inset-x-0 bottom-0 top-16 z-[45] bg-[#1a1a1a] rounded-t-2xl flex flex-col min-h-0 overflow-y-auto scrollbar-hide transition-transform duration-300 ease-out
          ${isCartOpen ? "translate-y-0" : "translate-y-full"}
          lg:static lg:inset-auto lg:translate-y-0 lg:z-auto lg:rounded-xl lg:w-[400px] lg:shrink-0 lg:flex-none lg:mt-4 lg:mr-3`}
        >
          {/* Drawer handle / close button — mobile only */}
          <div className="flex items-center justify-between px-4 py-3 lg:hidden shrink-0 border-b border-[#2a2a2a]">
            <h1 className="text-[#f5f5f5] font-semibold tracking-wide">Your Order</h1>
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-[#ababab] hover:text-white p-1.5 rounded-lg hover:bg-[#242424] transition-colors"
            >
              <IoMdClose size={20} />
            </button>
          </div>

          <div className="shrink-0">
            <CustomerInfo />
            <hr className="border-[#2a2a2a] border-t-2" />
          </div>

          <div className="shrink-0">
            <CartInfo />
          </div>

          <div className="shrink-0 border-t-2 border-[#2a2a2a] mt-auto">
            <Bill onOrderPlaced={() => setIsCartOpen(false)} />
          </div>
        </div>

        {/* Backdrop behind the mobile drawer */}
        <AnimatePresence>
          {isCartOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Floating cart summary bar — mobile only, hidden once the drawer is open */}
      <AnimatePresence>
        {!isCartOpen && cartItemCount > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => setIsCartOpen(true)}
            className="lg:hidden fixed bottom-20 left-3 right-3 z-30 bg-[#BD5D31] rounded-xl px-4 py-3 flex items-center justify-between shadow-lg shadow-black/30"
          >
            <span className="flex items-center gap-2 text-[#F3EEE3] font-semibold text-sm">
              <FaShoppingCart size={16} />
              {cartItemCount} {cartItemCount === 1 ? "Item" : "Items"}
            </span>
            <span className="flex items-center gap-2 text-[#F3EEE3] font-bold text-sm">
              ₹{cartTotal.toFixed(0)}
              <span className="bg-black/20 rounded-lg px-2 py-1 text-xs font-semibold">
                View Cart
              </span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <BottomNav />
    </section>
  );
};

export default Menu;