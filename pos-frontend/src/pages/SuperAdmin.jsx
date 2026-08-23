import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useMutation,
  useQuery,
} from "@tanstack/react-query";

import {
  enqueueSnackbar,
} from "notistack";

import {
  useNavigate,
} from "react-router-dom";

import {
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiSearch,
  FiUsers,
  FiXCircle,
  FiRefreshCw,
  FiHome,
  FiPauseCircle,
  FiPlayCircle,
  FiEye,
} from "react-icons/fi";

import {
  getAllUsers,
  getAllSubscriptionRequests,
  reviewSubscriptionRequest,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurantStatus,
} from "../https";

const getDateValue = (
  date
) => {
  if (!date) return "";

  const d =
    new Date(date);

  if (
    Number.isNaN(
      d.getTime()
    )
  ) {
    return "";
  }

  const year =
    d.getFullYear();

  const month =
    String(
      d.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      d.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getTimeValue = (
  date
) => {
  if (!date) return "";

  const d =
    new Date(date);

  if (
    Number.isNaN(
      d.getTime()
    )
  ) {
    return "";
  }

  const hours =
    String(
      d.getHours()
    ).padStart(2, "0");

  const minutes =
    String(
      d.getMinutes()
    ).padStart(2, "0");

  return `${hours}:${minutes}`;
};

const getDefaultStartDate =
  () => {
    const d =
      new Date();

    return getDateValue(d);
  };

const getDefaultStartTime =
  () => {
    const d =
      new Date();

    d.setMinutes(
      d.getMinutes() + 5
    );

    return getTimeValue(d);
  };

const SuperAdmin =
  () => {
    const navigate =
      useNavigate();

    const [
      activeTab,
      setActiveTab,
    ] = useState(
      "restaurants"
    );

    const [
      search,
      setSearch,
    ] = useState("");

    const [
      rejectingRequest,
      setRejectingRequest,
    ] = useState(
      null
    );

    const [
      rejectionReason,
      setRejectionReason,
    ] = useState("");

    const [
      approvingRequest,
      setApprovingRequest,
    ] = useState(
      null
    );

    const [
      startDate,
      setStartDate,
    ] = useState(
      getDefaultStartDate()
    );

    const [
      startTime,
      setStartTime,
    ] = useState(
      getDefaultStartTime()
    );

    const [
      expiryDate,
      setExpiryDate,
    ] = useState("");

    const [
      expiryTime,
      setExpiryTime,
    ] = useState(
      "23:59"
    );

    const [
      selectedRestaurant,
      setSelectedRestaurant,
    ] = useState(
      null
    );

    const [
      showRestaurantDetails,
      setShowRestaurantDetails,
    ] = useState(
      false
    );

    useEffect(() => {
      document.title =
        "POS | Super Admin";
    }, []);

    // ========================================================
    // REQUESTS
    // ========================================================

    const {
      data:
        requestsResponse,
      isLoading:
        requestsLoading,
      refetch:
        refetchRequests,
    } = useQuery({
      queryKey: [
        "super-admin-subscription-requests",
      ],
      queryFn:
        getAllSubscriptionRequests,
    });

    // ========================================================
    // USERS
    // ========================================================

    const {
      data:
        usersResponse,
      isLoading:
        usersLoading,
      refetch:
        refetchUsers,
    } = useQuery({
      queryKey: [
        "super-admin-users",
      ],
      queryFn:
        getAllUsers,
    });

    // ========================================================
    // RESTAURANTS
    // ========================================================

    const {
      data:
        restaurantsResponse,
      isLoading:
        restaurantsLoading,
      refetch:
        refetchRestaurants,
    } = useQuery({
      queryKey: [
        "super-admin-restaurants",
      ],
      queryFn:
        getAllRestaurants,
    });

    const requests =
      requestsResponse?.data?.data ||
      [];

    const users =
      usersResponse?.data?.data ||
      [];

    const restaurants =
      restaurantsResponse?.data?.data ||
      [];

    // ========================================================
    // REVIEW REQUEST
    // ========================================================

    const reviewMutation =
      useMutation({
        mutationFn:
          reviewSubscriptionRequest,

        onSuccess: (
          _data,
          variables
        ) => {
          enqueueSnackbar(
            variables.status ===
              "Approved"
              ? "Subscription approved."
              : "Subscription request rejected.",
            {
              variant:
                variables.status ===
                "Approved"
                  ? "success"
                  : "warning",
            }
          );

          setApprovingRequest(
            null
          );

          setRejectingRequest(
            null
          );

          setRejectionReason(
            ""
          );

          refetchRequests();
          refetchRestaurants();
          refetchUsers();
        },

        onError: (
          error
        ) => {
          enqueueSnackbar(
            error?.response
              ?.data
              ?.message ||
              "Unable to process the request.",
            {
              variant:
                "error",
            }
          );
        },
      });

    // ========================================================
    // RESTAURANT STATUS
    // ========================================================

    const statusMutation =
      useMutation({
        mutationFn:
          updateRestaurantStatus,

        onSuccess: () => {
          enqueueSnackbar(
            "Restaurant status updated.",
            {
              variant:
                "success",
            }
          );

          refetchRestaurants();
          refetchUsers();
        },

        onError: (
          error
        ) => {
          enqueueSnackbar(
            error?.response
              ?.data
              ?.message ||
              "Unable to update restaurant status.",
            {
              variant:
                "error",
            }
          );
        },
      });

    // ========================================================
    // RESTAURANT DETAILS
    // ========================================================

    const {
      data:
        restaurantDetailResponse,
      isLoading:
        restaurantDetailLoading,
    } = useQuery({
      queryKey: [
        "super-admin-restaurant-detail",
        selectedRestaurant?._id,
      ],
      queryFn: () =>
        getRestaurantById(
          selectedRestaurant._id
        ),
      enabled:
        Boolean(
          selectedRestaurant?._id &&
            showRestaurantDetails
        ),
    });

    const restaurantDetail =
      restaurantDetailResponse?.data
        ?.data || null;

    // ========================================================
    // FILTER
    // ========================================================

    const filteredRestaurants =
      useMemo(() => {
        const query =
          search
            .trim()
            .toLowerCase();

        if (!query) {
          return restaurants;
        }

        return restaurants.filter(
          (
            restaurant
          ) => {
            const owner =
              restaurant.owner;

            return (
              restaurant.name
                ?.toLowerCase()
                .includes(query) ||
              owner?.name
                ?.toLowerCase()
                .includes(query) ||
              owner?.email
                ?.toLowerCase()
                .includes(query) ||
              owner?.phone
                ?.toLowerCase()
                .includes(query) ||
              restaurant.status
                ?.toLowerCase()
                .includes(query)
            );
          }
        );
      }, [
        restaurants,
        search,
      ]);

    const pendingRequests =
      requests.filter(
        (request) =>
          request.status ===
          "Pending"
      );

    const activeRestaurants =
      restaurants.filter(
        (restaurant) =>
          restaurant.status ===
          "active"
      );

    // ========================================================
    // APPROVE MODAL
    // ========================================================

    const openApproval =
      (request) => {
        const now =
          new Date();

        const oneMonthLater =
          new Date(now);

        oneMonthLater.setMonth(
          oneMonthLater.getMonth() +
            1
        );

        setStartDate(
          getDateValue(
            now
          )
        );

        setStartTime(
          getTimeValue(
            now
          )
        );

        setExpiryDate(
          getDateValue(
            oneMonthLater
          )
        );

        setExpiryTime(
          "23:59"
        );

        setApprovingRequest(
          request
        );
      };

    const approveRequest =
      () => {
        if (
          !approvingRequest
        ) {
          return;
        }

        if (
          !startDate ||
          !startTime ||
          !expiryDate ||
          !expiryTime
        ) {
          enqueueSnackbar(
            "Please select start and expiry date/time.",
            {
              variant:
                "warning",
            }
          );

          return;
        }

        const start =
          new Date(
            `${startDate}T${startTime}`
          );

        const expiry =
          new Date(
            `${expiryDate}T${expiryTime}`
          );

        if (
          Number.isNaN(
            start.getTime()
          ) ||
          Number.isNaN(
            expiry.getTime()
          )
        ) {
          enqueueSnackbar(
            "Invalid subscription date/time.",
            {
              variant:
                "error",
            }
          );

          return;
        }

        if (
          expiry <=
          start
        ) {
          enqueueSnackbar(
            "Expiry must be later than start.",
            {
              variant:
                "warning",
            }
          );

          return;
        }

        reviewMutation.mutate(
          {
            requestId:
              approvingRequest._id,

            status:
              "Approved",

            startDate,
            startTime,

            expiryDate,
            expiryTime,
          }
        );
      };

    const rejectRequest =
      () => {
        if (
          !rejectingRequest
        ) {
          return;
        }

        reviewMutation.mutate(
          {
            requestId:
              rejectingRequest._id,

            status:
              "Rejected",

            rejectionReason:
              rejectionReason.trim() ||
              "Payment could not be verified.",
          }
        );
      };

    const handleStatus =
      (
        restaurant
      ) => {
        const nextStatus =
          restaurant.status ===
          "active"
            ? "suspended"
            : "active";

        statusMutation.mutate(
          {
            restaurantId:
              restaurant._id,

            status:
              nextStatus,
          }
        );
      };

    const openRestaurant =
      (restaurant) => {
        setSelectedRestaurant(
          restaurant
        );

        setShowRestaurantDetails(
          true
        );
      };

    const refreshAll =
      () => {
        refetchRequests();
        refetchUsers();
        refetchRestaurants();
      };

    return (
      <div className="min-h-screen bg-[#12181F] text-[#F3EEE3]">

        {/* ==================================================
            HEADER
           ================================================== */}

        <div className="border-b border-[#2a323d] bg-[#1B222B]">

          <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <p className="font-['Space_Mono',_monospace] text-[10px] tracking-[0.3em] text-[#BD5D31]">
                SYSTEM CONTROL
              </p>

              <h1 className="text-2xl md:text-3xl font-bold mt-1">
                Super Admin
              </h1>

              <p className="text-sm text-[#8993A1] mt-1">
                Restaurants, accounts and subscriptions.
              </p>
            </div>

            <div className="flex gap-2">

              <button
                onClick={() =>
                  navigate("/")
                }
                className="px-4 py-2.5 rounded-lg bg-[#242c38] hover:bg-[#2c3542] flex items-center gap-2 text-sm"
              >
                <FiArrowLeft />
                POS
              </button>

              <button
                onClick={
                  refreshAll
                }
                className="px-4 py-2.5 rounded-lg bg-[#242c38] hover:bg-[#2c3542] flex items-center gap-2 text-sm"
              >
                <FiRefreshCw />
                Refresh
              </button>

            </div>

          </div>
        </div>

        <main className="max-w-7xl mx-auto px-6 py-8">

          {/* ==================================================
              STATS
             ================================================== */}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

            <div className="bg-[#1B222B] border border-[#2a323d] rounded-xl p-5">
              <p className="text-xs text-[#8993A1]">
                TOTAL RESTAURANTS
              </p>

              <p className="text-3xl font-bold mt-2">
                {
                  restaurants.length
                }
              </p>
            </div>

            <div className="bg-[#1B222B] border border-[#2a323d] rounded-xl p-5">
              <p className="text-xs text-[#8993A1]">
                ACTIVE
              </p>

              <p className="text-3xl font-bold mt-2">
                {
                  activeRestaurants.length
                }
              </p>
            </div>

            <div className="bg-[#1B222B] border border-[#2a323d] rounded-xl p-5">
              <p className="text-xs text-[#8993A1]">
                PENDING REQUESTS
              </p>

              <p className="text-3xl font-bold mt-2">
                {
                  pendingRequests.length
                }
              </p>
            </div>

          </div>

          {/* ==================================================
              TABS
             ================================================== */}

          <div className="flex flex-wrap gap-2 mb-6">

            {[
              [
                "restaurants",
                "Restaurants",
                <FiHome />,
              ],
              [
                "requests",
                "Requests",
                <FiClock />,
              ],
              [
                "users",
                "Users",
                <FiUsers />,
              ],
            ].map(
              ([
                id,
                label,
                icon,
              ]) => (
                <button
                  key={id}
                  onClick={() =>
                    setActiveTab(
                      id
                    )
                  }
                  className={`px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                    activeTab ===
                    id
                      ? "bg-[#BD5D31]"
                      : "bg-[#1B222B] border border-[#2a323d]"
                  }`}
                >
                  {icon}
                  {label}
                </button>
              )
            )}

          </div>

          {/* ==================================================
              RESTAURANTS
             ================================================== */}

          {activeTab ===
            "restaurants" && (
            <section className="bg-[#1B222B] border border-[#2a323d] rounded-xl overflow-hidden">

              <div className="px-6 py-5 border-b border-[#2a323d] flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                <div>
                  <h2 className="text-lg font-bold">
                    Restaurants
                  </h2>

                  <p className="text-xs text-[#8993A1] mt-1">
                    Revenue is intentionally not tracked here.
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-[#242c38] rounded-lg px-4 py-2.5 min-w-[280px]">

                  <FiSearch
                    className="text-[#8993A1]"
                    size={16}
                  />

                  <input
                    value={search}
                    onChange={(
                      event
                    ) =>
                      setSearch(
                        event.target
                          .value
                      )
                    }
                    placeholder="Search restaurant / owner / phone..."
                    className="bg-transparent outline-none w-full text-sm text-[#F3EEE3] placeholder:text-[#6f7782]"
                  />

                </div>
              </div>

              {restaurantsLoading ? (
                <div className="p-8 text-[#8993A1]">
                  Loading restaurants...
                </div>
              ) : filteredRestaurants.length ===
                0 ? (
                <div className="p-8 text-center text-[#8993A1]">
                  No restaurants found.
                </div>
              ) : (
                <div className="overflow-x-auto">

                  <table className="w-full min-w-[1150px]">

                    <thead>
                      <tr className="border-b border-[#2a323d] text-left text-xs text-[#8993A1]">

                        <th className="px-6 py-4">
                          RESTAURANT
                        </th>

                        <th className="px-6 py-4">
                          OWNER
                        </th>

                        <th className="px-6 py-4">
                          ACCOUNTS
                        </th>

                        <th className="px-6 py-4">
                          PLAN
                        </th>

                        <th className="px-6 py-4">
                          EXPIRY
                        </th>

                        <th className="px-6 py-4">
                          STATUS
                        </th>

                        <th className="px-6 py-4">
                          ACTION
                        </th>

                      </tr>
                    </thead>

                    <tbody>

                      {filteredRestaurants.map(
                        (
                          restaurant
                        ) => {
                          const expiry =
                            restaurant
                              .subscription
                              ?.expiryDate
                              ? new Date(
                                  restaurant
                                    .subscription
                                    .expiryDate
                                )
                              : null;

                          const active =
                            restaurant.status ===
                            "active";

                          return (
                            <tr
                              key={
                                restaurant._id
                              }
                              className="border-b border-[#2a323d] last:border-0"
                            >

                              <td className="px-6 py-5">

                                <button
                                  onClick={() =>
                                    openRestaurant(
                                      restaurant
                                    )
                                  }
                                  className="text-left hover:text-[#BD5D31] transition"
                                >
                                  <p className="font-semibold">
                                    {
                                      restaurant.name
                                    }
                                  </p>

                                  <p className="text-xs text-[#8993A1] mt-1">
                                    Click for details
                                  </p>
                                </button>

                              </td>

                              <td className="px-6 py-5">

                                <p className="font-semibold">
                                  {
                                    restaurant
                                      .owner
                                      ?.name ||
                                    "—"
                                  }
                                </p>

                                <p className="text-xs text-[#8993A1] mt-1">
                                  {
                                    restaurant
                                      .owner
                                      ?.email ||
                                    "—"
                                  }
                                </p>

                                <p className="text-xs text-[#8993A1] mt-1">
                                  {
                                    restaurant
                                      .owner
                                      ?.phone ||
                                    "—"
                                  }
                                </p>

                              </td>

                              <td className="px-6 py-5">

                                <p className="font-bold">
                                  {
                                    restaurant
                                      .staff
                                      ?.total ||
                                    0
                                  }
                                </p>

                                <p className="text-xs text-[#8993A1] mt-1">
                                  Admin{" "}
                                  {
                                    restaurant
                                      .staff
                                      ?.admins ||
                                    0
                                  }{" "}
                                  · Waiter{" "}
                                  {
                                    restaurant
                                      .staff
                                      ?.waiters ||
                                    0
                                  }{" "}
                                  · Kitchen{" "}
                                  {
                                    restaurant
                                      .staff
                                      ?.kitchen ||
                                    0
                                  }
                                </p>

                              </td>

                              <td className="px-6 py-5">

                                <p className="font-semibold">
                                  {
                                    restaurant
                                      .subscription
                                      ?.plan ||
                                    "—"
                                  }
                                </p>

                                <p className="text-xs text-[#8993A1] mt-1">
                                  {
                                    restaurant
                                      .subscription
                                      ?.duration ||
                                    "—"
                                  }
                                </p>

                              </td>

                              <td className="px-6 py-5 text-sm">

                                {expiry
                                  ? expiry.toLocaleString(
                                      "en-IN"
                                    )
                                  : "—"}

                              </td>

                              <td className="px-6 py-5">

                                <span
                                  className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                                    active
                                      ? "bg-[#25392c] text-[#8FB89C]"
                                      : restaurant.status ===
                                        "suspended"
                                      ? "bg-[#3a2925] text-[#d77958]"
                                      : "bg-[#3a2c1f] text-[#e0a35c]"
                                  }`}
                                >
                                  {
                                    restaurant.status
                                  }
                                </span>

                              </td>

                              <td className="px-6 py-5">

                                <div className="flex gap-2">

                                  <button
                                    onClick={() =>
                                      openRestaurant(
                                        restaurant
                                      )
                                    }
                                    className="px-3 py-2 rounded-lg bg-[#242c38] text-xs font-bold flex items-center gap-1.5"
                                  >
                                    <FiEye />
                                    Details
                                  </button>

                                  <button
                                    onClick={() =>
                                      handleStatus(
                                        restaurant
                                      )
                                    }
                                    disabled={
                                      statusMutation.isPending
                                    }
                                    className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 ${
                                      active
                                        ? "bg-[#3a2925] text-[#d77958]"
                                        : "bg-[#25392c] text-[#8FB89C]"
                                    }`}
                                  >
                                    {active ? (
                                      <>
                                        <FiPauseCircle />
                                        Suspend
                                      </>
                                    ) : (
                                      <>
                                        <FiPlayCircle />
                                        Activate
                                      </>
                                    )}
                                  </button>

                                </div>

                              </td>

                            </tr>
                          );
                        }
                      )}

                    </tbody>
                  </table>

                </div>
              )}

            </section>
          )}

          {/* ==================================================
              REQUESTS
             ================================================== */}

          {activeTab ===
            "requests" && (
            <section className="bg-[#1B222B] border border-[#2a323d] rounded-xl overflow-hidden">

              <div className="px-6 py-5 border-b border-[#2a323d]">

                <h2 className="text-lg font-bold">
                  Subscription Requests
                </h2>

                <p className="text-xs text-[#8993A1] mt-1">
                  Verify payment and choose exact activation/expiry time.
                </p>

              </div>

              {requestsLoading ? (
                <div className="p-8 text-[#8993A1]">
                  Loading requests...
                </div>
              ) : requests.length ===
                0 ? (
                <div className="p-8 text-center text-[#8993A1]">
                  No subscription requests found.
                </div>
              ) : (
                <div className="overflow-x-auto">

                  <table className="w-full min-w-[1100px]">

                    <thead>
                      <tr className="border-b border-[#2a323d] text-left text-xs text-[#8993A1]">

                        <th className="px-6 py-4">
                          RESTAURANT
                        </th>

                        <th className="px-6 py-4">
                          OWNER
                        </th>

                        <th className="px-6 py-4">
                          PLAN
                        </th>

                        <th className="px-6 py-4">
                          AMOUNT
                        </th>

                        <th className="px-6 py-4">
                          PAYMENT REF
                        </th>

                        <th className="px-6 py-4">
                          STATUS
                        </th>

                        <th className="px-6 py-4">
                          ACTION
                        </th>

                      </tr>
                    </thead>

                    <tbody>

                      {requests.map(
                        (
                          request
                        ) => {
                          const owner =
                            request.user;

                          return (
                            <tr
                              key={
                                request._id
                              }
                              className="border-b border-[#2a323d] last:border-0"
                            >

                              <td className="px-6 py-5">

                                <p className="font-semibold">
                                  {
                                    request
                                      .restaurantId
                                      ?.name ||
                                    "Unknown restaurant"
                                  }
                                </p>

                              </td>

                              <td className="px-6 py-5">

                                <p className="font-semibold">
                                  {
                                    owner?.name ||
                                    request.name ||
                                    "—"
                                  }
                                </p>

                                <p className="text-xs text-[#8993A1] mt-1">
                                  {
                                    owner?.email ||
                                    request.email ||
                                    "—"
                                  }
                                </p>

                                <p className="text-xs text-[#8993A1] mt-1">
                                  {
                                    owner?.phone ||
                                    "—"
                                  }
                                </p>

                              </td>

                              <td className="px-6 py-5">

                                <p className="font-semibold">
                                  {
                                    request.plan
                                  }
                                </p>

                                <p className="text-xs text-[#8993A1] mt-1">
                                  {
                                    request.duration
                                  }
                                </p>

                              </td>

                              <td className="px-6 py-5 font-bold text-[#BD5D31]">
                                ₹
                                {request.amount?.toLocaleString(
                                  "en-IN"
                                )}
                              </td>

                              <td className="px-6 py-5">

                                <span className="text-xs bg-[#242c38] px-3 py-1.5 rounded-md">
                                  {
                                    request.paymentReference
                                  }
                                </span>

                              </td>

                              <td className="px-6 py-5">

                                <span
                                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
                                    request.status ===
                                    "Approved"
                                      ? "bg-[#25392c] text-[#8FB89C]"
                                      : request.status ===
                                        "Rejected"
                                      ? "bg-[#3a2925] text-[#d77958]"
                                      : "bg-[#3a2c1f] text-[#e0a35c]"
                                  }`}
                                >
                                  {request.status ===
                                  "Approved" ? (
                                    <FiCheckCircle />
                                  ) : request.status ===
                                    "Rejected" ? (
                                    <FiXCircle />
                                  ) : (
                                    <FiClock />
                                  )}

                                  {
                                    request.status
                                  }

                                </span>

                              </td>

                              <td className="px-6 py-5">

                                {request.status ===
                                "Pending" ? (
                                  <div className="flex gap-2">

                                    <button
                                      onClick={() =>
                                        openApproval(
                                          request
                                        )
                                      }
                                      className="px-3 py-2 rounded-lg bg-[#25392c] text-[#8FB89C] text-xs font-bold"
                                    >
                                      Approve
                                    </button>

                                    <button
                                      onClick={() => {
                                        setRejectingRequest(
                                          request
                                        );

                                        setRejectionReason(
                                          ""
                                        );
                                      }}
                                      className="px-3 py-2 rounded-lg bg-[#3a2925] text-[#d77958] text-xs font-bold"
                                    >
                                      Reject
                                    </button>

                                  </div>
                                ) : (
                                  <span className="text-xs text-[#8993A1]">
                                    Reviewed
                                  </span>
                                )}

                              </td>

                            </tr>
                          );
                        }
                      )}

                    </tbody>

                  </table>
                </div>
              )}

            </section>
          )}

          {/* ==================================================
              USERS
             ================================================== */}

          {activeTab ===
            "users" && (
            <section className="bg-[#1B222B] border border-[#2a323d] rounded-xl overflow-hidden">

              <div className="px-6 py-5 border-b border-[#2a323d]">

                <h2 className="text-lg font-bold">
                  All Accounts
                </h2>

                <p className="text-xs text-[#8993A1] mt-1">
                  Account ownership and restaurant association.
                </p>

              </div>

              {users.length ===
              0 ? (
                <div className="p-8 text-center text-[#8993A1]">
                  No users found.
                </div>
              ) : (
                users.map(
                  (user) => (
                    <div
                      key={
                        user._id
                      }
                      className="px-6 py-5 border-b border-[#2a323d] flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                    >

                      <div>

                        <p className="font-semibold">
                          {
                            user.name
                          }
                        </p>

                        <p className="text-xs text-[#8993A1] mt-1">
                          {
                            user.email
                          }
                        </p>

                        <p className="text-xs text-[#8993A1] mt-1">
                          {
                            user.phone ||
                            "—"
                          }
                        </p>

                      </div>

                      <div className="flex items-center gap-3">

                        <span className="px-3 py-1.5 rounded-full bg-[#242c38] text-xs font-bold">
                          {
                            user.role
                          }
                        </span>

                        <span className="text-xs text-[#8993A1]">
                          {
                            user
                              .restaurantId
                              ?.name ||
                            "No Restaurant"
                          }
                        </span>

                      </div>

                    </div>
                  )
                )
              )}

            </section>
          )}

        </main>

        {/* ==================================================
            APPROVE MODAL
           ================================================== */}

        {approvingRequest && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-5">

            <div className="w-full max-w-2xl bg-[#1B222B] border border-[#2a323d] rounded-2xl p-6 shadow-2xl">

              <div className="flex items-start justify-between gap-4">

                <div>
                  <p className="text-xs tracking-[0.2em] text-[#BD5D31]">
                    SUBSCRIPTION APPROVAL
                  </p>

                  <h2 className="text-2xl font-bold mt-1">
                    {
                      approvingRequest
                        .restaurantId
                        ?.name ||
                      "Restaurant"
                    }
                  </h2>

                  <p className="text-sm text-[#8993A1] mt-2">
                    {
                      approvingRequest
                        .user
                        ?.name ||
                      approvingRequest.name
                    }{" "}
                    ·{" "}
                    {
                      approvingRequest
                        .user
                        ?.email ||
                      approvingRequest.email
                    }
                  </p>

                  <p className="text-sm text-[#8993A1] mt-1">
                    Phone:{" "}
                    {
                      approvingRequest
                        .user
                        ?.phone ||
                      "—"
                    }
                  </p>

                </div>

                <button
                  onClick={() =>
                    setApprovingRequest(
                      null
                    )
                  }
                  className="text-[#8993A1] hover:text-white text-xl"
                >
                  ×
                </button>

              </div>

              <div className="mt-6 grid sm:grid-cols-2 gap-4">

                <div className="bg-[#242c38] rounded-xl p-4">

                  <p className="text-xs text-[#8993A1]">
                    PLAN
                  </p>

                  <p className="font-bold mt-1">
                    {
                      approvingRequest.plan
                    }{" "}
                    ·{" "}
                    {
                      approvingRequest.duration
                    }
                  </p>

                </div>

                <div className="bg-[#242c38] rounded-xl p-4">

                  <p className="text-xs text-[#8993A1]">
                    PAYMENT
                  </p>

                  <p className="font-bold mt-1 text-[#BD5D31]">
                    ₹
                    {approvingRequest.amount?.toLocaleString(
                      "en-IN"
                    )}
                  </p>

                  <p className="text-xs text-[#8993A1] mt-1">
                    {
                      approvingRequest.paymentReference
                    }
                  </p>

                </div>

              </div>

              <div className="mt-6 grid sm:grid-cols-2 gap-5">

                <div>
                  <label className="block text-xs text-[#8993A1] mb-2">
                    START DATE
                  </label>

                  <input
                    type="date"
                    value={
                      startDate
                    }
                    onChange={(
                      event
                    ) =>
                      setStartDate(
                        event
                          .target
                          .value
                      )
                    }
                    className="w-full bg-[#242c38] border border-[#3a4452] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#BD5D31]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#8993A1] mb-2">
                    START TIME
                  </label>

                  <input
                    type="time"
                    value={
                      startTime
                    }
                    onChange={(
                      event
                    ) =>
                      setStartTime(
                        event
                          .target
                          .value
                      )
                    }
                    className="w-full bg-[#242c38] border border-[#3a4452] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#BD5D31]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#8993A1] mb-2">
                    EXPIRY DATE
                  </label>

                  <input
                    type="date"
                    value={
                      expiryDate
                    }
                    onChange={(
                      event
                    ) =>
                      setExpiryDate(
                        event
                          .target
                          .value
                      )
                    }
                    className="w-full bg-[#242c38] border border-[#3a4452] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#BD5D31]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#8993A1] mb-2">
                    EXPIRY TIME
                  </label>

                  <input
                    type="time"
                    value={
                      expiryTime
                    }
                    onChange={(
                      event
                    ) =>
                      setExpiryTime(
                        event
                          .target
                          .value
                      )
                    }
                    className="w-full bg-[#242c38] border border-[#3a4452] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#BD5D31]"
                  />
                </div>

              </div>

              <div className="mt-5 bg-[#25392c] border border-[#385642] rounded-xl p-4 text-sm text-[#a7b8aa]">
                Start ke pehle subscription
                <b> pending/scheduled </b>
                rahegi, start time par active
                hogi aur expiry cross hote hi
                expired ho jayegi.
              </div>

              <div className="flex justify-end gap-3 mt-6">

                <button
                  onClick={() =>
                    setApprovingRequest(
                      null
                    )
                  }
                  className="px-5 py-3 rounded-lg bg-[#242c38]"
                >
                  Cancel
                </button>

                <button
                  onClick={
                    approveRequest
                  }
                  disabled={
                    reviewMutation.isPending
                  }
                  className="px-5 py-3 rounded-lg bg-[#BD5D31] font-bold disabled:opacity-50"
                >
                  {
                    reviewMutation.isPending
                      ? "Activating..."
                      : "Activate Subscription"
                  }
                </button>

              </div>

            </div>

          </div>
        )}

        {/* ==================================================
            REJECT MODAL
           ================================================== */}

        {rejectingRequest && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-5">

            <div className="w-full max-w-md bg-[#1B222B] border border-[#2a323d] rounded-2xl p-6">

              <h2 className="text-xl font-bold">
                Reject Subscription
              </h2>

              <p className="text-sm text-[#8993A1] mt-2">
                {
                  rejectingRequest
                    .restaurantId
                    ?.name ||
                  rejectingRequest.email
                }
              </p>

              <textarea
                rows={4}
                value={
                  rejectionReason
                }
                onChange={(
                  event
                ) =>
                  setRejectionReason(
                    event.target
                      .value
                  )
                }
                placeholder="Reason for rejection..."
                className="w-full mt-5 bg-[#242c38] border border-[#3a4452] rounded-lg px-4 py-3 text-sm resize-none outline-none focus:border-[#BD5D31]"
              />

              <div className="flex justify-end gap-3 mt-5">

                <button
                  onClick={() =>
                    setRejectingRequest(
                      null
                    )
                  }
                  className="px-4 py-2.5 rounded-lg bg-[#242c38]"
                >
                  Cancel
                </button>

                <button
                  onClick={
                    rejectRequest
                  }
                  disabled={
                    reviewMutation.isPending
                  }
                  className="px-4 py-2.5 rounded-lg bg-[#BD5D31] font-bold disabled:opacity-50"
                >
                  {
                    reviewMutation.isPending
                      ? "Rejecting..."
                      : "Reject Request"
                  }
                </button>

              </div>

            </div>
          </div>
        )}

        {/* ==================================================
            RESTAURANT DETAILS MODAL
           ================================================== */}

        {showRestaurantDetails && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-5">

            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#1B222B] border border-[#2a323d] rounded-2xl p-6">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-xs tracking-[0.2em] text-[#BD5D31]">
                    RESTAURANT DETAILS
                  </p>

                  <h2 className="text-2xl font-bold mt-1">
                    {
                      restaurantDetail
                        ?.restaurant
                        ?.name ||
                      selectedRestaurant?.name
                    }
                  </h2>

                </div>

                <button
                  onClick={() =>
                    setShowRestaurantDetails(
                      false
                    )
                  }
                  className="text-[#8993A1] hover:text-white text-xl"
                >
                  ×
                </button>

              </div>

              {restaurantDetailLoading ? (
                <div className="py-10 text-center text-[#8993A1]">
                  Loading restaurant details...
                </div>
              ) : restaurantDetail ? (
                <div className="mt-6 space-y-6">

                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

                    <div className="bg-[#242c38] rounded-xl p-4">
                      <p className="text-xs text-[#8993A1]">
                        OWNER
                      </p>
                      <p className="font-bold mt-1">
                        {
                          restaurantDetail
                            .owner
                            ?.name
                        }
                      </p>
                    </div>

                    <div className="bg-[#242c38] rounded-xl p-4">
                      <p className="text-xs text-[#8993A1]">
                        EMAIL
                      </p>
                      <p className="font-bold mt-1 break-all">
                        {
                          restaurantDetail
                            .owner
                            ?.email
                        }
                      </p>
                    </div>

                    <div className="bg-[#242c38] rounded-xl p-4">
                      <p className="text-xs text-[#8993A1]">
                        PHONE
                      </p>
                      <p className="font-bold mt-1">
                        {
                          restaurantDetail
                            .owner
                            ?.phone ||
                          "—"
                        }
                      </p>
                    </div>

                    <div className="bg-[#242c38] rounded-xl p-4">
                      <p className="text-xs text-[#8993A1]">
                        STATUS
                      </p>
                      <p className="font-bold mt-1">
                        {
                          restaurantDetail
                            .restaurant
                            ?.status
                        }
                      </p>
                    </div>

                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

                    {[
                      [
                        "TOTAL ACCOUNTS",
                        restaurantDetail
                          .counts
                          ?.totalUsers,
                      ],
                      [
                        "ADMINS",
                        restaurantDetail
                          .counts
                          ?.admins,
                      ],
                      [
                        "WAITERS",
                        restaurantDetail
                          .counts
                          ?.waiters,
                      ],
                      [
                        "KITCHEN",
                        restaurantDetail
                          .counts
                          ?.kitchen,
                      ],
                    ].map(
                      ([
                        label,
                        value,
                      ]) => (
                        <div
                          key={
                            label
                          }
                          className="bg-[#242c38] rounded-xl p-4"
                        >
                          <p className="text-xs text-[#8993A1]">
                            {label}
                          </p>

                          <p className="text-2xl font-bold mt-1">
                            {value ??
                              0}
                          </p>
                        </div>
                      )
                    )}

                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">

                    {[
                      [
                        "TABLES",
                        restaurantDetail
                          .counts
                          ?.tables,
                      ],
                      [
                        "CATEGORIES",
                        restaurantDetail
                          .counts
                          ?.categories,
                      ],
                      [
                        "DISHES",
                        restaurantDetail
                          .counts
                          ?.dishes,
                      ],
                      [
                        "ORDERS",
                        restaurantDetail
                          .counts
                          ?.orders,
                      ],
                      [
                        "PLAN",
                        restaurantDetail
                          .restaurant
                          ?.subscription
                          ?.plan ||
                          "—",
                      ],
                    ].map(
                      ([
                        label,
                        value,
                      ]) => (
                        <div
                          key={
                            label
                          }
                          className="bg-[#242c38] rounded-xl p-4"
                        >
                          <p className="text-xs text-[#8993A1]">
                            {label}
                          </p>

                          <p className="font-bold mt-1">
                            {value ??
                              "—"}
                          </p>
                        </div>
                      )
                    )}

                  </div>

                  <div className="bg-[#242c38] rounded-xl p-5">

                    <p className="text-sm font-bold">
                      Subscription
                    </p>

                    <div className="grid sm:grid-cols-3 gap-4 mt-4 text-sm">

                      <div>
                        <p className="text-xs text-[#8993A1]">
                          PLAN
                        </p>
                        <p className="mt-1 font-semibold">
                          {
                            restaurantDetail
                              .restaurant
                              ?.subscription
                              ?.plan ||
                            "—"
                          }
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-[#8993A1]">
                          START
                        </p>
                        <p className="mt-1 font-semibold">
                          {
                            restaurantDetail
                              .restaurant
                              ?.subscription
                              ?.startDate
                            ? new Date(
                                restaurantDetail
                                  .restaurant
                                  .subscription
                                  .startDate
                              ).toLocaleString(
                                "en-IN"
                              )
                            : "—"
                          }
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-[#8993A1]">
                          EXPIRY
                        </p>
                        <p className="mt-1 font-semibold">
                          {
                            restaurantDetail
                              .restaurant
                              ?.subscription
                              ?.expiryDate
                            ? new Date(
                                restaurantDetail
                                  .restaurant
                                  .subscription
                                  .expiryDate
                              ).toLocaleString(
                                "en-IN"
                              )
                            : "—"
                          }
                        </p>
                      </div>

                    </div>

                  </div>

                </div>
              ) : (
                <div className="py-10 text-center text-[#8993A1]">
                  Restaurant details not available.
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    );
  };

export default SuperAdmin;