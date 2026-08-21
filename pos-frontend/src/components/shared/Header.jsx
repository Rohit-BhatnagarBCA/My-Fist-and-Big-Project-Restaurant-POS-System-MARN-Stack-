import React from "react";

import {
  motion,
} from "framer-motion";

import {
  FaSearch,
  FaUserCircle,
  FaBell,
} from "react-icons/fa";

import {
  MdDashboard,
  MdPerson,
} from "react-icons/md";

import logo from "../../assets/images/logo.png";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  IoLogOut,
} from "react-icons/io5";

import {
  useMutation,
} from "@tanstack/react-query";

import {
  logout,
} from "../../https";

import {
  removeUser,
} from "../../redux/slices/userSlice";

import {
  useNavigate,
  useLocation,
} from "react-router-dom";

const labelFont =
  "font-['Space_Mono',_monospace]";

const IconButton = ({
  onClick,
  children,
  title,
  active,
}) => (
  <motion.button
    onClick={onClick}
    title={title}
    whileHover={{
      scale: 1.06,
    }}
    whileTap={{
      scale: 0.94,
    }}
    className={`rounded-xl p-3 transition-colors ${
      active
        ? "bg-[#BD5D31] text-[#F3EEE3]"
        : "bg-[#242c38] text-[#F3EEE3] hover:bg-[#2c3542]"
    }`}
  >
    {children}
  </motion.button>
);

const Header = () => {
  const userData =
    useSelector(
      (state) => state.user
    );

  const dispatch =
    useDispatch();

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const logoutMutation =
    useMutation({
      mutationFn:
        () => logout(),

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

      onError: (error) => {
        console.log(
          "Logout error:",
          error
        );

        // Clear local auth even if
        // server request fails.
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
  // RENEWAL REMINDER
  // ==========================================================

  let daysUntilExpiry =
    null;

  if (
    userData.role ===
      "Admin" &&
    userData.subscription
      ?.expiryDate
  ) {
    const diffMs =
      new Date(
        userData.subscription
          .expiryDate
      ) -
      new Date();

    daysUntilExpiry =
      Math.ceil(
        diffMs /
          (1000 *
            60 *
            60 *
            24)
      );
  }

  const showExpiryBanner =
    daysUntilExpiry !== null &&
    daysUntilExpiry <= 3 &&
    daysUntilExpiry >= 0;

  return (
    <>
      <header className="flex justify-between items-center gap-3 py-3 sm:py-4 px-4 sm:px-8 bg-[#1B222B] border-b border-[#2a323d]">

        {/* ==================================================
            LOGO
           ================================================== */}

        <motion.div
          whileHover={{
            scale: 1.02,
          }}
          onClick={() =>
            navigate("/")
          }
          className="flex items-center gap-2 cursor-pointer shrink-0"
        >
          <img
            src={logo}
            className="h-8 w-8 rounded-full"
            alt="restro logo"
          />

          <h1
            className={`hidden xs:block ${labelFont} text-sm tracking-[0.25em] text-[#F3EEE3]`}
          >
            RESTRO
          </h1>
        </motion.div>

        {/* ==================================================
            SEARCH
           ================================================== */}

        <div className="hidden md:flex items-center gap-3 bg-[#242c38] rounded-full px-5 py-2.5 flex-1 max-w-[440px] border border-transparent focus-within:border-[#BD5D31] transition-colors">
          <FaSearch
            className="text-[#7d8797] shrink-0"
            size={14}
          />

          <input
            type="text"
            placeholder="Search"
            className="bg-transparent outline-none text-[#F3EEE3] placeholder:text-[#7d8797] text-sm w-full"
          />
        </div>

        {/* ==================================================
            RIGHT SIDE
           ================================================== */}

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">

          {/* Dashboard */}

          {userData.role ===
            "Admin" && (
            <IconButton
              onClick={() =>
                navigate(
                  "/dashboard"
                )
              }
              title="Dashboard"
              active={
                location.pathname ===
                "/dashboard"
              }
            >
              <MdDashboard
                size={20}
              />
            </IconButton>
          )}

          {/* Profile */}

          <IconButton
            onClick={() =>
              navigate(
                "/profile"
              )
            }
            title="My Profile"
            active={
              location.pathname ===
              "/profile"
            }
          >
            <MdPerson
              size={20}
            />
          </IconButton>

          {/* Notifications */}

          <IconButton
            title="Notifications"
          >
            <FaBell
              size={18}
            />
          </IconButton>

          {/* User */}

          <div className="flex items-center gap-2 sm:gap-3 pl-1 sm:pl-2">

            <FaUserCircle
              className="text-[#7d8797]"
              size={34}
            />

            <div className="hidden sm:flex flex-col items-start">
              <h1 className="text-sm text-[#F3EEE3] font-semibold tracking-wide leading-tight">
                {userData.name ||
                  "TEST USER"}
              </h1>

              <p
                className={`${labelFont} text-[10px] tracking-widest text-[#7d8797]`}
              >
                {userData.role ||
                  "ROLE"}
              </p>
            </div>

            {/* Logout */}

            <motion.button
              onClick={
                handleLogout
              }
              title="Logout"
              whileHover={{
                scale: 1.1,
                rotate: -8,
              }}
              whileTap={{
                scale: 0.9,
              }}
              disabled={
                logoutMutation.isPending
              }
              className="text-[#7d8797] hover:text-[#BD5D31] transition-colors ml-1 disabled:opacity-40"
            >
              <IoLogOut
                size={26}
              />
            </motion.button>

          </div>
        </div>
      </header>

      {/* ====================================================
          EXPIRY BANNER
         ==================================================== */}

      {showExpiryBanner && (
        <div className="bg-[#BD5D31] text-[#F3EEE3] text-sm font-medium px-4 sm:px-8 py-2 flex items-center justify-between gap-3">

          <span>
            {daysUntilExpiry ===
            0
              ? "Your plan expires today."
              : `Your plan expires in ${daysUntilExpiry} day${
                  daysUntilExpiry ===
                  1
                    ? ""
                    : "s"
                }.`}{" "}
            Renew to avoid losing
            access for your whole
            team.
          </span>

          <button
            onClick={() =>
              navigate(
                "/about"
              )
            }
            className="bg-black/20 hover:bg-black/30 transition-colors px-3 py-1 rounded-md text-xs font-bold shrink-0"
          >
            Renew Now
          </button>

        </div>
      )}
    </>
  );
};

export default Header;