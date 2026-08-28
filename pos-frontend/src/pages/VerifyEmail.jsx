import React, {
  useEffect,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useMutation,
} from "@tanstack/react-query";

import {
  enqueueSnackbar,
} from "notistack";

import {
  FiArrowLeft,
  FiMail,
  FiRefreshCw,
} from "react-icons/fi";

import {
  verifyEmail,
  resendVerificationOtp,
} from "../https";

const VerifyEmail =
  () => {
    const navigate =
      useNavigate();

    const location =
      useLocation();

    const initialEmail =
      location.state
        ?.email ||
      "";

    const [
      email,
      setEmail,
    ] = useState(
      initialEmail
    );

    const [
      otp,
      setOtp,
    ] = useState("");

    useEffect(() => {
      document.title =
        "Restro POS | Verify Email";
    }, []);

    const verifyMutation =
      useMutation({
        mutationFn:
          verifyEmail,

        onSuccess:
          () => {
            enqueueSnackbar(
              "Email verified! Please login.",
              {
                variant:
                  "success",
              }
            );

            navigate(
              "/auth",
              {
                replace:
                  true,
              }
            );
          },

        onError:
          (error) => {
            enqueueSnackbar(
              error?.response
                ?.data
                ?.message ||
                "Unable to verify email.",
              {
                variant:
                  "error",
              }
            );
          },
      });

    const resendMutation =
      useMutation({
        mutationFn:
          resendVerificationOtp,

        onSuccess:
          (response) => {
            enqueueSnackbar(
              response?.data
                ?.message ||
                "New OTP sent.",
              {
                variant:
                  "success",
              }
            );
          },

        onError:
          (error) => {
            enqueueSnackbar(
              error?.response
                ?.data
                ?.message ||
                "Unable to send OTP.",
              {
                variant:
                  "error",
              }
            );
          },
      });

    const handleVerify =
      (event) => {
        event.preventDefault();

        const cleanEmail =
          email.trim()
            .toLowerCase();

        const cleanOtp =
          otp.trim();

        if (
          !cleanEmail
        ) {
          enqueueSnackbar(
            "Please enter your email.",
            {
              variant:
                "warning",
            }
          );

          return;
        }

        if (
          !/^\d{6}$/.test(
            cleanOtp
          )
        ) {
          enqueueSnackbar(
            "Enter the 6-digit OTP.",
            {
              variant:
                "warning",
            }
          );

          return;
        }

        verifyMutation.mutate({
          email:
            cleanEmail,

          otp:
            cleanOtp,
        });
      };

    return (
      <div className="min-h-screen bg-[#FFF8F2] flex items-center justify-center px-5">

        <div className="w-full max-w-md bg-white border border-[#E8DCD3] rounded-2xl p-7 shadow-[0_20px_60px_rgba(70,42,27,.08)]">

          <button
            onClick={() =>
              navigate(
                "/auth"
              )
            }
            className="flex items-center gap-2 text-sm text-[#7D7067] hover:text-[#C65A2E]"
          >
            <FiArrowLeft />
            Back to login
          </button>

          <div className="mt-8 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF0E7] text-[#C65A2E]">
            <FiMail
              size={21}
            />
          </div>

          <h1 className="mt-5 text-2xl font-black text-[#241B16]">
            Verify your email
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-[#7A6D64]">
            We sent a 6-digit verification code
            to your email address.
          </p>

          <form
            onSubmit={
              handleVerify
            }
            className="mt-7 space-y-4"
          >

            <div>
              <label className="block text-xs font-semibold text-[#807269] mb-2">
                EMAIL
              </label>

              <input
                type="email"
                value={
                  email
                }
                onChange={(
                  event
                ) =>
                  setEmail(
                    event.target
                      .value
                  )
                }
                className="w-full rounded-lg border border-[#E2D6CD] bg-[#FFFDFB] px-4 py-3 text-sm outline-none focus:border-[#C65A2E]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#807269] mb-2">
                OTP
              </label>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit code"
                value={
                  otp
                }
                onChange={(
                  event
                ) =>
                  setOtp(
                    event.target
                      .value
                      .replace(
                        /\D/g,
                        ""
                      )
                  )
                }
                className="w-full rounded-lg border border-[#E2D6CD] bg-[#FFFDFB] px-4 py-3 text-center text-xl font-bold tracking-[0.4em] outline-none focus:border-[#C65A2E]"
              />
            </div>

            <button
              type="submit"
              disabled={
                verifyMutation.isPending
              }
              className="w-full rounded-lg bg-[#C65A2E] py-3.5 font-bold text-white disabled:opacity-50"
            >
              {verifyMutation.isPending
                ? "Verifying..."
                : "Verify Email"}
            </button>

          </form>

          <button
            onClick={() => {
              const cleanEmail =
                email.trim()
                  .toLowerCase();

              if (
                !cleanEmail
              ) {
                enqueueSnackbar(
                  "Enter your email first.",
                  {
                    variant:
                      "warning",
                  }
                );

                return;
              }

              resendMutation.mutate(
                cleanEmail
              );
            }}
            disabled={
              resendMutation.isPending
            }
            className="mt-4 w-full rounded-lg border border-[#E2D6CD] bg-white py-3 text-sm font-semibold text-[#4D3D34] hover:bg-[#FFF8F2] disabled:opacity-50"
          >
            <span className="inline-flex items-center gap-2">
              <FiRefreshCw
                size={15}
              />

              {resendMutation.isPending
                ? "Sending..."
                : "Resend OTP"}
            </span>
          </button>

        </div>

      </div>
    );
  };

export default VerifyEmail;