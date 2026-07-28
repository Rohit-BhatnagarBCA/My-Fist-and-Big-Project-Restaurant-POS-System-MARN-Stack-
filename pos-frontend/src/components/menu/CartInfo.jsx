import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiDeleteBin2Fill } from "react-icons/ri";
import { FaNotesMedical } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { removeItem } from "../../redux/slices/cartSlice";

const CartInfo = () => {
  const cartData = useSelector((state) => state.cart);
  const scrollRef = useRef();
  const dispatch = useDispatch();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [cartData]);

  const handleRemove = (itemId) => {
    dispatch(removeItem(itemId));
  };

  return (
    <div className="px-4 py-2 ">
      <h1 className="text-lg text-[#e4e4e4] font-semibold tracking-wide">
        Order Details
      </h1>

      <div
        className="mt-4 overflow-y-scroll h-[220px] sm:h-[180px] scrollbar-hide"
        ref={scrollRef}
      >
        {cartData.length === 0 ? (
          <p className="text-[#ababab] text-sm flex justify-center items-center py-8 text-center px-6">
            Your cart is empty. Start adding items!
          </p>
        ) : (
          <AnimatePresence initial={false}>
            {cartData.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="bg-[#1f1f1f] rounded-lg px-4 py-4 mb-2"
              >
                <div className="flex items-center justify-between ">
                  <h1 className="text-[#ababab] font-semibold tracking-wide text-md truncate pr-2">
                    {item.name}
                  </h1>
                  <p className="text-[#ababab] font-semibold shrink-0">
                    x{item.quantity}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-3">
                    <RiDeleteBin2Fill
                      onClick={() => handleRemove(item.id)}
                      className="text-[#ababab] cursor-pointer hover:text-red-400 transition-colors"
                      size={20}
                    />
                    <FaNotesMedical
                      className="text-[#ababab] cursor-pointer hover:text-yellow-400 transition-colors"
                      size={20}
                    />
                  </div>
                  <p className="text-[#f5f5f5] text-md font-bold">
                    ₹{item.price}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default CartInfo;