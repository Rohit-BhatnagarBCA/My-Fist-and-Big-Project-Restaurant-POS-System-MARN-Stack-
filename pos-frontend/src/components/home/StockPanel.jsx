import React from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FaBoxes, FaMinus, FaPlus } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { enqueueSnackbar } from "notistack";
import { getDishes, updateDish } from "../../https/index";

// Lightweight stock control for Kitchen — quantity +/- and an out-of-stock
// toggle only. No name/price/category editing, no add/delete.
const StockPanel = ({ onClose }) => {
  const queryClient = useQueryClient();
  const { data: dishesRes } = useQuery({ queryKey: ["dishes"], queryFn: getDishes });
  const dishes = dishesRes?.data?.data || [];

  const updateMutation = useMutation({
    mutationFn: (payload) => updateDish(payload),
    // Update the cached dish list immediately so +/- and the toggle feel
    // instant, instead of waiting on a full network round-trip.
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["dishes"] });
      const previous = queryClient.getQueryData(["dishes"]);

      queryClient.setQueryData(["dishes"], (old) => {
        if (!old?.data?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            data: old.data.data.map((d) =>
              d._id === payload.dishId ? { ...d, ...payload } : d
            ),
          },
        };
      });

      return { previous };
    },
    onError: (error, _payload, context) => {
      // Roll back to the pre-mutation list if the server rejects it.
      if (context?.previous) {
        queryClient.setQueryData(["dishes"], context.previous);
      }
      enqueueSnackbar(
        error?.response?.data?.message || "Could not update stock!",
        { variant: "error" }
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["dishes"] });
    },
  });

  const bumpQuantity = (dish, delta) => {
    const next = Math.max(0, (dish.quantity || 0) + delta);
    updateMutation.mutate({ dishId: dish._id, quantity: next });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="fixed inset-0 z-[60] bg-black/60 flex items-start sm:items-center justify-center px-3 py-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#1B222B] w-full max-w-md rounded-xl overflow-hidden max-h-[85vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a323d] shrink-0">
          <h2 className="text-[#F3EEE3] font-bold tracking-wide flex items-center gap-2">
            <FaBoxes className="text-[#BD5D31]" /> Stock
          </h2>
          <button
            onClick={onClose}
            className="text-[#7d8797] hover:text-[#F3EEE3] transition-colors"
          >
            <IoMdClose size={20} />
          </button>
        </div>

        <div className="overflow-y-auto scrollbar-hide px-4 py-3 space-y-2">
          {dishes.length === 0 && (
            <p className="text-[#7d8797] text-sm text-center py-6">No dishes found.</p>
          )}
          {dishes.map((dish) => {
            const qty = dish.quantity || 0;
            const isOut = !dish.isAvailable;
            return (
              <div
                key={dish._id}
                className="flex items-center justify-between bg-[#242c38] rounded-lg px-3 py-2.5 gap-2"
              >
                <div className="min-w-0">
                  <p className="text-[#F3EEE3] text-sm font-semibold truncate">
                    {dish.name}
                  </p>
                  <p className="text-[10px] text-[#7d8797]">Qty: {qty}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Quantity stepper — only this, no name/price/category editing */}
                  <div className="flex items-center bg-[#1B222B] rounded-lg overflow-hidden">
                    <button
                      onClick={() => bumpQuantity(dish, -1)}
                      className="w-7 h-7 flex items-center justify-center text-[#BD5D31] hover:bg-[#2a323d] transition-colors"
                    >
                      <FaMinus size={10} />
                    </button>
                    <span className="w-8 text-center text-[#F3EEE3] text-sm font-semibold">
                      {qty}
                    </span>
                    <button
                      onClick={() => bumpQuantity(dish, 1)}
                      className="w-7 h-7 flex items-center justify-center text-[#BD5D31] hover:bg-[#2a323d] transition-colors"
                    >
                      <FaPlus size={10} />
                    </button>
                  </div>

                  {/* Out of stock toggle */}
                  <button
                    onClick={() =>
                      updateMutation.mutate({
                        dishId: dish._id,
                        isAvailable: !dish.isAvailable,
                      })
                    }
                    title={isOut ? "Mark back in stock" : "Mark out of stock"}
                    className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                      isOut
                        ? "bg-red-500/20 text-red-400"
                        : "bg-[#1f3a2c] text-[#8FB89C]"
                    }`}
                  >
                    {isOut ? "Out of Stock" : "In Stock"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default StockPanel;