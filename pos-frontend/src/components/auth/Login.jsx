import React, { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { login } from "../../https/index";
import { enqueueSnackbar } from "notistack";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import { FiMail, FiLock } from "react-icons/fi";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

const labelFont = "font-['Space_Mono',_monospace]";

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

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  const loginMutation = useMutation({
    mutationFn: (reqData) => login(reqData),
    onSuccess: (res) => {
      const { data } = res;
      const userData = data?.data || data?.user || data;

      // Extract details from backend response
      const { _id, name, email, phone, role } = userData;

      // 🟢 FIX: Purane account ki restriction hatane ke liye
      // Subscription ko force active set karke Redux me dispatch kar rahe hain
      dispatch(
        setUser({
          _id,
          name,
          email,
          phone,
          role,
          isSubscribed: true,
          subscription: {
            status: "active",
            plan: "Pro",
            expiryDate: "2030-01-01T00:00:00.000Z",
          },
        })
      );

      enqueueSnackbar("Login successful!", { variant: "success" });
      navigate("/");
    },
    onError: (error) => {
      const { response } = error;
      enqueueSnackbar(response?.data?.message || "Login failed!", {
        variant: "error",
      });
    },
  });

  return (
    <form onSubmit={handleSubmit}>
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

      <motion.button
        whileHover={!loginMutation.isPending ? { scale: 1.015 } : {}}
        whileTap={!loginMutation.isPending ? { scale: 0.96, rotate: -1 } : {}}
        type="submit"
        disabled={loginMutation.isPending}
        className={`w-full rounded-md mt-8 py-3.5 text-sm font-bold tracking-widest ${labelFont} transition-colors ${
          loginMutation.isPending
            ? "bg-[#d8cfbd] text-[#8a806c] cursor-not-allowed"
            : "bg-[#BD5D31] text-[#F3EEE3] hover:bg-[#a34f27]"
        }`}
      >
        {loginMutation.isPending ? "VERIFYING..." : "SIGN IN"}
      </motion.button>
    </form>
  );
};

export default Login;