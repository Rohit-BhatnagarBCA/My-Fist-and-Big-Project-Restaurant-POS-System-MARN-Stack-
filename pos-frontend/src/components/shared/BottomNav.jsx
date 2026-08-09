import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaHome } from "react-icons/fa";
import { MdOutlineReorder, MdTableBar } from "react-icons/md";
import { CiCircleMore } from "react-icons/ci";
import { BiSolidDish } from "react-icons/bi";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import CreateOrderModal from "./CreateOrderModal";
import { markOrdersRead } from "../../redux/slices/notificationSlice";

const navItems = [
  { path: "/", label: "Home", icon: FaHome },
  { path: "/orders", label: "Orders", icon: MdOutlineReorder },
  { path: "/tables", label: "Tables", icon: MdTableBar },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { role } = useSelector((state) => state.user);
  const { hasUnread } = useSelector((state) => state.notification);
  const isKitchen = role === "Kitchen";
  // Kitchen staff only need to see live tickets and order status — no
  // table management, no starting new orders.
  const visibleNavItems = isKitchen
    ? navItems.filter((item) => item.path !== "/tables")
    : navItems;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const isActive = (path) => location.pathname === path;
  const fabDisabled = isActive("/tables") || isActive("/menu");

  const handleNavClick = (path) => {
    navigate(path);
    if (path === "/orders") {
      dispatch(markOrdersRead());
    }
  };

  // Already looking at Orders when something new happens? Don't leave a
  // stale dot behind — clear it as soon as it would appear.
  useEffect(() => {
    if (isActive("/orders") && hasUnread) {
      dispatch(markOrdersRead());
    }
  });

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-[#1B222B] border-t border-[#2a323d] px-2 sm:px-4 h-16 flex items-center justify-around gap-1 z-40">
        {visibleNavItems.map(({ path, label, icon: Icon }) => {
          const active = isActive(path);
          const showDot = path === "/orders" && hasUnread && !active;
          return (
            <button
              key={path}
              onClick={() => handleNavClick(path)}
              className={`relative flex-1 max-w-[140px] h-11 flex items-center justify-center gap-2 font-semibold text-sm rounded-full transition-colors ${
                active ? "text-[#F3EEE3]" : "text-[#7d8797] hover:text-[#c4cad4]"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="bottomnav-active"
                  className="absolute inset-0 bg-[#BD5D31] rounded-full -z-10"
                  transition={{ type: "spring", duration: 0.4 }}
                />
              )}
              <span className="relative">
                <Icon size={18} />
                {showDot && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-[#1B222B]"
                  />
                )}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          );
        })}

        <button
          disabled
          title="Coming soon"
          className="flex-1 max-w-[140px] h-11 flex items-center justify-center gap-2 font-semibold text-sm rounded-full text-[#4d5561] cursor-not-allowed"
        >
          <CiCircleMore size={18} />
          <span className="hidden sm:inline">More</span>
        </button>
      </div>

      {/* Floating action button — Kitchen doesn't place new orders */}
      {!isKitchen && (
        <>
          <motion.button
            disabled={fabDisabled}
            onClick={openModal}
            animate={
              fabDisabled
                ? { scale: 1, boxShadow: "0 0 0 0 rgba(189,93,49,0)" }
                : {
                    scale: [1, 1.04, 1],
                    boxShadow: [
                      "0 0 0 0 rgba(189,93,49,0.35)",
                      "0 0 0 10px rgba(189,93,49,0)",
                      "0 0 0 0 rgba(189,93,49,0)",
                    ],
                  }
            }
            transition={{ duration: 2.2, repeat: fabDisabled ? 0 : Infinity, ease: "easeInOut" }}
            whileTap={!fabDisabled ? { scale: 0.92 } : {}}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full p-4 z-50 transition-colors ${
              fabDisabled
                ? "bg-[#3a3f47] text-[#6b7280] cursor-not-allowed"
                : "bg-[#BD5D31] text-[#F3EEE3] hover:bg-[#a34f27]"
            }`}
          >
            <BiSolidDish size={32} />
          </motion.button>

          <CreateOrderModal isOpen={isModalOpen} onClose={closeModal} />
        </>
      )}
    </>
  );
};

export default BottomNav;