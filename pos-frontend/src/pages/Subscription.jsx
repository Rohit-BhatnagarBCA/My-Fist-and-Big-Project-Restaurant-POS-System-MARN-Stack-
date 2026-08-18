import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiCheck, FiArrowLeft } from "react-icons/fi";

import {
  BUSINESS_PLANS,
  DURATIONS,
  savingsLabel,
} from "../config/pricing";

import {
  createSubscriptionOrder,
  verifySubscriptionPayment,
} from "../https";

const Subscription = () => {
  const navigate = useNavigate();

  const [selectedPlan, setSelectedPlan] = useState("Basic");
  const [selectedDuration, setSelectedDuration] = useState("Monthly");

  const plan = BUSINESS_PLANS.find(
    (item) => item.id === selectedPlan
  );

  const amount = plan.prices[selectedDuration];

  // ==========================================
  // CREATE RAZORPAY ORDER
  // ==========================================

  const createOrderMutation = useMutation({
    mutationFn: createSubscriptionOrder,

    onSuccess: (res) => {
      const { order } = res.data;

      if (!window.Razorpay) {
        enqueueSnackbar(
          "Razorpay SDK is not loaded!",
          { variant: "error" }
        );
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,

        amount: order.amount,
        currency: order.currency,

        name: "Restaurant POS",
        description: `${selectedPlan} - ${selectedDuration}`,

        order_id: order.id,

        handler: async function (response) {
          try {
            await verifySubscriptionPayment({
              razorpay_order_id:
                response.razorpay_order_id,

              razorpay_payment_id:
                response.razorpay_payment_id,

              razorpay_signature:
                response.razorpay_signature,

              plan: selectedPlan,
              duration: selectedDuration,
            });

            enqueueSnackbar(
              "Subscription activated successfully!",
              { variant: "success" }
            );

            navigate("/");
          } catch (error) {
            enqueueSnackbar(
              error?.response?.data?.message ||
                "Payment verification failed!",
              { variant: "error" }
            );
          }
        },

        theme: {
          color: "#BD5D31",
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.open();
    },

    onError: (error) => {
      enqueueSnackbar(
        error?.response?.data?.message ||
          "Unable to create payment order!",
        { variant: "error" }
      );
    },
  });

  // ==========================================
  // BUY / RENEW
  // ==========================================

  const handleSubscribe = () => {
    createOrderMutation.mutate({
      plan: selectedPlan,
      duration: selectedDuration,
    });
  };

  return (
    <div className="min-h-screen bg-[#12181F] text-[#F3EEE3] px-6 py-10">

      {/* HEADER */}

      <div className="max-w-6xl mx-auto">

        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-[#a89e8b] hover:text-[#F3EEE3] transition mb-8"
        >
          <FiArrowLeft />
          Back
        </button>

        <div className="text-center mb-10">

          <p className="font-['Space_Mono',_monospace] text-xs tracking-[0.3em] text-[#BD5D31] mb-3">
            RESTAURANT POS
          </p>

          <h1 className="text-4xl md:text-5xl font-bold">
            Choose your plan
          </h1>

          <p className="text-[#a89e8b] mt-3">
            Keep your restaurant running smoothly.
          </p>

        </div>


        {/* DURATION */}

        <div className="flex justify-center mb-10">

          <div className="flex gap-2 bg-[#1B222B] p-2 rounded-lg">

            {DURATIONS.map((duration) => (

              <button
                key={duration.id}
                onClick={() =>
                  setSelectedDuration(duration.id)
                }
                className={`px-5 py-2.5 rounded-md text-sm transition ${
                  selectedDuration === duration.id
                    ? "bg-[#BD5D31] text-[#F3EEE3]"
                    : "text-[#a89e8b] hover:text-[#F3EEE3]"
                }`}
              >
                {duration.label}
              </button>

            ))}

          </div>

        </div>


        {/* PLANS */}

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">

          {BUSINESS_PLANS.map((item) => {

            const selected =
              selectedPlan === item.id;

            const price =
              item.prices[selectedDuration];

            return (

              <motion.div
                key={item.id}
                whileHover={{ y: -5 }}
                onClick={() =>
                  setSelectedPlan(item.id)
                }
                className={`cursor-pointer rounded-xl p-7 border transition ${
                  selected
                    ? "border-[#BD5D31] bg-[#1B222B]"
                    : "border-[#2d3540] bg-[#1B222B]"
                }`}
              >

                {item.highlighted && (
                  <div className="inline-block mb-4 px-3 py-1 rounded-full bg-[#BD5D31] text-xs font-bold">
                    MOST POPULAR
                  </div>
                )}

                <h2 className="text-2xl font-bold">
                  {item.name}
                </h2>

                <p className="text-[#a89e8b] text-sm mt-2">
                  {item.tagline}
                </p>


                <div className="mt-6">

                  <span className="text-4xl font-bold">
                    ₹{price}
                  </span>

                  <span className="text-[#8a806c] ml-2">
                    / {selectedDuration}
                  </span>

                </div>


                {savingsLabel(
                  item,
                  selectedDuration
                ) && (
                  <p className="text-[#8FB89C] text-sm mt-2">
                    {savingsLabel(
                      item,
                      selectedDuration
                    )}
                  </p>
                )}


                <div className="mt-7 space-y-3">

                  {item.features.map((feature) => (

                    <div
                      key={feature}
                      className="flex gap-3 text-sm text-[#d8cfbd]"
                    >
                      <FiCheck
                        className="text-[#8FB89C] mt-0.5 shrink-0"
                      />

                      <span>{feature}</span>
                    </div>

                  ))}

                </div>

              </motion.div>

            );
          })}

        </div>


        {/* PAYMENT BUTTON */}

        <div className="max-w-4xl mx-auto mt-8">

          <button
            onClick={handleSubscribe}
            disabled={createOrderMutation.isPending}
            className="w-full py-4 rounded-lg bg-[#BD5D31] hover:bg-[#a34f27] disabled:bg-[#59463b] transition font-bold tracking-widest font-['Space_Mono',_monospace]"
          >
            {createOrderMutation.isPending
              ? "CREATING ORDER..."
              : `PAY ₹${amount} & ACTIVATE`}
          </button>

        </div>

      </div>

    </div>
  );
};

export default Subscription;