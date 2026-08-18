import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
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
} from "react-icons/fi";

import {
  getAllUsers,
  updateUserSubscription,
  getAllSubscriptionRequests,
  reviewSubscriptionRequest,
} from "../https";

const SuperAdmin = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("requests");
  const [search, setSearch] = useState("");
  const [rejectingRequest, setRejectingRequest] =
    useState(null);
  const [rejectionReason, setRejectionReason] =
    useState("");

  useEffect(() => {
    document.title = "POS | Super Admin";
  }, []);

  const {
    data: requestsResponse,
    isLoading: requestsLoading,
    refetch: refetchRequests,
  } = useQuery({
    queryKey: ["super-admin-subscription-requests"],
    queryFn: getAllSubscriptionRequests,
  });

  const {
    data: usersResponse,
    isLoading: usersLoading,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ["super-admin-users"],
    queryFn: getAllUsers,
  });

  const requests =
    requestsResponse?.data?.data || [];

  const users =
    usersResponse?.data?.data || [];

  const reviewMutation = useMutation({
    mutationFn: reviewSubscriptionRequest,

    onSuccess: (_, variables) => {
      enqueueSnackbar(
        variables.status === "Approved"
          ? "Subscription approved successfully."
          : "Subscription request rejected.",
        {
          variant:
            variables.status === "Approved"
              ? "success"
              : "warning",
        }
      );

      setRejectingRequest(null);
      setRejectionReason("");

      refetchRequests();
      refetchUsers();
    },

    onError: (error) => {
      enqueueSnackbar(
        error?.response?.data?.message ||
          "Unable to process the request.",
        {
          variant: "error",
        }
      );
    },
  });

  const subscriptionMutation = useMutation({
    mutationFn: updateUserSubscription,

    onSuccess: (_, variables) => {
      enqueueSnackbar(
        variables.isActive
          ? "Subscription activated."
          : "Subscription disabled.",
        {
          variant: "success",
        }
      );

      refetchUsers();
      refetchRequests();
    },

    onError: (error) => {
      enqueueSnackbar(
        error?.response?.data?.message ||
          "Unable to update subscription.",
        {
          variant: "error",
        }
      );
    },
  });

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return users;

    return users.filter((user) => {
      return (
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.role?.toLowerCase().includes(query)
      );
    });
  }, [users, search]);

  const pendingRequests = requests.filter(
    (request) => request.status === "Pending"
  );

  const activeUsers = users.filter((user) => {
    const expiry = user.subscription?.expiryDate;

    return (
      expiry &&
      new Date(expiry) > new Date()
    );
  });

  const handleApprove = (request) => {
    if (
      reviewMutation.isPending ||
      request.status !== "Pending"
    ) {
      return;
    }

    reviewMutation.mutate({
      requestId: request._id,
      status: "Approved",
    });
  };

  const handleReject = () => {
    if (!rejectingRequest) return;

    reviewMutation.mutate({
      requestId: rejectingRequest._id,
      status: "Rejected",
      rejectionReason:
        rejectionReason.trim() ||
        "Payment could not be verified.",
    });
  };

  const handleToggleSubscription = (
    user
  ) => {
    const isActive =
      user.subscription?.expiryDate &&
      new Date(user.subscription.expiryDate) >
        new Date();

    subscriptionMutation.mutate({
      userId: user._id,
      isActive: !isActive,
      expiryDate: !isActive
        ? new Date(
            Date.now() +
              30 *
                24 *
                60 *
                60 *
                1000
          ).toISOString()
        : null,
    });
  };

  const refreshAll = () => {
    refetchRequests();
    refetchUsers();
  };

  return (
    <div className="min-h-screen bg-[#12181F] text-[#F3EEE3]">
      {/* Header */}
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
              Manage users and manual subscription approvals.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2.5 rounded-lg bg-[#242c38] hover:bg-[#2c3542] transition flex items-center gap-2 text-sm"
            >
              <FiArrowLeft />
              POS
            </button>

            <button
              onClick={refreshAll}
              className="px-4 py-2.5 rounded-lg bg-[#242c38] hover:bg-[#2c3542] transition flex items-center gap-2 text-sm"
            >
              <FiRefreshCw />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#1B222B] border border-[#2a323d] rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#8993A1]">
                  TOTAL USERS
                </p>

                <p className="text-3xl font-bold mt-2">
                  {users.length}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#242c38]">
                <FiUsers
                  className="text-[#BD5D31]"
                  size={22}
                />
              </div>
            </div>
          </div>

          <div className="bg-[#1B222B] border border-[#2a323d] rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#8993A1]">
                  PENDING REQUESTS
                </p>

                <p className="text-3xl font-bold mt-2">
                  {pendingRequests.length}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#3a2c1f]">
                <FiClock
                  className="text-[#e0a35c]"
                  size={22}
                />
              </div>
            </div>
          </div>

          <div className="bg-[#1B222B] border border-[#2a323d] rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#8993A1]">
                  ACTIVE SUBSCRIPTIONS
                </p>

                <p className="text-3xl font-bold mt-2">
                  {activeUsers.length}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#25392c]">
                <FiCheckCircle
                  className="text-[#8FB89C]"
                  size={22}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold ${
              activeTab === "requests"
                ? "bg-[#BD5D31]"
                : "bg-[#1B222B] border border-[#2a323d]"
            }`}
          >
            Subscription Requests
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold ${
              activeTab === "users"
                ? "bg-[#BD5D31]"
                : "bg-[#1B222B] border border-[#2a323d]"
            }`}
          >
            Users
          </button>
        </div>

        {/* =====================================================
            REQUESTS
           ===================================================== */}

        {activeTab === "requests" && (
          <section className="bg-[#1B222B] border border-[#2a323d] rounded-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-[#2a323d]">
              <h2 className="text-lg font-bold">
                Subscription Requests
              </h2>

              <p className="text-xs text-[#8993A1] mt-1">
                Verify manual payments and approve subscriptions.
              </p>
            </div>

            {requestsLoading ? (
              <div className="p-8 text-[#8993A1]">
                Loading requests...
              </div>
            ) : requests.length === 0 ? (
              <div className="p-8 text-center text-[#8993A1]">
                No subscription requests found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px]">
                  <thead>
                    <tr className="border-b border-[#2a323d] text-left text-xs text-[#8993A1]">
                      <th className="px-6 py-4">
                        USER
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
                    {requests.map((request) => (
                      <tr
                        key={request._id}
                        className="border-b border-[#2a323d] last:border-b-0"
                      >
                        <td className="px-6 py-5">
                          <p className="font-semibold">
                            {request.name}
                          </p>

                          <p className="text-xs text-[#8993A1] mt-1">
                            {request.email}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <p className="font-semibold">
                            {request.plan}
                          </p>

                          <p className="text-xs text-[#8993A1] mt-1">
                            {request.duration}
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
                            {request.paymentReference ||
                              "—"}
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

                            {request.status}
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
                                className="px-3 py-2 rounded-lg bg-[#25392c] text-[#8FB89C] hover:opacity-80 disabled:opacity-50 text-xs font-bold"
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
                                className="px-3 py-2 rounded-lg bg-[#3a2925] text-[#d77958] hover:opacity-80 disabled:opacity-50 text-xs font-bold"
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
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* =====================================================
            USERS
           ===================================================== */}

        {activeTab === "users" && (
          <section className="bg-[#1B222B] border border-[#2a323d] rounded-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-[#2a323d] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">
                  Registered Users
                </h2>

                <p className="text-xs text-[#8993A1] mt-1">
                  View account roles and subscription status.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-[#242c38] rounded-lg px-4 py-2.5 min-w-[260px]">
                <FiSearch
                  className="text-[#8993A1]"
                  size={16}
                />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search user..."
                  className="bg-transparent outline-none w-full text-sm text-[#F3EEE3] placeholder:text-[#6f7782]"
                />
              </div>
            </div>

            {usersLoading ? (
              <div className="p-8 text-[#8993A1]">
                Loading users...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-[#8993A1]">
                No users found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-[#2a323d] text-left text-xs text-[#8993A1]">
                      <th className="px-6 py-4">
                        USER
                      </th>
                      <th className="px-6 py-4">
                        ROLE
                      </th>
                      <th className="px-6 py-4">
                        SUBSCRIPTION
                      </th>
                      <th className="px-6 py-4">
                        EXPIRY
                      </th>
                      <th className="px-6 py-4">
                        ACTION
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsers.map((user) => {
                      const expiry =
                        user.subscription?.expiryDate
                          ? new Date(
                              user.subscription.expiryDate
                            )
                          : null;

                      const active =
                        expiry &&
                        expiry > new Date();

                      return (
                        <tr
                          key={user._id}
                          className="border-b border-[#2a323d] last:border-b-0"
                        >
                          <td className="px-6 py-5">
                            <p className="font-semibold">
                              {user.name}
                            </p>

                            <p className="text-xs text-[#8993A1] mt-1">
                              {user.email}
                            </p>
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                                user.role ===
                                "SuperAdmin"
                                  ? "bg-[#3a2c1f] text-[#e0a35c]"
                                  : "bg-[#242c38] text-[#c6ced9]"
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                                active
                                  ? "bg-[#25392c] text-[#8FB89C]"
                                  : "bg-[#3a2925] text-[#d77958]"
                              }`}
                            >
                              {active
                                ? "ACTIVE"
                                : "INACTIVE"}
                            </span>

                            {user.subscription?.plan && (
                              <p className="text-xs text-[#8993A1] mt-2">
                                {
                                  user.subscription.plan
                                }{" "}
                                ·{" "}
                                {
                                  user.subscription
                                    .duration
                                }
                              </p>
                            )}
                          </td>

                          <td className="px-6 py-5 text-sm">
                            {expiry
                              ? expiry.toLocaleDateString(
                                  "en-IN"
                                )
                              : "—"}
                          </td>

                          <td className="px-6 py-5">
                            {user.role ===
                            "SuperAdmin" ? (
                              <span className="flex items-center gap-2 text-xs text-[#e0a35c]">
                                <FiShield />
                                Protected
                              </span>
                            ) : (
                              <button
                                onClick={() =>
                                  handleToggleSubscription(
                                    user
                                  )
                                }
                                disabled={
                                  subscriptionMutation.isPending
                                }
                                className={`px-3 py-2 rounded-lg text-xs font-bold disabled:opacity-50 ${
                                  active
                                    ? "bg-[#3a2925] text-[#d77958]"
                                    : "bg-[#25392c] text-[#8FB89C]"
                                }`}
                              >
                                {active
                                  ? "Disable"
                                  : "Activate 30 Days"}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Reject Modal */}
      {rejectingRequest && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-5">
          <div className="w-full max-w-md bg-[#1B222B] border border-[#2a323d] rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold">
              Reject Subscription Request
            </h2>

            <p className="text-sm text-[#8993A1] mt-2">
              {rejectingRequest.email}
            </p>

            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(event) =>
                setRejectionReason(
                  event.target.value
                )
              }
              placeholder="Reason for rejection..."
              className="w-full mt-5 bg-[#242c38] border border-[#3a4452] rounded-lg px-4 py-3 text-sm resize-none outline-none focus:border-[#BD5D31]"
            />

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => {
                  setRejectingRequest(null);
                  setRejectionReason("");
                }}
                className="px-4 py-2.5 rounded-lg bg-[#242c38] hover:bg-[#2c3542] text-sm"
              >
                Cancel
              </button>

              <button
                onClick={handleReject}
                disabled={
                  reviewMutation.isPending
                }
                className="px-4 py-2.5 rounded-lg bg-[#BD5D31] hover:bg-[#a34f27] disabled:opacity-50 text-sm font-bold"
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