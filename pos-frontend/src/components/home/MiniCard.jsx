import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiArrowUpRight } from "react-icons/fi";

const labelFont = "font-['Space_Mono',_monospace]";

// Small count-up effect for the headline number, purely visual.
const useCountUp = (target, duration = 800) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let startTime;
    let frame;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
};

const MiniCard = ({ title, icon, number, footerNum, prefix = "", onClick }) => {
  const displayValue = useCountUp(number);

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -3 }}
      whileTap={onClick ? { scale: 0.97 } : {}}
      className={`flex-1 bg-[#1B222B] rounded-xl p-3.5 sm:p-5 flex flex-col justify-between gap-3 sm:gap-4 min-w-0 ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className={`${labelFont} text-[9px] sm:text-[10px] tracking-widest text-[#7d8797] truncate`}>
          {title.toUpperCase()}
        </p>
        <div className="bg-[#BD5D31]/15 text-[#BD5D31] p-1.5 sm:p-2 rounded-lg text-base sm:text-lg shrink-0">
          {icon}
        </div>
      </div>

      <h1 className="text-[#F3EEE3] text-xl sm:text-3xl font-bold tabular-nums truncate">
        {prefix}
        {displayValue}
      </h1>

      <p className="text-[10px] sm:text-xs text-[#7d8797] flex items-center gap-1 whitespace-nowrap">
        <span className="flex items-center gap-0.5 text-[#8FB89C] font-semibold shrink-0">
          <FiArrowUpRight size={12} />
          {footerNum}%
        </span>
        <span className="truncate">from last week</span>
      </p>
    </motion.div>
  );
};

export default MiniCard;