import React from "react";

import {
  motion,
} from "framer-motion";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  FaBoxes,
  FaMinus,
  FaPlus,
} from "react-icons/fa";

import {
  IoMdClose,
} from "react-icons/io";

import {
  enqueueSnackbar,
} from "notistack";

import {
  getDishes,
  updateDishStock,
} from "../../https/index";

// ============================================================
// KITCHEN STOCK PANEL
//
// Kitchen can ONLY:
// - increase quantity
// - decrease quantity
// - mark in/out of stock
//
// Kitchen cannot:
// - change name
// - change price
// - change category
// - delete dish
// ============================================================

const StockPanel = ({
  onClose,
}) => {
  const queryClient =
    useQueryClient();

  // ==========================================================
  // DISHES
  // ==========================================================

  const {
    data: dishesRes,
    isLoading,
  } = useQuery({
    queryKey: [
      "dishes",
    ],
    queryFn:
      getDishes,
  });

  const dishes =
    dishesRes?.data?.data ||
    [];

  // ==========================================================
  // UPDATE STOCK
  // ==========================================================

  const updateMutation =
    useMutation({
      mutationFn:
        (payload) =>
          updateDishStock(
            payload
          ),

      // -------------------------------------------------------
      // Optimistic update
      // -------------------------------------------------------

      onMutate:
        async (
          payload
        ) => {
          await queryClient.cancelQueries(
            {
              queryKey: [
                "dishes",
              ],
            }
          );

          const previous =
            queryClient.getQueryData(
              [
                "dishes",
              ]
            );

          queryClient.setQueryData(
            [
              "dishes",
            ],
            (
              old
            ) => {
              if (
                !old?.data?.data
              ) {
                return old;
              }

              return {
                ...old,

                data: {
                  ...old.data,

                  data:
                    old.data.data.map(
                      (
                        dish
                      ) => {
                        if (
                          dish._id !==
                          payload.dishId
                        ) {
                          return dish;
                        }

                        return {
                          ...dish,

                          ...(payload.quantity !==
                          undefined
                            ? {
                                quantity:
                                  payload.quantity,
                              }
                            : {}),

                          ...(payload.isAvailable !==
                          undefined
                            ? {
                                isAvailable:
                                  payload.isAvailable,
                              }
                            : {}),
                        };
                      }
                    ),
                },
              };
            }
          );

          return {
            previous,
          };
        },

      // -------------------------------------------------------
      // Rollback
      // -------------------------------------------------------

      onError: (
        error,
        _payload,
        context
      ) => {
        if (
          context?.previous
        ) {
          queryClient.setQueryData(
            [
              "dishes",
            ],
            context.previous
          );
        }

        enqueueSnackbar(
          error?.response
            ?.data
            ?.message ||
            "Could not update stock!",
          {
            variant:
              "error",
          }
        );
      },

      // -------------------------------------------------------
      // Final server refresh
      // -------------------------------------------------------

      onSuccess:
        () => {
          enqueueSnackbar(
            "Stock updated!",
            {
              variant:
                "success",
            }
          );
        },

      onSettled:
        () => {
          queryClient.invalidateQueries(
            {
              queryKey: [
                "dishes",
              ],
            }
          );
        },
    });

  // ==========================================================
  // QUANTITY
  // ==========================================================

  const bumpQuantity =
    (
      dish,
      delta
    ) => {
      const current =
        Number(
          dish.quantity
        ) || 0;

      const next =
        Math.max(
          0,
          current + delta
        );

      updateMutation.mutate({
        dishId:
          dish._id,

        quantity:
          next,
      });
    };

  // ==========================================================
  // AVAILABILITY
  // ==========================================================

  const toggleAvailability =
    (
      dish
    ) => {
      const nextAvailable =
        !dish.isAvailable;

      updateMutation.mutate({
        dishId:
          dish._id,

        isAvailable:
          nextAvailable,
      });
    };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: -8,
      }}
      className="fixed inset-0 z-[60] bg-black/60 flex items-start sm:items-center justify-center px-3 py-6"
      onClick={
        onClose
      }
    >
      <div
        onClick={(event) =>
          event.stopPropagation()
        }
        className="bg-[#1B222B] w-full max-w-md rounded-xl overflow-hidden max-h-[85vh] flex flex-col"
      >

        {/* ==================================================
            HEADER
           ================================================== */}

        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a323d] shrink-0">

          <h2 className="text-[#F3EEE3] font-bold tracking-wide flex items-center gap-2">
            <FaBoxes className="text-[#BD5D31]" />

            Stock
          </h2>

          <button
            onClick={
              onClose
            }
            className="text-[#7d8797] hover:text-[#F3EEE3] transition-colors"
          >
            <IoMdClose
              size={20}
            />
          </button>

        </div>

        {/* ==================================================
            LIST
           ================================================== */}

        <div className="overflow-y-auto scrollbar-hide px-4 py-3 space-y-2">

          {isLoading && (
            <p className="text-[#7d8797] text-sm text-center py-6">
              Loading stock...
            </p>
          )}

          {!isLoading &&
            dishes.length ===
              0 && (
              <p className="text-[#7d8797] text-sm text-center py-6">
                No dishes found.
              </p>
            )}

          {dishes.map(
            (
              dish
            ) => {
              const qty =
                Number(
                  dish.quantity
                ) || 0;

              const isOut =
                !dish.isAvailable ||
                qty === 0;

              const isUpdating =
                updateMutation.isPending &&
                updateMutation.variables
                  ?.dishId ===
                  dish._id;

              return (
                <div
                  key={
                    dish._id
                  }
                  className="flex items-center justify-between bg-[#242c38] rounded-lg px-3 py-2.5 gap-2"
                >

                  {/* DISH */}

                  <div className="min-w-0">

                    <p className="text-[#F3EEE3] text-sm font-semibold truncate">
                      {
                        dish.name
                      }
                    </p>

                    <p className="text-[10px] text-[#7d8797]">
                      Qty:{" "}
                      {qty}
                    </p>

                  </div>

                  {/* CONTROLS */}

                  <div className="flex items-center gap-2 shrink-0">

                    <div className="flex items-center bg-[#1B222B] rounded-lg overflow-hidden">

                      <button
                        onClick={() =>
                          bumpQuantity(
                            dish,
                            -1
                          )
                        }
                        disabled={
                          isUpdating ||
                          qty <=
                            0
                        }
                        className="w-7 h-7 flex items-center justify-center text-[#BD5D31] hover:bg-[#2a323d] transition-colors disabled:opacity-30"
                      >
                        <FaMinus
                          size={10}
                        />
                      </button>

                      <span className="w-8 text-center text-[#F3EEE3] text-sm font-semibold">
                        {qty}
                      </span>

                      <button
                        onClick={() =>
                          bumpQuantity(
                            dish,
                            1
                          )
                        }
                        disabled={
                          isUpdating
                        }
                        className="w-7 h-7 flex items-center justify-center text-[#BD5D31] hover:bg-[#2a323d] transition-colors disabled:opacity-30"
                      >
                        <FaPlus
                          size={10}
                        />
                      </button>

                    </div>

                    {/* AVAILABILITY */}

                    <button
                      onClick={() =>
                        toggleAvailability(
                          dish
                        )
                      }
                      disabled={
                        isUpdating
                      }
                      title={
                        isOut
                          ? "Mark back in stock"
                          : "Mark out of stock"
                      }
                      className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors disabled:opacity-40 ${
                        isOut
                          ? "bg-red-500/20 text-red-400"
                          : "bg-[#1f3a2c] text-[#8FB89C]"
                      }`}
                    >
                      {isOut
                        ? "Out of Stock"
                        : "In Stock"}
                    </button>

                  </div>

                </div>
              );
            }
          )}

        </div>
      </div>
    </motion.div>
  );
};

export default StockPanel;