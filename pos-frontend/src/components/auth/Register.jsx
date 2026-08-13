import React, { useState } from "react";
import { motion } from "framer-motion";
import { enqueueSnackbar } from "notistack";
import { FiUser, FiMail, FiPhone, FiLock, FiArrowLeft, FiCheck } from "react-icons/fi";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import {
  quoteRegistrationPrice,
  createRegistrationOrder,
  verifyAndRegister,
} from "../../https";
import { DURATIONS, BUSINESS_PLANS } from "../../constants/pricing";

const labelFont = "font-['Space_Mono',_monospace]";

const roles = ["Waiter", "Kitchen", "Admin"];

function loadRazorpayScript(src) {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const TicketField = ({ label, icon: Icon, children }) => (
  <div>
    <label
      className={`${labelFont} block text-[#8a806c] mb-2 mt-4 text-[10px] tracking-widest`}
    >
      {label}
    </label>
    <div className="flex items-center gap-3 border-b-2 border-[#C9BFAC] focus-within:border-[#BD5D31] transition-colors py-2">
      <Icon className="text-[#8a806c] shrink-0" size={16} />
      {children}
    </div>
  </div>
);

const Register = ({ setIsRegister }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState("form"); // "form" | "plan"
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "",
  });

  // Plan step state
  const [selectedPlan, setSelectedPlan] = useState("Basic");
  const [selectedDuration, setSelectedDuration] = useState("Monthly");
  const [staffQuote, setStaffQuote] = useState(null); // { amount, isLinkedToAdmin }
  const [isQuoting, setIsQuoting] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const isAdmin = formData.role === "Admin";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelection = (selectedRole) => {
    setFormData({ ...formData, role: selectedRole });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.role) {
      enqueueSnackbar("Please select a role!", { variant: "warning" });
      return;
    }

    if (!isAdmin) {
      // Waiter/Kitchen — fetch their price quote (depends on whether their
      // email matches a currently-paying Admin) before showing the card.
      setIsQuoting(true);
      try {
        const { data } = await quoteRegistrationPrice({
          role: formData.role,
          email: formData.email,
        });
        setStaffQuote(data);
      } catch (error) {
        enqueueSnackbar(
          error?.response?.data?.message || "Could not calculate price.",
          { variant: "error" }
        );
        setIsQuoting(false);
        return;
      }
      setIsQuoting(false);
    }

    setStep("plan");
  };

  const handlePayAndRegister = async () => {
    setIsPaying(true);
    try {
      const res = await loadRazorpayScript(
        "https://checkout.razorpay.com/v1/checkout.js"
      );
      if (!res) {
        enqueueSnackbar("Razorpay SDK failed to load. Are you online?", {
          variant: "warning",
        });
        setIsPaying(false);
        return;
      }

      const payload = {
        role: formData.role,
        email: formData.email,
        plan: isAdmin ? selectedPlan : undefined,
        duration: isAdmin ? selectedDuration : undefined,
      };

      const { data } = await createRegistrationOrder(payload);

      const options = {
        key: `${import.meta.env.VITE_RAZORPAY_KEY_ID}`,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Restro POS",
        description: isAdmin
          ? `${selectedPlan} plan — ${selectedDuration}`
          : `${formData.role} account`,
        order_id: data.order.id,
        handler: async function (response) {
          try {
            const verifyRes = await verifyAndRegister({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              ...formData,
              plan: isAdmin ? selectedPlan : undefined,
              duration: isAdmin ? selectedDuration : undefined,
            });

            enqueueSnackbar(verifyRes.data.message, { variant: "success" });

            if (verifyRes.data.unlockedStaffDiscount) {
              setTimeout(() => {
                enqueueSnackbar(
                  "🎉 You can now add Waiter/Kitchen accounts with your admin email at 50% off!",
                  { variant: "info", autoHideDuration: 7000 }
                );
              }, 800);
            }

            setFormData({ name: "", email: "", phone: "", password: "", role: "" });
            setStep("form");
            setStaffQuote(null);
            setTimeout(() => setIsRegister(false), 1000);
          } catch (error) {
            enqueueSnackbar(
              error?.response?.data?.message || "Payment succeeded but registration failed. Contact support.",
              { variant: "error" }
            );
          } finally {
            setIsPaying(false);
          }
        },
        modal: {
          ondismiss: () => setIsPaying(false),
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: "#BD5D31" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      enqueueSnackbar(
        error?.response?.data?.message || "Could not start payment.",
        { variant: "error" }
      );
      setIsPaying(false);
    }
  };

  // ---------- PLAN STEP ----------
  if (step === "plan") {
    return (
      <div>
        <button
          type="button"
          onClick={() => setStep("form")}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#8a806c] hover:text-[#BD5D31] transition-colors mb-4"
        >
          <FiArrowLeft size={14} /> Back to details
        </button>

        {isAdmin ? (
          <>
            <label className={`${labelFont} block text-[#8a806c] mb-2 text-[10px] tracking-widest`}>
              CHOOSE DURATION
            </label>
            <div className="relative flex bg-[#e7e0d1] rounded-lg p-1 gap-1 mb-4">
              {DURATIONS.map((d) => {
                const active = selectedDuration === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDuration(d.id)}
                    className={`relative flex-1 py-2 rounded-md text-xs font-semibold transition-colors z-10 ${
                      active ? "text-[#F3EEE3]" : "text-[#6b6252]"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="duration-bg"
                        className="absolute inset-0 bg-[#BD5D31] rounded-md -z-10"
                        transition={{ type: "spring", duration: 0.4 }}
                      />
                    )}
                    {d.label}
                  </button>
                );
              })}
            </div>

            <div className="space-y-3">
              {BUSINESS_PLANS.map((plan) => {
                const active = selectedPlan === plan.id;
                const price = plan.prices[selectedDuration];
                return (
                  <button
                    type="button"
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`w-full text-left rounded-xl p-4 border-2 transition-colors ${
                      active
                        ? "border-[#BD5D31] bg-[#BD5D31]/5"
                        : "border-[#e7e0d1] hover:border-[#BD5D31]/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#2A241D]">{plan.name}</span>
                      <span className="font-bold text-[#BD5D31]">
                        ₹{price.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <p className="text-xs text-[#8a806c] mt-1">
                      {plan.excelExport ? "Includes Excel export" : "No Excel export"}
                    </p>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="bg-[#e7e0d1] rounded-xl p-5 text-center">
            {isQuoting || !staffQuote ? (
              <p className="text-sm text-[#6b6252]">Calculating your price…</p>
            ) : (
              <>
                <p className={`${labelFont} text-[10px] tracking-widest text-[#8a806c] mb-2`}>
                  {formData.role.toUpperCase()} ACCOUNT
                </p>
                <p className="text-3xl font-bold text-[#2A241D]">
                  ₹{staffQuote.amount}
                  <span className="text-sm font-medium text-[#8a806c]">/month</span>
                </p>
                <p className="text-xs text-[#6b6252] mt-2 flex items-center justify-center gap-1">
                  <FiCheck className="text-[#BD5D31]" />
                  {staffQuote.isLinkedToAdmin
                    ? "50% off — linked to your admin's paid account"
                    : "10% off — standalone account"}
                </p>
              </>
            )}
          </div>
        )}

        <motion.button
          whileHover={!isPaying ? { scale: 1.015 } : {}}
          whileTap={!isPaying ? { scale: 0.96 } : {}}
          type="button"
          disabled={isPaying || (!isAdmin && !staffQuote)}
          onClick={handlePayAndRegister}
          className={`w-full rounded-md mt-6 py-3.5 text-sm font-bold tracking-widest ${labelFont} transition-colors ${
            isPaying
              ? "bg-[#d8cfbd] text-[#8a806c] cursor-not-allowed"
              : "bg-[#BD5D31] text-[#F3EEE3] hover:bg-[#a34f27]"
          }`}
        >
          {isPaying ? "PROCESSING..." : "PAY & CREATE ACCOUNT"}
        </motion.button>
      </div>
    );
  }

  // ---------- FORM STEP ----------
  return (
    <form onSubmit={handleFormSubmit}>
      <TicketField label="EMPLOYEE NAME" icon={FiUser}>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Full name"
          className="bg-transparent flex-1 text-[#2A241D] placeholder:text-[#a89e8b] focus:outline-none text-sm"
          required
        />
      </TicketField>

      <TicketField label="EMPLOYEE EMAIL" icon={FiMail}>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@restro.com"
          className="bg-transparent flex-1 text-[#2A241D] placeholder:text-[#a89e8b] focus:outline-none text-sm"
          required
        />
      </TicketField>

      <TicketField label="EMPLOYEE PHONE" icon={FiPhone}>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="10-digit number"
          maxLength={10}
          className="bg-transparent flex-1 text-[#2A241D] placeholder:text-[#a89e8b] focus:outline-none text-sm"
          required
        />
      </TicketField>

      <TicketField label="PASSWORD" icon={FiLock}>
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          className="bg-transparent flex-1 text-[#2A241D] placeholder:text-[#a89e8b] focus:outline-none text-sm"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword((p) => !p)}
          className="text-[#8a806c] hover:text-[#BD5D31] transition-colors"
        >
          {showPassword ? <IoEyeOffOutline size={17} /> : <IoEyeOutline size={17} />}
        </button>
      </TicketField>

      <div>
        <label
          className={`${labelFont} block text-[#8a806c] mb-2 mt-5 text-[10px] tracking-widest`}
        >
          CHOOSE ROLE
        </label>
        <div className="relative flex bg-[#e7e0d1] rounded-lg p-1 gap-1">
          {roles.map((role) => {
            const active = formData.role === role;
            return (
              <button
                key={role}
                type="button"
                onClick={() => handleRoleSelection(role)}
                className={`relative flex-1 py-2.5 rounded-md text-sm font-semibold transition-colors z-10 ${
                  active ? "text-[#F3EEE3]" : "text-[#6b6252] hover:text-[#2A241D]"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="role-bg"
                    className="absolute inset-0 bg-[#BD5D31] rounded-md -z-10"
                    transition={{ type: "spring", duration: 0.4 }}
                  />
                )}
                {role}
              </button>
            );
          })}
        </div>
      </div>

      <motion.button
        whileHover={!isQuoting ? { scale: 1.015 } : {}}
        whileTap={!isQuoting ? { scale: 0.96, rotate: -1 } : {}}
        type="submit"
        disabled={isQuoting}
        className={`w-full rounded-md mt-8 py-3.5 text-sm font-bold tracking-widest ${labelFont} transition-colors ${
          isQuoting
            ? "bg-[#d8cfbd] text-[#8a806c] cursor-not-allowed"
            : "bg-[#BD5D31] text-[#F3EEE3] hover:bg-[#a34f27]"
        }`}
      >
        {isQuoting ? "CHECKING..." : "CONTINUE TO PLAN"}
      </motion.button>
    </form>
  );
};

export default Register;