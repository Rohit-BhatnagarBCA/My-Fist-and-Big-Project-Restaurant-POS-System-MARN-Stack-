import React, {
  useState,
} from "react";

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
  useQuery,
} from "@tanstack/react-query";

import {
  logout,
  getMyNotifications,
} from "../../https";

import {
  removeUser,
} from "../../redux/slices/userSlice";

import {
  clearUnreadCount,
} from "../../redux/slices/notificationSlice";

import {
  useNavigate,
  useLocation,
} from "react-router-dom";

import NotificationPanel from "./NotificationPanel";

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
      (state) =>
        state.user
    );

  const unreadActivityCount =
    useSelector(
      (state) =>
        state.notification
          ?.unreadCount || 0
    );

  const dispatch =
    useDispatch();

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const [
    showNotifications,
    setShowNotifications,
  ] = useState(false);

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
  // NOTIFICATION PREVIEW DATA
  // ==========================================================

  const {
    data:
      notificationResponse,
  } = useQuery({
    queryKey: [
      "my-notifications",
    ],

    queryFn:
      getMyNotifications,

    refetchInterval:
      10000,

    enabled:
      Boolean(
        userData?.isAuth
      ),
  });

  const notificationData =
    notificationResponse
      ?.data
      ?.data || {};

  const subscription =
    notificationData.subscription ||
    userData.subscription ||
    null;

  // ==========================================================
  // EXPIRY
  // ==========================================================

  let daysUntilExpiry =
    null;

  if (
    subscription?.expiryDate
  ) {
    const diff =
      new Date(
        subscription.expiryDate
      ) -
      new Date();

    daysUntilExpiry =
      Math.ceil(
        diff /
          (1000 *
            60 *
            60 *
            24)
      );
  }

  const showExpiryBanner =
    userData.role ===
      "Admin" &&
    daysUntilExpiry !==
      null &&
    daysUntilExpiry <=
      3 &&
    daysUntilExpiry >=
      0;

  const handleNotifications =
    () => {
      setShowNotifications(
        true
      );
    };

  const handleRenew =
    () => {
      setShowNotifications(
        false
      );

      navigate(
        "/about"
      );
    };

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
            className={`${labelFont} hidden xs:block text-sm tracking-[0.25em] text-[#F3EEE3]`}
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

          {/* ==================================================
              NOTIFICATIONS
             ================================================== */}

          <div className="relative">

            <IconButton
              onClick={
                handleNotifications
              }
              title="Notifications"
            >
              <FaBell
                size={18}
              />
            </IconButton>

            {unreadActivityCount >
              0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#BD5D31] text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-[#1B222B]">
                {unreadActivityCount >
                99
                  ? "99+"
                  : unreadActivityCount}
              </span>
            )}

          </div>

          {/* User */}

          <div className="flex items-center gap-2 sm:gap-3 pl-1 sm:pl-2">

            <FaUserCircle
              className="text-[#7d8797]"
              size={34}
            />

            <div className="hidden sm:flex flex-col items-start">

              <h1 className="text-sm text-[#F3EEE3] font-semibold tracking-wide leading-tight">
                {
                  userData.name
                }
              </h1>

              <p
                className={`${labelFont} text-[10px] tracking-widest text-[#7d8797]`}
              >
                {
                  userData.role
                }
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
            onClick={
              handleRenew
            }
            className="bg-black/20 hover:bg-black/30 transition-colors px-3 py-1 rounded-md text-xs font-bold shrink-0"
          >
            Renew Now
          </button>

        </div>
      )}

      {/* ====================================================
          NOTIFICATION PANEL
         ==================================================== */}

      {showNotifications && (
        <NotificationPanel
          onClose={() =>
            setShowNotifications(
              false
            )
          }
          onRenew={
            handleRenew
          }
        />
      )}
    </>
  );
};

export default Header;