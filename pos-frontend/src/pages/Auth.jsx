import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import restaurant from "../assets/images/restaurant-img.jpg";
import logo from "../assets/images/logo.png";
import Register from "../components/auth/Register";
import Login from "../components/auth/Login";

const labelFont = "font-['Space_Mono',_monospace]";
const bodyFont = "font-['Manrope',_sans-serif]";

const tickets = [
  { table: "04", note: "2x Paneer Tikka", rotate: -6, top: "18%", left: "18%" },
  { table: "11", note: "1x Masala Dosa", rotate: 4, top: "42%", left: "58%" },
  { table: "07", note: "3x Cold Coffee", rotate: -3, top: "66%", left: "28%" },
];

const Auth = () => {
  useEffect(() => {
    document.title = "POS | Auth";
  }, []);

  const [isRegister, setIsRegister] = useState(false);

  return (
    <div
      className={`flex min-h-screen w-full bg-[#12181F] ${bodyFont}`}
    >
      {/* Left Section — order rail */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden">
        <img
          className="w-full h-full object-cover"
          src={restaurant}
          alt="Restaurant Image"
        />

        {/* Duotone overlay: ink + rust */}
        <div className="absolute inset-0 bg-[#12181F]/80" />
        <div
          className="absolute inset-0 mix-blend-color"
          style={{
            background:
              "linear-gradient(160deg, #12181F 10%, #BD5D31 100%)",
          }}
        />

        {/* Vertical rail line */}
        <div className="absolute left-1/2 top-[10%] bottom-[22%] w-px bg-[#F3EEE3]/25" />

        {/* Floating order tickets clipped to the rail */}
        {tickets.map((t, i) => (
          <motion.div
            key={t.table}
            initial={{ opacity: 0, y: -20, rotate: t.rotate - 8 }}
            animate={{
              opacity: 1,
              y: [0, -6, 0],
              rotate: t.rotate,
            }}
            transition={{
              opacity: { duration: 0.6, delay: 0.3 + i * 0.2 },
              y: {
                duration: 3 + i,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
                delay: 0.6 + i * 0.3,
              },
              rotate: { duration: 0.6, delay: 0.3 + i * 0.2 },
            }}
            className="absolute bg-[#F3EEE3] text-[#2A241D] px-4 py-3 rounded-sm shadow-xl w-[168px]"
            style={{ top: t.top, left: t.left }}
          >
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#BD5D31]" />
            <p className={`${labelFont} text-[10px] tracking-widest text-[#BD5D31] mb-1`}>
              TABLE {t.table}
            </p>
            <p className="text-sm font-medium leading-snug">{t.note}</p>
          </motion.div>
        ))}

        {/* Quote at bottom */}
        <div className="absolute bottom-12 px-10 w-full">
          <p className={`${labelFont} text-[11px] tracking-[0.2em] text-[#BD5D31] mb-3`}>
            FOUNDER'S NOTE
          </p>
          <blockquote className="text-xl italic text-[#F3EEE3] leading-relaxed">
            "Serve customers the best food with prompt and friendly service in
            a welcoming atmosphere, and they'll keep coming back."
          </blockquote>
          <span className={`${labelFont} block mt-4 text-sm text-[#F3EEE3]/70`}>
            — Founder of Restro
          </span>
        </div>
      </div>

      {/* Right Section — the ticket card */}
      <div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          {/* Wordmark */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-3 mb-8"
          >
            <img
              src={logo}
              alt="Restro Logo"
              className="h-12 w-12 rounded-full ring-2 ring-[#BD5D31]/50 p-0.5"
            />
            <h1
              className={`${labelFont} text-sm tracking-[0.3em] text-[#F3EEE3]`}
            >
              RESTRO&nbsp;POS
            </h1>
            <Link
              to="/about"
              className="text-xs font-semibold text-[#BD5D31] hover:underline"
            >
              About this app & pricing plans →
            </Link>
          </motion.div>

          {/* Tab switch */}
          <div className="flex justify-center mb-6">
            <div className="relative flex bg-[#1B222B] rounded-full p-1 w-full max-w-[280px]">
              {["Login", "Register"].map((tab) => {
                const active =
                  (tab === "Login" && !isRegister) ||
                  (tab === "Register" && isRegister);
                return (
                  <button
                    key={tab}
                    onClick={() => setIsRegister(tab === "Register")}
                    className={`relative flex-1 py-2 text-sm font-semibold rounded-full transition-colors z-10 ${
                      active ? "text-[#12181F]" : "text-[#F3EEE3]/60 hover:text-[#F3EEE3]"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="auth-tab-bg"
                        className="absolute inset-0 bg-[#F3EEE3] rounded-full -z-10"
                        transition={{ type: "spring", duration: 0.4 }}
                      />
                    )}
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>

          {/* The ticket card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            {/* torn top edge */}
            <div
              className="h-2"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, transparent 50%, #F3EEE3 50%), linear-gradient(-135deg, transparent 50%, #F3EEE3 50%)",
                backgroundPosition: "top left",
                backgroundSize: "16px 16px",
                backgroundRepeat: "repeat-x",
              }}
            />
            <div className="bg-[#F3EEE3] rounded-b-lg px-6 sm:px-8 py-8 shadow-2xl">
              <div className="mb-6 text-center">
                <p className={`${labelFont} text-[10px] tracking-[0.25em] text-[#BD5D31] mb-1`}>
                  {isRegister ? "NEW STAFF TICKET" : "STAFF ACCESS"}
                </p>
                <h2 className="text-2xl font-bold text-[#2A241D]">
                  {isRegister ? "Employee Registration" : "Employee Login"}
                </h2>
              </div>

              {/* dashed divider, receipt style */}
              <div
                className="h-px w-full mb-6"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, #C9BFAC 50%, transparent 0%)",
                  backgroundSize: "8px 1px",
                  backgroundRepeat: "repeat-x",
                }}
              />

              <AnimatePresence mode="wait">
                <motion.div
                  key={isRegister ? "register" : "login"}
                  initial={{ opacity: 0, x: isRegister ? 16 : -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRegister ? -16 : 16 }}
                  transition={{ duration: 0.2 }}
                >
                  {isRegister ? (
                    <Register setIsRegister={setIsRegister} />
                  ) : (
                    <Login />
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="flex justify-center mt-6">
                <p className="text-sm text-[#6b6252]">
                  {isRegister ? "Already have an account? " : "Don't have an account? "}
                  <button
                    type="button"
                    onClick={() => setIsRegister(!isRegister)}
                    className="text-[#BD5D31] font-semibold hover:underline"
                  >
                    {isRegister ? "Sign in" : "Sign up"}
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Auth;