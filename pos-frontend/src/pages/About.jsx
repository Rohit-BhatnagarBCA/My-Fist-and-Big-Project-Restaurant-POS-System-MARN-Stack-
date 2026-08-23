import React, {
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  useNavigate,
} from "react-router-dom";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  useMutation,
} from "@tanstack/react-query";

import {
  FiArrowLeft,
  FiCheck,
  FiZap,
  FiTrendingUp,
  FiPlusCircle,
  FiAlertTriangle,
  FiLogOut,
  FiUsers,
  FiActivity,
} from "react-icons/fi";

import {
  MdTableBar,
  MdOutlineReceiptLong,
} from "react-icons/md";

import {
  BiSolidDish,
} from "react-icons/bi";

import logo from "../assets/images/logo.png";

import {
  logout,
} from "../https";

import {
  removeUser,
} from "../redux/slices/userSlice";

import {
  DURATIONS,
  BUSINESS_PLANS,
  STAFF_LINKED_DISCOUNT_PRICE,
  STAFF_BASE_PRICE,
  savingsLabel,
} from "../constants/pricing";

const labelFont =
  "font-['Space_Mono',_monospace]";

const bodyFont =
  "font-['Manrope',_sans-serif]";

// ============================================================
// FEATURES
// ============================================================

const repoFeatures = [
  {
    icon: FiPlusCircle,
    badge: "ADMIN CONTROL",
    title:
      "Custom Category, Dishes & Tables",
    text:
      "Admin gets full control to dynamically add/edit menu items, categories, pricing, and create new table layouts on the fly.",
  },

  {
    icon: FiAlertTriangle,
    badge: "KITCHEN SYNC",
    title:
      "Live Stock & Menu Restriction",
    text:
      "Food items running out? Kitchen staff can update quantities or lock items instantly, stopping Waiters from taking unavailable orders.",
  },

  {
    icon: MdTableBar,
    badge: "MULTI-ROLE ORDERING",
    title:
      "Waiter & Admin Order Punching",
    text:
      "Waiters and Admins can both punch orders directly to assigned tables with real-time status updates across all connected devices.",
  },

  {
    icon: BiSolidDish,
    badge: "KITCHEN PASS",
    title:
      "Live KOT Board + Sound Alerts",
    text:
      "Dedicated KOT screen with instant audio notifications as soon as an order is fired by the waiter or admin.",
  },

  {
    icon: FiTrendingUp,
    badge: "ANALYTICS",
    title:
      "Top-Selling Dishes & Sales Insights",
    text:
      "Calculates total order metrics to highlight your best-selling items, peak operational hours, and real-time sales breakdowns.",
  },

  {
    icon: MdOutlineReceiptLong,
    badge: "BILLING",
    title:
      "Thermal Bills & GST Ready",
    text:
      "One-click split payments, discount application, cash/online tags, and direct thermal printer output.",
  },
];

// ============================================================
// TECH STACK
// ============================================================

const techStack = [
  "MongoDB",
  "Express.js",
  "React.js",
  "Node.js",
  "Redux Toolkit",
  "Framer Motion",
  "Tailwind CSS",
];

// ============================================================
// ABOUT PAGE
// ============================================================

