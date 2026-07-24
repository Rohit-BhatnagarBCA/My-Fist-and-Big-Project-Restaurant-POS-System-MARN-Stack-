import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux"; // Redux state check karne ke liye
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import TableCard from "../components/tables/TableCard";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getTables } from "../https";

const Tables = () => {
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    document.title = "POS | Tables";
  }, []);

  const { data: resData } = useQuery({
    queryKey: ["tables"],
    queryFn: getTables,
    placeholderData: keepPreviousData,
  });

  const list = resData?.data?.data || [];
  const filtered = list.filter(t => filter === "all" ? true : t.status?.toLowerCase() === "booked");

  // Flow active hai ya nahi check karo (same as TableCard logic)
  const customerData = useSelector((state) => state.customer);
  const isFlowActive = !!(customerData?.customerName || customerData?.customerDetails?.name);

  return (
    <section className="bg-[#0D0D0D] min-h-screen text-[#F3EEE3] pb-28 font-['Manrope',_sans-serif] overflow-x-hidden w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 border-b border-[#242c38]">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-lg sm:text-xl font-bold font-['Space_Mono'] uppercase tracking-wider text-[#F3EEE3]">
            Floor Plan
          </h1>
        </div>
        
        {/* Toggle Controls */}
        <div className="flex bg-[#161616] p-1 border border-[#262626] w-full sm:w-auto rounded-lg">
          <button 
            onClick={() => setFilter("all")} 
            className={`flex-1 sm:flex-none px-5 py-2 text-xs font-['Space_Mono'] uppercase tracking-wider transition-all duration-150 rounded-md ${
              filter === "all" ? "bg-[#BD5D31] text-white font-bold" : "text-[#ababab] hover:text-[#F3EEE3]"
            }`}
          >
            All ({list.length})
          </button>
          <button 
            onClick={() => setFilter("booked")} 
            className={`flex-1 sm:flex-none px-5 py-2 text-xs font-['Space_Mono'] uppercase tracking-wider transition-all duration-150 rounded-md ${
              filter === "booked" ? "bg-[#BD5D31] text-white font-bold" : "text-[#ababab] hover:text-[#F3EEE3]"
            }`}
          >
            Booked ({list.filter(t => t.status?.toLowerCase() === "booked").length})
          </button>
        </div>
      </div>

      {/* 
        CRITICAL RESPONSIVE UPDATE: Yellow Warning Message
        - mx-2: Choti screen (320px) par left-right gap kam kiya hai taaki text na toote.
        - text-[11px] xs:text-xs sm:text-sm: Screen size ke hisab se text small aur dynamic scale hoga.
        - shrink-0 aur items-start sm:items-center: SVG icon ko center ya baseline par neat align rakhega.
      */}
      {!isFlowActive && (
        <div 
          className="mx-2 xs:mx-4 sm:mx-10 mt-4 mb-2 flex items-start sm:items-center gap-2 sm:gap-3 bg-[#4a452e] text-[#e0a35c] px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-[11px] xs:text-xs sm:text-sm leading-snug sm:leading-normal" 
          style={{ opacity: 1, transform: "none" }}
        >
          <svg 
            stroke="currentColor" 
            fill="currentColor" 
            strokeWidth="0" 
            viewBox="0 0 512 512" 
            className="shrink-0 mt-[2px] sm:mt-0" 
            height="1.2em" 
            width="1.2em" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M504 256c0 136.997-111.043 248-248 248S8 392.997 8 256C8 119.083 119.043 8 256 8s248 111.083 248 248zm-248 50c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595 46-46-20.595-46-46-46zm-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654z"></path>
          </svg>
          <span className="min-w-0">
            Start a new order first — tap the <span className="font-bold text-[#F3EEE3]">Order button</span> below before selecting a table.
          </span>
        </div>
      )}

      {/* Grid Layout (Perfect for all screen sizes) */}
      <div className="p-4 sm:p-6 w-full max-w-[1600px] mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {filtered.map(t => (
          <TableCard 
            key={t._id} 
            id={t._id} 
            name={t.tableNo} 
            status={t.status} 
            initials={t?.currentOrder?.customerDetails?.name} 
            seats={t.seats} 
          />
        ))}
      </div>

      <BottomNav />
    </section>
  );
};

export default Tables;