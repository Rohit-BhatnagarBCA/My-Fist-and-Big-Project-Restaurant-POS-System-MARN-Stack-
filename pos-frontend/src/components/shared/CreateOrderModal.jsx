import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdTableBar, MdOutlineTakeoutDining } from "react-icons/md";
import { FiUser, FiPhone } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Modal from "./Modal";
import { setCustomer } from "../../redux/slices/customerSlice";

const labelFont = "font-['Space_Mono',_monospace]";

// A small fountain-pen cursor, tip-hotspot at the writing point,
// used on the diary-style form fields below.
const penCursorSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26"><path d="M4 22l3-1 12-12-2-2L5 19l-1 3z" fill="#BD5D31" stroke="#2A241D" stroke-width="0.5"/><path d="M18 5l3-3 3 3-3 3-3-3z" fill="#2A241D"/></svg>`;
const penCursor = `url("data:image/svg+xml,${encodeURIComponent(
  penCursorSvg
)}") 2 24, text`;

const CreateOrderModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { role } = useSelector((state) => state.user);
  // Only Admin can start a Packing/takeaway order — Waiter only ever
  // handles table service, so they never see that choice at all.
  const canPickOrderType = role === "Admin";

  const [guestCount, setGuestCount] = useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [orderType, setOrderType] = useState("Dine In");

  const increment = () => {
    if (guestCount >= 6) return;
    setGuestCount((prev) => prev + 1);
  };
  const decrement = () => {
    if (guestCount <= 0) return;
    setGuestCount((prev) => prev - 1);
  };

  const handleCreateOrder = () => {
    // Waiter can never actually be on "Packing" since the picker is
    // hidden for them, but this keeps it bulletproof either way.
    const effectiveType = canPickOrderType ? orderType : "Dine In";
    const isPacking = effectiveType === "Packing";

    dispatch(
      setCustomer({
        name: isPacking ? "Packing Order" : name,
        phone: isPacking ? "N/A" : phone,
        guests: guestCount,
        orderType: effectiveType,
      })
    );
    navigate(isPacking ? "/menu" : "/tables");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Order">
      {/* Diary-style card, matching the Auth page ticket look */}
      <div
        className="h-2"
        style={{
          backgroundImage:
            "linear-gradient(135deg, transparent 50%, #F3EEE3 50%), linear-gradient(-135deg, transparent 50%, #F3EEE3 50%)",
          backgroundPosition: "top left",
          backgroundSize: "16px 16px",
          backgroundRepeat: "repeat-x",
        }}
      />
      <div className="bg-[#F3EEE3] px-5 sm:px-7 py-6 rounded-b-lg">
        <div
          className="h-px w-full mb-5"
          style={{
            backgroundImage:
              "linear-gradient(to right, #C9BFAC 50%, transparent 0%)",
            backgroundSize: "8px 1px",
            backgroundRepeat: "repeat-x",
          }}
        />

        {canPickOrderType && (
          <div>
            <label className={`${labelFont} block text-[#8a806c] mb-2 text-[10px] tracking-widest`}>
              ORDER TYPE
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOrderType("Dine In")}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm border transition-colors ${
                  orderType === "Dine In"
                    ? "bg-[#BD5D31] border-[#BD5D31] text-[#F3EEE3]"
                    : "bg-[#e7e0d1] border-transparent text-[#6b6252] hover:border-[#BD5D31]/40"
                }`}
              >
                <MdTableBar size={18} /> On Table
              </button>
              <button
                type="button"
                onClick={() => setOrderType("Packing")}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm border transition-colors ${
                  orderType === "Packing"
                    ? "bg-[#BD5D31] border-[#BD5D31] text-[#F3EEE3]"
                    : "bg-[#e7e0d1] border-transparent text-[#6b6252] hover:border-[#BD5D31]/40"
                }`}
              >
                <MdOutlineTakeoutDining size={18} /> Packing
              </button>
            </div>
          </div>
        )}

        {(!canPickOrderType || orderType !== "Packing") && (
          <>
            <div>
              <label className={`${labelFont} block text-[#8a806c] mb-2 mt-5 text-[10px] tracking-widest`}>
                CUSTOMER NAME
              </label>
              <div className="flex items-center gap-3 border-b-2 border-[#C9BFAC] focus-within:border-[#BD5D31] transition-colors py-2">
                <FiUser className="text-[#8a806c] shrink-0" size={16} />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  placeholder="Enter customer name"
                  style={{ cursor: penCursor }}
                  className="bg-transparent flex-1 text-[#2A241D] placeholder:text-[#a89e8b] focus:outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className={`${labelFont} block text-[#8a806c] mb-2 mt-4 text-[10px] tracking-widest`}>
                CUSTOMER PHONE
              </label>
              <div className="flex items-center gap-3 border-b-2 border-[#C9BFAC] focus-within:border-[#BD5D31] transition-colors py-2">
                <FiPhone className="text-[#8a806c] shrink-0" size={16} />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                  maxLength={10}
                  placeholder="10-digit number"
                  style={{ cursor: penCursor }}
                  className="bg-transparent flex-1 text-[#2A241D] placeholder:text-[#a89e8b] focus:outline-none text-sm"
                />
              </div>
            </div>
          </>
        )}

        <div>
          <label className={`${labelFont} block mb-2 mt-5 text-[10px] tracking-widest text-[#8a806c]`}>
            GUESTS
          </label>
          <div className="flex items-center justify-between bg-[#e7e0d1] px-4 py-3 rounded-lg">
            <button
              type="button"
              onClick={decrement}
              className="text-[#BD5D31] text-2xl leading-none hover:text-[#a34f27]"
            >
              &minus;
            </button>
            <span className="text-[#2A241D] font-semibold w-20 text-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={guestCount}
                  initial={{ y: -6, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 6, opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className="inline-block"
                >
                  {guestCount} {guestCount === 1 ? "Person" : "People"}
                </motion.span>
              </AnimatePresence>
            </span>
            <button
              type="button"
              onClick={increment}
              className="text-[#BD5D31] text-2xl leading-none hover:text-[#a34f27]"
            >
              &#43;
            </button>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.96, rotate: -1 }}
          onClick={handleCreateOrder}
          className={`w-full rounded-md mt-8 py-3.5 text-sm font-bold tracking-widest ${labelFont} bg-[#BD5D31] text-[#F3EEE3] hover:bg-[#a34f27] transition-colors`}
        >
          CREATE ORDER
        </motion.button>
      </div>
    </Modal>
  );
};

export default CreateOrderModal;