const About = () => {
  const navigate =
    useNavigate();

  const dispatch =
    useDispatch();

  const userData =
    useSelector(
      (state) => state.user
    );

  const [duration, setDuration] =
    useState("Monthly");

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const logoutMutation =
    useMutation({
      mutationFn: () =>
        logout(),

      onSuccess: () => {
        dispatch(
          removeUser()
        );

        navigate(
          "/auth",
          {
            replace: true,
          }
        );
      },

      onError: () => {
        // Even if backend logout
        // fails, clear frontend auth.
        dispatch(
          removeUser()
        );

        navigate(
          "/auth",
          {
            replace: true,
          }
        );
      },
    });

  const handleLogout =
    () => {
      if (
        logoutMutation.isPending
      ) {
        return;
      }

      logoutMutation.mutate();
    };

  // ==========================================================
  // GET STARTED
  //
  // Logged in:
  //      -> /subscription
  //
  // Logged out:
  //      -> /auth
  // ==========================================================

  const handleGetStarted =
    () => {
      if (
        userData?.isAuth
      ) {
        navigate(
          "/subscription"
        );

        return;
      }

      navigate(
        "/auth"
      );
    };

  return (
    <div
      className={`min-h-screen bg-[#0E131A] text-[#F3EEE3] selection:bg-[#BD5D31] selection:text-white ${bodyFont} relative overflow-hidden`}
    >

      {/* =====================================================
          BACKGROUND GLOW
         ===================================================== */}

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[#BD5D31]/15 blur-[140px] pointer-events-none rounded-full" />

      <div className="absolute top-[40%] right-0 w-[400px] h-[400px] bg-[#BD5D31]/5 blur-[150px] pointer-events-none rounded-full" />

      {/* =====================================================
          NAVBAR
         ===================================================== */}

      <nav className="relative z-10 flex items-center justify-between px-5 sm:px-8 lg:px-12 py-5 border-b border-[#1E2633]/80 bg-[#0E131A]/85 backdrop-blur-md sticky top-0">

        {/* LEFT */}

        <button
          onClick={() =>
            navigate(-1)
          }
          className="flex items-center gap-2 text-[#8C95A5] hover:text-[#F3EEE3] transition-colors text-sm font-semibold group"
        >
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform text-lg" />

          Back
        </button>

        {/* CENTER LOGO */}

        <div className="flex items-center gap-3">

          <img
            src={logo}
            alt="Restro POS Logo"
            className="h-9 w-9 rounded-full ring-2 ring-[#BD5D31]/50 shadow-md shadow-[#BD5D31]/20"
          />

          <span
            className={`${labelFont} hidden sm:inline text-xs tracking-[0.3em] font-bold text-[#F3EEE3]`}
          >
            RESTRO&nbsp;POS
          </span>

        </div>

        {/* RIGHT */}

        {userData?.isAuth ? (
          <div className="flex items-center gap-2">

            {/* PROFILE */}

            <button
              onClick={() =>
                navigate(
                  "/profile"
                )
              }
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1B222B] border border-[#2a323d] hover:border-[#BD5D31]/50 hover:bg-[#242c38] transition-all text-sm font-semibold"
            >
              <FiUsers />
              Profile
            </button>

            {/* LOGOUT */}

            <button
              onClick={
                handleLogout
              }
              disabled={
                logoutMutation.isPending
              }
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1B222B] border border-[#2a323d] text-[#F3EEE3] hover:bg-[#242c38] hover:border-[#BD5D31]/50 transition-all text-sm font-semibold disabled:opacity-50"
            >
              <FiLogOut />

              <span className="hidden sm:inline">
                {logoutMutation.isPending
                  ? "Logging out..."
                  : "Logout"}
              </span>
            </button>

          </div>
        ) : (
          <button
            onClick={() =>
              navigate(
                "/auth"
              )
            }
            className="px-4 py-2 rounded-lg bg-[#BD5D31] hover:bg-[#a64e26] text-[#F3EEE3] font-bold text-sm transition-all"
          >
            Login
          </button>
        )}

      </nav>

      {/* =====================================================
          HERO
         ===================================================== */}

      <section className="relative z-10 max-w-5xl mx-auto text-center px-6 pt-12 pb-16">

        <motion.div
          initial={{
            opacity: 0,
            y: -10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="inline-flex items-center gap-2 bg-[#BD5D31]/15 border border-[#BD5D31]/30 rounded-full px-4 py-1.5 mb-6"
        >
          <FiZap className="text-[#BD5D31] text-xs animate-pulse" />

          <span
            className={`${labelFont} text-[10px] tracking-[0.25em] text-[#BD5D31] font-bold`}
          >
            RESTAURANT MANAGEMENT OS
          </span>
        </motion.div>

        <motion.h1
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.1,
          }}
          className="text-4xl sm:text-6xl font-extrabold text-[#F3EEE3] leading-[1.15] tracking-tight"
        >
          Manage Dishes,
          Kitchen Pass
          <br className="hidden sm:block" />
          & Live Orders —
          All Seamlessly.
        </motion.h1>

        <motion.p
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.2,
          }}
          className="text-[#929CAE] mt-6 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
        >
          From menu customization by
          Admins to live menu restrictions
          from Kitchen staff, Restro POS keeps
          your entire front and back of house
          synced in real time.
        </motion.p>

        {/* TECH */}

        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.3,
          }}
          className="flex flex-wrap items-center justify-center gap-2 mt-8"
        >

          {techStack.map(
            (tech) => (
              <span
                key={tech}
                className={`${labelFont} text-[10px] tracking-wider font-semibold bg-[#18212D] border border-[#253040] text-[#A3ADB8] px-3 py-1 rounded-md`}
              >
                {tech}
              </span>
            )
          )}

        </motion.div>

      </section>

      {/* =====================================================
          FEATURES
         ===================================================== */}

      <section className="relative z-10 max-w-6xl mx-auto px-6 mb-24">

        <div className="text-center mb-12">

          <p
            className={`${labelFont} text-[11px] tracking-[0.25em] text-[#BD5D31] font-bold mb-2`}
          >
            POWERFUL FEATURES
          </p>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F3EEE3]">
            Engineered for
            Fast-Paced Restaurants
          </h2>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

          {repoFeatures.map(
            (
              {
                icon: Icon,
                badge,
                title,
                text,
              },
              index
            ) => (
              <motion.div
                key={title}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  delay:
                    0.05 *
                    index,
                }}
                className="bg-[#141B24] hover:bg-[#18222E] border border-[#212C3B] hover:border-[#BD5D31]/50 rounded-2xl p-6 transition-all duration-300 shadow-xl group"
              >

                <div className="flex items-center justify-between mb-5">

                  <div className="bg-[#BD5D31]/15 text-[#BD5D31] p-3 rounded-xl group-hover:scale-110 transition-transform">
                    <Icon
                      size={22}
                    />
                  </div>

                  <span
                    className={`${labelFont} text-[9px] tracking-wider font-bold text-[#BD5D31] bg-[#BD5D31]/10 px-2.5 py-1 rounded-md border border-[#BD5D31]/20`}
                  >
                    {badge}
                  </span>

                </div>

                <h3 className="text-[#F3EEE3] text-lg font-bold mb-2">
                  {title}
                </h3>

                <p className="text-[#838D9E] text-xs leading-relaxed">
                  {text}
                </p>

              </motion.div>
            )
          )}

        </div>

      </section>

      {/* =====================================================
          PRICING
         ===================================================== */}

      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-20">

        <div className="text-center mb-10">

          <p
            className={`${labelFont} text-[11px] tracking-[0.25em] text-[#BD5D31] font-bold mb-2`}
          >
            BUSINESS PLANS
          </p>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F3EEE3]">
            Flexible plans for
            every restaurant
          </h2>

        </div>

        {/* =================================================
            DURATION
           ================================================= */}

        <div className="flex justify-center mb-10">

          <div className="relative flex flex-wrap justify-center bg-[#141B24] border border-[#212C3B] rounded-full p-1.5 shadow-inner">

            {DURATIONS.map(
              (item) => {
                const active =
                  duration ===
                  item.id;

                return (
                  <button
                    key={
                      item.id
                    }
                    onClick={() =>
                      setDuration(
                        item.id
                      )
                    }
                    className={`relative px-6 py-2 text-xs sm:text-sm font-bold rounded-full transition-colors z-10 ${
                      active
                        ? "text-[#0E131A]"
                        : "text-[#838D9E] hover:text-[#F3EEE3]"
                    }`}
                  >

                    {active && (
                      <motion.span
                        layoutId="about-duration-active"
                        className="absolute inset-0 bg-[#F3EEE3] rounded-full -z-10 shadow-md"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}

                    {
                      item.label
                    }

                  </button>
                );
              }
            )}

          </div>

        </div>

        {/* =================================================
            PLAN CARDS
           ================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">

          {BUSINESS_PLANS.map(
            (item) => {
              const price =
                item.prices[
                  duration
                ];

              const savings =
                savingsLabel(
                  item,
                  duration
                );

              return (
                <div
                  key={
                    item.id
                  }
                  className={`rounded-2xl p-7 flex flex-col relative transition-all duration-300 ${
                    item.highlighted
                      ? "bg-gradient-to-b from-[#BD5D31] to-[#92421D] text-[#F3EEE3] shadow-2xl shadow-[#BD5D31]/25 ring-2 ring-[#E38558]"
                      : "bg-[#141B24] border border-[#212C3B] text-[#F3EEE3]"
                  }`}
                >

                  {item.highlighted && (
                    <span
                      className={`${labelFont} absolute -top-3 left-6 bg-[#F3EEE3] text-[#BD5D31] text-[10px] font-bold px-3 py-0.5 rounded-full shadow`}
                    >
                      POPULAR CHOICE
                    </span>
                  )}

                  <h3 className="text-2xl font-bold mt-1">
                    {
                      item.name
                    }
                  </h3>

                  <p
                    className={`text-xs mt-1 mb-5 ${
                      item.highlighted
                        ? "text-[#F3EEE3]/90"
                        : "text-[#838D9E]"
                    }`}
                  >
                    {
                      item.tagline
                    }
                  </p>

                  <div className="flex items-baseline gap-1.5 mb-2">

                    <span className="text-4xl font-extrabold tracking-tight">
                      ₹
                      {price.toLocaleString(
                        "en-IN"
                      )}
                    </span>

                    <span
                      className={`text-xs ${
                        item.highlighted
                          ? "text-[#F3EEE3]/80"
                          : "text-[#838D9E]"
                      }`}
                    >
                      /
                      {duration ===
                      "Yearly"
                        ? "year"
                        : duration ===
                          "4-Month"
                        ? "4 months"
                        : "month"}
                    </span>

                  </div>

                  {savings ? (
                    <p
                      className={`text-xs font-bold mb-5 ${
                        item.highlighted
                          ? "text-[#F3EEE3]"
                          : "text-[#8FB89C]"
                      }`}
                    >
                      {savings}
                    </p>
                  ) : (
                    <div className="mb-5" />
                  )}

                  <ul className="space-y-3 mb-8 flex-1 border-t border-white/10 pt-5">

                    {item.features.map(
                      (feature) => (
                        <li
                          key={
                            feature
                          }
                          className="flex items-start gap-2.5 text-xs sm:text-sm"
                        >

                          <FiCheck
                            className={`mt-0.5 shrink-0 text-base ${
                              item.highlighted
                                ? "text-[#F3EEE3]"
                                : "text-[#BD5D31]"
                            }`}
                          />

                          <span
                            className={
                              item.highlighted
                                ? "text-[#F3EEE3]"
                                : "text-[#A0AAB8]"
                            }
                          >
                            {feature}
                          </span>

                        </li>
                      )
                    )}

                  </ul>

                  {/* =================================================
                      THIS IS THE IMPORTANT FIX
                     ================================================= */}

                  <button
                    onClick={
                      handleGetStarted
                    }
                    className={`w-full rounded-xl py-3.5 text-sm font-extrabold tracking-wide transition-transform active:scale-95 shadow-lg ${
                      item.highlighted
                        ? "bg-[#F3EEE3] text-[#BD5D31] hover:bg-white"
                        : "bg-[#BD5D31] text-[#F3EEE3] hover:bg-[#a64e26]"
                    }`}
                  >
                    Get Started
                  </button>

                </div>
              );
            }
          )}

        </div>

        {/* =================================================
            STAFF
           ================================================= */}

        <div className="max-w-3xl mx-auto mt-8 bg-[#141B24] border border-[#212C3B] rounded-2xl p-6 text-center shadow-md">

          <div className="flex items-center justify-center gap-2 mb-2">

            <FiActivity className="text-[#BD5D31]" />

            <p className="text-[#F3EEE3] font-bold text-sm">
              Add Waiters & Kitchen Accounts
            </p>

          </div>

          <p className="text-[#838D9E] text-xs leading-relaxed">
            Staff seats cost ₹
            {STAFF_BASE_PRICE}
            /mo each. Get 50% discount
            at{" "}
            <span className="text-[#8FB89C] font-bold">
              ₹
              {
                STAFF_LINKED_DISCOUNT_PRICE
              }
              /mo
            </span>{" "}
            when registered using your
            main Admin email link.
          </p>

        </div>

      </section>

    </div>
  );
};

export default About;