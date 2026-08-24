import React from "react";

import {
  FiBell,
  FiCheck,
  FiClock,
  FiRefreshCw,
  FiX,
} from "react-icons/fi";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../../https";

const NotificationPanel = ({
  onClose,
  onRenew,
}) => {
  const queryClient =
    useQueryClient();

  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "my-notifications",
    ],
    queryFn:
      getMyNotifications,
    refetchInterval: 10000,
  });

  const data =
    response?.data?.data || {};

  const notifications =
    data.notifications || [];

  const subscription =
    data.subscription || {};

  const restaurant =
    data.restaurant || {};

  // ==========================================================
  // MARK ONE READ
  // ==========================================================

  const readMutation =
    useMutation({
      mutationFn:
        markNotificationRead,

      onSuccess:
        () => {
          queryClient.invalidateQueries({
            queryKey: [
              "my-notifications",
            ],
          });
        },
    });

  // ==========================================================
  // MARK ALL READ
  // ==========================================================

  const readAllMutation =
    useMutation({
      mutationFn:
        markAllNotificationsRead,

      onSuccess:
        () => {
          queryClient.invalidateQueries({
            queryKey: [
              "my-notifications",
            ],
          });
        },
    });

  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatDate = (
    date
  ) => {
    if (!date) {
      return "—";
    }

    const parsed =
      new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return "—";
    }

    return parsed.toLocaleString(
      "en-IN"
    );
  };

  // ==========================================================
  // ICON
  // ==========================================================

  const getNotificationIcon =
    (type) => {
      switch (type) {
        case "subscription":
          return (
            <FiRefreshCw
              className="text-[#8FB89C]"
              size={17}
            />
          );

        case "warning":
          return (
            <FiClock
              className="text-[#e0a35c]"
              size={17}
            />
          );

        case "system":
          return (
            <FiCheck
              className="text-[#BD5D31]"
              size={17}
            />
          );

        default:
          return (
            <FiBell
              className="text-[#BD5D31]"
              size={17}
            />
          );
      }
    };

  return (
    <>
      {/* ========================================================
          BACKDROP
         ======================================================== */}

      <div
        className="fixed inset-0 z-[80] bg-black/30"
        onClick={onClose}
      />

      {/* ========================================================
          PANEL
         ======================================================== */}

      <aside className="fixed top-0 right-0 z-[90] h-screen w-full sm:w-[420px] bg-[#12181F] border-l border-[#2a323d] shadow-2xl flex flex-col">

        {/* ======================================================
            HEADER
           ====================================================== */}

        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a323d] bg-[#1B222B]">

          <div className="flex items-center gap-3">

            <div className="p-2.5 rounded-lg bg-[#242c38]">
              <FiBell
                className="text-[#BD5D31]"
                size={18}
              />
            </div>

            <div>
              <h2 className="font-bold text-[#F3EEE3]">
                Notifications
              </h2>

              <p className="text-[10px] text-[#7d8797]">
                {restaurant.name ||
                  "Restro POS"}
              </p>
            </div>

          </div>

          <button
            onClick={onClose}
            className="text-[#7d8797] hover:text-[#F3EEE3] transition"
          >
            <FiX size={21} />
          </button>

        </div>

        {/* ======================================================
            CURRENT PLAN
           ====================================================== */}

        <div className="p-4 border-b border-[#2a323d]">

          <div className="bg-[#1B222B] border border-[#2a323d] rounded-xl p-4">

            <div className="flex items-center justify-between gap-3">

              <div>
                <p className="text-[10px] tracking-[0.2em] text-[#7d8797]">
                  CURRENT PLAN
                </p>

                <p className="text-xl font-bold mt-1 text-[#F3EEE3]">
                  {subscription.plan ||
                    "No active plan"}
                </p>
              </div>

              <button
                onClick={onRenew}
                className="px-3.5 py-2 rounded-lg bg-[#BD5D31] hover:bg-[#a64e26] text-xs font-bold text-[#F3EEE3] transition"
              >
                Renew
              </button>

            </div>

            {subscription.expiryDate && (
              <div className="mt-4">

                <div className="flex items-center justify-between text-xs">

                  <span className="text-[#7d8797]">
                    Expires
                  </span>

                  <span className="text-[#F3EEE3] font-semibold">
                    {formatDate(
                      subscription.expiryDate
                    )}
                  </span>

                </div>

                {subscription.daysUntilExpiry !==
                  null && (
                  <p
                    className={`text-xs mt-2 ${
                      subscription.daysUntilExpiry <=
                      3
                        ? "text-[#d77958]"
                        : "text-[#8FB89C]"
                    }`}
                  >
                    {subscription.daysUntilExpiry <
                    0
                      ? "Subscription expired"
                      : subscription.daysUntilExpiry ===
                        0
                      ? "Expires today"
                      : `${subscription.daysUntilExpiry} day${
                          subscription.daysUntilExpiry ===
                          1
                            ? ""
                            : "s"
                        } remaining`}
                  </p>
                )}

              </div>
            )}

          </div>

        </div>

        {/* ======================================================
            READ ALL
           ====================================================== */}

        {notifications.length >
          0 && (
          <div className="px-5 py-3 flex justify-end border-b border-[#2a323d]">

            <button
              onClick={() =>
                readAllMutation.mutate()
              }
              disabled={
                readAllMutation.isPending
              }
              className="text-xs text-[#BD5D31] hover:text-[#e08a62] disabled:opacity-50"
            >
              Mark all as read
            </button>

          </div>
        )}

        {/* ======================================================
            BODY
           ====================================================== */}

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">

          {isLoading ? (
            <div className="text-center text-[#7d8797] text-sm py-10">
              Loading notifications...
            </div>
          ) : isError ? (
            <div className="text-center py-10">

              <FiBell
                className="mx-auto text-[#3b4653]"
                size={30}
              />

              <p className="text-[#d77958] text-sm mt-3">
                Could not load notifications.
              </p>

            </div>
          ) : notifications.length ===
            0 ? (
            <div className="text-center py-14">

              <FiBell
                className="mx-auto text-[#3b4653]"
                size={30}
              />

              <p className="text-[#7d8797] text-sm mt-3">
                No messages yet.
              </p>

            </div>
          ) : (
            notifications.map(
              (
                notification
              ) => (
                <button
                  key={
                    notification._id
                  }
                  onClick={() => {
                    if (
                      !notification.isRead
                    ) {
                      readMutation.mutate(
                        notification._id
                      );
                    }
                  }}
                  className={`w-full text-left rounded-xl border p-4 transition ${
                    notification.isRead
                      ? "bg-[#1B222B] border-[#2a323d]"
                      : "bg-[#1e2a22] border-[#4b674f]"
                  }`}
                >

                  <div className="flex items-start gap-3">

                    <div className="p-2 rounded-lg bg-[#242c38] shrink-0">
                      {getNotificationIcon(
                        notification.type
                      )}
                    </div>

                    <div className="min-w-0 flex-1">

                      <div className="flex items-start justify-between gap-3">

                        <h3 className="font-semibold text-sm text-[#F3EEE3]">
                          {
                            notification.title
                          }
                        </h3>

                        {!notification.isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#BD5D31] shrink-0 mt-1.5" />
                        )}

                      </div>

                      <p className="text-xs text-[#a3acb8] mt-2 leading-relaxed whitespace-pre-wrap">
                        {
                          notification.message
                        }
                      </p>

                      <p className="text-[10px] text-[#687280] mt-3">
                        {formatDate(
                          notification.createdAt
                        )}
                      </p>

                    </div>

                  </div>

                </button>
              )
            )
          )}

        </div>

      </aside>
    </>
  );
};

export default NotificationPanel;