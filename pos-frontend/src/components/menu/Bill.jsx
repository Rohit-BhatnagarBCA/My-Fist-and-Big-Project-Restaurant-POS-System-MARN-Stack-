import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { FaMoneyBillWave, FaRegCreditCard, FaPrint } from "react-icons/fa";
import { BsCheckCircleFill } from "react-icons/bs";
import { RiLoader4Line } from "react-icons/ri";

import { getTotalPrice } from "../../redux/slices/cartSlice";

import {
  addOrder,
  addItemsToOrder,
  updateTable,
} from "../../https/index";

import { enqueueSnackbar } from "notistack";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { removeAllItems } from "../../redux/slices/cartSlice";
import { removeCustomer } from "../../redux/slices/customerSlice";

import Invoice from "../invoice/Invoice";
import { usePrinter } from "../../context/PrinterContext";
import InfoAlert from "../shared/InfoAlert";

const paymentOptions = [
  { id: "Cash", label: "Cash", icon: FaMoneyBillWave },
  { id: "Online", label: "Online", icon: FaRegCreditCard },
];

const Bill = ({ onOrderPlaced }) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const { isConnected, isSupported, printReceipt } = usePrinter();

  const customerData = useSelector((state) => state.customer);
  const cartData = useSelector((state) => state.cart);

  const total = useSelector(getTotalPrice);

  const taxRate = 5.25;
  const tax = (total * taxRate) / 100;
  const totalPriceWithTax = total + tax;

  const [paymentMethod, setPaymentMethod] = useState();
  const [showInvoice, setShowInvoice] = useState(false);
  const [orderInfo, setOrderInfo] = useState();
  const [printAlert, setPrintAlert] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const isAppendMode = Boolean(customerData.existingOrderId);

  const handlePrintBill = async () => {
    if (cartData.length === 0) {
      enqueueSnackbar("Add items to the cart before printing.", {
        variant: "warning",
      });
      return;
    }

    if (!isSupported) {
      setPrintAlert({
        title: "Browser not supported",
        message:
          "Direct printer connections need Chrome or Edge. Please switch browsers to print.",
      });
      return;
    }

    if (!isConnected) {
      setPrintAlert({
        title: "Printer not connected",
        message:
          "We couldn't find a connected bill printer. Please plug it in, or pair it from Dashboard → Add Printer.",
      });
      return;
    }

    setIsPrinting(true);

    try {
      await printReceipt({
        orderDate: new Date(),
        table: customerData.table,
        customerDetails: {
          name: customerData.customerName,
          phone: customerData.customerPhone,
        },
        items: cartData,
        bills: {
          total,
          tax,
          totalWithTax: totalPriceWithTax,
        },
      });

      enqueueSnackbar("Bill printed!", {
        variant: "success",
      });
    } catch (error) {
      console.log(error);

      setPrintAlert({
        title: "Couldn't print",
        message:
          "The printer connection dropped while printing. Please check it and try again.",
      });
    } finally {
      setIsPrinting(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (cartData.length === 0) {
      enqueueSnackbar("Add items to the cart first!", {
        variant: "warning",
      });
      return;
    }

    // Adding items to an already-placed order.
    // Existing order payment method remains unchanged.
    if (isAppendMode) {
      addItemsMutation.mutate({
        orderId: customerData.existingOrderId,
        items: cartData,
      });
      return;
    }

    if (!paymentMethod) {
      enqueueSnackbar("Please select a payment method!", {
        variant: "warning",
      });
      return;
    }

    // Cash and Online now follow exactly the same order flow.
    // There is no external payment gateway here.
    const orderData = {
      customerDetails: {
        name: customerData.customerName,
        phone: customerData.customerPhone,
        guests: customerData.guests,
      },

      orderStatus: "In Progress",

      orderType: customerData.orderType,

      bills: {
        total: total,
        tax: tax,
        totalWithTax: totalPriceWithTax,
      },

      items: cartData,

      ...(customerData.orderType !== "Packing" && {
        table: customerData.table?.tableId,
      }),

      paymentMethod: paymentMethod,
    };

    orderMutation.mutate(orderData);
  };

  const orderMutation = useMutation({
    mutationFn: (reqData) => addOrder(reqData),

    onSuccess: (resData) => {
      const { data, stockAdjustments } = resData.data;

      setOrderInfo(data);

      queryClient.invalidateQueries({
        queryKey: ["dishes"],
      });

      queryClient.invalidateQueries({
        queryKey: ["orders"],
      });

      if (data.table) {
        const tableData = {
          status: "Booked",
          orderId: data._id,
          tableId: data.table,
        };

        setTimeout(() => {
          tableUpdateMutation.mutate(tableData);
        }, 1500);
      } else {
        // Packing orders have no table to book.
        dispatch(removeCustomer());
        dispatch(removeAllItems());
      }

      // Backend auto-adjusts quantities according to available stock.
      if (stockAdjustments && stockAdjustments.length > 0) {
        stockAdjustments.forEach((adj) => {
          enqueueSnackbar(
            `${adj.name}: only ${adj.given} of ${adj.requested} were available — order adjusted.`,
            {
              variant: "warning",
              autoHideDuration: 6000,
            }
          );
        });
      }

      enqueueSnackbar("Order Placed!", {
        variant: "success",
      });

      setShowInvoice(true);

      onOrderPlaced?.();
    },

    onError: (error) => {
      console.log(error);

      enqueueSnackbar(
        error?.response?.data?.message ||
          "Something went wrong while placing the order!",
        {
          variant: "error",
        }
      );
    },
  });

  const addItemsMutation = useMutation({
    mutationFn: (reqData) => addItemsToOrder(reqData),

    onSuccess: (resData) => {
      const { data, stockAdjustments } = resData.data;

      setOrderInfo(data);

      queryClient.invalidateQueries({
        queryKey: ["dishes"],
      });

      queryClient.invalidateQueries({
        queryKey: ["orders"],
      });

      if (stockAdjustments && stockAdjustments.length > 0) {
        stockAdjustments.forEach((adj) => {
          enqueueSnackbar(
            `${adj.name}: only ${adj.given} of ${adj.requested} were available — order adjusted.`,
            {
              variant: "warning",
              autoHideDuration: 6000,
            }
          );
        });
      }

      enqueueSnackbar("Items added to the order!", {
        variant: "success",
      });

      dispatch(removeCustomer());
      dispatch(removeAllItems());

      setShowInvoice(true);

      onOrderPlaced?.();
    },

    onError: (error) => {
      console.log(error);

      enqueueSnackbar(
        error?.response?.data?.message ||
          "Something went wrong while adding items to the order!",
        {
          variant: "error",
        }
      );
    },
  });

  const tableUpdateMutation = useMutation({
    mutationFn: (reqData) => updateTable(reqData),

    onSuccess: () => {
      dispatch(removeCustomer());
      dispatch(removeAllItems());
    },

    onError: (error) => {
      console.log(error);
    },
  });

  const isPlacingOrder =
    orderMutation.isPending ||
    tableUpdateMutation.isPending ||
    addItemsMutation.isPending;

  return (
    <div className="flex flex-col">
      {/* Price Summary */}
      <div className="px-5 pt-3 pb-1">
        <div className="flex items-center justify-between py-1.5">
          <p className="text-xs text-[#ababab] font-medium">
            Items ({cartData.length})
          </p>

          <h1 className="text-sm text-[#f5f5f5] font-semibold">
            ₹{total.toFixed(2)}
          </h1>
        </div>

        <div className="flex items-center justify-between py-1.5">
          <p className="text-xs text-[#ababab] font-medium">
            Tax ({taxRate}%)
          </p>

          <h1 className="text-sm text-[#f5f5f5] font-semibold">
            ₹{tax.toFixed(2)}
          </h1>
        </div>

        <div className="h-px bg-[#2a2a2a] my-2" />

        <div className="flex items-center justify-between py-1">
          <p className="text-sm text-[#f5f5f5] font-semibold">
            Total with Tax
          </p>

          <motion.h1
            key={totalPriceWithTax.toFixed(2)}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="text-xl text-yellow-400 font-bold"
          >
            ₹{totalPriceWithTax.toFixed(2)}
          </motion.h1>
        </div>
      </div>

      {/* Payment Method */}
      {isAppendMode ? (
        <div className="px-5 mt-2">
          <p className="text-xs text-[#ababab] font-medium bg-[#1f1f1f] border border-[#3a3a3a] rounded-lg px-4 py-3">
            These items will be added to the existing order for this table —
            no new payment needed.
          </p>
        </div>
      ) : (
        <div className="px-5 mt-2">
          <p className="text-xs text-[#ababab] font-medium mb-2 tracking-wide">
            PAYMENT METHOD
          </p>

          <div className="grid grid-cols-2 gap-3">
            {paymentOptions.map(({ id, label, icon: Icon }) => {
              const isActive = paymentMethod === id;

              return (
                <motion.button
                  key={id}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setPaymentMethod(id)}
                  className={`relative flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-colors border ${
                    isActive
                      ? "bg-[#2a2a2a] border-yellow-400 text-[#f5f5f5]"
                      : "bg-[#1f1f1f] border-transparent text-[#ababab] hover:border-[#3a3a3a]"
                  }`}
                >
                  <Icon
                    className={
                      isActive
                        ? "text-yellow-400"
                        : "text-[#ababab]"
                    }
                  />

                  {label}

                  {isActive && (
                    <motion.span
                      layoutId="payment-check"
                      className="absolute -top-1.5 -right-1.5 text-yellow-400 bg-[#1f1f1f] rounded-full"
                    >
                      <BsCheckCircleFill size={16} />
                    </motion.span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 px-5 mt-5 mb-3">
        <motion.button
          whileHover={!isPrinting ? { scale: 1.02 } : {}}
          whileTap={!isPrinting ? { scale: 0.97 } : {}}
          onClick={handlePrintBill}
          disabled={isPrinting}
          className={`flex items-center justify-center gap-2 border px-4 py-3 w-full rounded-xl font-semibold transition-colors ${
            isPrinting
              ? "bg-[#1f1f1f] border-[#3a3a3a] text-[#6a6a6a] cursor-not-allowed"
              : "bg-[#1f1f1f] border-[#3a3a3a] text-[#ababab] hover:text-[#f5f5f5] hover:border-[#4a4a4a]"
          }`}
        >
          {isPrinting ? (
            <RiLoader4Line className="animate-spin" />
          ) : (
            <FaPrint />
          )}

          {isPrinting ? "Printing..." : "Print"}
        </motion.button>

        <motion.button
          whileHover={!isPlacingOrder ? { scale: 1.02 } : {}}
          whileTap={!isPlacingOrder ? { scale: 0.97 } : {}}
          onClick={handlePlaceOrder}
          disabled={isPlacingOrder}
          className={`flex items-center justify-center gap-2 px-4 py-3 w-full rounded-xl font-semibold text-lg shadow-lg shadow-yellow-400/10 transition-colors ${
            isPlacingOrder
              ? "bg-[#3a3a3a] text-[#8a8a8a] cursor-not-allowed"
              : "bg-yellow-400 text-[#1f1f1f] hover:bg-yellow-300"
          }`}
        >
          <AnimatePresence mode="wait">
            {isPlacingOrder ? (
              <motion.span
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <RiLoader4Line className="animate-spin" />

                {isAppendMode ? "Adding..." : "Placing..."}
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {isAppendMode ? "Add To Order" : "Place Order"}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <AnimatePresence>
        {showInvoice && (
          <Invoice
            orderInfo={orderInfo}
            setShowInvoice={setShowInvoice}
          />
        )}
      </AnimatePresence>

      {printAlert && (
        <InfoAlert
          title={printAlert.title}
          message={printAlert.message}
          onClose={() => setPrintAlert(null)}
        />
      )}
    </div>
  );
};

export default Bill;