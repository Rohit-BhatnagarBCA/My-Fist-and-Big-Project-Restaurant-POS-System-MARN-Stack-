import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FiCheck, FiArrowLeft } from "react-icons/fi";
import { MdOutlineTakeoutDining, MdTableBar, MdOutlineReceiptLong } from "react-icons/md";
import { BiSolidDish } from "react-icons/bi";
import logo from "../assets/images/logo.png";
import {
  DURATIONS,
  BUSINESS_PLANS,
  STAFF_LINKED_DISCOUNT_PRICE,
  STAFF_INDEPENDENT_DISCOUNT_PRICE,
  STAFF_BASE_PRICE,
  savingsLabel,
} from "../constants/pricing";

const labelFont = "font-['Space_Mono',_monospace]";
const bodyFont = "font-['Manrope',_sans-serif]";

const highlights = [
  {
    icon: MdTableBar,
    title: "Dine-In & Packing, one system",
    text: "Table service and takeaway orders both flow through the same live board — nothing gets missed.",
  },
  {
    icon: BiSolidDish,
    title: "Kitchen never misses a ticket",
    text: "A dedicated Kitchen Order Ticket board with live sync and sound alerts the moment a new order lands.",
  },
  {
    icon: MdOutlineReceiptLong,
    title: "Billing that just works",
    text: "Cash or Razorpay online payments, GST-ready totals, and direct thermal-printer receipts — no extra apps.",
  },
  {
    icon: MdOutlineTakeoutDining,
    title: "Built for every food business",
    text: "Restaurants, cloud kitchens, cafés, dhabas — if you take orders and bill customers, this fits.",
  },
];

const About = () => {
  const navigate = useNavigate();
  const [duration, setDuration] = useState("Monthly");

  return (
    <div className={`min-h-screen bg-[#12181F] ${bodyFont}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 sm:px-10 py-5">
        <button
          onClick={() => navigate("/auth")}
          className="flex items-center gap-2 text-[#F3EEE3]/70 hover:text-[#F3EEE3] transition-colors text-sm font-medium"
        >
          <FiArrowLeft /> Back
        </button>
        <div className="flex items-center gap-2">
          <img src={logo} alt="Restro" className="h-8 w-8 rounded-full ring-2 ring-[#BD5D31]/50" />
          <span className={`${labelFont} text-xs tracking-[0.25em] text-[#F3EEE3]`}>
            RESTRO&nbsp;POS
          </span>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-3xl mx-auto text-center px-5 pt-8 pb-14">
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${labelFont} text-[11px] tracking-[0.25em] text-[#BD5D31] mb-4`}
        >
          THE ORDER TICKET, DIGITIZED
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-3xl sm:text-5xl font-bold text-[#F3EEE3] leading-tight"
        >
          A billing counter, kitchen screen,
          <br className="hidden sm:block" /> and dashboard — in one app.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[#a8b0bc] mt-5 text-base sm:text-lg max-w-xl mx-auto"
        >
          Restro POS replaces the notebook, the calculator, and the shouting
          across the kitchen pass — with something built to run your whole
          front-of-house and back-of-house from one screen.
        </motion.p>
      </div>

      {/* Feature highlights */}
      <div className="max-w-5xl mx-auto px-5 grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
        {highlights.map(({ icon: Icon, title, text }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="bg-[#1B222B] rounded-xl p-5 flex gap-4"
          >
            <div className="bg-[#BD5D31]/15 text-[#BD5D31] p-3 rounded-lg h-fit shrink-0">
              <Icon size={22} />
            </div>
            <div>
              <h3 className="text-[#F3EEE3] font-semibold mb-1">{title}</h3>
              <p className="text-[#8b93a1] text-sm leading-relaxed">{text}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pricing */}
      <div className="max-w-5xl mx-auto px-5 pb-10">
        <div className="text-center mb-8">
          <p className={`${labelFont} text-[11px] tracking-[0.25em] text-[#BD5D31] mb-2`}>
            PRICING
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F3EEE3]">
            Simple plans, no surprises
          </h2>
        </div>

        {/* Duration toggle */}
        <div className="flex justify-center mb-8">
          <div className="relative flex bg-[#1B222B] rounded-full p-1">
            {DURATIONS.map((d) => {
              const active = duration === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setDuration(d.id)}
                  className={`relative px-5 py-2 text-sm font-semibold rounded-full transition-colors z-10 ${
                    active ? "text-[#12181F]" : "text-[#F3EEE3]/60 hover:text-[#F3EEE3]"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="about-duration-bg"
                      className="absolute inset-0 bg-[#F3EEE3] rounded-full -z-10"
                      transition={{ type: "spring", duration: 0.4 }}
                    />
                  )}
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
          {BUSINESS_PLANS.map((plan) => {
            const price = plan.prices[duration];
            const savings = savingsLabel(plan, duration);
            return (
              <div
                key={plan.id}
                className={`rounded-2xl p-6 flex flex-col ${
                  plan.highlighted
                    ? "bg-[#BD5D31] text-[#F3EEE3] ring-2 ring-[#e0a35c]"
                    : "bg-[#1B222B] text-[#F3EEE3]"
                }`}
              >
                {plan.highlighted && (
                  <span className="self-start bg-black/20 text-xs font-bold px-2.5 py-1 rounded-full mb-3">
                    MOST POPULAR
                  </span>
                )}
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className={`text-sm mt-1 mb-4 ${plan.highlighted ? "text-[#F3EEE3]/85" : "text-[#8b93a1]"}`}>
                  {plan.tagline}
                </p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold">₹{price.toLocaleString("en-IN")}</span>
                  <span className={`text-sm ${plan.highlighted ? "text-[#F3EEE3]/80" : "text-[#8b93a1]"}`}>
                    /{duration === "Yearly" ? "year" : duration === "4-Month" ? "4 months" : "month"}
                  </span>
                </div>
                {savings && (
                  <p className={`text-xs font-semibold mb-4 ${plan.highlighted ? "text-[#F3EEE3]" : "text-[#8FB89C]"}`}>
                    {savings}
                  </p>
                )}
                {!savings && <div className="mb-4" />}

                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <FiCheck className={`mt-0.5 shrink-0 ${plan.highlighted ? "text-[#F3EEE3]" : "text-[#BD5D31]"}`} />
                      <span className={plan.highlighted ? "text-[#F3EEE3]/95" : "text-[#c4cad4]"}>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => navigate("/auth")}
                  className={`w-full rounded-lg py-3 text-sm font-bold tracking-wide transition-colors ${
                    plan.highlighted
                      ? "bg-[#F3EEE3] text-[#BD5D31] hover:bg-white"
                      : "bg-[#BD5D31] text-[#F3EEE3] hover:bg-[#a34f27]"
                  }`}
                >
                  Get Started
                </button>
              </div>
            );
          })}
        </div>

        {/* Staff seat pricing note */}
        <div className="max-w-2xl mx-auto mt-8 bg-[#1B222B] rounded-xl p-5 text-center">
          <p className="text-[#F3EEE3] font-semibold mb-1">Adding Waiter & Kitchen staff</p>
          <p className="text-[#8b93a1] text-sm">
            Each staff seat is ₹{STAFF_BASE_PRICE}/month. Register them with
            your own admin email and pay just{" "}
            <span className="text-[#8FB89C] font-semibold">
              ₹{STAFF_LINKED_DISCOUNT_PRICE}/month
            </span>{" "}
            (50% off) — or ₹{STAFF_INDEPENDENT_DISCOUNT_PRICE}/month with a
            different email.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;