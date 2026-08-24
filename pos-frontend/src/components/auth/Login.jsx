import React, {
  useState,
} from "react";

import {
  motion,
} from "framer-motion";

import {
  useMutation,
} from "@tanstack/react-query";

import {
  login,
  getUserData,
} from "../../https";

import {
  enqueueSnackbar,
} from "notistack";

import {
  useDispatch,
} from "react-redux";

import {
  setUser,
} from "../../redux/slices/userSlice";

import {
  useNavigate,
} from "react-router-dom";

import {
  FiMail,
  FiLock,
} from "react-icons/fi";

import {
  IoEyeOutline,
  IoEyeOffOutline,
} from "react-icons/io5";

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

const Login = () => {
  const navigate =
    useNavigate();

  const dispatch =
    useDispatch();

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    formData,
    setFormData,
  ] = useState({
    email: "",
    password: "",
  });

  const saveSession =
    (userData) => {
      const restaurant =
        userData?.restaurantId ||
        null;

      /*
        IMPORTANT:
        Restaurant subscription is the primary source.
        User subscription is used only as a fallback
        for older accounts.
      */
      const restaurantSubscription =
        restaurant?.subscription;

      const userSubscription =
        userData?.subscription;

      const subscription =
        restaurantSubscription &&
        (
          restaurantSubscription
            .startDate ||
          restaurantSubscription
            .expiryDate ||
          restaurantSubscription
            .plan
        )
          ? restaurantSubscription
          : userSubscription ||
            null;

      dispatch(
        setUser({
          _id:
            userData._id,

          name:
            userData.name,

          email:
            userData.email,

          phone:
            userData.phone,

          role:
            userData.role,

          restaurantId:
            restaurant?._id ||
            null,

          restaurant,

          subscription,

          isAuth:
            true,
        })
      );

      return {
        restaurant,
        subscription,
      };
    };

  const loginMutation =
    useMutation({
      mutationFn: (
        reqData
      ) =>
        login(reqData),

      onSuccess:
        async (
          res
        ) => {
          const responseData =
            res?.data;

          const initialUser =
            responseData?.data ||
            responseData?.user ||
            responseData;

          if (
            !initialUser?._id
          ) {
            enqueueSnackbar(
              "Invalid login response!",
              {
                variant:
                  "error",
              }
            );

            return;
          }

          /*
            First save what login returned.
          */
          saveSession(
            initialUser
          );

          /*
            Then fetch the authoritative current user
            from backend once more.

            This is important because the backend may have
            updated Restaurant.subscription/status.
          */
          try {
            const freshResponse =
              await getUserData();

            const freshUser =
              freshResponse
                ?.data
                ?.data;

            if (
              freshUser?._id
            ) {
              saveSession(
                freshUser
              );

              const restaurant =
                freshUser.restaurantId ||
                null;

              const restaurantSubscription =
                restaurant?.subscription;

              const userSubscription =
                freshUser.subscription;

              const subscription =
                restaurantSubscription &&
                (
                  restaurantSubscription
                    .startDate ||
                  restaurantSubscription
                    .expiryDate ||
                  restaurantSubscription
                    .plan
                )
                  ? restaurantSubscription
                  : userSubscription ||
                    null;

              const now =
                new Date();

              const startDate =
                subscription
                  ?.startDate
                  ? new Date(
                      subscription.startDate
                    )
                  : null;

              const expiryDate =
                subscription
                  ?.expiryDate
                  ? new Date(
                      subscription.expiryDate
                    )
                  : null;

              const hasValidDates =
                startDate &&
                expiryDate &&
                !Number.isNaN(
                  startDate.getTime()
                ) &&
                !Number.isNaN(
                  expiryDate.getTime()
                );

              const isActive =
                Boolean(
                  hasValidDates &&
                  now >= startDate &&
                  now < expiryDate
                );

              const isRestaurantActive =
                restaurant?.status ===
                "active";

              /*
                SuperAdmin always goes to SuperAdmin.
              */

              if (
                freshUser.role ===
                "SuperAdmin"
              ) {
                enqueueSnackbar(
                  "Login successful!",
                  {
                    variant:
                      "success",
                  }
                );

                navigate(
                  "/super-admin",
                  {
                    replace:
                      true,
                  }
                );

                return;
              }

              enqueueSnackbar(
                "Login successful!",
                {
                  variant:
                    "success",
                }
              );

              /*
                Only a currently active restaurant subscription
                goes directly into POS.
              */
              if (
                isActive &&
                isRestaurantActive
              ) {
                navigate(
                  "/",
                  {
                    replace:
                      true,
                  }
                );

                return;
              }

              /*
                No active subscription:
                send user to About / pricing.
              */
              navigate(
                "/about",
                {
                  replace:
                    true,
                }
              );

              return;
            }
          } catch (error) {
            console.error(
              "Fresh session fetch failed:",
              error
            );
          }

          /*
            Fallback if fresh fetch fails.
            Still use the initial login data.
          */

          const {
            restaurant,
            subscription,
          } = saveSession(
            initialUser
          );

          const now =
            new Date();

          const startDate =
            subscription
              ?.startDate
              ? new Date(
                  subscription.startDate
                )
              : null;

          const expiryDate =
            subscription
              ?.expiryDate
              ? new Date(
                  subscription.expiryDate
                )
              : null;

          const isActive =
            Boolean(
              startDate &&
              expiryDate &&
              now >= startDate &&
              now < expiryDate
            );

          const isRestaurantActive =
            restaurant?.status ===
            "active";

          if (
            initialUser.role ===
            "SuperAdmin"
          ) {
            navigate(
              "/super-admin",
              {
                replace:
                  true,
              }
            );

            return;
          }

          if (
            isActive &&
            isRestaurantActive
          ) {
            navigate(
              "/",
              {
                replace:
                  true,
              }
            );

            return;
          }

          navigate(
            "/about",
            {
              replace:
                true,
            }
          );
        },

      onError: (
        error
      ) => {
        const message =
          error?.response
            ?.data
            ?.message ||
          "Login failed!";

        enqueueSnackbar(
          message,
          {
            variant:
              "error",
          }
        );
      },
    });

  const handleChange =
    (event) => {
      setFormData({
        ...formData,

        [event.target.name]:
          event.target.value,
      });
    };

  const handleSubmit =
    (event) => {
      event.preventDefault();

      loginMutation.mutate(
        formData
      );
    };

  return (
    <form
      onSubmit={
        handleSubmit
      }
    >
      <TicketField
        label="EMPLOYEE EMAIL"
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
              (previous) =>
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

      <motion.button
        whileHover={
          !loginMutation.isPending
            ? {
                scale:
                  1.015,
              }
            : {}
        }
        whileTap={
          !loginMutation.isPending
            ? {
                scale: 0.96,
                rotate: -1,
              }
            : {}
        }
        type="submit"
        disabled={
          loginMutation.isPending
        }
        className={`w-full rounded-md mt-8 py-3.5 text-sm font-bold tracking-widest ${labelFont} transition-colors ${
          loginMutation.isPending
            ? "bg-[#d8cfbd] text-[#8a806c] cursor-not-allowed"
            : "bg-[#BD5D31] text-[#F3EEE3] hover:bg-[#a34f27]"
        }`}
      >
        {loginMutation.isPending
          ? "VERIFYING..."
          : "SIGN IN"}
      </motion.button>
    </form>
  );
};

export default Login;