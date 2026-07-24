import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateTable } from "../../redux/slices/customerSlice";
import { getAvatarName } from "../../utils";
import { enqueueSnackbar } from "notistack";
import { FaLongArrowAltRight, FaCheck } from "react-icons/fa";

const TableCard = ({ id, name, status, initials, seats }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux se data select kiya
  const customerData = useSelector((state) => state.customer);
  const isBooked = status === "Booked";

  // STRICT FLOW VALIDATION: State ke andar check karenge customerDetails ya customerName ko
  const isFlowActive = !!(customerData?.customerName || customerData?.customerDetails?.name);

  const handleClick = () => {
    if (isBooked) return;

    // Strict Restriction: Agar user direct click karega toh block hoga aur warning dikhegi
    if (!isFlowActive) {
      enqueueSnackbar(
        "Please create an order first — tap the Order button below to add customer details.",
        { variant: "warning" }
      );
      return;
    }

    // Flow valid hone par hi dispatch hoga aur menu par jayega
    dispatch(updateTable({ table: { tableId: id, tableNo: name } }));
    navigate("/menu");
  };

  return (
    <motion.div
      onClick={handleClick}
      whileHover={!isBooked ? { y: -4 } : {}}
      whileTap={!isBooked ? { scale: 0.98 } : {}}
      // h-full lagaya taaki grid cells barabar broad rahein aur w-full flex-col dynamic layout banaye
      className={`p-3 sm:p-4 rounded-xl border border-transparent transition-colors flex flex-col justify-between h-full w-full min-w-0 select-none ${
        isBooked
          ? "bg-[#7a3a1f] cursor-not-allowed opacity-90"
          : "bg-[#1f4d3b] cursor-pointer hover:brightness-110"
      }`}
    >
      {/* Top Section: Choti screen (320px/360px) par elements ko shrink/wrap hone se bachane ke liye safe font sizes */}
      <div className="flex items-center justify-between gap-1 w-full min-w-0">
        <h1 className="text-[#F3EEE3] text-sm sm:text-base md:text-lg font-semibold flex items-center gap-1 min-w-0 truncate">
          Table 
          <FaLongArrowAltRight className="text-[#F3EEE3]/60 shrink-0" size={12} /> 
          <span className="truncate">{name}</span>
        </h1>
        <p className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md bg-black/20 text-[#F3EEE3] shrink-0 whitespace-nowrap">
          {status}
        </p>
      </div>

      {/* Middle Avatar Circle: Size scales perfectly from mobile (w-12 h-12) to desktop (w-16 h-16) */}
      <div className="flex items-center justify-center my-4 sm:my-5 md:my-6">
        <div
          className={`flex items-center justify-center rounded-full w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 font-bold text-sm sm:text-base md:text-lg transition-all shrink-0 ${
            isBooked ? "bg-[#F3EEE3] text-[#7a3a1f]" : "bg-[#F3EEE3] text-[#1f4d3b]"
          }`}
        >
          {isBooked ? (
            <span className="truncate px-1">{getAvatarName(initials) || "N/A"}</span>
          ) : (
            <FaCheck className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5" size={22} />
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="w-full">
        <hr className="border-[#F3EEE3]/15 w-full" />

        <div className="flex items-center justify-between mt-2.5 sm:mt-3 text-[11px] sm:text-xs md:text-sm">
          <span className="text-[#F3EEE3]/70">Seats</span>
          <span className="text-[#F3EEE3] font-semibold">{seats}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default TableCard;