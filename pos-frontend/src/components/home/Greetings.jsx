import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";

const labelFont = "font-['Space_Mono',_monospace]";

const getGreeting = (hour) => {
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};

const Greetings = () => {
  const userData = useSelector((state) => state.user);
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    return `${months[date.getMonth()]} ${String(date.getDate()).padStart(2, "0")}, ${date.getFullYear()}`;
  };

  const formatTime = (date) =>
    `${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes()
    ).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 px-4 sm:px-8 pt-6"
    >
      <div>
        <h1 className="text-[#F3EEE3] text-xl sm:text-2xl font-semibold tracking-wide">
          {getGreeting(dateTime.getHours())}, {userData.name || "TEST USER"}
        </h1>
        <p className="text-[#7d8797] text-sm mt-1">
          Give your best service for customers 😀
        </p>
      </div>
      <div className="sm:text-right">
        <h1
          className={`${labelFont} text-[#F3EEE3] text-2xl sm:text-3xl font-bold tracking-wide tabular-nums`}
        >
          {formatTime(dateTime)}
        </h1>
        <p className="text-[#7d8797] text-sm mt-1">{formatDate(dateTime)}</p>
      </div>
    </motion.div>
  );
};

export default Greetings;