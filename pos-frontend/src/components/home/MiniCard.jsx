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
      className={`flex-1 bg-[#1B222B] rounded-xl p-5 flex flex-col justify-between gap-4 ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <p className={`${labelFont} text-[10px] tracking-widest text-[#7d8797]`}>
          {title.toUpperCase()}
        </p>
        <div className="bg-[#BD5D31]/15 text-[#BD5D31] p-2 rounded-lg text-lg">
          {icon}
        </div>
      </div>

      <h1 className="text-[#F3EEE3] text-3xl font-bold tabular-nums">
        {prefix}
        {displayValue}
      </h1>

      <p className="text-xs text-[#7d8797] flex items-center gap-1">
        <span className="flex items-center gap-0.5 text-[#8FB89C] font-semibold">
          <FiArrowUpRight size={13} />
          {footerNum}%
        </span>
        from last week
      </p>
    </motion.div>
  );
};

export default MiniCard;