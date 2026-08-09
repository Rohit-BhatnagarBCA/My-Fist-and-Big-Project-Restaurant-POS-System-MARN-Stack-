import React, { useState } from "react";
import { motion } from "framer-motion";
import { register } from "../../https";
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { FiUser, FiMail, FiPhone, FiLock } from "react-icons/fi";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

const labelFont = "font-['Space_Mono',_monospace]";

const roles = ["Waiter", "Kitchen", "Admin"];

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
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelection = (selectedRole) => {
    setFormData({ ...formData, role: selectedRole });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.role) {
      enqueueSnackbar("Please select a role!", { variant: "warning" });
      return;
    }
    registerMutation.mutate(formData);
  };

  const registerMutation = useMutation({
    mutationFn: (reqData) => register(reqData),
    onSuccess: (res) => {
      const { data } = res;
      enqueueSnackbar(data.message, { variant: "success" });
      setFormData({ name: "", email: "", phone: "", password: "", role: "" });

      setTimeout(() => {
        setIsRegister(false);
      }, 1200);
    },
    onError: (error) => {
      const { response } = error;
      enqueueSnackbar(response?.data?.message || "Registration failed!", {
        variant: "error",
      });
    },
  });

  return (
    <form onSubmit={handleSubmit}>
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
        whileHover={!registerMutation.isPending ? { scale: 1.015 } : {}}
        whileTap={!registerMutation.isPending ? { scale: 0.96, rotate: -1 } : {}}
        type="submit"
        disabled={registerMutation.isPending}
        className={`w-full rounded-md mt-8 py-3.5 text-sm font-bold tracking-widest ${labelFont} transition-colors ${
          registerMutation.isPending
            ? "bg-[#d8cfbd] text-[#8a806c] cursor-not-allowed"
            : "bg-[#BD5D31] text-[#F3EEE3] hover:bg-[#a34f27]"
        }`}
      >
        {registerMutation.isPending ? "CREATING..." : "SIGN UP"}
      </motion.button>
    </form>
  );
};

export default Register;