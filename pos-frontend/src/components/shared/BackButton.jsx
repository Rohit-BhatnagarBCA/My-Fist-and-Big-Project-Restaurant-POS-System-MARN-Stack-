import React from "react";
import { motion } from "framer-motion";
import { IoArrowBackOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={() => navigate(-1)}
      className="bg-[#025cca] p-2 text-xl font-bold rounded-full text-white"
    >
      <IoArrowBackOutline />
    </motion.button>
  );
};

export default BackButton;