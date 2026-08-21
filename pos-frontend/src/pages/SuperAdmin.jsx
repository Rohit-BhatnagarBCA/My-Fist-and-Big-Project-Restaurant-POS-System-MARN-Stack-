import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useMutation,
  useQuery,
} from "@tanstack/react-query";

import { enqueueSnackbar } from "notistack";

import { useNavigate } from "react-router-dom";

import {
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiSearch,
  FiUsers,
  FiXCircle,
  FiShield,
  FiRefreshCw,
  FiHome,
  FiPauseCircle,
  FiPlayCircle,
} from "react-icons/fi";

import {
  getAllUsers,
  getAllSubscriptionRequests,
  reviewSubscriptionRequest,

  getAllRestaurants,
  updateRestaurantStatus,
} from "../https";

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
    ] = useState(null);

    const [
      rejectionReason,
      setRejectionReason,
    ] = useState("");

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
          _,
          variables
        ) => {
          enqueueSnackbar(
            variables.status ===
              "Approved"
              ? "Restaurant subscription approved."
              : "Subscription request rejected.",
            {
              variant:
                variables.status ===
                "Approved"
                  ? "success"
                  : "warning",
            }
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
            error
              ?.response
              ?.data
              ?.message ||
              "Unable to process the request.",
            {
              variant: "error",
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
            error
              ?.response
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
          (restaurant) => {
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
    // ACTIONS
    // ========================================================

    const handleApprove =
      (request) => {
        if (
          reviewMutation.isPending ||
          request.status !==
            "Pending"
        ) {
          return;
        }

        reviewMutation.mutate(
          {
            requestId:
              request._id,

            status:
              "Approved",
          }
        );
      };

    const handleReject =
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
        restaurant,
        status
      ) => {
        statusMutation.mutate(
          {
            restaurantId:
              restaurant._id,

            status,
          }
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

        {/* ====================================================
            HEADER
           ==================================================== */}

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
                Manage restaurants, accounts and subscriptions.
              </p>
            </div>

            <div className="flex items-center gap-2">

              <button
                onClick={() =>
                  navigate("/")
                }
                className="px-4 py-2.5 rounded-lg bg-[#242c38] hover:bg-[#2c3542] transition flex items-center gap-2 text-sm"
              >
                <FiArrowLeft />
                POS
              </button>

              <button
                onClick={
                  refreshAll
                }
                className="px-4 py-2.5 rounded-lg bg-[#242c38] hover:bg-[#2c3542] transition flex items-center gap-2 text-sm"
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
                ACTIVE RESTAURANTS
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

            <button
              onClick={() =>
                setActiveTab(
                  "restaurants"
                )
              }
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                activeTab ===
                "restaurants"
                  ? "bg-[#BD5D31]"
                  : "bg-[#1B222B] border border-[#2a323d]"
              }`}
            >
              <FiHome />
              Restaurants
            </button>

            <button
              onClick={() =>
                setActiveTab(
                  "requests"
                )
              }
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                activeTab ===
                "requests"
                  ? "bg-[#BD5D31]"
                  : "bg-[#1B222B] border border-[#2a323d]"
              }`}
            >
              <FiClock />
              Requests
            </button>

            <button
              onClick={() =>
                setActiveTab(
                  "users"
                )
              }
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                activeTab ===
                "users"
                  ? "bg-[#BD5D31]"
                  : "bg-[#1B222B] border border-[#2a323d]"
              }`}
            >
              <FiUsers />
              Users
            </button>

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
                    View business accounts and staff count. No revenue data is tracked here.
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
                        event.target.value
                      )
                    }
                    placeholder="Search restaurant / owner..."
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
                              "active" &&
                            expiry &&
                            expiry >
                              new Date();

                          return (
                            <tr
                              key={
                                restaurant._id
                              }
                              className="border-b border-[#2a323d] last:border-0"
                            >

                              <td className="px-6 py-5">

                                <p className="font-semibold">
                                  {
                                    restaurant.name
                                  }
                                </p>

                                <p className="text-xs text-[#8993A1] mt-1">
                                  {
                                    restaurant._id
                                  }
                                </p>

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

                              </td>

                              <td className="px-6 py-5">

                                <p className="font-bold">
                                  {
                                    restaurant
                                      .staff
                                      ?.total || 0
                                  }
                                </p>

                                <p className="text-xs text-[#8993A1] mt-1">
                                  Admin{" "}
                                  {
                                    restaurant
                                      .staff
                                      ?.admins || 0
                                  }
                                  {" · "}
                                  Waiter{" "}
                                  {
                                    restaurant
                                      .staff
                                      ?.waiters || 0
                                  }
                                  {" · "}
                                  Kitchen{" "}
                                  {
                                    restaurant
                                      .staff
                                      ?.kitchen || 0
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
                                  ? expiry.toLocaleDateString(
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
                                      handleStatus(
                                        restaurant,
                                        restaurant.status ===
                                          "active"
                                          ? "suspended"
                                          : "active"
                                      )
                                    }
                                    disabled={
                                      statusMutation.isPending
                                    }
                                    className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 ${
                                      restaurant.status ===
                                      "active"
                                        ? "bg-[#3a2925] text-[#d77958]"
                                        : "bg-[#25392c] text-[#8FB89C]"
                                    }`}
                                  >
                                    {restaurant.status ===
                                    "active" ? (
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
                  Verify manual payments and approve restaurant subscriptions.
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

                  <table className="w-full min-w-[1000px]">

                    <thead>
                      <tr className="border-b border-[#2a323d] text-left text-xs text-[#8993A1]">

                        <th className="px-6 py-4">
                          RESTAURANT
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
                        ) => (
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

                              <p className="text-xs text-[#8993A1] mt-1">
                                {
                                  request
                                    .email
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
                                      handleApprove(
                                        request
                                      )
                                    }
                                    disabled={
                                      reviewMutation.isPending
                                    }
                                    className="px-3 py-2 rounded-lg bg-[#25392c] text-[#8FB89C] text-xs font-bold disabled:opacity-50"
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
                                    disabled={
                                      reviewMutation.isPending
                                    }
                                    className="px-3 py-2 rounded-lg bg-[#3a2925] text-[#d77958] text-xs font-bold disabled:opacity-50"
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
                        )
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
                  Super Admin view of registered accounts.
                </p>

              </div>

              {users.map(
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
              )}

            </section>
          )}

        </main>

        {/* ====================================================
            REJECT MODAL
           ==================================================== */}

        {rejectingRequest && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-5">

            <div className="w-full max-w-md bg-[#1B222B] border border-[#2a323d] rounded-2xl p-6 shadow-2xl">

              <h2 className="text-xl font-bold">
                Reject Subscription Request
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

              <div className="flex justify-end gap-2 mt-5">

                <button
                  onClick={() => {
                    setRejectingRequest(
                      null
                    );

                    setRejectionReason(
                      ""
                    );
                  }}
                  className="px-4 py-2.5 rounded-lg bg-[#242c38] text-sm"
                >
                  Cancel
                </button>

                <button
                  onClick={
                    handleReject
                  }
                  disabled={
                    reviewMutation.isPending
                  }
                  className="px-4 py-2.5 rounded-lg bg-[#BD5D31] text-sm font-bold disabled:opacity-50"
                >
                  {reviewMutation.isPending
                    ? "Processing..."
                    : "Reject Request"}
                </button>

              </div>

            </div>

          </div>
        )}

      </div>
    );
  };

export default SuperAdmin;