import React, {
  useEffect,
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

import { motion } from "framer-motion";

import {
  FiCheck,
  FiArrowLeft,
  FiUpload,
  FiClock,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";

import { useDispatch } from "react-redux";

import {
  BUSINESS_PLANS,
  DURATIONS,
  savingsLabel,
} from "../constants/pricing";

import {
  createSubscriptionRequest,
  getMySubscriptionRequests,
  getUserData,
} from "../https";

import {
  setUser,
} from "../redux/slices/userSlice";

const Subscription = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [selectedPlan, setSelectedPlan] =
    useState("Basic");

  const [selectedDuration, setSelectedDuration] =
    useState("Monthly");

  const [paymentReference, setPaymentReference] =
    useState("");

  const [paymentNote, setPaymentNote] =
    useState("");

  const plan = BUSINESS_PLANS.find(
    (item) => item.id === selectedPlan
  );

  const amount =
    plan?.prices?.[selectedDuration] || 0;

  // ==========================================================
  // REQUEST HISTORY
  // ==========================================================

  const {
    data: requestsResponse,
    isLoading: requestsLoading,
    refetch: refetchRequests,
  } = useQuery({
    queryKey: ["my-subscription-requests"],
    queryFn: getMySubscriptionRequests,
  });

  const requests =
    requestsResponse?.data?.data || [];

  const latestRequest =
    requests[0] || null;

  const hasPendingRequest =
    requests.some(
      (request) =>
        request.status === "Pending"
    );

  // ==========================================================
  // CREATE REQUEST
  // ==========================================================

  const createRequestMutation =
    useMutation({
      mutationFn: createSubscriptionRequest,

      onSuccess: () => {
        enqueueSnackbar(
          "Subscription request submitted successfully!",
          {
            variant: "success",
          }
        );

        setPaymentReference("");
        setPaymentNote("");

        refetchRequests();
      },

      onError: (error) => {
        enqueueSnackbar(
          error?.response?.data?.message ||
            "Unable to submit subscription request.",
          {
            variant: "error",
          }
        );
      },
    });

  // ==========================================================
  // SUBMIT REQUEST
  // ==========================================================

  const handleSubmitRequest = () => {
    if (!paymentReference.trim()) {
      enqueueSnackbar(
        "Please enter your payment reference / UTR.",
        {
          variant: "warning",
        }
      );

      return;
    }

    createRequestMutation.mutate({
      plan: selectedPlan,
      duration: selectedDuration,
      paymentReference:
        paymentReference.trim(),
      paymentNote: paymentNote.trim(),
    });
  };

  // ==========================================================
  // REFRESH CURRENT SESSION
  // ==========================================================

  const refreshSession = async () => {
    try {
      const { data } = await getUserData();

      const userData = data?.data;

      if (!userData?._id) {
        throw new Error(
          "Unable to refresh user session."
        );
      }

      const restaurant =
        userData.restaurantId || null;

      const restaurantSubscription =
        restaurant?.subscription || null;

      const userSubscription =
        userData.subscription || null;

      const subscription =
        restaurantSubscription &&
        (
          restaurantSubscription.startDate ||
          restaurantSubscription.expiryDate ||
          restaurantSubscription.plan
        )
          ? restaurantSubscription
          : userSubscription;

      dispatch(
        setUser({
          _id: userData._id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          role: userData.role,

          restaurantId:
            restaurant?._id || null,

          restaurant,

          subscription,

          isAuth: true,
        })
      );

      return {
        userData,
        restaurant,
        subscription,
      };
    } catch (error) {
      console.error(
        "Session refresh failed:",
        error
      );

      enqueueSnackbar(
        "Could not refresh your account status. Please try again.",
        {
          variant: "error",
        }
      );

      return null;
    }
  };

  // ==========================================================
  // ENTER POS
  // ==========================================================

  const handleEnterPOS = async () => {
    const result = await refreshSession();

    if (!result) {
      return;
    }

    const {
      userData,
      restaurant,
      subscription,
    } = result;

    // SuperAdmin
    if (userData.role === "SuperAdmin") {
      navigate("/super-admin", {
        replace: true,
      });

      return;
    }

    const now = new Date();

    const startDate =
      subscription?.startDate
        ? new Date(subscription.startDate)
        : null;

    const expiryDate =
      subscription?.expiryDate
        ? new Date(subscription.expiryDate)
        : null;

    const validDates =
      startDate &&
      expiryDate &&
      !Number.isNaN(startDate.getTime()) &&
      !Number.isNaN(expiryDate.getTime());

    const activeSubscription =
      Boolean(
        validDates &&
          now >= startDate &&
          now < expiryDate
      );

    const restaurantActive =
      restaurant?.status === "active";

    if (
      activeSubscription &&
      restaurantActive
    ) {
      navigate("/", {
        replace: true,
      });

      return;
    }

    enqueueSnackbar(
      "Your subscription is not currently active.",
      {
        variant: "warning",
      }
    );

    navigate("/about", {
      replace: true,
    });
  };

  // ==========================================================
  // PAGE TITLE
  // ==========================================================

  useEffect(() => {
    document.title = "POS | Subscription";
  }, []);

  // ==========================================================
  // STATUS ICON
  // ==========================================================

  const getStatusIcon = (status) => {
    if (status === "Approved") {
      return (
        <FiCheckCircle
          className="text-[#8FB89C]"
          size={18}
        />
      );
    }

    if (status === "Rejected") {
      return (
        <FiXCircle
          className="text-[#d77958]"
          size={18}
        />
      );
    }

    return (
      <FiClock
        className="text-[#e0a35c]"
        size={18}
      />
    );
  };

  return (
    <div className="min-h-screen bg-[#12181F] text-[#F3EEE3] px-6 py-10">
      <div className="max-w-6xl mx-auto">

        {/* ==================================================
            BACK
           ================================================== */}

        <button
          onClick={() => navigate("/about")}
          className="flex items-center gap-2 text-[#a89e8b] hover:text-[#F3EEE3] transition mb-8"
        >
          <FiArrowLeft />
          Back
        </button>

        {/* ==================================================
            HEADER
           ================================================== */}

        <div className="text-center mb-10">
          <p className="font-['Space_Mono',_monospace] text-xs tracking-[0.3em] text-[#BD5D31] mb-3">
            RESTAURANT POS
          </p>

          <h1 className="text-4xl md:text-5xl font-bold">
            Choose your plan
          </h1>

          <p className="text-[#a89e8b] mt-3">
            Pay manually using the QR code
            and send the payment reference
            for approval.
          </p>
        </div>

        {/* ==================================================
            DURATION
           ================================================== */}

        <div className="flex justify-center mb-10">
          <div className="flex flex-wrap gap-2 bg-[#1B222B] p-2 rounded-lg">
            {DURATIONS.map((duration) => (
              <button
                key={duration.id}
                onClick={() =>
                  setSelectedDuration(
                    duration.id
                  )
                }
                className={`px-5 py-2.5 rounded-md text-sm transition ${
                  selectedDuration ===
                  duration.id
                    ? "bg-[#BD5D31] text-[#F3EEE3]"
                    : "text-[#a89e8b] hover:text-[#F3EEE3]"
                }`}
              >
                {duration.label}
              </button>
            ))}
          </div>
        </div>

        {/* ==================================================
            PLANS
           ================================================== */}

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {BUSINESS_PLANS.map((item) => {
            const selected =
              selectedPlan === item.id;

            const price =
              item.prices[selectedDuration];

            const savings =
              savingsLabel(
                item,
                selectedDuration
              );

            return (
              <motion.div
                key={item.id}
                whileHover={{
                  y: -5,
                }}
                onClick={() =>
                  setSelectedPlan(
                    item.id
                  )
                }
                className={`cursor-pointer rounded-xl p-7 border transition ${
                  selected
                    ? "border-[#BD5D31] bg-[#1B222B]"
                    : "border-[#2d3540] bg-[#1B222B]"
                }`}
              >
                {item.highlighted && (
                  <div className="inline-block mb-4 px-3 py-1 rounded-full bg-[#BD5D31] text-xs font-bold">
                    MOST POPULAR
                  </div>
                )}

                <h2 className="text-2xl font-bold">
                  {item.name}
                </h2>

                <p className="text-[#a89e8b] text-sm mt-2">
                  {item.tagline}
                </p>

                <div className="mt-6">
                  <span className="text-4xl font-bold">
                    ₹
                    {price.toLocaleString(
                      "en-IN"
                    )}
                  </span>

                  <span className="text-[#8a806c] ml-2">
                    / {selectedDuration}
                  </span>
                </div>

                {savings && (
                  <p className="text-[#8FB89C] text-sm mt-2">
                    {savings}
                  </p>
                )}

                <div className="mt-7 space-y-3">
                  {item.features.map(
                    (feature) => (
                      <div
                        key={feature}
                        className="flex gap-3 text-sm text-[#d8cfbd]"
                      >
                        <FiCheck className="text-[#8FB89C] mt-0.5 shrink-0" />

                        <span>
                          {feature}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ==================================================
            PAYMENT
           ================================================== */}

        <div className="max-w-4xl mx-auto mt-10 grid lg:grid-cols-2 gap-6">

          {/* QR */}

          <div className="bg-[#1B222B] rounded-xl border border-[#2d3540] p-6">
            <p className="font-['Space_Mono',_monospace] text-xs tracking-widest text-[#BD5D31] mb-3">
              STEP 01
            </p>

            <h2 className="text-xl font-bold mb-2">
              Scan & Pay
            </h2>

            <p className="text-sm text-[#a89e8b] mb-5">
              Scan the restaurant subscription
              QR and complete the payment.
            </p>

            <div className="bg-[#F3EEE3] rounded-xl p-5 flex items-center justify-center min-h-[300px]">
              <img
                src="/subscription-qr.png"
                alt="Subscription payment QR"
                className="w-64 h-64 object-contain"
                onError={(event) => {
                  event.currentTarget.style.display =
                    "none";

                  const fallback =
                    event.currentTarget.parentElement.querySelector(
                      "[data-qr-fallback]"
                    );

                  if (fallback) {
                    fallback.classList.remove(
                      "hidden"
                    );
                  }
                }}
              />

              <div
                data-qr-fallback
                className="hidden text-center text-[#2A241D]"
              >
                <p className="font-bold text-lg">
                  PAYMENT QR
                </p>

                <p className="text-sm mt-2 text-[#6b6252] max-w-xs">
                  Add your QR image as{" "}
                  <span className="font-semibold">
                    subscription-qr.png
                  </span>{" "}
                  inside the frontend{" "}
                  <span className="font-semibold">
                    public
                  </span>{" "}
                  folder.
                </p>
              </div>
            </div>

            <div className="mt-5 bg-[#242c38] rounded-lg p-4">
              <div className="flex justify-between text-sm">
                <span className="text-[#a89e8b]">
                  Selected Plan
                </span>

                <span className="font-semibold">
                  {plan?.name}
                </span>
              </div>

              <div className="flex justify-between text-sm mt-2">
                <span className="text-[#a89e8b]">
                  Duration
                </span>

                <span className="font-semibold">
                  {selectedDuration}
                </span>
              </div>

              <div className="flex justify-between text-sm mt-2">
                <span className="text-[#a89e8b]">
                  Amount
                </span>

                <span className="font-bold text-[#BD5D31]">
                  ₹
                  {amount.toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* PAYMENT FORM */}

          <div className="bg-[#1B222B] rounded-xl border border-[#2d3540] p-6">
            <p className="font-['Space_Mono',_monospace] text-xs tracking-widest text-[#BD5D31] mb-3">
              STEP 02
            </p>

            <h2 className="text-xl font-bold mb-2">
              Submit Payment Details
            </h2>

            <p className="text-sm text-[#a89e8b] mb-6">
              Enter your UTR / transaction
              reference. Super Admin will
              verify it manually.
            </p>

            <label className="block text-xs font-semibold tracking-widest text-[#a89e8b] mb-2">
              PAYMENT REFERENCE / UTR
            </label>

            <input
              type="text"
              value={paymentReference}
              onChange={(event) =>
                setPaymentReference(
                  event.target.value
                )
              }
              placeholder="Enter UTR / transaction ID"
              disabled={
                hasPendingRequest
              }
              className="w-full bg-[#242c38] border border-[#3a4452] rounded-lg px-4 py-3 text-sm text-[#F3EEE3] placeholder:text-[#6f7782] focus:outline-none focus:border-[#BD5D31] disabled:opacity-50"
            />

            <label className="block text-xs font-semibold tracking-widest text-[#a89e8b] mb-2 mt-5">
              PAYMENT NOTE
            </label>

            <textarea
              value={paymentNote}
              onChange={(event) =>
                setPaymentNote(
                  event.target.value
                )
              }
              placeholder="Optional payment note"
              rows={4}
              disabled={
                hasPendingRequest
              }
              className="w-full bg-[#242c38] border border-[#3a4452] rounded-lg px-4 py-3 text-sm text-[#F3EEE3] placeholder:text-[#6f7782] focus:outline-none focus:border-[#BD5D31] resize-none disabled:opacity-50"
            />

            <button
              onClick={
                handleSubmitRequest
              }
              disabled={
                createRequestMutation.isPending ||
                hasPendingRequest
              }
              className="w-full mt-6 py-4 rounded-lg bg-[#BD5D31] hover:bg-[#a34f27] disabled:bg-[#59463b] transition font-bold tracking-widest font-['Space_Mono',_monospace] flex items-center justify-center gap-2"
            >
              <FiUpload />

              {createRequestMutation.isPending
                ? "SUBMITTING..."
                : hasPendingRequest
                ? "REQUEST PENDING"
                : "SUBMIT FOR APPROVAL"}
            </button>

            {hasPendingRequest && (
              <p className="text-xs text-[#e0a35c] mt-3 text-center">
                You already have a pending
                request. Please wait for admin
                review.
              </p>
            )}
          </div>
        </div>

        {/* ==================================================
            REQUEST HISTORY
           ================================================== */}

        <div className="max-w-4xl mx-auto mt-8">
          <div className="bg-[#1B222B] rounded-xl border border-[#2d3540] overflow-hidden">

            <div className="px-6 py-5 border-b border-[#2d3540]">
              <h2 className="font-bold text-lg">
                Subscription Requests
              </h2>

              <p className="text-xs text-[#8a806c] mt-1">
                Track your previous payment requests.
              </p>
            </div>

            {requestsLoading ? (
              <div className="p-6 text-sm text-[#a89e8b]">
                Loading requests...
              </div>
            ) : requests.length === 0 ? (
              <div className="p-6 text-sm text-[#a89e8b]">
                No subscription requests yet.
              </div>
            ) : (
              <div className="divide-y divide-[#2d3540]">
                {requests.map((request) => (
                  <div
                    key={request._id}
                    className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(
                          request.status
                        )}

                        <span className="font-semibold">
                          {request.plan} ·{" "}
                          {request.duration}
                        </span>
                      </div>

                      <p className="text-xs text-[#8a806c] mt-2">
                        Amount: ₹
                        {request.amount}
                      </p>

                      <p className="text-xs text-[#8a806c] mt-1">
                        Reference:{" "}
                        {
                          request.paymentReference
                        }
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                          request.status ===
                          "Approved"
                            ? "bg-[#25392c] text-[#8FB89C]"
                            : request.status ===
                              "Rejected"
                            ? "bg-[#3a2925] text-[#d77958]"
                            : "bg-[#3a2c1f] text-[#e0a35c]"
                        }`}
                      >
                        {request.status}
                      </span>

                      {request.subscriptionStart && (
                        <p className="text-xs text-[#8a806c] mt-2">
                          Starts{" "}
                          {new Date(
                            request.subscriptionStart
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      )}

                      {request.subscriptionExpiry && (
                        <p className="text-xs text-[#8a806c] mt-1">
                          Valid till{" "}
                          {new Date(
                            request.subscriptionExpiry
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      )}

                      {request.rejectionReason && (
                        <p className="text-xs text-[#d77958] mt-2 max-w-xs">
                          {
                            request.rejectionReason
                          }
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ==================================================
            ENTER POS
           ================================================== */}

        {latestRequest?.status === "Approved" && (
          <div className="max-w-4xl mx-auto mt-6">
            <div className="bg-[#25392c] border border-[#8FB89C]/30 rounded-xl p-5 text-center">

              <p className="text-[#8FB89C] font-bold">
                Subscription approved successfully.
              </p>

              <p className="text-xs text-[#a7b8aa] mt-2">
                Refreshing your restaurant subscription
                status before entering the POS.
              </p>

              <button
                onClick={handleEnterPOS}
                className="mt-3 px-6 py-2 rounded-lg bg-[#8FB89C] text-[#12181F] font-bold hover:bg-[#9fc9ad] transition"
              >
                ENTER POS
              </button>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscription;