import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdPrintDisabled } from "react-icons/md";

const labelFont = "font-['Space_Mono',_monospace]";

const InfoAlert = ({ title, message, actionLabel, onAction, onClose }) => (
  <AnimatePresence>
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[80] px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 8 }}
        transition={{ duration: 0.2 }}
        className="bg-[#1B222B] p-6 rounded-2xl shadow-xl w-full max-w-sm text-center"
      >
        <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-[#3a2c1f] flex items-center justify-center text-[#e0a35c]">
          <MdPrintDisabled size={26} />
        </div>
        <p className={`${labelFont} text-[10px] tracking-widest text-[#e0a35c] mb-2`}>
          PRINTER
        </p>
        <h3 className="text-[#F3EEE3] text-lg font-semibold mb-2">{title}</h3>
        <p className="text-[#7d8797] text-sm mb-6">{message}</p>
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-[#7d8797] hover:text-[#F3EEE3] border border-[#2a323d] hover:border-[#3a4350] transition-colors"
          >
            Close
          </button>
          {actionLabel && (
            <button
              onClick={onAction}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-[#BD5D31] text-[#F3EEE3] hover:bg-[#a34f27] transition-colors"
            >
              {actionLabel}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  </AnimatePresence>
);

export default InfoAlert;