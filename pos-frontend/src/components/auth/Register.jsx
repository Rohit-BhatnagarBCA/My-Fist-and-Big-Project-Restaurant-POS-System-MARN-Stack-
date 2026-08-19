import React, {
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  enqueueSnackbar,
} from "notistack";

import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiHome,
} from "react-icons/fi";

import {
  IoEyeOutline,
  IoEyeOffOutline,
} from "react-icons/io5";

import { register } from "../../https";

const labelFont =
  "font-['Space_Mono',_monospace]";

const TicketField = ({
  label,
  icon: Icon,
  children,
}) => (
  <div>
    <label
      className={`${labelFont} block text-[#8a806c] mb-2 mt-4 text-[10px] tracking-widest`}
    >
      {label}
    </label>

    <div className="flex items-center gap-3 border-b-2 border-[#C9BFAC] focus-within:border-[#BD5D31] transition-colors py-2">
      <Icon
        className="text-[#8a806c] shrink-0"
        size={16}
      />

      {children}
    </div>
  </div>
);

const Register = ({
  setIsRegister,
}) => {
  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    formData,
    setFormData,
  ] = useState({
    name: "",
    restaurantName: "",
    email: "",
    phone: "",
    password: "",
  });

  const [
    isRegistering,
    setIsRegistering,
  ] = useState(false);

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    if (
      name === "phone"
    ) {
      const numericValue =
        value
          .replace(/\D/g, "")
          .slice(0, 10);

      setFormData(
        (previous) => ({
          ...previous,
          phone:
            numericValue,
        })
      );

      return;
    }

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      if (
        formData.phone.length !==
        10
      ) {
        enqueueSnackbar(
          "Phone number must be exactly 10 digits.",
          {
            variant:
              "warning",
          }
        );

        return;
      }

      if (
        !formData.restaurantName.trim()
      ) {
        enqueueSnackbar(
          "Please enter your restaurant name.",
          {
            variant:
              "warning",
          }
        );

        return;
      }

      setIsRegistering(
        true
      );

      try {
        const response =
          await register(
            formData
          );

        enqueueSnackbar(
          response?.data?.message ||
            "Restaurant account created successfully! Please login.",
          {
            variant:
              "success",
          }
        );

        setFormData({
          name: "",
          restaurantName:
            "",
          email: "",
          phone: "",
          password: "",
        });

        setTimeout(() => {
          setIsRegister(
            false
          );
        }, 1000);
      } catch (error) {
        enqueueSnackbar(
          error?.response?.data
            ?.message ||
            "Registration failed!",
          {
            variant:
              "error",
          }
        );
      } finally {
        setIsRegistering(
          false
        );
      }
    };

  return (
    <form
      onSubmit={
        handleSubmit
      }
    >
      {/* =================================================
          RESTAURANT NAME
         ================================================= */}

      <TicketField
        label="RESTAURANT NAME"
        icon={FiHome}
      >
        <input
          type="text"
          name="restaurantName"
          value={
            formData.restaurantName
          }
          onChange={
            handleChange
          }
          placeholder="Your restaurant name"
          maxLength={120}
          className="bg-transparent flex-1 text-[#2A241D] placeholder:text-[#a89e8b] focus:outline-none text-sm"
          required
        />
      </TicketField>

      {/* =================================================
          OWNER NAME
         ================================================= */}

      <TicketField
        label="OWNER / ADMIN NAME"
        icon={FiUser}
      >
        <input
          type="text"
          name="name"
          value={
            formData.name
          }
          onChange={
            handleChange
          }
          placeholder="Full name"
          className="bg-transparent flex-1 text-[#2A241D] placeholder:text-[#a89e8b] focus:outline-none text-sm"
          required
        />
      </TicketField>

      {/* =================================================
          EMAIL
         ================================================= */}

      <TicketField
        label="OWNER EMAIL"
        icon={FiMail}
      >
        <input
          type="email"
          name="email"
          value={
            formData.email
          }
          onChange={
            handleChange
          }
          placeholder="you@restro.com"
          className="bg-transparent flex-1 text-[#2A241D] placeholder:text-[#a89e8b] focus:outline-none text-sm"
          required
        />
      </TicketField>

      {/* =================================================
          PHONE
         ================================================= */}

      <TicketField
        label="OWNER PHONE"
        icon={FiPhone}
      >
        <input
          type="tel"
          name="phone"
          value={
            formData.phone
          }
          onChange={
            handleChange
          }
          placeholder="10-digit number"
          inputMode="numeric"
          maxLength={10}
          pattern="[0-9]{10}"
          className="bg-transparent flex-1 text-[#2A241D] placeholder:text-[#a89e8b] focus:outline-none text-sm"
          required
        />
      </TicketField>

      {/* =================================================
          PASSWORD
         ================================================= */}

      <TicketField
        label="PASSWORD"
        icon={FiLock}
      >
        <input
          type={
            showPassword
              ? "text"
              : "password"
          }
          name="password"
          value={
            formData.password
          }
          onChange={
            handleChange
          }
          placeholder="••••••••"
          className="bg-transparent flex-1 text-[#2A241D] placeholder:text-[#a89e8b] focus:outline-none text-sm"
          required
        />

        <button
          type="button"
          onClick={() =>
            setShowPassword(
              (
                previous
              ) =>
                !previous
            )
          }
          className="text-[#8a806c] hover:text-[#BD5D31] transition-colors"
        >
          {showPassword ? (
            <IoEyeOffOutline
              size={17}
            />
          ) : (
            <IoEyeOutline
              size={17}
            />
          )}
        </button>
      </TicketField>

      {/* =================================================
          ROLE INFO
         ================================================= */}

      <div className="mt-5 rounded-lg bg-[#E7E0D1] border border-[#C9BFAC] px-4 py-3">
        <p
          className={`${labelFont} text-[9px] tracking-widest text-[#8a806c]`}
        >
          ACCOUNT TYPE
        </p>

        <p className="text-sm font-bold text-[#2A241D] mt-1">
          Restaurant Admin / Owner
        </p>

        <p className="text-xs text-[#6b6252] mt-1 leading-relaxed">
          Staff accounts like Waiter and Kitchen
          will be created later from your restaurant
          management panel.
        </p>
      </div>

      {/* =================================================
          REGISTER
         ================================================= */}

      <motion.button
        whileHover={
          !isRegistering
            ? {
                scale: 1.015,
              }
            : {}
        }
        whileTap={
          !isRegistering
            ? {
                scale: 0.96,
                rotate: -1,
              }
            : {}
        }
        type="submit"
        disabled={
          isRegistering
        }
        className={`w-full rounded-md mt-8 py-3.5 text-sm font-bold tracking-widest ${labelFont} transition-colors ${
          isRegistering
            ? "bg-[#d8cfbd] text-[#8a806c] cursor-not-allowed"
            : "bg-[#BD5D31] text-[#F3EEE3] hover:bg-[#a34f27]"
        }`}
      >
        {isRegistering
          ? "CREATING RESTAURANT..."
          : "CREATE RESTAURANT ACCOUNT"}
      </motion.button>
    </form>
  );
};

export default Register;